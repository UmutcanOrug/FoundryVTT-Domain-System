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
  setSettlementTier,
  queueRecruitment,
  queueReplenishment,
  cancelRecruitment,
  processTurn,
  processSingleSettlement,
  resolveMonthEvent,
  undoSettlementTurn,
  calculateSettlement,
  buildWarnings,
  foodSecurityState,
  foodReserveGrowthModifier,
  populationPressureFor,
  treeLineageLayout,
  updateTroop,
  recruitableUnitsContext,
  permissionsFor,
  upsertSample
};`, context, { filename: "ds.js" });

const api = context.__dsTest;
const freshWorld = (templateId = "blank-hamlet") => {
  const raw = api.defaultWorldData();
  const template = raw.settlementTemplates.find(item => item.id === templateId);
  raw.settlements = [api.defaultSettlement(template, raw.rules)];
  return api.normalizeData(raw);
};
const richSettlement = data => {
  const settlement = data.settlements[0];
  settlement.ownerUserIds = [player.id];
  settlement.population = 500;
  settlement.treasure = 10_000_000;
  settlement.food = 100_000;
  settlement.materials = 100_000;
  data.rules.events.enabled = false;
  return settlement;
};

// Schema v7 preserves prior systems, repairs Laurent staffing, and refreshes built-in economic balance.
const stale = api.defaultWorldData();
stale.schemaVersion = 3;
stale.catalog.find(item => item.id === "drill-hall").parentIds = ["muster-field"];
stale.catalog.find(item => item.id === "stable").parentIds = [];
stale.catalog.push({ id: "tannery", name: "Old Tannery", category: "economic", nodeTier: 3 });
stale.settlements = [{
  id: "stale-branch-domain",
  name: "Stale Branch Domain",
  tier: "town",
  population: 500,
  treasure: 10_000_000,
  food: 100_000,
  materials: 100_000,
  publicOrder: 50,
  ownerUserIds: [player.id],
  terrainTags: ["Plains", "Horses"],
  buildings: [{
    id: "direct-infantry-yard",
    catalogId: "infantry-yard",
    slotId: "slot-1",
    name: "Infantry Yard",
    category: "military",
    active: true,
    assignedPop: 15,
    workers: 15,
    parentIds: []
  }],
  slots: Array.from({ length: 18 }, (_, index) => ({ id: `slot-${index + 1}`, index, unlocked: true })),
  troops: [],
  recruitment: [],
  projects: []
}];
const migrated = api.normalizeData(stale);
assert.equal(migrated.schemaVersion, 7);
assert.deepEqual([...migrated.catalog.find(item => item.id === "drill-hall").parentIds], ["infantry-yard"]);
assert.deepEqual([...migrated.catalog.find(item => item.id === "stable").parentIds], ["infantry-yard"]);
assert.equal(migrated.catalog.some(item => item.id === "tannery"), false);
assert.deepEqual([...migrated.settlements[0].buildings[0].parentIds], ["muster-field"]);
api.queueConstruction(migrated, {
  settlementId: migrated.settlements[0].id,
  slotId: migrated.settlements[0].buildings[0].slotId,
  catalogId: "drill-hall"
}, player);
assert.equal(migrated.settlements[0].projects.at(-1).catalogId, "drill-hall");

const legacyLaurentWorld = api.defaultWorldData();
legacyLaurentWorld.schemaVersion = 4;
const legacyLaurentSettlement = legacyLaurentWorld.settlements[0];
const legacyLandmark = legacyLaurentSettlement.buildings.find(building => building.catalogId === "laurent-manor");
legacyLandmark.catalogId = "fortified-estate";
legacyLandmark.name = "Fortified Estate";
legacyLandmark.landmark = false;
legacyLandmark.nodeTier = 2;
legacyLandmark.slotId = "slot-5";
legacyLaurentSettlement.buildings.push({ ...structuredClone(legacyLandmark), id: "duplicate-laurent", catalogId: "ducal-seat", name: "Ducal Seat", nodeTier: 4, slotId: "slot-6" });
const migratedLaurentWorld = api.normalizeData(legacyLaurentWorld);
const migratedLaurentBuildings = migratedLaurentWorld.settlements[0].buildings.filter(building => building.catalogId === "laurent-manor");
assert.equal(migratedLaurentBuildings.length, 1);
assert.equal(migratedLaurentBuildings[0].landmark, true);
assert.equal(migratedLaurentBuildings[0].slotId, "");

const schemaFiveWorld = api.defaultWorldData();
schemaFiveWorld.schemaVersion = 5;
schemaFiveWorld.rules.economy.incomeMultiplier = 1.37;
const schemaFiveManor = schemaFiveWorld.settlements[0].buildings.find(building => building.catalogId === "laurent-manor");
schemaFiveWorld.catalog.find(building => building.id === "laurent-manor").workers = 0;
schemaFiveManor.workers = 5;
schemaFiveManor.assignedPop = 0;
const repairedSchemaFiveWorld = api.normalizeData(schemaFiveWorld);
const repairedManor = repairedSchemaFiveWorld.settlements[0].buildings.find(building => building.catalogId === "laurent-manor");
assert.equal(repairedSchemaFiveWorld.rules.economy.incomeMultiplier, 1.37, "v5 custom rules must survive the targeted v6 migration");
assert.equal(repairedSchemaFiveWorld.catalog.find(building => building.id === "laurent-manor").workers, 5);
assert.equal(repairedManor.workers, 5);
assert.equal(repairedManor.assignedPop, 5);

const schemaSixWorld = api.defaultWorldData();
schemaSixWorld.schemaVersion = 6;
schemaSixWorld.rules.economy.incomeMultiplier = 1.23;
schemaSixWorld.rules.growth.populationPressureStart = 250;
const staleSurveyCatalog = schemaSixWorld.catalog.find(building => building.id === "survey-camp");
staleSurveyCatalog.materialsOutput = 1;
staleSurveyCatalog.rate = 999;
staleSurveyCatalog.imageUrl = "custom/survey.webp";
const staleSurveyBuilding = schemaSixWorld.settlements[0].buildings.find(building => building.catalogId === "survey-camp");
staleSurveyBuilding.materialsOutput = 1;
staleSurveyBuilding.rate = 999;
staleSurveyBuilding.notes = "Keep this settlement note";
const customEconomic = structuredClone(staleSurveyCatalog);
customEconomic.id = "custom-salt-works";
customEconomic.name = "Custom Salt Works";
customEconomic.materialsOutput = 777;
schemaSixWorld.catalog.push(customEconomic);
const migratedSchemaSix = api.normalizeData(schemaSixWorld);
assert.equal(migratedSchemaSix.schemaVersion, 7);
assert.equal(migratedSchemaSix.rules.economy.incomeMultiplier, 1.23);
assert.equal(migratedSchemaSix.rules.growth.populationPressureStart, 250);
assert.equal(migratedSchemaSix.catalog.find(building => building.id === "survey-camp").materialsOutput, 180);
assert.equal(migratedSchemaSix.catalog.find(building => building.id === "survey-camp").rate, 0);
assert.equal(migratedSchemaSix.catalog.find(building => building.id === "survey-camp").imageUrl, "custom/survey.webp");
assert.equal(migratedSchemaSix.settlements[0].buildings.find(building => building.catalogId === "survey-camp").materialsOutput, 180);
assert.equal(migratedSchemaSix.settlements[0].buildings.find(building => building.catalogId === "survey-camp").notes, "Keep this settlement note");
assert.equal(migratedSchemaSix.catalog.find(building => building.id === "custom-salt-works").materialsOutput, 777);

// Tier downgrade shrinks empty Metropolis slots while preserving occupied districts.
const downgradeData = freshWorld();
const downgradeSettlement = richSettlement(downgradeData);
api.setSettlementTier(downgradeData, { settlementId: downgradeSettlement.id, tier: "metropolis" }, gm);
api.addBuilding(downgradeData, { settlementId: downgradeSettlement.id, catalogId: "land-clearance" }, gm);
api.addBuilding(downgradeData, { settlementId: downgradeSettlement.id, catalogId: "watch-post" }, gm);
assert.equal(downgradeSettlement.slots.length, 18);
api.setSettlementTier(downgradeData, { settlementId: downgradeSettlement.id, tier: "hamlet" }, gm);
assert.equal(downgradeSettlement.slots.length, 4);
assert.equal(downgradeSettlement.buildings.length, 2);

// Every normal built-in family spans T1-T5; landmarks are tierless and fully described.
const catalogWorld = api.defaultWorldData();
const tiersByBranch = new Map();
for (const building of catalogWorld.catalog) {
  if (building.landmark) {
    assert.equal(building.nodeTier, 0);
    assert.equal(building.slotUse, 0);
    assert.ok(building.description.length > 20, `${building.id} needs a description`);
    continue;
  }
  if (!tiersByBranch.has(building.chainId)) tiersByBranch.set(building.chainId, new Set());
  tiersByBranch.get(building.chainId).add(building.nodeTier);
  assert.equal(building.settlementTier, ["hamlet", "village", "town", "city", "metropolis"][building.nodeTier - 1]);
  assert.ok(building.description.length > 20, `${building.id} needs a description`);
  for (const parentId of building.parentIds) {
    const parent = catalogWorld.catalog.find(item => item.id === parentId);
    assert.ok(parent, `${building.id} has a missing parent`);
    assert.equal(parent.nodeTier, building.nodeTier - 1);
  }
}
for (const [branchId, tiers] of tiersByBranch) {
  assert.deepEqual([...tiers].sort(), [1, 2, 3, 4, 5], `${branchId} must span all settlement tiers`);
}
for (const building of catalogWorld.catalog.filter(item => !item.landmark && item.parentIds.length)) {
  for (const parentId of building.parentIds) {
    const parent = catalogWorld.catalog.find(item => item.id === parentId);
    assert.ok(building.crownCost > parent.crownCost, `${building.id} Crown cost must progress beyond ${parentId}`);
    assert.ok(building.cpCost > parent.cpCost, `${building.id} CP cost must progress beyond ${parentId}`);
    assert.ok(building.materialCost >= parent.materialCost, `${building.id} Materials cost must not regress below ${parentId}`);
  }
}

// Economic families have explicit pure, hybrid, Crown, and civic identities.
const economicBuildings = catalogWorld.catalog.filter(item => item.category === "economic");
for (const building of economicBuildings) {
  assert.equal(building.uniqueChain, false, `${building.id} should permit more than one district in its family`);
  assert.equal(building.maxPerSettlement, 2, `${building.id} should support a second long-term investment`);
  if (building.branch === "food") {
    assert.equal(building.materialsOutput, 0, `${building.id} mixes Food and Materials`);
    assert.equal(building.publicOrder, 0, `${building.id} should not provide Public Order`);
  }
  if (building.branch === "materials") assert.equal(building.foodOutput, 0, `${building.id} mixes Materials and Food`);
}
for (const id of ["land-clearance", "farmstead", "grain-estate", "grand-granary", "agrarian-heartland"]) {
  const building = economicBuildings.find(item => item.id === id);
  assert.equal(building.rate, 0, `${id} must be pure Food`);
  assert.equal(building.flatOutput, 0, `${id} must be pure Food`);
  assert.ok(building.foodOutput > 0, `${id} needs Food output`);
}
for (const id of ["horse-ranch", "royal-stud", "imperial-stud"]) {
  const building = economicBuildings.find(item => item.id === id);
  assert.ok(building.rate > 0 || building.flatOutput > 0, `${id} needs hybrid Crown output`);
  assert.ok(building.foodOutput > 0, `${id} needs hybrid Food output`);
  assert.ok(building.growth > 0, `${id} needs a Growth identity`);
}
for (const id of ["survey-camp", "stone-quarry", "masonry-district", "builders-guild", "monumental-works"]) {
  const building = economicBuildings.find(item => item.id === id);
  assert.equal(building.rate, 0, `${id} must be pure Materials`);
  assert.equal(building.flatOutput, 0, `${id} must be pure Materials`);
  assert.ok(building.materialsOutput > 0, `${id} needs Materials output`);
}
for (const id of ["iron-mine", "ironworks", "grand-foundry", "industrial-complex"]) {
  const building = economicBuildings.find(item => item.id === id);
  assert.ok(building.rate > 0 || building.flatOutput > 0, `${id} needs hybrid Crown output`);
  assert.ok(building.materialsOutput > 0, `${id} needs hybrid Materials output`);
  assert.ok(building.grantsTags.includes("iron"), `${id} needs Iron access`);
}
for (const building of economicBuildings.filter(item => item.branch === "commerce")) {
  assert.ok(building.rate > 0 || building.flatOutput > 0, `${building.id} needs Crown output`);
  assert.equal(building.foodOutput, 0);
  assert.equal(building.materialsOutput, 0);
}
for (const building of economicBuildings.filter(item => item.branch === "civic")) {
  assert.equal(building.rate, 0, `${building.id} should not print Crown`);
  assert.equal(building.flatOutput, 0, `${building.id} should not print Crown`);
  assert.ok(building.publicOrder > 0 || building.growth > 0 || building.eventRollBonus > 0 || building.mitigationTags.length > 0);
}
assert.deepEqual([...catalogWorld.rules.tiers.map(tier => tier.baseIncomePerFreePop)], [10, 20, 30, 40, 50]);

// Food branch siblings are sidegrades: grain maximizes Food, pastoral favors Growth, Crown, and horses.
const grainEstate = catalogWorld.catalog.find(item => item.id === "grain-estate");
const pastoralRanch = catalogWorld.catalog.find(item => item.id === "horse-ranch");
assert.ok(grainEstate.foodOutput > pastoralRanch.foodOutput);
assert.ok(pastoralRanch.growth > grainEstate.growth);
assert.ok(pastoralRanch.workers * pastoralRanch.rate + pastoralRanch.flatOutput - pastoralRanch.buildingUpkeep
  > grainEstate.workers * grainEstate.rate + grainEstate.flatOutput - grainEstate.buildingUpkeep);
assert.ok(pastoralRanch.grantsTags.includes("horses"));

const stoneQuarry = catalogWorld.catalog.find(item => item.id === "stone-quarry");
const ironMine = catalogWorld.catalog.find(item => item.id === "iron-mine");
assert.ok(stoneQuarry.materialsOutput > ironMine.materialsOutput);
assert.ok(stoneQuarry.constructionBonus > ironMine.constructionBonus);
assert.ok(ironMine.rate > 0 && ironMine.recruitmentDiscount > 0);
const worldMarket = catalogWorld.catalog.find(item => item.id === "world-market");
const imperialPort = catalogWorld.catalog.find(item => item.id === "imperial-port");
assert.ok(imperialPort.workers * imperialPort.rate + imperialPort.flatOutput - imperialPort.buildingUpkeep
  > worldMarket.workers * worldMarket.rate + worldMarket.flatOutput - worldMarket.buildingUpkeep);
assert.ok(imperialPort.eventRollBonus > worldMarket.eventRollBonus);
assert.equal(worldMarket.bonusEconomicSlots, 1);
const culturalCapital = catalogWorld.catalog.find(item => item.id === "cultural-capital");
const sacredUniversity = catalogWorld.catalog.find(item => item.id === "sacred-university");
assert.ok(culturalCapital.publicOrder > sacredUniversity.publicOrder);
assert.ok(culturalCapital.eventRollBonus > sacredUniversity.eventRollBonus);
assert.ok(sacredUniversity.growth > culturalCapital.growth);
assert.ok(sacredUniversity.mitigationTags.length > culturalCapital.mitigationTags.length);
const valuesFor = (ids, field) => ids.map(id => catalogWorld.catalog.find(item => item.id === id)[field]);
const assertIncreasing = (values, label) => values.slice(1).forEach((value, index) => assert.ok(value > values[index], `${label} must increase by tier`));
assertIncreasing(valuesFor(["land-clearance", "farmstead", "grain-estate", "grand-granary", "agrarian-heartland"], "foodOutput"), "pure Food output");
assertIncreasing(valuesFor(["horse-ranch", "royal-stud", "imperial-stud"], "foodOutput"), "hybrid Food output");
assertIncreasing(valuesFor(["survey-camp", "stone-quarry", "masonry-district", "builders-guild", "monumental-works"], "materialsOutput"), "pure Materials output");
assertIncreasing(valuesFor(["iron-mine", "ironworks", "grand-foundry", "industrial-complex"], "materialsOutput"), "hybrid Materials output");

// De Laurent remains a Village with one tierless landmark and a sustainable economy.
const deLaurent = catalogWorld.settlements[0];
const deLaurentSummary = api.calculateSettlement(deLaurent, catalogWorld);
assert.equal(deLaurent.tier, "village");
assert.ok(deLaurent.buildings.filter(building => !building.landmark).every(building => building.nodeTier <= 2));
assert.deepEqual([...deLaurent.buildings.map(building => building.catalogId)], ["survey-camp", "market-town", "stone-quarry", "farmstead", "laurent-manor"]);
const laurentManor = deLaurent.buildings.find(building => building.catalogId === "laurent-manor");
assert.equal(laurentManor.landmark, true);
assert.equal(laurentManor.slotId, "");
assert.equal(laurentManor.workers, 5);
assert.equal(laurentManor.assignedPop, 5);
assert.equal(deLaurent.slots.some(slot => slot.reservedByBuildingId === laurentManor.id), false);
assert.equal(deLaurentSummary.manpowerCap, 309);
assert.equal(deLaurentSummary.manpowerReserve, 209);
assert.equal(deLaurentSummary.manpowerRecovery, 31);
assert.equal(deLaurentSummary.troopManpowerUsed, 100);
assert.equal(deLaurentSummary.civilianPopulation, 309);
assert.equal(deLaurentSummary.freePop, 236);
assert.equal(deLaurentSummary.militaryCapacity, 350);
assert.equal(api.buildWarnings(deLaurent, catalogWorld, deLaurentSummary).some(warning => warning.includes("Laurent Manor")), false);
assert.ok(deLaurentSummary.netIncome > 0);
assert.ok(deLaurentSummary.foodBalance > 0);

// Free POP income increases with settlement tier.
for (const [index, tierId] of ["hamlet", "village", "town", "city", "metropolis"].entries()) {
  const data = freshWorld();
  const settlement = data.settlements[0];
  settlement.population = 100;
  api.setSettlementTier(data, { settlementId: settlement.id, tier: tierId }, gm);
  assert.equal(api.calculateSettlement(settlement, data).baseIncome, 100 * (index + 1) * 10);
}

// Recruitment creates current/max strength; casualties and replenishment preserve maximum strength.
const armyData = freshWorld();
const armySettlement = richSettlement(armyData);
api.setSettlementTier(armyData, { settlementId: armySettlement.id, tier: "town" }, gm);
api.addBuilding(armyData, { settlementId: armySettlement.id, catalogId: "infantry-yard", assignedPop: 15 }, gm);
const infantryYard = armySettlement.buildings.find(building => building.catalogId === "infantry-yard");
const visibleUnits = api.recruitableUnitsContext(
  armySettlement,
  armyData,
  api.permissionsFor(armySettlement, false, player.id),
  api.calculateSettlement(armySettlement, armyData),
  false
).map(unit => unit.id);
assert.deepEqual([...visibleUnits].sort(), ["men-at-arms", "spearman"]);

const crownBeforeRecruit = armySettlement.treasure;
const manpowerBeforeRecruit = armySettlement.manpowerReserve;
api.queueRecruitment(armyData, {
  settlementId: armySettlement.id,
  unitId: "men-at-arms",
  sourceBuildingId: infantryYard.id,
  targetCount: 10,
  regimentName: "First Company",
  actorUuid: "Actor.first-company"
}, player);
assert.equal(armySettlement.treasure, crownBeforeRecruit - 6_500);
assert.equal(armySettlement.manpowerReserve, manpowerBeforeRecruit - 10);
const recruitOrder = armySettlement.recruitment.at(-1);
api.cancelRecruitment(armyData, { settlementId: armySettlement.id, recruitmentId: recruitOrder.id }, player);
assert.equal(armySettlement.manpowerReserve, manpowerBeforeRecruit);
assert.equal(armySettlement.treasure, crownBeforeRecruit);
api.queueRecruitment(armyData, {
  settlementId: armySettlement.id,
  unitId: "men-at-arms",
  sourceBuildingId: infantryYard.id,
  targetCount: 10,
  regimentName: "First Company",
  actorUuid: "Actor.first-company"
}, player);
await api.processTurn(armyData, {}, gm);
const regiment = armySettlement.troops.find(troop => troop.name === "First Company");
assert.equal(regiment.count, 10);
assert.equal(regiment.maxCount, 10);
assert.equal(regiment.actorUuid, "Actor.first-company");

api.updateTroop(armyData, {
  settlementId: armySettlement.id,
  troopId: regiment.id,
  name: regiment.name,
  count: 7,
  mode: "garrison",
  imageUrl: regiment.imageUrl,
  actorUuid: regiment.actorUuid,
  notes: "Three casualties"
}, player);
assert.equal(regiment.count, 7);
assert.equal(regiment.maxCount, 10);
api.updateTroop(armyData, {
  settlementId: armySettlement.id,
  troopId: regiment.id,
  count: 10,
  mode: "garrison"
}, player);
assert.equal(regiment.count, 7, "players cannot restore casualties without replenishment");
const crownBeforeReplenish = armySettlement.treasure;
const manpowerBeforeReplenish = armySettlement.manpowerReserve;
infantryYard.recruitPerLevel = 1;
api.queueReplenishment(armyData, {
  settlementId: armySettlement.id,
  troopId: regiment.id,
  sourceBuildingId: infantryYard.id,
  targetCount: 3
}, player);
assert.equal(armySettlement.treasure, crownBeforeReplenish - 684);
assert.equal(armySettlement.manpowerReserve, manpowerBeforeReplenish - 3);
assert.equal(armySettlement.recruitment.at(-1).kind, "replenishment");
await api.processTurn(armyData, {}, gm);
assert.equal(regiment.count, 10);
assert.equal(regiment.maxCount, 10);
assert.equal(armySettlement.recruitment.at(-1).status, "completed", "replenishment must finish despite source capacity 1");

// Army manpower never subtracts civilian POP, and army Food is charged separately.
const armySummary = api.calculateSettlement(armySettlement, armyData);
assert.equal(armySummary.civilianPopulation, armySettlement.population);
assert.equal(armySummary.manpowerCap, armySettlement.population);
assert.equal(armySummary.troopManpowerUsed, 10);
assert.ok(armySummary.armyFood > 0);
assert.equal(armySummary.manpowerRecoveryRate, 10);

// Manpower reserve recovers by 10% of capacity each processed month and casualties do not refund it.
const reserveData = freshWorld();
reserveData.rules.events.enabled = false;
const reserveSettlement = reserveData.settlements[0];
reserveSettlement.population = 309;
reserveSettlement.manpowerReserve = 100;
await api.processSingleSettlement(reserveData, { settlementId: reserveSettlement.id }, gm);
assert.equal(reserveSettlement.manpowerReserve, 131);
assert.equal(api.calculateSettlement(reserveSettlement, reserveData).manpowerRecovery, 31);

// Policies have tier gates and explicit tradeoffs.
const policyData = freshWorld();
const policySettlement = policyData.settlements[0];
policySettlement.population = 100;
let balanced = api.calculateSettlement(policySettlement, policyData);
policySettlement.policyId = "growth-rations";
let rations = api.calculateSettlement(policySettlement, policyData);
assert.equal(rations.foodConsumption - balanced.foodConsumption, 100);
assert.ok(rations.growthRate > balanced.growthRate);
api.setSettlementTier(policyData, { settlementId: policySettlement.id, tier: "town" }, gm);
policySettlement.policyId = "heavy-taxation";
const taxed = api.calculateSettlement(policySettlement, policyData);
assert.equal(taxed.grossIncome, Math.round(taxed.baseIncome * 1.25));
assert.ok(taxed.effectivePublicOrder < balanced.effectivePublicOrder);

// Public Order uses visible bands, while Defense reports tier-relative protection.
policySettlement.policyId = "balanced";
policySettlement.publicOrder = 20;
let orderSummary = api.calculateSettlement(policySettlement, policyData);
assert.equal(orderSummary.publicOrderBand.id, "unrest");
assert.equal(orderSummary.publicOrderGrowth, -0.75);
policySettlement.publicOrder = 95;
orderSummary = api.calculateSettlement(policySettlement, policyData);
assert.equal(orderSummary.publicOrderBand.id, "prosperous");
assert.equal(orderSummary.publicOrderGrowth, 0.5);
assert.equal(orderSummary.defenseTarget, 160);

// Food Security is ratio-based and capped; reserve depth and POP pressure remain bounded.
assert.equal(api.foodSecurityState(0.49).id, "critical");
assert.equal(api.foodSecurityState(0.5).id, "strained");
assert.equal(api.foodSecurityState(1).id, "sustained");
assert.equal(api.foodSecurityState(1.25).id, "secure");
assert.equal(api.foodSecurityState(1.5).id, "abundant");
assert.equal(api.foodSecurityState(2).id, "overflowing");
assert.equal(api.foodSecurityState(20).growth, 1);
assert.equal(api.foodReserveGrowthModifier(0.9), -0.25);
assert.equal(api.foodReserveGrowthModifier(1), 0);
assert.equal(api.foodReserveGrowthModifier(3), 0.1);
assert.equal(api.foodReserveGrowthModifier(60), 0.2);
assert.equal(api.populationPressureFor(100, catalogWorld.rules), 0);
assert.equal(api.populationPressureFor(800, catalogWorld.rules), -0.75);
assert.ok(api.populationPressureFor(8_000, catalogWorld.rules) < api.populationPressureFor(2_000, catalogWorld.rules));
assert.equal(api.populationPressureFor(1_000_000_000, catalogWorld.rules), -3);

const growthScenario = (population, tier, buildingIds = []) => {
  const data = freshWorld();
  const settlement = data.settlements[0];
  settlement.population = population;
  settlement.food = population * 8;
  settlement.treasure = 100_000_000;
  settlement.materials = 1_000_000;
  api.setSettlementTier(data, { settlementId: settlement.id, tier }, gm);
  for (const catalogId of buildingIds) api.addBuilding(data, { settlementId: settlement.id, catalogId }, gm);
  return api.calculateSettlement(settlement, data);
};
for (const scenario of [
  growthScenario(100, "village", ["farmstead"]),
  growthScenario(500, "town", ["horse-ranch", "shrine-district"]),
  growthScenario(2_000, "city", ["grand-granary", "cathedral-academy"]),
  growthScenario(8_000, "metropolis", ["agrarian-heartland", "sacred-university"])
]) {
  assert.ok(scenario.foodCoverage >= 1, "invested settlements should cover Food consumption");
  assert.ok(scenario.growthRate > 0, "sensible Food and Growth investment should remain viable");
}
const uninvestedMetropolis = growthScenario(8_000, "metropolis");
const investedMetropolis = growthScenario(8_000, "metropolis", ["agrarian-heartland", "sacred-university"]);
assert.ok(uninvestedMetropolis.growthRate < 0, "an uninvested metropolis should stagnate");
assert.ok(investedMetropolis.growthRate > 0, "top-tier Food and Civic investment should overcome pressure");
assert.ok(investedMetropolis.foodSecurityGrowth <= 1.2, "Food Security plus reserves must stay capped");

const treeLayout = api.treeLineageLayout(catalogWorld.catalog.filter(item => item.chainId === "recruitment"));
assert.equal(treeLayout.columnCount, 3);
assert.match(treeLayout.styles.get("muster-field"), /span 3/);
assert.equal(treeLayout.styles.get("drill-hall"), treeLayout.styles.get("royal-barracks"));
assert.equal(treeLayout.styles.get("stable"), treeLayout.styles.get("cavalry-yard"));
assert.equal(treeLayout.styles.get("marksmen-range"), treeLayout.styles.get("rangers-lodge"));

// Month events create editable temporary percentage modifiers and never inject flat resources.
const eventData = freshWorld();
const eventSettlement = eventData.settlements[0];
const treasureBeforeEvent = eventSettlement.treasure;
eventSettlement.pendingEvents = [{
  id: "event-test",
  eventId: "merchant-caravan",
  month: 1,
  rawRoll: 75,
  modifier: 0,
  finalRoll: 75,
  name: "Merchant Caravan",
  description: "Trade opportunity.",
  severity: "opportunity",
  effects: { incomePercent: 15, recruitmentCostPercent: -5 },
  duration: 2,
  status: "pending",
  created: Date.now()
}];
api.resolveMonthEvent(eventData, {
  settlementId: eventSettlement.id,
  eventId: "event-test",
  resolution: "apply",
  incomePercent: 15,
  recruitmentCostPercent: -5,
  duration: 2
}, gm);
assert.equal(eventSettlement.treasure, treasureBeforeEvent);
assert.equal(eventSettlement.activeEffects.length, 1);
assert.equal(eventSettlement.activeEffects[0].remainingMonths, 2);
assert.equal(api.calculateSettlement(eventSettlement, eventData).activeModifiers.incomePercent, 15);
eventData.rules.events.enabled = false;
await api.processTurn(eventData, {}, gm);
assert.equal(eventSettlement.activeEffects[0].remainingMonths, 1);
await api.processTurn(eventData, {}, gm);
assert.equal(eventSettlement.activeEffects.length, 0);

const narrativeData = freshWorld();
const narrativeSettlement = narrativeData.settlements[0];
narrativeSettlement.pendingEvents = [{
  id: "narrative-event",
  eventId: "local-festival",
  month: 1,
  rawRoll: 80,
  modifier: 0,
  finalRoll: 80,
  name: "Local Festival",
  description: "The GM decides the story outcome.",
  severity: "opportunity",
  effects: { incomePercent: 25, growth: 1 },
  duration: 3,
  status: "pending",
  created: Date.now()
}];
api.resolveMonthEvent(narrativeData, {
  settlementId: narrativeSettlement.id,
  eventId: "narrative-event",
  resolution: "narrative",
  incomePercent: 25,
  growth: 1,
  duration: 3
}, gm);
assert.equal(narrativeSettlement.activeEffects.length, 0);
assert.equal(narrativeSettlement.pendingEvents[0].status, "narrative");

// Top-tier military branches unlock distinct elite rosters.
const byId = id => catalogWorld.catalog.find(item => item.id === id).recruitableUnitIds;
assert.deepEqual([...byId("war-college")], ["imperial-guard", "war-champion"]);
assert.deepEqual([...byId("knightly-order")], ["knight"]);
assert.deepEqual([...byId("imperial-marksmen")], ["imperial-marksman"]);
assert.deepEqual([...byId("grand-arsenal")], ["grand-artillery"]);
for (const unit of catalogWorld.unitCatalog) {
  assert.ok(unit.power > 0);
  assert.ok(unit.foodUpkeep >= 0);
  assert.equal(Object.hasOwn(unit, "role"), false);
  assert.equal(Object.hasOwn(unit, "melee"), false);
  assert.equal(Object.hasOwn(unit, "mobility"), false);
}

// GM direct recruitment remains available without a building and completes immediately.
const directData = freshWorld();
const directSettlement = directData.settlements[0];
api.queueRecruitment(directData, { settlementId: directSettlement.id, unitId: "militia", targetCount: 2 }, gm);
assert.equal(directSettlement.troops[0].count, 2);
assert.equal(directSettlement.troops[0].maxCount, 2);
assert.equal(directSettlement.treasure, 25_000);

// Individual turns still do not advance the shared month.
const turnData = freshWorld();
turnData.rules.events.enabled = false;
const turnSettlement = turnData.settlements[0];
turnData.month = 10;
await api.processSingleSettlement(turnData, { settlementId: turnSettlement.id }, gm);
assert.equal(turnData.month, 10);
assert.equal(turnSettlement.lastProcessedMonth, 10);
await assert.rejects(() => api.processSingleSettlement(turnData, { settlementId: turnSettlement.id }, gm), /already been processed/);

// De Laurent is never used as a reusable template or overwritten by the restore command.
const protectedWorld = api.defaultWorldData();
protectedWorld.settlements[0].name = "De Laurent - Player Edited";
api.upsertSample(protectedWorld);
assert.equal(protectedWorld.settlements.length, 1);
assert.equal(protectedWorld.settlements[0].name, "De Laurent - Player Edited");
assert.equal(protectedWorld.settlementTemplates.some(template => template.id === "de-laurent"), false);

const hbs = fs.readFileSync(new URL("../templates/ds-panel.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles/ds.css", import.meta.url), "utf8");
assert.doesNotMatch(hbs, /Professional Capacity|Militia Capacity|Mobility|fa-person-rifle/);
assert.match(hbs, /queueReplenishment/);
assert.match(hbs, /Settlement Policy/);
assert.doesNotMatch(hbs, /<details class="ds-overview-slot/);
assert.match(hbs, /data-overview-slot-id/);
assert.match(hbs, /ds-district-branch-overlay/);
assert.match(hbs, /ds-branch-workspace/);
assert.match(hbs, /data-branch-detail-content/);
assert.match(hbs, /Month-End Replenishment/);
assert.match(hbs, /Narrative Only/);
assert.match(hbs, /Growth and Food Security/);
assert.match(hbs, /--tree-columns/);
assert.match(hbs, /style="\{\{treeStyle\}\}"/);
assert.match(css, /\.ds-unit-recruit-grid,[\s\S]*grid-template-columns:\s*repeat\(2,/);
assert.match(css, /\.ds-overview-slot-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,/);
assert.match(css, /\.ds-overview-districts\s*\{[\s\S]*align-content:\s*start/);
assert.match(css, /\.ds-root button\.ds-overview-slot\s*\{/);
assert.match(css, /\.ds-district-branch-overlay\s*\{[\s\S]*background-color:\s*#090d0a\s*!important/);
assert.match(css, /\.ds-branch-detail-panel\s*\{/);
assert.match(css, /\.ds-branch-green/);
assert.match(css, /\.ds-node-tooltip/);
assert.match(css, /grid-template-columns:\s*repeat\(var\(--tree-columns/);

console.log("DS v0.1.11 logic tests passed");
