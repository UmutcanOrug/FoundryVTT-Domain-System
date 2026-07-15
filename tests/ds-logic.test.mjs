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
  synchronizeBuildingGarrisons,
  troopAvailableForDefense,
  addSettlementEffect,
  updateSettlementEffect,
  createBuildingWizard,
  createUnitWizard,
  createRegimentWizard,
  importData,
  recruitableUnitsContext,
  permissionsFor,
  toggleBuildingOperation,
  deleteBuilding,
  processRecruitment,
  addContentCategory,
  updateContentCategory,
  transferTreasure,
  unitUpkeepFromRules,
  constructionCost,
  settlementConstructionBenefits,
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

// Schema v12 and settlement hierarchy defaults.
const defaults = api.defaultWorldData();
assert.equal(defaults.schemaVersion, 12);
assert.deepEqual(
  [...defaults.rules.tiers.map(tier => [tier.openSlots, tier.maxSlots])],
  [[2, 3], [3, 4], [4, 6], [6, 8], [8, 10]]
);
assert.equal(defaults.rules.military.upkeepPercent, 20);
assert.equal(defaults.rules.military.manpowerRecoveryRate, 10);
assert.equal(defaults.rules.economy.replenishmentCostPercent, 35);
assert.deepEqual(
  [...defaults.rules.tiers.map(tier => tier.promotionCost)],
  [0, 20_000, 80_000, 300_000, 1_000_000]
);

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
assert.equal(migrated.schemaVersion, 12);
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

// Schema v12 keeps legacy player regiments raised and turns building garrisons into persistent casualty-capable records.
const schemaEleven = api.defaultWorldData();
schemaEleven.schemaVersion = 11;
schemaEleven.settlements[0].troops[0].mode = "garrison";
const migratedTwelve = api.normalizeData(schemaEleven);
assert.equal(migratedTwelve.settlements[0].troops.find(troop => troop.id === "dl-maa").mode, "raised");

const garrisonData = freshWorld();
const garrisonSettlement = prepareSettlement(garrisonData, 500);
api.addBuilding(garrisonData, { settlementId: garrisonSettlement.id, catalogId: "laurent-manor" }, gm);
let garrisonSummary = api.calculateSettlement(garrisonSettlement, garrisonData);
const sourceGarrison = garrisonSettlement.troops.find(troop => troop.sourceCatalogId === "laurent-manor");
assert.ok(sourceGarrison, "landmark should create real garrison regiments");
assert.equal(sourceGarrison.mode, "garrison");
assert.equal(sourceGarrison.freeUpkeep, true);
assert.equal(sourceGarrison.usesManpower, false);
assert.equal(sourceGarrison.lockedToGarrison, true);
assert.equal(garrisonSummary.militaryCost, 0);
assert.equal(garrisonSummary.troopManpowerUsed, 0);
assert.ok(garrisonSummary.garrisonPower > 0);

sourceGarrison.count = Math.max(0, sourceGarrison.maxCount - 3);
const damagedCount = sourceGarrison.count;
api.calculateSettlement(garrisonSettlement, garrisonData);
assert.equal(sourceGarrison.count, damagedCount, "garrison casualties must survive recalculation");
const activeFood = api.calculateSettlement(garrisonSettlement, garrisonData).foodConsumption;
const sourceBuilding = garrisonSettlement.buildings.find(building => building.id === sourceGarrison.sourceBuildingId);
api.toggleBuildingOperation(garrisonData, { settlementId: garrisonSettlement.id, buildingId: sourceBuilding.id, operation: "halt" }, gm);
const haltedSummary = api.calculateSettlement(garrisonSettlement, garrisonData);
assert.equal(api.troopAvailableForDefense(sourceGarrison, garrisonSettlement), false);
assert.ok(haltedSummary.garrisonPower < garrisonSummary.garrisonPower);
assert.ok(haltedSummary.foodConsumption < activeFood);
api.toggleBuildingOperation(garrisonData, { settlementId: garrisonSettlement.id, buildingId: sourceBuilding.id, operation: "continue" }, gm);

