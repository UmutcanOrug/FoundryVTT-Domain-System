import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const modulePath = new URL("../scripts/ds.js", import.meta.url);
const source = fs.readFileSync(modulePath, "utf8");
let idCounter = 0;

class MockApplicationV2 {
  async _prepareContext() { return {}; }
  async _onRender() {}
  render() {}
  close() {}
}

const gm = { id: "gm", name: "GM", isGM: true, active: true };
const player = { id: "player", name: "Player", isGM: false, active: true };
const context = vm.createContext({
  console,
  Date,
  Intl,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Map,
  Set,
  Promise,
  structuredClone,
  setTimeout,
  clearTimeout,
  Hooks: { once() {} },
  Handlebars: { helpers: {}, registerHelper() {} },
  CONST: { KEYBINDING_PRECEDENCE: { NORMAL: 0 } },
  foundry: {
    applications: {
      api: {
        ApplicationV2: MockApplicationV2,
        HandlebarsApplicationMixin: Base => class extends Base {}
      }
    },
    utils: {
      deepClone: value => structuredClone(value),
      randomID: () => `test-${++idCounter}`
    }
  },
  game: {
    user: gm,
    users: { contents: [gm, player] },
    settings: { register() {}, get() { return {}; }, async set() {} },
    keybindings: { register() {} },
    socket: { on() {}, emit() {} }
  },
  ui: { notifications: { info() {}, warn() {} } },
  globalThis: null
});
context.globalThis = context;

vm.runInContext(`${source}\n;globalThis.__dsTest = {
  defaultWorldData,
  defaultSettlement,
  starterSettlementTemplates,
  normalizeData,
  addBuilding,
  queueConstruction,
  cancelProject,
  queueSettlementUpgrade,
  queueRecruitment,
  processTurn,
  processSingleSettlement,
  resolveMonthEvent,
  undoSettlementTurn,
  setSettlementTier,
  updateTroop,
  calculateSettlement,
  upsertSample
};`, context, { filename: "ds.js" });

const api = context.__dsTest;
const freshWorld = (templateId = "blank-hamlet") => {
  const raw = api.defaultWorldData();
  const template = raw.settlementTemplates.find(item => item.id === templateId);
  raw.settlements = [api.defaultSettlement(template, raw.rules)];
  return api.normalizeData(raw);
};

// Schema v3 migration replaces old content while preserving settlement identity.
const legacy = api.normalizeData({
  schemaVersion: 2,
  month: 10,
  settlements: [{
    id: "legacy-domain",
    name: "Legacy Domain",
    type: "Village",
    region: "Plains",
    terrainTags: ["Plains"],
    ownerUserIds: [player.id],
    population: 500,
    treasure: 10000,
    buildings: [{
      id: "legacy-barracks",
      catalogId: "barracks",
      name: "Legacy Barracks",
      category: "military",
      active: true,
      assignedPop: 5,
      workers: 5,
      professionalCapacity: 100,
      recruitType: "men-at-arms",
      recruitPerLevel: 10
    }],
    troops: [{ id: "legacy-maa", type: "men-at-arms", count: 10, mode: "garrison", garrisonCost: 6, campaignCost: 16 }],
    recruitment: [],
    projects: []
  }]
});

assert.equal(legacy.schemaVersion, 3);
assert.equal(legacy.settlements[0].buildings[0].catalogId, "muster-field");
assert.equal(legacy.settlements[0].buildings[0].canRecruit, true);
assert.deepEqual([...legacy.settlements[0].buildings[0].recruitableUnitIds], ["militia", "watchman"]);
assert.ok(legacy.settlements[0].buildings[0].slotId);
assert.equal(legacy.settlements[0].troops[0].garrisonCost, 24);
assert.equal(legacy.settlements[0].troops[0].campaignCost, 64);
assert.ok(legacy.settlements[0].food > 0);
assert.ok(legacy.settlements[0].materials > 0);
assert.deepEqual(legacy.settlementTemplates.slice(0, 4).map(item => item.id), ["blank-hamlet", "starter-hamlet", "starter-village", "starter-town"]);

