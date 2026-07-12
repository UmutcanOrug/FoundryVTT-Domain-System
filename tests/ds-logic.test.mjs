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
    applications: { api: { ApplicationV2: MockApplicationV2, HandlebarsApplicationMixin: Base => class extends Base {} } },
    utils: { deepClone: value => structuredClone(value), randomID: () => `test-${++idCounter}` }
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
  addCatalogBuilding,
  addCatalogUnit,
  updateCatalogUnit,
  queueGmConstruction,
  setSettlementTier,
  queueRecruitment,
  queueReplenishment,
  cancelRecruitment,
  processTurn,
  processSingleSettlement,
  calculateSettlement,
  foodSecurityState,
  populationPressureFor,
  publicOrderPressureFor,
  treeLineageLayout,
  unitTreeGroups,
  updateTroop,
  recruitableUnitsContext,
  permissionsFor,
  toggleBuildingOperation,
  transferTreasure,
  unitUpkeepFromRules,
  buildingEffectBadges,
  buildWarnings
};`, context, { filename: "ds.js" });

const api = context.__dsTest;
const freshWorld = (templateId = "blank-hamlet") => {
  const raw = api.defaultWorldData();
  const template = raw.settlementTemplates.find(item => item.id === templateId);
  raw.settlements = [api.defaultSettlement(template, raw.rules)];
  raw.rules.events.enabled = false;
  return api.normalizeData(raw);
};
const prepareSettlement = (data, population = 500) => {
  const settlement = data.settlements[0];
  settlement.ownerUserIds = [player.id];
  settlement.population = population;
  settlement.treasure = 100_000_000;
  settlement.materials = 10_000_000;
  settlement.publicOrder = 60;
  settlement.manpowerReserve = population;
  return settlement;
};

// Schema v9 and settlement hierarchy defaults.
const defaults = api.defaultWorldData();
assert.equal(defaults.schemaVersion, 9);
assert.deepEqual(
  [...defaults.rules.tiers.map(tier => [tier.openSlots, tier.maxSlots])],
  [[2, 3], [3, 4], [4, 6], [6, 8], [8, 10]]
);
assert.equal(defaults.rules.military.upkeepPercent, 20);
assert.equal(defaults.rules.military.manpowerRecoveryRate, 10);
assert.equal(defaults.rules.economy.replenishmentCostPercent, 35);

// v0.1.12 data migrates once without overwriting custom Laurent values or custom slot rules.
const stale = api.defaultWorldData();
stale.schemaVersion = 8;
stale.rules.tiers.find(tier => tier.id === "city").openSlots = 7;
stale.rules.tiers.find(tier => tier.id === "city").maxSlots = 9;
const staleSettlement = stale.settlements[0];
staleSettlement.food = 99_999;
staleSettlement.biomeTags = ["Farmlands"];
staleSettlement.terrainTags.push("Iron", "Horses");
stale.settlementTemplates.find(template => template.id === "starter-village").buildings.find(building => building.catalogId === "farmstead").foodOutput = 220;
const staleManor = staleSettlement.buildings.find(building => building.catalogId === "laurent-manor");
staleManor.workers = 20;
staleManor.buildingUpkeep = 3_000;
staleManor.recruitPerLevel = 17;
staleManor.imageUrl = "world/laurent-custom.webp";
const migrated = api.normalizeData(stale);
const migratedManor = migrated.settlements[0].buildings.find(building => building.catalogId === "laurent-manor");
assert.equal(migrated.schemaVersion, 9);
assert.equal(migrated.rules.tiers.find(tier => tier.id === "city").openSlots, 7);
assert.equal(migrated.rules.tiers.find(tier => tier.id === "city").maxSlots, 9);
assert.equal(migratedManor.workers, 20);
assert.equal(migratedManor.buildingUpkeep, 3_000);
assert.equal(migratedManor.recruitPerLevel, 17);
assert.equal(migratedManor.imageUrl, "world/laurent-custom.webp");
assert.equal(migratedManor.siegeDefensePercent, 10);
assert.ok(migratedManor.garrisonUnits.length > 0);
assert.equal(migratedManor.bonusSlots, 2);
assert.equal(migrated.settlements[0].food, 0);
assert.deepEqual([...migrated.settlements[0].biomeTags], []);
assert.deepEqual([...migrated.settlements[0].terrainTags], []);
assert.equal(migrated.settlementTemplates.find(template => template.id === "starter-village").buildings.find(building => building.catalogId === "farmstead").foodOutput, 500);

// Built-in trees are complete, described, and no longer depend on strategic resources.
const catalogWorld = api.defaultWorldData();
const tiersByBranch = new Map();
for (const building of catalogWorld.catalog) {
  assert.ok(building.description.length > 20, `${building.id} needs a useful description`);
  assert.equal(Object.hasOwn(building, "terrain"), false, `${building.id} still carries a terrain field`);
  assert.equal(building.requiredTagsAny.length, 0, `${building.id} still has a strategic-resource gate`);
  assert.equal(building.grantsTags.some(tag => ["iron", "horse", "horses"].includes(tag.toLowerCase())), false);
  assert.ok(api.buildingEffectBadges(building, catalogWorld.unitCatalog).some(badge => badge.label.includes("Requires") || building.workers === 0));
  if (building.landmark) continue;
  if (!tiersByBranch.has(building.chainId)) tiersByBranch.set(building.chainId, new Set());
  tiersByBranch.get(building.chainId).add(building.nodeTier);
}
for (const [branchId, tiers] of tiersByBranch) {
  assert.deepEqual([...tiers].sort(), [1, 2, 3, 4, 5], `${branchId} must span T1-T5`);
}
for (const unit of catalogWorld.unitCatalog) assert.deepEqual([...unit.requiredTags], []);
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "spearman").branch, "infantry");
assert.deepEqual([...catalogWorld.unitCatalog.find(unit => unit.id === "spearman").parentIds], ["militia"]);
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "knight").branch, "unique");
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "knight").special, true);

// Economic branches have distinct pure and hybrid roles.
const byBuildingId = id => catalogWorld.catalog.find(item => item.id === id);
assert.ok(byBuildingId("grain-estate").foodOutput > byBuildingId("horse-ranch").foodOutput);
assert.equal(byBuildingId("grain-estate").rate, 0);
assert.ok(byBuildingId("horse-ranch").foodOutput > 0 && byBuildingId("horse-ranch").rate > 0 && byBuildingId("horse-ranch").growth > 0);
assert.ok(byBuildingId("stone-quarry").materialsOutput > byBuildingId("iron-mine").materialsOutput);
assert.equal(byBuildingId("stone-quarry").rate, 0);
assert.ok(byBuildingId("iron-mine").materialsOutput > 0 && byBuildingId("iron-mine").rate > 0 && byBuildingId("iron-mine").recruitmentDiscount > 0);
assert.ok(byBuildingId("world-market").buildingUpkeepDiscount > 0);
assert.equal(byBuildingId("world-market").bonusSlots, 1);
assert.equal(byBuildingId("laurent-manor").bonusSlots, 2);
assert.ok(byBuildingId("imperial-port").eventRollBonus > byBuildingId("world-market").eventRollBonus);
assert.ok(byBuildingId("imperial-port").workers * byBuildingId("imperial-port").rate + byBuildingId("imperial-port").flatOutput
  > byBuildingId("world-market").workers * byBuildingId("world-market").rate + byBuildingId("world-market").flatOutput);

// Labor is automatic and binary; halted or labor-starved buildings pay half upkeep.
const laborData = freshWorld();
const laborSettlement = prepareSettlement(laborData, 12);
api.addBuilding(laborData, { settlementId: laborSettlement.id, catalogId: "land-clearance" }, gm);
api.addBuilding(laborData, { settlementId: laborSettlement.id, catalogId: "watch-post" }, gm);
let laborSummary = api.calculateSettlement(laborSettlement, laborData);
const land = laborSettlement.buildings.find(building => building.catalogId === "land-clearance");
const watch = laborSettlement.buildings.find(building => building.catalogId === "watch-post");
assert.equal(land.assignedPop, 10);
assert.equal(watch.assignedPop, 0);
assert.equal(laborSummary.buildingUpkeepRaw, 80);
assert.ok(api.buildWarnings(laborSettlement, laborData, laborSummary).some(warning => warning.includes("waiting for 5")));
api.toggleBuildingOperation(laborData, { settlementId: laborSettlement.id, buildingId: land.id, operation: "halt" }, player);
laborSummary = api.calculateSettlement(laborSettlement, laborData);
assert.equal(land.assignedPop, 0);
assert.equal(watch.assignedPop, 5);
assert.equal(laborSummary.buildingUpkeepRaw, 100);
assert.equal(laborSummary.usedSlots, 2, "halting a building must not free its district");

// Rank downgrades shrink unused slots, and a valid branch upgrade replaces its current node.
const branchData = freshWorld();
const branchSettlement = prepareSettlement(branchData, 500);
api.setSettlementTier(branchData, { settlementId: branchSettlement.id, tier: "metropolis" }, gm);
api.addBuilding(branchData, { settlementId: branchSettlement.id, catalogId: "infantry-yard" }, gm);
assert.equal(branchSettlement.slots.length, 10);
api.setSettlementTier(branchData, { settlementId: branchSettlement.id, tier: "town" }, gm);
assert.equal(branchSettlement.slots.length, 6);
branchData.catalog.find(item => item.id === "drill-hall").cpCost = 1;
const branchSlot = branchSettlement.buildings[0].slotId;
api.queueConstruction(branchData, { settlementId: branchSettlement.id, slotId: branchSlot, catalogId: "drill-hall" }, player);
await api.processTurn(branchData, {}, gm);
assert.equal(branchSettlement.buildings[0].catalogId, "drill-hall");

// Food is a monthly flow. Stored values do not mask shortages or amplify abundance.
const foodData = freshWorld();
const foodSettlement = prepareSettlement(foodData, 100);
foodSettlement.food = 1_000_000;
let foodSummary = api.calculateSettlement(foodSettlement, foodData);
assert.equal(foodSummary.foodProduction, 25);
assert.equal(foodSummary.foodConsumption, 100);
assert.equal(foodSummary.foodSecurity.id, "starvation");
assert.equal(foodSummary.foodSecurityGrowth, -3);
foodSettlement.food = 0;
assert.equal(api.calculateSettlement(foodSettlement, foodData).foodCoverage, foodSummary.foodCoverage);
api.addBuilding(foodData, { settlementId: foodSettlement.id, catalogId: "land-clearance" }, gm);
foodSummary = api.calculateSettlement(foodSettlement, foodData);
assert.ok(foodSummary.foodCoverage >= 1.25 && foodSummary.foodCoverage < 1.5);
assert.equal(foodSummary.foodSecurity.id, "well-fed");
api.addBuilding(foodData, { settlementId: foodSettlement.id, catalogId: "land-clearance" }, gm);
foodSummary = api.calculateSettlement(foodSettlement, foodData);
assert.ok(foodSummary.foodCoverage >= 2);
assert.equal(foodSummary.foodSecurity.id, "abundant");
assert.equal(foodSummary.foodSecurityGrowth, 1.5);
assert.equal(api.foodSecurityState(0.49).id, "starvation");
assert.equal(api.foodSecurityState(0.5).id, "severe-shortage");
assert.equal(api.foodSecurityState(0.75).id, "shortage");
assert.equal(api.foodSecurityState(1).id, "sustained");
assert.equal(api.foodSecurityState(1.25).id, "well-fed");
assert.equal(api.foodSecurityState(1.5).id, "plentiful");
assert.equal(api.foodSecurityState(2).id, "abundant");

// One tier-appropriate Food district sustains civilians up to the next population threshold.
for (const scenario of [
  { tier: "village", population: 500, building: "farmstead" },
  { tier: "town", population: 2_000, building: "grain-estate" },
  { tier: "town", population: 2_000, building: "horse-ranch" },
  { tier: "city", population: 8_000, building: "grand-granary" },
  { tier: "city", population: 8_000, building: "royal-stud" },
  { tier: "metropolis", population: 16_000, building: "agrarian-heartland" },
  { tier: "metropolis", population: 16_000, building: "imperial-stud" }
]) {
  const scenarioData = freshWorld();
  const settlement = prepareSettlement(scenarioData, scenario.population);
  api.setSettlementTier(scenarioData, { settlementId: settlement.id, tier: scenario.tier }, gm);
  api.addBuilding(scenarioData, { settlementId: settlement.id, catalogId: scenario.building }, gm);
  const civilianSummary = api.calculateSettlement(settlement, scenarioData);
  assert.ok(civilianSummary.foodCoverage >= 1, `${scenario.building} does not feed ${scenario.population} civilian POP`);
  settlement.troops.push({ id: `army-${scenario.building}`, name: "Food Pressure", type: "men-at-arms", count: Math.round(scenario.population * 0.2), maxCount: Math.round(scenario.population * 0.2) });
  assert.ok(api.calculateSettlement(settlement, scenarioData).foodCoverage < civilianSummary.foodCoverage, `${scenario.building} ignores army Food pressure`);
}

// Public Order affects Crown and Growth exactly; population adds visible Order pressure.
const orderData = freshWorld();
const orderSettlement = prepareSettlement(orderData, 100);
orderSettlement.publicOrder = 20;
let orderSummary = api.calculateSettlement(orderSettlement, orderData);
assert.equal(orderSummary.publicOrderBand.id, "unrest");
assert.equal(orderSummary.publicOrderIncomePercent, -50);
assert.equal(orderSummary.publicOrderGrowth, -1);
assert.equal(orderSummary.grossIncome, 500);
orderSettlement.publicOrder = 95;
orderSummary = api.calculateSettlement(orderSettlement, orderData);
assert.equal(orderSummary.publicOrderBand.id, "prosperous");
assert.equal(orderSummary.grossIncome, 1_200);
assert.equal(orderSummary.publicOrderGrowth, 0.5);
assert.equal(api.publicOrderPressureFor(100, orderData.rules), 0);
assert.equal(api.publicOrderPressureFor(800, orderData.rules), -9);
assert.equal(api.publicOrderPressureFor(1_000_000_000, orderData.rules), -25);
assert.equal(api.populationPressureFor(800, orderData.rules), -0.75);

// One Total War-style upkeep is 20% of recruit cost regardless of old mode data.
const menAtArms = catalogWorld.unitCatalog.find(unit => unit.id === "men-at-arms");
assert.equal(api.unitUpkeepFromRules(menAtArms, catalogWorld.rules).upkeep, 130);
const upkeepData = freshWorld();
const upkeepSettlement = prepareSettlement(upkeepData, 100);
upkeepSettlement.troops = [{ id: "maa", name: "Company", type: "men-at-arms", count: 10, maxCount: 10, mode: "campaign" }];
assert.equal(api.calculateSettlement(upkeepSettlement, upkeepData).militaryCostRaw, 1_300);

// Recruitment buildings contribute one pooled monthly limit and retain ancestor unlocks.
const recruitData = freshWorld();
const recruitSettlement = prepareSettlement(recruitData, 500);
api.setSettlementTier(recruitData, { settlementId: recruitSettlement.id, tier: "town" }, gm);
api.addBuilding(recruitData, { settlementId: recruitSettlement.id, catalogId: "infantry-yard" }, gm);
api.addBuilding(recruitData, { settlementId: recruitSettlement.id, catalogId: "laurent-manor" }, gm);
let recruitSummary = api.calculateSettlement(recruitSettlement, recruitData);
assert.equal(recruitSummary.recruitmentCapacity, 25);
const visibleUnits = api.recruitableUnitsContext(
  recruitSettlement,
  recruitData,
  api.permissionsFor(recruitSettlement, false, player.id),
  recruitSummary,
  false
).map(unit => unit.id);
for (const id of ["militia", "watchman", "spearman", "men-at-arms", "archer"]) assert.ok(visibleUnits.includes(id), `${id} should be unlocked`);
const crownBeforeRecruit = recruitSettlement.treasure;
api.queueRecruitment(recruitData, { settlementId: recruitSettlement.id, unitId: "men-at-arms", targetCount: 25, regimentName: "First Cohort" }, player);
assert.equal(recruitSettlement.treasure, crownBeforeRecruit - 25 * 650);
assert.throws(() => api.queueRecruitment(recruitData, { settlementId: recruitSettlement.id, unitId: "militia", targetCount: 1 }, player), /capacity/);
await api.processTurn(recruitData, {}, gm);
assert.equal(recruitSettlement.troops.find(troop => troop.name === "First Cohort").count, 25);

const eliteData = freshWorld();
const eliteSettlement = prepareSettlement(eliteData, 8_000);
api.setSettlementTier(eliteData, { settlementId: eliteSettlement.id, tier: "metropolis" }, gm);
api.addBuilding(eliteData, { settlementId: eliteSettlement.id, catalogId: "war-college" }, gm);
const eliteVisible = api.recruitableUnitsContext(eliteSettlement, eliteData, api.permissionsFor(eliteSettlement, false, player.id), api.calculateSettlement(eliteSettlement, eliteData), false).map(unit => unit.id);
for (const id of ["militia", "watchman", "spearman", "men-at-arms", "veteran-infantry", "sergeant", "royal-guard", "imperial-guard", "war-champion"]) {
  assert.ok(eliteVisible.includes(id), `${id} should remain available through the infantry ancestry`);
}

// Replenishment needs no building and consumes no Recruitment Capacity.
const replenishData = freshWorld();
const replenishSettlement = prepareSettlement(replenishData, 309);
api.queueRecruitment(replenishData, { settlementId: replenishSettlement.id, unitId: "men-at-arms", targetCount: 70, regimentName: "Veteran Company", directGM: true }, gm);
const regiment = replenishSettlement.troops[0];
regiment.count = 58;
replenishSettlement.manpowerReserve = 239;
const replenishTreasure = replenishSettlement.treasure;
api.queueReplenishment(replenishData, { settlementId: replenishSettlement.id, troopId: regiment.id, targetCount: 12 }, player);
const replenishOrder = replenishSettlement.recruitment.at(-1);
assert.equal(replenishOrder.sourceBuildingId, "");
assert.equal(replenishSettlement.treasure, replenishTreasure - 12 * 228);
assert.equal(api.calculateSettlement(replenishSettlement, replenishData).recruitmentCapacity, 0);
await api.processTurn(replenishData, {}, gm);
assert.equal(regiment.count, 70);
assert.equal(replenishOrder.status, "completed");

// Defense buildings provide explicit free garrisons and siege mitigation.
const defenseData = freshWorld();
const defenseSettlement = prepareSettlement(defenseData, 500);
api.setSettlementTier(defenseData, { settlementId: defenseSettlement.id, tier: "town" }, gm);
api.addBuilding(defenseData, { settlementId: defenseSettlement.id, catalogId: "stone-walls" }, gm);
const defenseSummary = api.calculateSettlement(defenseSettlement, defenseData);
assert.equal(defenseSummary.siegeDefensePercent, 20);
assert.equal(defenseSummary.autoGarrison.find(entry => entry.unitId === "spearman").count, 25);
assert.equal(defenseSummary.autoGarrison.find(entry => entry.unitId === "men-at-arms").count, 15);
assert.equal(defenseSummary.autoGarrison.find(entry => entry.unitId === "archer").count, 20);
assert.ok(defenseSummary.autoGarrisonPower > 0);
assert.equal(defenseSummary.militaryCost, 0, "free garrisons must not pay raised-army upkeep");

// Players can transfer Treasury Crown with an audit entry when the GM allows it.
const treasuryData = freshWorld();
const treasurySettlement = prepareSettlement(treasuryData, 100);
treasurySettlement.treasure = 5_000;
api.transferTreasure(treasuryData, { settlementId: treasurySettlement.id, amount: 2_000, direction: "deposit" }, player);
assert.equal(treasurySettlement.treasure, 7_000);
api.transferTreasure(treasuryData, { settlementId: treasurySettlement.id, amount: 3_000, direction: "withdraw" }, player);
assert.equal(treasurySettlement.treasure, 4_000);
assert.match(treasurySettlement.eventLog[0].title, /Withdrawal/);
treasurySettlement.permissions.playersCanTransferTreasure = false;
assert.throws(() => api.transferTreasure(treasuryData, { settlementId: treasurySettlement.id, amount: 1, direction: "deposit" }, player), /cannot transfer/);

// Content Library creates the requested category directly; queued landmarks use no district and replace nothing.
const landmarkData = freshWorld();
const landmarkSettlement = prepareSettlement(landmarkData, 500);
api.addBuilding(landmarkData, { settlementId: landmarkSettlement.id, catalogId: "laurent-manor" }, gm);
const slotsBeforeLandmark = api.calculateSettlement(landmarkSettlement, landmarkData).usedSlots;
api.addCatalogBuilding(landmarkData, { buildingKind: "landmark" }, gm);
const customLandmark = landmarkData.catalog.at(-1);
customLandmark.name = "Hall of Heroes";
customLandmark.cpCost = 1;
customLandmark.crownCost = 0;
customLandmark.materialCost = 0;
customLandmark.description = "A custom player landmark used to verify GM construction workflow.";
assert.equal(customLandmark.landmark, true);
assert.equal(customLandmark.branch, "landmark");
api.queueGmConstruction(landmarkData, { settlementId: landmarkSettlement.id, catalogId: customLandmark.id, chargeResources: false }, gm);
assert.equal(landmarkSettlement.projects.at(-1).slotId, "");
await api.processTurn(landmarkData, {}, gm);
assert.equal(landmarkSettlement.buildings.filter(building => building.landmark).length, 2);
assert.equal(landmarkSettlement.buildings.some(building => building.name === "Hall of Heroes"), true);
assert.equal(api.calculateSettlement(landmarkSettlement, landmarkData).usedSlots, slotsBeforeLandmark);

// Tree layout keeps each branch vertically aligned with its lineage.
const treeLayout = api.treeLineageLayout(catalogWorld.catalog.filter(item => item.chainId === "recruitment"));
assert.equal(treeLayout.columnCount, 3);
assert.match(treeLayout.styles.get("muster-field"), /span 3/);
assert.equal(treeLayout.styles.get("drill-hall"), treeLayout.styles.get("royal-barracks"));
assert.equal(treeLayout.styles.get("stable"), treeLayout.styles.get("cavalry-yard"));
assert.equal(treeLayout.styles.get("marksmen-range"), treeLayout.styles.get("rangers-lodge"));
const unitTrees = api.unitTreeGroups(catalogWorld.unitCatalog.map(unit => ({ ...unit, parentNames: "", sourceBuildingNames: "" })));
assert.deepEqual([...unitTrees.map(tree => tree.id)], ["infantry", "ranged", "cavalry", "siege", "unique"]);
assert.ok(unitTrees.find(tree => tree.id === "unique").nodes.some(unit => unit.id === "knight"));

// Unit Library editing assigns a custom unit directly to recruitment buildings and existing instances.
const unitLibraryData = freshWorld();
const unitLibrarySettlement = prepareSettlement(unitLibraryData, 2_000);
api.setSettlementTier(unitLibraryData, { settlementId: unitLibrarySettlement.id, tier: "city" }, gm);
api.addBuilding(unitLibraryData, { settlementId: unitLibrarySettlement.id, catalogId: "marksmen-range" }, gm);
api.addCatalogUnit(unitLibraryData, { unitKind: "standard" }, gm);
const customUnit = unitLibraryData.unitCatalog.at(-1);
api.updateCatalogUnit(unitLibraryData, {
  unitId: customUnit.id,
  name: "Longbow Retinue",
  enabled: true,
  recruitCost: 2_000,
  tier: 4,
  branch: "ranged",
  parentIds: "crossbowman",
  power: 5,
  foodUpkeep: 1.25,
  maxPerSettlement: 0,
  special: false,
  imageUrl: "",
  actorUuid: "",
  description: "A custom ranged unit used to verify library building assignment.",
  sourceBuildingIds: ["marksmen-range"]
}, gm);
assert.ok(unitLibraryData.catalog.find(building => building.id === "marksmen-range").recruitableUnitIds.includes(customUnit.id));
assert.ok(unitLibrarySettlement.buildings.find(building => building.catalogId === "marksmen-range").recruitableUnitIds.includes(customUnit.id));
assert.equal(customUnit.branch, "ranged");
assert.deepEqual([...customUnit.parentIds], ["crossbowman"]);

// Representative City simulation: eight districts plus a landmark must support long-term growth and a meaningful army.
const cityData = freshWorld();
const city = prepareSettlement(cityData, 5_000);
api.setSettlementTier(cityData, { settlementId: city.id, tier: "city" }, gm);
for (const catalogId of [
  "grand-granary",
  "grand-bazaar",
  "grand-harbor",
  "builders-guild",
  "grand-foundry",
  "cathedral-academy",
  "royal-barracks",
  "citadel"
]) api.addBuilding(cityData, { settlementId: city.id, catalogId }, gm);
api.addBuilding(cityData, { settlementId: city.id, catalogId: "laurent-manor" }, gm);
let citySummary = api.calculateSettlement(city, cityData);
assert.equal(citySummary.usedSlots, 8);
assert.equal(citySummary.unlockedSlots, 8);
assert.ok(citySummary.netIncome > 100_000);
assert.ok(citySummary.foodCoverage >= 1.5);
assert.ok(citySummary.materialsBalance > 0);
assert.ok(citySummary.growthRate > 0);
assert.equal(citySummary.recruitmentCapacity, 50);

const cityRegiment = { id: "city-army", name: "City Field Army", type: "men-at-arms", count: 0, maxCount: 0, mode: "garrison" };
city.troops.push(cityRegiment);
let sustainableArmy = 0;
for (let count = 0; count <= city.population; count += 1) {
  cityRegiment.count = count;
  cityRegiment.maxCount = count;
  const summary = api.calculateSettlement(city, cityData);
  if (summary.netIncome >= 0 && summary.foodCoverage >= 1 && summary.troopManpowerUsed <= summary.manpowerCap) sustainableArmy = count;
  else break;
}
cityRegiment.count = sustainableArmy;
cityRegiment.maxCount = sustainableArmy;
citySummary = api.calculateSettlement(city, cityData);
assert.ok(sustainableArmy >= 1_800 && sustainableArmy <= 2_100, `unexpected sustainable City army: ${sustainableArmy}`);
assert.ok(citySummary.netIncome >= 0);
assert.ok(citySummary.foodCoverage >= 1);
console.log(`City balance: ${citySummary.grossIncome} gross, ${citySummary.buildingUpkeep} building upkeep, ${sustainableArmy} Men-at-Arms sustainable, ${Math.round(citySummary.foodCoverage * 100)}% food coverage.`);

// Individual processing keeps the shared month unchanged.
const turnData = freshWorld();
turnData.month = 10;
const turnSettlement = turnData.settlements[0];
await api.processSingleSettlement(turnData, { settlementId: turnSettlement.id }, gm);
assert.equal(turnData.month, 10);
assert.equal(turnSettlement.lastProcessedMonth, 10);
await assert.rejects(() => api.processSingleSettlement(turnData, { settlementId: turnSettlement.id }, gm), /already been processed/);

// Static UI contracts: obsolete controls are gone and the new workflows are visible.
const hbs = fs.readFileSync(new URL("../templates/ds-panel.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles/ds.css", import.meta.url), "utf8");
assert.doesNotMatch(hbs, /Terrain|Biome|Strategic Resource|Assigned POP|Garrison Upkeep|Campaign Upkeep|Promotion Food|Food Cost|Food Required|Food Paid|name="sourceBuildingId"|bonusEconomicSlots|bonusMilitarySlots/);
assert.match(hbs, /Food Flow/);
assert.match(hbs, /toggleBuildingOperation/);
assert.match(hbs, /playersCanTransferTreasure/);
assert.match(hbs, /queueGmConstruction/);
assert.match(hbs, /Military Building Trees/);
assert.match(hbs, /Unique Units/);
assert.match(hbs, /Recruitment Buildings/);
assert.match(hbs, /Bonus District Slots/);
assert.match(hbs, /no building or recruitment-capacity requirement/);
assert.match(hbs, /Starvation below 50% gives -3% Growth/);
assert.match(hbs, /Unrest 0-24 gives -50% Crown/);
assert.match(css, /\.ds-overview-districts:has\(\.ds-district-branch-overlay\)/);
assert.match(css, /overscroll-behavior:\s*contain/);
assert.match(css, /\.ds-regiment-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
assert.match(css, /\.ds-slot-tree-nodes\s*\{[\s\S]*repeat\(var\(--tree-columns/);

console.log("DS v0.1.13 logic tests passed");