const reserveBeforeReplenishment = garrisonSettlement.manpowerReserve;
const recruitmentCapacityBefore = api.calculateSettlement(garrisonSettlement, garrisonData).recruitmentCapacity;
api.queueReplenishment(garrisonData, { settlementId: garrisonSettlement.id, troopId: sourceGarrison.id, targetCount: 3 }, player);
const garrisonReplenishment = garrisonSettlement.recruitment.find(order => order.regimentId === sourceGarrison.id);
assert.equal(garrisonReplenishment.kind, "replenishment");
assert.equal(api.calculateSettlement(garrisonSettlement, garrisonData).recruitmentCapacity, recruitmentCapacityBefore);
assert.equal(garrisonSettlement.manpowerReserve, reserveBeforeReplenishment - 3);
await api.processSingleSettlement(garrisonData, { settlementId: garrisonSettlement.id }, gm);
assert.equal(sourceGarrison.count, sourceGarrison.maxCount);
assert.equal(garrisonReplenishment.status, "completed");

sourceGarrison.count -= 1;
const treasureBeforeOrphan = garrisonSettlement.treasure;
api.queueReplenishment(garrisonData, { settlementId: garrisonSettlement.id, troopId: sourceGarrison.id, targetCount: 1 }, player);
const orphanOrder = garrisonSettlement.recruitment.find(order => order.regimentId === sourceGarrison.id && order.status !== "completed");
api.deleteBuilding(garrisonData, { settlementId: garrisonSettlement.id, buildingId: sourceBuilding.id }, gm);
api.calculateSettlement(garrisonSettlement, garrisonData);
api.processRecruitment(garrisonSettlement, garrisonData);
assert.equal(orphanOrder.status, "completed");
assert.equal(garrisonSettlement.treasure, treasureBeforeOrphan);
assert.equal(garrisonSettlement.troops.some(troop => troop.sourceRecruitmentId === orphanOrder.id), false);

// GM settlement modifiers support timed/hidden effects and permanent edits.
api.addSettlementEffect(garrisonData, {
  settlementId: garrisonSettlement.id,
  name: "Royal Favor",
  kind: "buff",
  source: "Campaign",
  visible: false,
  remainingMonths: 3,
  incomePercent: 15,
  publicOrder: 4,
  description: "A temporary campaign reward."
}, gm);
const royalFavor = garrisonSettlement.activeEffects[0];
assert.equal(royalFavor.visible, false);
assert.equal(royalFavor.effects.incomePercent, 15);
assert.equal(royalFavor.remainingMonths, 3);
api.updateSettlementEffect(garrisonData, {
  settlementId: garrisonSettlement.id,
  effectId: royalFavor.id,
  name: royalFavor.name,
  kind: "buff",
  source: royalFavor.source,
  permanent: true,
  visible: true,
  incomePercent: 10,
  publicOrder: 2
}, gm);
assert.equal(royalFavor.permanent, true);
assert.equal(royalFavor.remainingMonths, 0);
assert.equal(royalFavor.visible, true);