// Every building family spans all five settlement tiers and Special is an overlay.
const catalogWorld = api.defaultWorldData();
const chains = new Map();
for (const building of catalogWorld.catalog) {
  assert.ok(["economic", "military"].includes(building.category));
  assert.equal(building.settlementTier, ["hamlet", "village", "town", "city", "metropolis"][building.nodeTier - 1]);
  if (!chains.has(building.chainId)) chains.set(building.chainId, new Set());
  chains.get(building.chainId).add(building.nodeTier);
  for (const parentId of building.parentIds) {
    const parent = catalogWorld.catalog.find(item => item.id === parentId);
    assert.ok(parent, `${building.id} has a missing parent`);
    assert.equal(parent.nodeTier, building.nodeTier - 1, `${building.id} must follow the previous tier`);
  }
}
for (const [chainId, tiers] of chains) assert.deepEqual([...tiers].sort(), [1, 2, 3, 4, 5], `${chainId} must cover tiers 1-5`);
assert.ok(Math.min(...catalogWorld.catalog.filter(item => item.nodeTier === 1).map(item => item.crownCost)) >= 18000);
assert.ok(Math.min(...catalogWorld.unitCatalog.map(item => item.recruitCost)) >= 150);

// GM can set a settlement tier directly in either direction.
const tierData = freshWorld();
const tierSettlement = tierData.settlements[0];
api.setSettlementTier(tierData, { settlementId: tierSettlement.id, tier: "town", note: "Test promotion" }, gm);
assert.equal(tierSettlement.tier, "town");
assert.equal(tierSettlement.type, "Town");
assert.ok(tierSettlement.slots.length >= 10);
api.setSettlementTier(tierData, { settlementId: tierSettlement.id, tier: "hamlet" }, gm);
assert.equal(tierSettlement.tier, "hamlet");

// Construction pays Crown, Materials, and Food up front; CP is generated by Free POP.
const buildData = freshWorld();
buildData.rules.events.enabled = false;
const settlement = buildData.settlements[0];
settlement.ownerUserIds = [player.id];
settlement.population = 500;
settlement.treasure = 5_000_000;
settlement.food = 100_000;
settlement.materials = 100_000;
api.setSettlementTier(buildData, { settlementId: settlement.id, tier: "town" }, gm);

api.addBuilding(buildData, { settlementId: settlement.id, catalogId: "muster-field", assignedPop: 8 }, gm);
const muster = settlement.buildings.find(building => building.catalogId === "muster-field");
const crownBeforeBranch = settlement.treasure;
const materialsBeforeBranch = settlement.materials;
api.queueConstruction(buildData, { settlementId: settlement.id, slotId: muster.slotId, catalogId: "infantry-yard" }, player);
const infantryProject = settlement.projects.at(-1);
assert.equal(settlement.treasure, crownBeforeBranch - 90_000);
assert.equal(settlement.materials, materialsBeforeBranch - 800);
assert.equal(infantryProject.requiredCp, 3_200);
assert.equal(infantryProject.replacesBuildingId, muster.id);

const cpBefore = api.calculateSettlement(settlement, buildData).cpThisMonth;
await api.processTurn(buildData, {}, gm);
assert.equal(infantryProject.cpPaid, Math.min(cpBefore, infantryProject.requiredCp));
while (infantryProject.status !== "completed") await api.processTurn(buildData, {}, gm);
const infantryYard = settlement.buildings.find(building => building.catalogId === "infantry-yard");
assert.ok(infantryYard);
assert.equal(infantryYard.slotId, muster.slotId);
assert.equal(settlement.buildings.filter(building => building.chainId === "recruitment").length, 1);

assert.throws(() => api.queueConstruction(buildData, {
  settlementId: settlement.id,
  slotId: infantryYard.slotId,
  catalogId: "marksmen-range"
}, player), /not a direct branch/);

