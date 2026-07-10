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
  normalizeData,
  addBuilding,
  queueConstruction,
  cancelProject,
  queueSettlementUpgrade,
  hireConstructionCp,
  queueRecruitment,
  cancelRecruitment,
  processTurn,
  processSingleSettlement,
  unlockSlot,
  updateTroop,
  calculateSettlement,
  upsertSample
};`, context, { filename: "ds.js" });

const api = context.__dsTest;

// Legacy v0.1.5 data migrates to the branch catalog, real slots, and sane upkeep.
const legacy = api.normalizeData({
  month: 10,
  catalog: [{
    id: "barracks",
    name: "Barracks",
    category: "military",
    terrain: "Any",
    workers: 5,
    crownCost: 2000,
    cpCost: 600,
    professionalCapacity: 100,
    recruitType: "men-at-arms",
    recruitPerLevel: 10
  }],
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
      level: 1,
      professionalCapacity: 100,
      recruitType: "men-at-arms",
      recruitPerLevel: 10
    }],
    troops: [{ id: "legacy-maa", type: "men-at-arms", count: 10, mode: "garrison", garrisonCost: 65, campaignCost: 95 }],
    recruitment: [],
    projects: [],
    growth: { overrideRate: "0" }
  }]
});

assert.equal(legacy.schemaVersion, 2);
assert.deepEqual([...legacy.catalog.find(item => item.id === "barracks").recruitableUnitIds], ["watchman", "men-at-arms"]);
assert.equal(legacy.settlements[0].buildings[0].canRecruit, true);
assert.ok(legacy.settlements[0].buildings[0].slotId);
assert.equal(legacy.settlements[0].troops[0].garrisonCost, 6);
assert.equal(legacy.settlements[0].troops[0].campaignCost, 16);

// Build a clean, wealthy player town for branch construction and recruitment.
const rawWorld = api.defaultWorldData();
rawWorld.settlements = [api.defaultSettlement(rawWorld.settlementTemplates[0], rawWorld.rules)];
const data = api.normalizeData(rawWorld);
const settlement = data.settlements[0];
settlement.name = "Branch Test Town";
settlement.ownerUserIds = [player.id];
settlement.tier = "town";
settlement.type = "Town";
settlement.population = 600;
settlement.treasure = 200000;

api.addBuilding(data, { settlementId: settlement.id, catalogId: "barracks" }, gm);
const barracks = settlement.buildings.find(building => building.catalogId === "barracks");
assert.ok(barracks?.slotId);

const treasureBeforeBranch = settlement.treasure;
api.queueConstruction(data, {
  settlementId: settlement.id,
  slotId: barracks.slotId,
  catalogId: "archery-range"
}, player);
assert.equal(settlement.treasure, treasureBeforeBranch - 12000);
assert.equal(settlement.projects[0].requiredCp, 1800);
assert.equal(settlement.projects[0].replacesBuildingId, barracks.id);
const treasureBeforeHire = settlement.treasure;
api.hireConstructionCp(data, { settlementId: settlement.id, projectId: settlement.projects[0].id, cp: 10 }, player);
assert.equal(settlement.treasure, treasureBeforeHire - 100);
assert.equal(settlement.projects[0].bonusCp, 10);

// Free POP produces CP. No fixed build duration is used.
let constructionMonths = 0;
while (settlement.projects[0].status !== "completed" && constructionMonths < 10) {
  api.processTurn(data, {}, gm);
  constructionMonths += 1;
}
assert.equal(constructionMonths, 3);
assert.equal(settlement.projects[0].status, "completed");
assert.equal(settlement.projects[0].bonusCp, 0);
const archeryRange = settlement.buildings.find(building => building.catalogId === "archery-range");
assert.ok(archeryRange);
assert.equal(archeryRange.slotId, barracks.slotId);
assert.equal(settlement.buildings.length, 1);

assert.throws(() => api.queueConstruction(data, {
  settlementId: settlement.id,
  slotId: archeryRange.slotId,
  catalogId: "stable"
}, player), /not a direct branch/);

// Locked slots are purchasable and deduct their configured Crown cost.
const lockedSlot = settlement.slots.find(slot => !slot.unlocked && !slot.gmLocked);
assert.ok(lockedSlot);
const treasureBeforeUnlock = settlement.treasure;
api.unlockSlot(data, { settlementId: settlement.id, slotId: lockedSlot.id }, player);
assert.equal(lockedSlot.unlocked, true);
assert.equal(settlement.treasure, treasureBeforeUnlock - lockedSlot.unlockCost);

// Recruitment is tied to the completed building and creates a distinct regiment per order.
api.queueRecruitment(data, {
  settlementId: settlement.id,
  unitId: "archer",
  sourceBuildingId: archeryRange.id,
  targetCount: 12,
  regimentName: "First Bow"
}, player);
api.processTurn(data, {}, gm);
assert.equal(settlement.recruitment.at(-1).status, "completed");
assert.equal(settlement.troops.at(-1).name, "First Bow");
assert.equal(settlement.troops.at(-1).count, 12);

api.queueRecruitment(data, {
  settlementId: settlement.id,
  unitId: "archer",
  sourceBuildingId: archeryRange.id,
  targetCount: 3,
  regimentName: "Second Bow"
}, player);
api.processTurn(data, {}, gm);
assert.equal(settlement.troops.filter(troop => troop.type === "archer").length, 2);

const secondRegiment = settlement.troops.find(troop => troop.name === "Second Bow");
api.updateTroop(data, {
  settlementId: settlement.id,
  troopId: secondRegiment.id,
  name: "Red Fletchers",
  imageUrl: "worlds/test/red-fletchers.webp",
  count: secondRegiment.count,
  mode: "garrison",
  notes: "Player regiment"
}, player);
assert.equal(secondRegiment.name, "Red Fletchers");
assert.equal(secondRegiment.imageUrl, "worlds/test/red-fletchers.webp");

// Individual processing does not move the world month or double-process on global close.
const turnWorld = api.defaultWorldData();
turnWorld.month = 10;
turnWorld.settlements.push(api.defaultSettlement(turnWorld.settlementTemplates[0], turnWorld.rules));
const turns = api.normalizeData(turnWorld);
const first = turns.settlements[0];
const second = turns.settlements[1];
first.treasure = 0;
second.treasure = 0;
api.processSingleSettlement(turns, { settlementId: first.id }, gm);
const firstTreasureAfterIndividual = first.treasure;
assert.equal(turns.month, 10);
assert.equal(first.lastProcessedMonth, 10);
assert.throws(() => api.processSingleSettlement(turns, { settlementId: first.id }, gm), /already been processed/);
api.processTurn(turns, {}, gm);
assert.equal(turns.month, 11);
assert.equal(first.treasure, firstTreasureAfterIndividual);
assert.equal(second.lastProcessedMonth, 10);

// Village progression is a CP project; population alone never auto-promotes it.
const progressionWorld = api.defaultWorldData();
progressionWorld.settlements = [api.defaultSettlement(progressionWorld.settlementTemplates[0], progressionWorld.rules)];
const progressionData = api.normalizeData(progressionWorld);
const village = progressionData.settlements[0];
village.ownerUserIds = [player.id];
village.population = 600;
village.treasure = 100000;
api.queueSettlementUpgrade(progressionData, { settlementId: village.id }, player);
assert.equal(village.tier, "village");
while (village.tier !== "town") api.processTurn(progressionData, {}, gm);
assert.equal(village.tier, "town");
assert.equal(village.type, "Town");
assert.ok(village.slots.length >= 9);

// De Laurent is an ordinary settlement and the legacy restore action never overwrites it.
const protectedWorld = api.defaultWorldData();
protectedWorld.settlements[0].name = "De Laurent - Player Edited";
api.upsertSample(protectedWorld);
assert.equal(protectedWorld.settlements.length, 1);
assert.equal(protectedWorld.settlements[0].name, "De Laurent - Player Edited");

const summary = api.calculateSettlement(settlement, data);
assert.equal(summary.cpThisMonth, summary.freePop + summary.constructionBonus);
assert.ok(Number.isFinite(summary.netIncome));

console.log("DS v0.1.6 logic tests passed");