// Content wizards create linked building/unit chains and the regiment wizard places existing templates directly.
const wizardData = freshWorld();
const wizardSettlement = prepareSettlement(wizardData, 500);
api.createBuildingWizard(wizardData, {
  categoryId: "food",
  nodes: [
    { localId: "root", name: "Apiary", nodeTier: 1, foodOutput: 150, workers: 5 },
    { localId: "child", name: "Royal Apiary", nodeTier: 2, parentRefs: ["root"], foodOutput: 400, workers: 10 }
  ]
}, gm);
const apiary = wizardData.catalog.find(item => item.name === "Apiary");
const royalApiary = wizardData.catalog.find(item => item.name === "Royal Apiary");
assert.ok(apiary && royalApiary);
assert.deepEqual([...royalApiary.parentIds], [apiary.id]);
assert.equal(royalApiary.chainId, apiary.chainId);
api.createUnitWizard(wizardData, {
  categoryId: "infantry",
  nodes: [
    { localId: "root", name: "Household Levy", tier: 1, recruitCost: 200, sourceBuildingIds: ["muster-field"] },
    { localId: "child", name: "Household Spear", tier: 2, parentRefs: ["root"], recruitCost: 500, sourceBuildingIds: ["infantry-yard"] }
  ]
}, gm);
const householdLevy = wizardData.unitCatalog.find(item => item.name === "Household Levy");
const householdSpear = wizardData.unitCatalog.find(item => item.name === "Household Spear");
assert.deepEqual([...householdSpear.parentIds], [householdLevy.id]);
assert.ok(wizardData.catalog.find(item => item.id === "muster-field").recruitableUnitIds.includes(householdLevy.id));
api.createRegimentWizard(wizardData, { settlementId: wizardSettlement.id, unitId: householdSpear.id, name: "Red Spears", mode: "garrison", count: 7, maxCount: 10 }, gm);
const directGarrison = wizardSettlement.troops.find(troop => troop.name === "Red Spears");
assert.equal(directGarrison.mode, "garrison");
assert.equal(directGarrison.freeUpkeep, false);
assert.equal(directGarrison.usesManpower, true);

api.addContentCategory(wizardData, { kind: "building", label: "Arcane Works", systemType: "economic", color: "#8b6fb5" }, gm);
const arcaneWorks = wizardData.contentCategories.find(category => category.label === "Arcane Works");
api.createBuildingWizard(wizardData, { categoryId: arcaneWorks.id, nodes: [{ name: "Rune Market", nodeTier: 1, flatOutput: 500 }] }, gm);
const runeMarket = wizardData.catalog.find(item => item.name === "Rune Market");
api.updateContentCategory(wizardData, { categoryId: arcaneWorks.id, categoryKind: "building", label: arcaneWorks.label, icon: arcaneWorks.icon, color: arcaneWorks.color, sort: arcaneWorks.sort, enabled: true, systemType: "military" }, gm);
assert.equal(runeMarket.category, "military");
assert.equal(runeMarket.slot, "military");

// Content imports merge reusable records without replacing settlement instances.
const settlementIdBeforeImport = wizardSettlement.id;
api.importData(wizardData, {
  importMode: "merge",
  importData: {
    format: "astargon-domain-system",
    formatVersion: 1,
    kind: "content",
    content: {
      contentCategories: [{ id: "arcane", kind: "unit", label: "Arcane", icon: "fa-wand-sparkles", color: "#8b6fb5", sort: 90, enabled: true, builtIn: false, systemType: "unit" }],
      policyCatalog: [],
      unitCatalog: [],
      catalog: [],
      eventCatalog: []
    }
  }
}, gm);
assert.equal(wizardData.settlements[0].id, settlementIdBeforeImport);
assert.ok(wizardData.contentCategories.some(category => category.id === "arcane" && category.kind === "unit"));

// Legacy price migration reprices old defaults while preserving deliberately customized rank costs.
const stalePriceWorld = api.defaultWorldData();
stalePriceWorld.schemaVersion = 10;
for (const [tierId, crown] of Object.entries({ village: 100_000, town: 400_000, city: 1_500_000, metropolis: 5_000_000 })) {
  stalePriceWorld.rules.tiers.find(tier => tier.id === tierId).promotionCost = crown;
}
stalePriceWorld.rules.tiers.find(tier => tier.id === "city").promotionCost = 777_777;
stalePriceWorld.catalog.find(item => item.id === "merchants-guild").crownCost = 320_000;
stalePriceWorld.catalog.find(item => item.id === "drill-hall").crownCost = 280_000;
const repriced = api.normalizeData(stalePriceWorld);
assert.equal(repriced.rules.tiers.find(tier => tier.id === "village").promotionCost, 20_000);
assert.equal(repriced.rules.tiers.find(tier => tier.id === "town").promotionCost, 80_000);
assert.equal(repriced.rules.tiers.find(tier => tier.id === "city").promotionCost, 777_777);
assert.equal(repriced.rules.tiers.find(tier => tier.id === "metropolis").promotionCost, 1_000_000);
assert.equal(repriced.catalog.find(item => item.id === "merchants-guild").crownCost, 35_000);
assert.equal(repriced.catalog.find(item => item.id === "drill-hall").crownCost, 35_000);

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
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "knight").branch, "cavalry");
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "knight").special, false);
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "gladiator").special, true);
assert.equal(catalogWorld.unitCatalog.find(unit => unit.id === "elven-guard").special, true);