// Cancellation refunds less as CP progress increases and returns all resource types proportionally.
const emptySlot = settlement.slots.find(slot => slot.unlocked && !settlement.buildings.some(building => [building.slotId, ...building.extraSlotIds].includes(slot.id)));
api.queueConstruction(buildData, { settlementId: settlement.id, slotId: emptySlot.id, catalogId: "land-clearance" }, player);
const cancelCandidate = settlement.projects.at(-1);
cancelCandidate.cpPaid = cancelCandidate.requiredCp / 2;
const crownBeforeCancel = settlement.treasure;
const materialsBeforeCancel = settlement.materials;
api.cancelProject(buildData, { settlementId: settlement.id, projectId: cancelCandidate.id }, player);
assert.equal(settlement.treasure, crownBeforeCancel + Math.round(20_000 * 0.75 * 0.5));
assert.equal(settlement.materials, materialsBeforeCancel + Math.round(100 * 0.75 * 0.5));

// Staffing gates output and recruitment, while soldiers consume population exactly once.
infantryYard.assignedPop = 0;
let summary = api.calculateSettlement(settlement, buildData);
assert.equal(summary.recruitmentCapacity, 0);
infantryYard.assignedPop = infantryYard.workers;
summary = api.calculateSettlement(settlement, buildData);
assert.ok(summary.recruitmentCapacity >= 18);
const treasureBeforeRecruitment = settlement.treasure;
api.queueRecruitment(buildData, {
  settlementId: settlement.id,
  unitId: "men-at-arms",
  sourceBuildingId: infantryYard.id,
  targetCount: 10,
  regimentName: "Actor-linked Infantry",
  actorUuid: "Actor.test-infantry"
}, player);
assert.equal(settlement.treasure, treasureBeforeRecruitment - 8_000);
await api.processTurn(buildData, {}, gm);
const regiment = settlement.troops.find(troop => troop.name === "Actor-linked Infantry");
assert.ok(regiment);
assert.equal(regiment.count, 10);
assert.equal(regiment.actorUuid, "Actor.test-infantry");
summary = api.calculateSettlement(settlement, buildData);
assert.equal(summary.troopManpowerUsed, 10);
assert.equal(summary.civilianPopulation, settlement.population - 10);
assert.ok(summary.armyPower > 0);

// Strategic resource requirements and multi-slot buildings are enforced and accounted for.
api.setSettlementTier(buildData, { settlementId: settlement.id, tier: "city" }, gm);
api.addBuilding(buildData, { settlementId: settlement.id, catalogId: "cavalry-yard", assignedPop: 40 }, gm);
const cavalryYard = settlement.buildings.find(building => building.catalogId === "cavalry-yard");
assert.throws(() => api.queueRecruitment(buildData, {
  settlementId: settlement.id,
  unitId: "cavalry",
  sourceBuildingId: cavalryYard.id,
  targetCount: 1
}, player), /strategic resource: horses/);
settlement.terrainTags.push("Horses");
api.queueRecruitment(buildData, {
  settlementId: settlement.id,
  unitId: "cavalry",
  sourceBuildingId: cavalryYard.id,
  targetCount: 1
}, player);
assert.equal(settlement.recruitment.at(-1).troopType, "cavalry");

api.addBuilding(buildData, { settlementId: settlement.id, catalogId: "laurent-manor", assignedPop: 5 }, gm);
const manor = settlement.buildings.find(building => building.catalogId === "laurent-manor");
assert.equal(manor.extraSlotIds.length, 1);
summary = api.calculateSettlement(settlement, buildData);
assert.ok(summary.usedSlots >= settlement.buildings.length + 1);

// Settlement progression is a paid CP project, never an automatic population promotion.
const progressionData = freshWorld();
progressionData.rules.events.enabled = false;
const hamlet = progressionData.settlements[0];
hamlet.ownerUserIds = [player.id];
hamlet.population = 500;
hamlet.treasure = 1_000_000;
hamlet.food = 100_000;
hamlet.materials = 100_000;
api.queueSettlementUpgrade(progressionData, { settlementId: hamlet.id }, player);
assert.equal(hamlet.tier, "hamlet");
assert.equal(hamlet.treasure, 900_000);
assert.equal(hamlet.materials, 99_500);
assert.equal(hamlet.food, 99_500);
let progressionMonths = 0;
while (hamlet.tier !== "village" && progressionMonths < 12) {
  await api.processTurn(progressionData, {}, gm);
  progressionMonths += 1;
}
assert.equal(hamlet.tier, "village");
assert.ok(progressionMonths > 1);