// Economic branches have distinct pure and hybrid roles.
const byBuildingId = id => catalogWorld.catalog.find(item => item.id === id);
assert.ok(byBuildingId("grain-estate").foodOutput > byBuildingId("horse-ranch").foodOutput);
assert.equal(byBuildingId("grain-estate").rate, 0);
assert.ok(byBuildingId("horse-ranch").foodOutput > 0 && byBuildingId("horse-ranch").rate > 0 && byBuildingId("horse-ranch").growth > 0);
assert.ok(byBuildingId("stone-quarry").materialsOutput > byBuildingId("iron-mine").materialsOutput);
assert.equal(byBuildingId("stone-quarry").rate, 0);
assert.equal(byBuildingId("stone-quarry").constructionCrownDiscount, 5);
assert.equal(byBuildingId("masonry-district").constructionMaterialsDiscount, 10);
assert.equal(byBuildingId("builders-guild").constructionCpPercent, 15);
assert.equal(byBuildingId("monumental-works").constructionCpPercent, 20);
assert.ok(byBuildingId("iron-mine").materialsOutput > 0 && byBuildingId("iron-mine").rate > 0);
assert.deepEqual(
  ["iron-mine", "ironworks", "grand-foundry", "industrial-complex"].map(id => byBuildingId(id).upkeepDiscount),
  [5, 10, 15, 20]
);
assert.equal(byBuildingId("grand-bazaar").buildingUpkeepDiscount, 5);
assert.equal(byBuildingId("grand-bazaar").upkeepDiscount, 5);
assert.equal(byBuildingId("world-market").buildingUpkeepDiscount, 10);
assert.equal(byBuildingId("world-market").upkeepDiscount, 10);
assert.equal(byBuildingId("world-market").bonusSlots, 0);
assert.equal(byBuildingId("stone-walls").bonusSlots, 1);
assert.equal(byBuildingId("grand-fortress").bonusSlots, 2);
assert.equal(byBuildingId("laurent-manor").bonusSlots, 2);
assert.ok(byBuildingId("imperial-port").eventRollBonus > byBuildingId("world-market").eventRollBonus);
assert.ok(byBuildingId("imperial-port").foodOutput > 0 && byBuildingId("imperial-port").foodOutput < byBuildingId("agrarian-heartland").foodOutput);
assert.ok(byBuildingId("imperial-port").materialsOutput > 0 && byBuildingId("imperial-port").materialsOutput < byBuildingId("industrial-complex").materialsOutput);
assert.ok(byBuildingId("imperial-port").workers * byBuildingId("imperial-port").rate + byBuildingId("imperial-port").flatOutput
  > byBuildingId("world-market").workers * byBuildingId("world-market").rate + byBuildingId("world-market").flatOutput);
assert.equal(byBuildingId("cultural-capital").publicOrder, 38);
assert.equal(byBuildingId("cultural-capital").incomeBonusPercent, 25);
assert.equal(byBuildingId("sacred-university").publicOrder, 0);
assert.equal(byBuildingId("sacred-university").growth, 3);
assert.equal(byBuildingId("sacred-university").buildingUpkeepDiscount, 20);
assert.equal(byBuildingId("merchants-guild").crownCost, 35_000);
assert.equal(byBuildingId("drill-hall").crownCost, 35_000);
assert.equal(byBuildingId("stable").crownCost, 40_000);
assert.equal(byBuildingId("watch-post").crownCost * 2, byBuildingId("muster-field").crownCost);
assert.equal(byBuildingId("palisade").crownCost * 2, byBuildingId("infantry-yard").crownCost);
assert.equal(byBuildingId("stone-walls").crownCost * 2, byBuildingId("stable").crownCost);
assert.equal(byBuildingId("citadel").crownCost * 2, byBuildingId("rangers-lodge").crownCost);
assert.equal(byBuildingId("grand-fortress").crownCost * 2, byBuildingId("imperial-marksmen").crownCost);
const townTier3Crown = ["merchants-guild", "grain-estate", "masonry-district", "festival-hall", "drill-hall", "stone-walls"]
  .reduce((sum, id) => sum + byBuildingId(id).crownCost, 0);
assert.equal(townTier3Crown, 285_000);

const townBudgetData = freshWorld();
const townBudgetSettlement = prepareSettlement(townBudgetData, 1_000);
api.setSettlementTier(townBudgetData, { settlementId: townBudgetSettlement.id, tier: "town" }, gm);
townBudgetSettlement.slots.forEach(slot => slot.unlocked = true);
for (const catalogId of ["merchants-guild", "grain-estate", "masonry-district", "festival-hall", "drill-hall", "stone-walls"]) {
  api.addBuilding(townBudgetData, { settlementId: townBudgetSettlement.id, catalogId }, gm);
}
const townBudgetSummary = api.calculateSettlement(townBudgetSettlement, townBudgetData);
assert.ok(townBudgetSummary.netIncome >= 30_000);
assert.ok(townTier3Crown / townBudgetSummary.netIncome <= 10, "a representative T3 Town should finance its final nodes in roughly ten months or less");

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

// Stone industry discounts the resources actually paid and boosts monthly CP.
const investmentData = freshWorld();
const investmentSettlement = prepareSettlement(investmentData, 500);
api.setSettlementTier(investmentData, { settlementId: investmentSettlement.id, tier: "town" }, gm);
api.addBuilding(investmentData, { settlementId: investmentSettlement.id, catalogId: "stone-quarry" }, gm);
const investmentSummary = api.calculateSettlement(investmentSettlement, investmentData);
assert.equal(investmentSummary.constructionCrownDiscount, 5);
assert.equal(investmentSummary.constructionMaterialsDiscount, 5);
assert.equal(investmentSummary.constructionCpPercent, 5);
assert.equal(investmentSummary.cpThisMonth, Math.floor((500 - 20) * 1.05));
const tradingPost = investmentData.catalog.find(item => item.id === "trading-post");
assert.deepEqual({ ...api.constructionCost(tradingPost, investmentSettlement) }, { crown: 1_900, cp: 1_000, materials: 95, food: 0 });
const occupiedInvestmentSlots = new Set(investmentSettlement.buildings.map(building => building.slotId));
const investmentSlot = investmentSettlement.slots.find(slot => slot.unlocked && !occupiedInvestmentSlots.has(slot.id));
const investmentTreasure = investmentSettlement.treasure;
const investmentMaterials = investmentSettlement.materials;
api.queueConstruction(investmentData, { settlementId: investmentSettlement.id, slotId: investmentSlot.id, catalogId: tradingPost.id }, player);
assert.equal(investmentSettlement.treasure, investmentTreasure - 1_900);
assert.equal(investmentSettlement.materials, investmentMaterials - 95);
assert.equal(investmentSettlement.projects.at(-1).requiredCrown, 1_900);
assert.equal(investmentSettlement.projects.at(-1).requiredMaterials, 95);

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

// Heroic Land Grants accelerates early settlement growth through flat settlers and strong recurring costs.
const heroData = freshWorld();
const heroSettlement = prepareSettlement(heroData, 100);
api.addBuilding(heroData, { settlementId: heroSettlement.id, catalogId: "watch-post" }, gm);
const balancedSummary = api.calculateSettlement(heroSettlement, heroData);
heroSettlement.policyId = "hero-land-grants";
const heroSummary = api.calculateSettlement(heroSettlement, heroData);
assert.equal(heroSummary.activePolicy.id, "hero-land-grants");
assert.equal(heroSummary.policyFlatPopulation, 20);
assert.equal(heroSummary.popChange, balancedSummary.popChange + 20);
assert.equal(heroSummary.populationFood, balancedSummary.populationFood + 50);
assert.equal(heroSummary.policyPublicOrder, -8);
assert.equal(heroSummary.effectivePublicOrder, balancedSummary.effectivePublicOrder - 8);
assert.equal(heroSummary.grossIncome, Math.round(balancedSummary.grossIncome * 0.6));
assert.equal(heroSummary.buildingUpkeep, Math.round(balancedSummary.buildingUpkeep * 1.25));