// Individual processing does not move the world month or double-process on global close.
const turnRaw = api.defaultWorldData();
turnRaw.rules.events.enabled = false;
turnRaw.settlements.push(api.defaultSettlement(turnRaw.settlementTemplates[0], turnRaw.rules));
const turns = api.normalizeData(turnRaw);
turns.month = 10;
const first = turns.settlements[0];
const second = turns.settlements[1];
await api.processSingleSettlement(turns, { settlementId: first.id }, gm);
const firstTreasureAfterIndividual = first.treasure;
assert.equal(turns.month, 10);
assert.equal(first.lastProcessedMonth, 10);
await assert.rejects(() => api.processSingleSettlement(turns, { settlementId: first.id }, gm), /already been processed/);
await api.processTurn(turns, {}, gm);
assert.equal(turns.month, 11);
assert.equal(first.treasure, firstTreasureAfterIndividual);
assert.equal(second.lastProcessedMonth, 10);

// d100 results wait for GM approval and snapshots restore the entire pre-turn settlement state.
context.Roll = class MockRoll {
  async evaluate() { this.total = 100; return this; }
};
const eventData = freshWorld();
const eventSettlement = eventData.settlements[0];
eventSettlement.population = 50;
eventSettlement.treasure = 100_000;
eventSettlement.food = 10_000;
eventSettlement.materials = 2_000;
eventSettlement.publicOrder = 50;
eventSettlement.growth.overrideRate = "0";
const snapshotTreasure = eventSettlement.treasure;
await api.processSingleSettlement(eventData, { settlementId: eventSettlement.id }, gm);
assert.equal(eventSettlement.pendingEvents.length, 1);
assert.equal(eventSettlement.pendingEvents[0].status, "pending");
assert.equal(eventSettlement.pendingEvents[0].finalRoll, 100);
assert.equal(eventSettlement.pendingEvents[0].name, "Golden Month");
assert.equal(eventSettlement.turnSnapshots.length, 1);
await assert.rejects(() => api.processTurn(eventData, {}, gm), /Resolve pending month events/);
const treasureBeforeResolution = eventSettlement.treasure;
api.resolveMonthEvent(eventData, {
  settlementId: eventSettlement.id,
  eventId: eventSettlement.pendingEvents[0].id,
  resolution: "accept",
  crown: 12_345,
  food: 0,
  materials: 0,
  population: 0,
  publicOrder: 0,
  gmNote: "Adjusted reward"
}, gm);
assert.equal(eventSettlement.treasure, treasureBeforeResolution + 12_345);
assert.equal(eventSettlement.pendingEvents[0].status, "accepted");
api.undoSettlementTurn(eventData, { settlementId: eventSettlement.id }, gm);
assert.equal(eventSettlement.treasure, snapshotTreasure);
assert.equal(eventSettlement.lastProcessedMonth, 0);
assert.equal(eventSettlement.pendingEvents.length, 0);

// De Laurent remains an ordinary player record and is never used as a reusable template.
const protectedWorld = api.defaultWorldData();
protectedWorld.settlements[0].name = "De Laurent - Player Edited";
api.upsertSample(protectedWorld);
assert.equal(protectedWorld.settlements.length, 1);
assert.equal(protectedWorld.settlements[0].name, "De Laurent - Player Edited");
assert.equal(protectedWorld.settlementTemplates.some(template => template.id === "de-laurent"), false);

const css = fs.readFileSync(new URL("../styles/ds.css", import.meta.url), "utf8");
assert.match(css, /\.ds-regiment-grid\s*\{\s*grid-template-columns:\s*repeat\(2,/s);

console.log("DS v0.1.7 logic tests passed");