// One Total War-style upkeep is 20% of recruit cost regardless of old mode data.
const menAtArms = catalogWorld.unitCatalog.find(unit => unit.id === "men-at-arms");
assert.equal(api.unitUpkeepFromRules(menAtArms, catalogWorld.rules).upkeep, 130);
const upkeepData = freshWorld();
const upkeepSettlement = prepareSettlement(upkeepData, 100);
upkeepSettlement.troops = [{ id: "maa", name: "Company", type: "men-at-arms", count: 10, maxCount: 10, mode: "campaign" }];
assert.equal(api.calculateSettlement(upkeepSettlement, upkeepData).militaryCostRaw, 1_300);
api.addBuilding(upkeepData, { settlementId: upkeepSettlement.id, catalogId: "iron-mine" }, gm);
const discountedUpkeep = api.calculateSettlement(upkeepSettlement, upkeepData);
assert.equal(discountedUpkeep.upkeepDiscount, 5);
assert.equal(discountedUpkeep.militaryCost, 1_235);

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
assert.equal(defenseSummary.totalSlots, 7, "Stone Walls should raise the Town maximum by one district slot");
assert.equal(defenseSummary.unlockedSlots, 5, "Stone Walls should immediately unlock one additional district slot");

const fortressData = freshWorld();
const fortressSettlement = prepareSettlement(fortressData, 8_000);
api.setSettlementTier(fortressData, { settlementId: fortressSettlement.id, tier: "metropolis" }, gm);
api.addBuilding(fortressData, { settlementId: fortressSettlement.id, catalogId: "grand-fortress" }, gm);
const fortressSummary = api.calculateSettlement(fortressSettlement, fortressData);
assert.equal(fortressSummary.totalSlots, 12, "Grand Fortress should raise the Metropolis maximum by two district slots");
assert.equal(fortressSummary.unlockedSlots, 10, "Grand Fortress should immediately unlock two additional district slots");
assert.deepEqual(
  [...fortressSummary.autoGarrison.map(entry => [entry.unitId, entry.count])],
  [["watchman", 210], ["men-at-arms", 45], ["archer", 30], ["royal-guard", 15]]
);
assert.equal(fortressSummary.autoGarrison.reduce((sum, entry) => sum + entry.count, 0), 300);

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

// Schema v10 recognizes existing arena/elf landmarks and makes true Unique units landmark-only.
const uniqueMigrationData = freshWorld();
api.addCatalogBuilding(uniqueMigrationData, { buildingKind: "landmark" }, gm);
const arenaLandmark = uniqueMigrationData.catalog.at(-1);
arenaLandmark.name = "Gladiator Arena";
api.addCatalogBuilding(uniqueMigrationData, { buildingKind: "landmark" }, gm);
const elvenLandmark = uniqueMigrationData.catalog.at(-1);
elvenLandmark.name = "Elven Sanctuary";
uniqueMigrationData.schemaVersion = 9;
uniqueMigrationData.settlements[0].systemNotes = "Districts use building slots. Assign POP to buildings, then process the month from GM Controls.";
const migratedUniqueData = api.normalizeData(uniqueMigrationData);
const migratedArena = migratedUniqueData.catalog.find(item => item.id === arenaLandmark.id);
const migratedElven = migratedUniqueData.catalog.find(item => item.id === elvenLandmark.id);
assert.ok(migratedArena.recruitableUnitIds.includes("gladiator"));
assert.ok(migratedElven.recruitableUnitIds.includes("elven-guard"));
assert.equal(migratedArena.canRecruit, true);
assert.equal(migratedArena.recruitPerLevel, 10);
assert.equal(migratedUniqueData.settlements[0].systemNotes, "");
const elvenGuard = migratedUniqueData.unitCatalog.find(unit => unit.id === "elven-guard");
api.updateCatalogUnit(migratedUniqueData, {
  unitId: elvenGuard.id,
  name: elvenGuard.name,
  enabled: true,
  recruitCost: elvenGuard.recruitCost,
  tier: elvenGuard.tier,
  power: elvenGuard.power,
  foodUpkeep: elvenGuard.foodUpkeep,
  maxPerSettlement: elvenGuard.maxPerSettlement,
  special: true,
  imageUrl: "",
  actorUuid: "",
  description: elvenGuard.description,
  sourceBuildingIds: [elvenLandmark.id, "marksmen-range"]
}, gm);
assert.ok(migratedUniqueData.catalog.find(item => item.id === elvenLandmark.id).recruitableUnitIds.includes("elven-guard"));
assert.equal(migratedUniqueData.catalog.find(item => item.id === "marksmen-range").recruitableUnitIds.includes("elven-guard"), false);

// Tree layout keeps each branch vertically aligned with its lineage.
const treeLayout = api.treeLineageLayout(catalogWorld.catalog.filter(item => item.chainId === "recruitment"));
assert.equal(treeLayout.columnCount, 3);
assert.match(treeLayout.styles.get("muster-field"), /span 3/);
assert.match(treeLayout.styles.get("muster-field"), /grid-row:\s*1/);
assert.equal(treeLayout.styles.get("drill-hall"), treeLayout.styles.get("royal-barracks"));
assert.equal(treeLayout.styles.get("stable"), treeLayout.styles.get("cavalry-yard"));
assert.equal(treeLayout.styles.get("marksmen-range"), treeLayout.styles.get("rangers-lodge"));
const unitTrees = api.unitTreeGroups(catalogWorld.unitCatalog.map(unit => ({ ...unit, parentNames: "", sourceBuildingNames: "" })));
assert.deepEqual([...unitTrees.map(tree => tree.id)], ["infantry", "ranged", "cavalry", "siege", "unique"]);
assert.equal(unitTrees.find(tree => tree.id === "unique").nodes.some(unit => unit.id === "knight"), false);
assert.ok(unitTrees.find(tree => tree.id === "cavalry").nodes.some(unit => unit.id === "knight"));
assert.deepEqual(
  [...unitTrees.find(tree => tree.id === "unique").nodes.map(unit => unit.id)].sort(),
  ["elven-guard", "gladiator"]
);

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
assert.ok(sustainableArmy >= 2_200 && sustainableArmy <= 2_500, `unexpected sustainable City army: ${sustainableArmy}`);
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
assert.match(hbs, /Recruitment Landmarks/);
assert.match(hbs, /Bonus District Slots/);
assert.match(hbs, /selected\.overviewDescription/);
assert.match(hbs, /ds-regiment-settings/);
assert.match(hbs, /battles remain a GM decision/);
assert.match(hbs, /no building or recruitment-capacity requirement/);
assert.match(hbs, /Garrison Regiments/);
assert.ok(hbs.indexOf("Garrison Regiments") > hbs.indexOf("Raised Regiments"), "garrison regiments must remain below owned raised regiments");
assert.match(hbs, /Settlement Buffs and Debuffs/);
assert.match(hbs, /Export Content/);
assert.match(hbs, /Building Wizard/);
assert.match(hbs, /Starvation below 50% gives -3% Growth/);
assert.match(hbs, /Unrest 0-24 gives -50% Crown/);
assert.match(hbs, /Base Public Order/);
assert.match(hbs, /Public Order Breakdown/);
assert.match(css, /\.ds-overview-districts:has\(\.ds-district-branch-overlay\)/);
assert.match(css, /overscroll-behavior:\s*contain/);
assert.match(css, /\.ds-regiment-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
assert.match(css, /\.ds-regiment-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
assert.match(css, /\.ds-regiment-settings-panel/);
assert.match(css, /\.ds-slot-tree-nodes\s*\{[\s\S]*repeat\(var\(--tree-columns/);

console.log("DS v0.1.16 logic tests passed");
