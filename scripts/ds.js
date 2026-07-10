const MODULE_ID = "ds";
const DATA_SETTING = "worldData";
const CLIENT_SETTING = "clientState";
const SOCKET_NAME = `module.${MODULE_ID}`;
const TEMPLATE_PATH = `modules/${MODULE_ID}/templates/ds-panel.hbs`;
const ACTION_CONFIRM_TIMEOUT_MS = 6000;
const DIRECT_RECRUITMENT_SOURCE = "__direct__";
const SCHEMA_VERSION = 2;

const TABS = [
  { id: "overview", label: "Overview", icon: "fa-map" },
  { id: "town", label: "Town", icon: "fa-landmark" },
  { id: "construction", label: "Construction", icon: "fa-hammer" },
  { id: "recruitment", label: "Recruitment", icon: "fa-shield-halved" },
  { id: "chronicle", label: "Chronicle", icon: "fa-scroll" },
  { id: "rules", label: "Rules", icon: "fa-book" },
  { id: "catalog", label: "Content Library", icon: "fa-book-open", gmOnly: true },
  { id: "gm", label: "GM Controls", icon: "fa-sliders" }
];

const CATEGORIES = [
  { value: "economic", label: "Economic" },
  { value: "military", label: "Military" }
];

const SLOT_CATEGORIES = [
  { value: "all", label: "Any Building" },
  ...CATEGORIES
];

const SETTLEMENT_TIER_IDS = ["hamlet", "village", "town", "city", "metropolis"];

const PROJECT_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "inProgress", label: "In Progress" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" }
];

const RECRUITMENT_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "inProgress", label: "Recruiting" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" }
];

const TROOP_ROLES = [
  { value: "professional", label: "Professional" },
  { value: "militia", label: "Militia" }
];

const TROOP_TYPES = [
  unit("militia", "Militia", "militia", 25, 1, 4, 1, "Rapidly raised local levies."),
  unit("watchman", "Watchman / Guard", "professional", 80, 2, 6, 1, "Local guards trained for settlement defense."),
  unit("spearman", "Spearman", "professional", 120, 4, 10, 1, "Shielded line infantry trained to hold ground."),
  unit("men-at-arms", "Man-at-Arms", "professional", 200, 6, 16, 2, "Disciplined professional infantry."),
  unit("archer", "Archer", "professional", 180, 5, 14, 2, "Ranged troops trained in the archery branch."),
  unit("crossbowman", "Crossbowman", "professional", 260, 8, 20, 3, "Armored ranged troops requiring an advanced range."),
  unit("sergeant", "Sergeant", "professional", 500, 15, 38, 3, "Veteran infantry leaders and retainers."),
  unit("mounted-scout", "Mounted Scout", "professional", 450, 14, 36, 2, "Fast mounted troops trained at a stable."),
  unit("cavalry", "Cavalry Trooper", "professional", 900, 27, 72, 3, "Professional cavalry requiring a developed stable branch."),
  unit("knight", "Knight", "professional", 1800, 54, 144, 4, "Elite armored cavalry and noble retainers."),
  unit("siege-crew", "Siege Crew", "professional", 650, 20, 52, 3, "Engineers and crew trained for siege equipment.")
];

const BUILDING_CATALOG = [
  eco("lumber-camp", "Lumber Camp", "Forest", 15, 18, 3000, 450, { chainId: "timber", nodeTier: 1 }),
  eco("sawmill", "Sawmill", "Forest", 30, 30, 9000, 1300, { chainId: "timber", nodeTier: 2, parentIds: ["lumber-camp"], flatOutput: 300, settlementTier: "village" }),
  eco("carpenters-guild", "Carpenters Guild", "Any Settlement", 45, 55, 24000, 3500, { chainId: "timber", nodeTier: 3, parentIds: ["sawmill"], flatOutput: 900, constructionBonus: 60, settlementTier: "town" }),
  eco("shipwright-yard", "Shipwright Yard", "Coast, River, or Lake", 45, 60, 28000, 4000, { chainId: "timber", nodeTier: 3, parentIds: ["sawmill"], flatOutput: 700, special: true, settlementTier: "town" }),

  eco("hunting-lodge", "Hunting Lodge", "Forest or Wilderness", 10, 20, 2500, 400, { chainId: "leather", nodeTier: 1 }),
  eco("tannery", "Tannery", "Any Settlement", 25, 32, 8500, 1200, { chainId: "leather", nodeTier: 2, parentIds: ["hunting-lodge"], flatOutput: 200, settlementTier: "village" }),
  eco("leatherworker-workshop", "Leatherworkers Guild", "Town or City", 40, 55, 22000, 3200, { chainId: "leather", nodeTier: 3, parentIds: ["tannery"], flatOutput: 700, settlementTier: "town" }),

  eco("stone-quarry", "Stone Quarry", "Hills or Mountains", 20, 20, 4000, 600, { chainId: "stone", nodeTier: 1 }),
  eco("masons-yard", "Masons Yard", "Any Settlement", 35, 35, 11000, 1700, { chainId: "stone", nodeTier: 2, parentIds: ["stone-quarry"], flatOutput: 300, settlementTier: "village" }),
  eco("builders-guild", "Builders Guild", "Town or City", 55, 60, 30000, 4500, { chainId: "stone", nodeTier: 3, parentIds: ["masons-yard"], flatOutput: 1000, constructionBonus: 100, settlementTier: "town" }),

  eco("iron-mine", "Iron Mine", "Iron resource nearby", 20, 25, 5000, 700, { chainId: "iron", nodeTier: 1 }),
  eco("bloomery", "Bloomery", "Any Settlement", 35, 40, 13000, 2000, { chainId: "iron", nodeTier: 2, parentIds: ["iron-mine"], flatOutput: 400, settlementTier: "village" }),
  eco("weaponsmith", "Weaponsmith Quarter", "Town or City", 50, 65, 32000, 5000, { chainId: "iron", nodeTier: 3, parentIds: ["bloomery"], flatOutput: 1000, recruitmentDiscount: 10, special: true, settlementTier: "town" }),
  eco("armorer", "Armorer Quarter", "Town or City", 50, 58, 32000, 5000, { chainId: "iron", nodeTier: 3, parentIds: ["bloomery"], flatOutput: 900, upkeepDiscount: 8, special: true, settlementTier: "town" }),

  eco("high-yield-crop-field", "Crop Fields", "Farmlands or Plains", 20, 18, 3000, 450, { chainId: "grain", nodeTier: 1, growth: 0.15 }),
  eco("farmstead", "Farmstead", "Farmlands or Plains", 35, 32, 8500, 1300, { chainId: "grain", nodeTier: 2, parentIds: ["high-yield-crop-field"], flatOutput: 250, growth: 0.25, settlementTier: "village" }),
  eco("grain-mill", "Grain Mill", "Any Settlement", 45, 55, 20000, 3000, { chainId: "grain", nodeTier: 3, parentIds: ["farmstead", "high-yield-crop-field"], flatOutput: 650, settlementTier: "town" }),
  eco("grand-granary", "Grand Granary", "Town or City", 30, 35, 18000, 2800, { chainId: "grain", nodeTier: 3, parentIds: ["farmstead"], flatOutput: 300, growth: 0.75, special: true, settlementTier: "town" }),
  eco("estate-farms", "Estate Farms", "Farmlands or Plains", 60, 60, 26000, 3800, { chainId: "grain", nodeTier: 3, parentIds: ["farmstead"], flatOutput: 900, settlementTier: "town" }),

  eco("cattle-ranch", "Cattle Ranch", "Grassland, Farmlands, or Plains", 15, 22, 3500, 500, { chainId: "livestock", nodeTier: 1 }),
  eco("stockyards", "Stockyards", "Any Settlement", 30, 38, 10000, 1500, { chainId: "livestock", nodeTier: 2, parentIds: ["cattle-ranch"], flatOutput: 300, settlementTier: "village" }),
  eco("horse-breeding-stable", "Horse Breeding Estate", "Plains or Grassland", 40, 48, 24000, 3600, { chainId: "livestock", nodeTier: 3, parentIds: ["stockyards"], flatOutput: 700, recruitmentDiscount: 8, special: true, settlementTier: "town" }),

  eco("fishing-wharf", "Fishing Wharf", "Coast, River, or Lake", 15, 20, 3000, 450, { chainId: "harbor", nodeTier: 1 }),
  eco("harbor", "Harbor", "Coast, River, or Lake", 35, 40, 12000, 1800, { chainId: "harbor", nodeTier: 2, parentIds: ["fishing-wharf"], flatOutput: 500, settlementTier: "village" }),
  eco("shipyard", "Shipyard", "Coast, River, or Lake", 60, 70, 35000, 5500, { chainId: "harbor", nodeTier: 3, parentIds: ["harbor"], flatOutput: 1200, special: true, settlementTier: "town" }),

  eco("orchard-farm", "Orchard Farm", "Plains or Farmlands", 15, 20, 3000, 450, { chainId: "orchard", nodeTier: 1 }),
  eco("cider-mill", "Cider Mill", "Any Settlement", 30, 38, 9000, 1400, { chainId: "orchard", nodeTier: 2, parentIds: ["orchard-farm"], flatOutput: 300, settlementTier: "village" }),
  eco("vintners-guild", "Vintners Guild", "Town or City", 45, 58, 25000, 3600, { chainId: "orchard", nodeTier: 3, parentIds: ["cider-mill"], flatOutput: 1000, settlementTier: "town" }),

  eco("herbalist-garden", "Herbalist Garden", "Grassland or Forest Edge", 10, 18, 2500, 400, { chainId: "medicine", nodeTier: 1, growth: 0.1 }),
  eco("apothecary", "Apothecary", "Village or larger", 25, 35, 9000, 1400, { chainId: "medicine", nodeTier: 2, parentIds: ["herbalist-garden"], flatOutput: 250, growth: 0.35, settlementTier: "village" }),
  eco("physicians-guild", "Physicians Guild", "Town or City", 40, 48, 24000, 3600, { chainId: "medicine", nodeTier: 3, parentIds: ["apothecary"], flatOutput: 800, growth: 0.65, special: true, settlementTier: "town" }),

  eco("village-market", "Village Market", "Any Settlement", 10, 15, 4000, 600, { chainId: "trade", nodeTier: 1, flatOutput: 500 }),
  eco("market-hall", "Market Hall", "Village or larger", 25, 20, 15000, 2200, { chainId: "trade", nodeTier: 2, parentIds: ["village-market"], flatOutput: 1500, settlementTier: "village" }),
  eco("merchants-guild", "Merchants Guild", "Town or City", 40, 40, 40000, 6000, { chainId: "trade", nodeTier: 3, parentIds: ["market-hall"], flatOutput: 4000, settlementTier: "town" }),
  eco("grand-bazaar", "Grand Bazaar", "City or Metropolis", 50, 45, 50000, 7000, { chainId: "trade", nodeTier: 3, parentIds: ["market-hall"], flatOutput: 5000, special: true, settlementTier: "city" }),

  eco("warehouse", "Warehouse", "Any Settlement", 10, 10, 5000, 700, { chainId: "logistics", nodeTier: 1, flatOutput: 300 }),
  eco("trade-depot", "Trade Depot", "Village or larger", 25, 35, 16000, 2400, { chainId: "logistics", nodeTier: 2, parentIds: ["warehouse"], flatOutput: 1000, settlementTier: "village" }),
  eco("royal-exchange", "Royal Exchange", "City or Metropolis", 35, 60, 45000, 6500, { chainId: "logistics", nodeTier: 3, parentIds: ["trade-depot"], flatOutput: 4500, special: true, settlementTier: "city" }),

  mil("barracks", "Barracks", 10, 5000, 800, { chainId: "barracks", nodeTier: 1, professionalCapacity: 80, canRecruit: true, recruitPerLevel: 10, recruitableUnitIds: ["watchman", "men-at-arms"] }),
  mil("infantry-yard", "Infantry Yard", 20, 12000, 1800, { chainId: "barracks", nodeTier: 2, parentIds: ["barracks"], professionalCapacity: 150, canRecruit: true, recruitPerLevel: 15, recruitableUnitIds: ["spearman", "men-at-arms"], settlementTier: "village" }),
  mil("drill-hall", "Drill Hall", 35, 30000, 4500, { chainId: "barracks", nodeTier: 3, parentIds: ["infantry-yard"], professionalCapacity: 300, canRecruit: true, recruitPerLevel: 25, recruitableUnitIds: ["spearman", "men-at-arms", "sergeant"], settlementTier: "town" }),
  mil("royal-barracks", "Royal Barracks", 50, 75000, 10000, { chainId: "barracks", nodeTier: 4, parentIds: ["drill-hall"], professionalCapacity: 600, canRecruit: true, recruitPerLevel: 40, recruitableUnitIds: ["spearman", "men-at-arms", "sergeant"], special: true, settlementTier: "city" }),
  mil("archery-range", "Archery Range", 20, 12000, 1800, { chainId: "barracks", nodeTier: 2, parentIds: ["barracks"], professionalCapacity: 120, canRecruit: true, recruitPerLevel: 15, recruitableUnitIds: ["archer"], settlementTier: "village" }),
  mil("marksmen-range", "Marksmen Range", 35, 30000, 4500, { chainId: "barracks", nodeTier: 3, parentIds: ["archery-range"], professionalCapacity: 260, canRecruit: true, recruitPerLevel: 24, recruitableUnitIds: ["archer", "crossbowman"], settlementTier: "town" }),
  mil("rangers-lodge", "Rangers Lodge", 45, 70000, 9500, { chainId: "barracks", nodeTier: 4, parentIds: ["marksmen-range"], professionalCapacity: 450, canRecruit: true, recruitPerLevel: 36, recruitableUnitIds: ["archer", "crossbowman", "sergeant"], special: true, settlementTier: "city" }),
  mil("stable", "Stable", 20, 15000, 2200, { chainId: "barracks", nodeTier: 2, parentIds: ["barracks"], terrain: "Plains, Grassland, or Horse resource", professionalCapacity: 100, canRecruit: true, recruitPerLevel: 8, recruitableUnitIds: ["mounted-scout"], settlementTier: "village" }),
  mil("cavalry-yard", "Cavalry Yard", 35, 36000, 5200, { chainId: "barracks", nodeTier: 3, parentIds: ["stable"], professionalCapacity: 220, canRecruit: true, recruitPerLevel: 15, recruitableUnitIds: ["mounted-scout", "cavalry"], settlementTier: "town" }),
  mil("knightly-stables", "Knightly Stables", 50, 90000, 12000, { chainId: "barracks", nodeTier: 4, parentIds: ["cavalry-yard"], professionalCapacity: 400, canRecruit: true, recruitPerLevel: 20, recruitableUnitIds: ["cavalry", "knight"], special: true, settlementTier: "city" }),

  mil("town-watch-post", "Town Watch Post", 5, 3000, 500, { chainId: "watch", nodeTier: 1, militiaCapacity: 100, canRecruit: true, recruitPerLevel: 25, recruitableUnitIds: ["watchman", "militia"] }),
  mil("guard-house", "Guard House", 15, 9000, 1300, { chainId: "watch", nodeTier: 2, parentIds: ["town-watch-post"], professionalCapacity: 50, militiaCapacity: 250, canRecruit: true, recruitPerLevel: 35, recruitableUnitIds: ["watchman", "militia", "spearman"], settlementTier: "village" }),
  mil("garrison-command", "Garrison Command", 30, 28000, 4200, { chainId: "watch", nodeTier: 3, parentIds: ["guard-house"], professionalCapacity: 220, militiaCapacity: 500, canRecruit: true, recruitPerLevel: 45, recruitableUnitIds: ["watchman", "militia", "spearman", "men-at-arms"], settlementTier: "town" }),

  mil("palisade", "Palisade", 10, 6000, 900, { chainId: "defense", nodeTier: 1, professionalCapacity: 20 }),
  mil("stone-walls", "Stone Walls", 25, 25000, 3800, { chainId: "defense", nodeTier: 2, parentIds: ["palisade"], professionalCapacity: 80, settlementTier: "town" }),
  mil("citadel", "Citadel", 50, 80000, 11000, { chainId: "defense", nodeTier: 3, parentIds: ["stone-walls"], professionalCapacity: 300, special: true, settlementTier: "city" }),

  mil("engineers-yard", "Engineers Yard", 15, 10000, 1500, { chainId: "siege", nodeTier: 1, settlementTier: "town" }),
  mil("siege-workshop", "Siege Workshop", 30, 35000, 5200, { chainId: "siege", nodeTier: 2, parentIds: ["engineers-yard"], professionalCapacity: 80, canRecruit: true, recruitPerLevel: 8, recruitableUnitIds: ["siege-crew"], settlementTier: "town" }),
  mil("grand-arsenal", "Grand Arsenal", 50, 90000, 13000, { chainId: "siege", nodeTier: 3, parentIds: ["siege-workshop"], professionalCapacity: 220, canRecruit: true, recruitPerLevel: 15, recruitableUnitIds: ["siege-crew", "sergeant"], special: true, settlementTier: "city" }),

  {
    id: "laurent-manor",
    name: "Laurent Manor",
    category: "military",
    terrain: "Any",
    workers: 5,
    rate: 0,
    crownCost: 0,
    cpCost: 0,
    slot: "military",
    slotUse: 2,
    professionalCapacity: 200,
    militiaCapacity: 25,
    recruitType: "men-at-arms",
    recruitPerLevel: 15,
    canRecruit: true,
    recruitableUnitIds: ["watchman", "men-at-arms", "archer", "sergeant", "cavalry", "knight", "militia"],
    bonusEconomicSlots: 2,
    bonusMilitarySlots: 0,
    special: true,
    gmOnly: true,
    enabled: true,
    chainId: "laurent-estate",
    nodeTier: 1,
    parentIds: [],
    settlementTier: "village",
    maxLevel: 1,
    notes: "Fortified noble estate with quarters, armory, logistics, stables, and administration."
  }
];

let dsApp = null;
const pendingActionRequests = new Map();

const uiState = {
  activeTab: "overview",
  selectedSettlementId: "",
  search: "",
  constructionCategory: "all",
  constructionSearch: "",
  catalogKind: "buildings",
  catalogSearch: ""
};

function unit(id, name, role, recruitCost, garrison, campaign, tier, description) {
  return { id, name, role, recruitCost, garrison, campaign, tier, useRuleUpkeep: true, enabled: true, imageUrl: "", description };
}

Hooks.once("init", () => {
  registerHandlebarsHelpers();
  registerSettings();
  registerKeybinding();
});

Hooks.once("ready", async () => {
  loadClientState();
  bindSocket();
  exposeApi();

  if (game.user.isGM && isResponsibleGM()) {
    await ensureWorldData();
  }
});

function eco(id, name, terrain, workers, rate, crownCost, cpCost, extra = {}) {
  return {
    id,
    name,
    category: "economic",
    terrain,
    workers,
    rate,
    flatOutput: 0,
    buildingUpkeep: 0,
    crownCost,
    cpCost,
    slot: "economic",
    slotUse: 0,
    professionalCapacity: 0,
    militiaCapacity: 0,
    bonusEconomicSlots: 0,
    bonusMilitarySlots: 0,
    recruitType: "",
    recruitPerLevel: 0,
    canRecruit: false,
    recruitableUnitIds: [],
    chainId: id,
    nodeTier: 1,
    parentIds: [],
    settlementTier: "hamlet",
    constructionBonus: 0,
    recruitmentDiscount: 0,
    upkeepDiscount: 0,
    enabled: true,
    maxLevel: 1,
    ...extra
  };
}

function mil(id, name, workers, crownCost, cpCost, extra = {}) {
  return {
    id,
    name,
    category: "military",
    terrain: "Any",
    workers,
    rate: 0,
    flatOutput: 0,
    buildingUpkeep: 0,
    crownCost,
    cpCost,
    slot: "military",
    slotUse: 0,
    bonusEconomicSlots: 0,
    bonusMilitarySlots: 0,
    recruitType: "",
    recruitPerLevel: 0,
    canRecruit: false,
    recruitableUnitIds: [],
    chainId: id,
    nodeTier: 1,
    parentIds: [],
    settlementTier: "hamlet",
    constructionBonus: 0,
    recruitmentDiscount: 0,
    upkeepDiscount: 0,
    enabled: true,
    maxLevel: 1,
    ...extra
  };
}

function registerSettings() {
  game.settings.register(MODULE_ID, DATA_SETTING, {
    name: "DS World Data",
    scope: "world",
    config: false,
    type: Object,
    default: defaultWorldData()
  });

  game.settings.register(MODULE_ID, CLIENT_SETTING, {
    name: "DS Client State",
    scope: "client",
    config: false,
    type: Object,
    default: {}
  });
}

function registerKeybinding() {
  game.keybindings.register(MODULE_ID, "toggleDsPanel", {
    name: "DS: Toggle Domain Panel",
    hint: "Open or close the Domain System panel.",
    editable: [{ key: "KeyK" }],
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
    onDown: () => {
      toggleDsPanel();
      return true;
    }
  });
}

function registerHandlebarsHelpers() {
  const helpers = {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    not: value => !value,
    and: (...args) => args.slice(0, -1).every(Boolean),
    or: (...args) => args.slice(0, -1).some(Boolean),
    checked: value => value ? "checked" : "",
    optionSelected: (a, b) => a === b ? "selected" : ""
  };

  for (const [name, fn] of Object.entries(helpers)) {
    if (!Handlebars.helpers[name]) Handlebars.registerHelper(name, fn);
  }
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class DomainSystemApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "ds-domain-system",
    classes: ["ds-window"],
    tag: "section",
    window: {
      title: "DS: Domain System",
      icon: "fa-solid fa-building-columns",
      resizable: true
    },
    position: {
      width: 1180,
      height: 760
    }
  };

  static PARTS = {
    body: {
      template: TEMPLATE_PATH
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return Object.assign(context, buildContext(getWorldData()));
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    activateListeners(this.element);
  }
}

function exposeApi() {
  globalThis.DS = {
    open: openDsPanel,
    close: closeDsPanel,
    toggle: toggleDsPanel,
    getData: getWorldData
  };
}

function openDsPanel() {
  const visible = visibleSettlements(getWorldData());
  if (!game.user.isGM && !visible.length) {
    ui.notifications.warn("DS: You do not have an assigned settlement yet.");
    return false;
  }

  if (!dsApp) {
    dsApp = new DomainSystemApplication({
      position: defaultPanelPosition()
    });
  }
  return dsApp.render(true);
}

async function closeDsPanel() {
  if (!dsApp?.rendered) return;
  await dsApp.close();
}

function toggleDsPanel() {
  if (dsApp?.rendered) return closeDsPanel();
  return openDsPanel();
}

function defaultPanelPosition() {
  const width = Math.max(420, Math.min(1180, (globalThis.innerWidth || 1280) - 32));
  const height = Math.max(520, Math.min(760, (globalThis.innerHeight || 820) - 32));
  return { width, height };
}

function renderDsPanel() {
  if (dsApp?.rendered) dsApp.render(false);
}

function scheduleRefresh() {
  setTimeout(renderDsPanel, 50);
}

function buildContext(rawData) {
  const data = normalizeData(rawData);
  const isGM = Boolean(game.user?.isGM);
  const allVisible = visibleSettlements(data);
  const search = cleanString(uiState.search).toLowerCase();
  const filtered = search
    ? allVisible.filter(settlement => searchableSettlementText(settlement).includes(search))
    : allVisible;

  const selected = allVisible.find(settlement => settlement.id === uiState.selectedSettlementId) || filtered[0] || allVisible[0] || null;
  if (selected) uiState.selectedSettlementId = selected.id;

  const tabs = TABS
    .filter(tab => isGM || !tab.gmOnly && tab.id !== "gm")
    .map(tab => ({ ...tab, active: tab.id === uiState.activeTab }));

  if (!tabs.some(tab => tab.active)) {
    uiState.activeTab = "overview";
    tabs.forEach(tab => tab.active = tab.id === "overview");
  }

  const catalogSearch = cleanString(uiState.catalogSearch).toLowerCase();
  const catalogBuildings = data.catalog
    .filter(item => !catalogSearch || [item.name, item.category, item.terrain, item.notes].join(" ").toLowerCase().includes(catalogSearch))
    .map(item => catalogBuildingContext(item, data.unitCatalog));
  const catalogUnits = data.unitCatalog
    .filter(item => !catalogSearch || [item.name, item.role, item.description].join(" ").toLowerCase().includes(catalogSearch))
    .map(item => catalogUnitContext(item, data.rules));

  return {
    moduleId: MODULE_ID,
    isGM,
    month: data.month,
    processedSettlementCount: data.settlements.filter(settlement => settlement.lastProcessedMonth === data.month).length,
    pendingSettlementCount: data.settlements.filter(settlement => settlement.lastProcessedMonth !== data.month).length,
    activeTab: uiState.activeTab,
    search: uiState.search,
    constructionSearch: uiState.constructionSearch,
    constructionCategory: uiState.constructionCategory,
    catalogKind: uiState.catalogKind,
    catalogSearch: uiState.catalogSearch,
    catalogBuildingsActive: uiState.catalogKind === "buildings",
    catalogUnitsActive: uiState.catalogKind === "units",
    tabs,
    settlements: filtered.map(settlement => settlementListContext(settlement, data)),
    selected: selected ? selectedContext(selected, data, isGM) : null,
    userOptions: selected ? userOptions(selected) : [],
    catalog: data.catalog,
    catalogBuildings,
    catalogUnits,
    unitCatalog: data.unitCatalog,
    rules: rulesContext(data.rules),
    tierRules: data.rules.tiers.map(tier => tierRuleContext(tier)),
    settlementTemplates: data.settlementTemplates.map(template => ({ ...template })),
    categories: CATEGORIES,
    slotCategories: SLOT_CATEGORIES,
    projectStatuses: PROJECT_STATUSES,
    recruitmentStatuses: RECRUITMENT_STATUSES,
    troopRoles: TROOP_ROLES,
    troopTypes: data.unitCatalog,
    hasVisibleSettlements: allVisible.length > 0
  };
}

function searchableSettlementText(settlement) {
  return [
    settlement.name,
    settlement.region,
    settlement.type,
    ...(settlement.terrainTags || []),
    ...(settlement.biomeTags || [])
  ].join(" ").toLowerCase();
}

function settlementListContext(settlement, data) {
  const summary = calculateSettlement(settlement, data);
  return {
    id: settlement.id,
    name: settlement.name,
    region: settlement.region,
    type: settlement.type,
    active: settlement.id === uiState.selectedSettlementId,
    pop: formatNumber(summary.totalPop),
    net: formatSigned(summary.netIncome),
    processedThisMonth: settlement.lastProcessedMonth === data.month,
    warnings: buildWarnings(settlement, data, summary).length
  };
}

function selectedContext(settlement, data, isGM) {
  const summary = calculateSettlement(settlement, data);
  const permissions = permissionsFor(settlement, isGM);
  const warnings = buildWarnings(settlement, data, summary);
  const note = settlement.turnNotes[game.user.id] || { text: "", authorName: game.user.name || "Player", updated: 0 };
  const buildingCards = settlement.buildings.map(building => buildingContext(building, settlement, data, permissions));
  const troopCards = settlement.troops.map(troop => troopContext(troop, permissions, data.unitCatalog));
  const projects = settlement.projects.map((project, index) => projectContext(project, summary, permissions, settlement, data, index));
  const recruitment = settlement.recruitment.map(order => recruitmentContext(order, settlement, permissions, data.unitCatalog, isGM));
  const slots = settlementSlotsContext(settlement, data, permissions, summary, isGM);
  const progression = settlementProgressionContext(settlement, data, permissions);

  return {
    ...settlement,
    terrainTagsText: settlement.terrainTags.join(", "),
    biomeTagsText: settlement.biomeTags.join(", "),
    terrainTagsList: settlement.terrainTags,
    biomeTagsList: settlement.biomeTags,
    ownerNames: ownerNames(settlement),
    access: permissions,
    canEditBasics: permissions.canEditBasics,
    canEditAssignments: permissions.canEditAssignments,
    canWriteTurnNote: permissions.canWriteTurnNote,
    summary: summaryContext(summary),
    warnings,
    hasWarnings: warnings.length > 0,
    treasure: formatNumber(settlement.treasure),
    treasureValue: settlement.treasure,
    buildings: buildingCards,
    troops: troopCards,
    economicBuildings: buildingCards.filter(building => building.category === "economic"),
    militaryBuildings: buildingCards.filter(building => building.category === "military"),
    specialBuildings: buildingCards.filter(building => building.special),
    tierLabel: tierName(settlement.tier, data.rules),
    coreName: tierRuleFor(settlement.tier, data.rules).coreName,
    progression,
    slots,
    buildingChains: buildingChainsContext(settlement, data, permissions, summary, isGM),
    processedThisMonth: settlement.lastProcessedMonth === data.month,
    processStatusLabel: settlement.lastProcessedMonth === data.month ? `Processed for Month ${data.month}` : `Pending for Month ${data.month}`,
    heroStyle: settlement.imageUrl ? `background-image: linear-gradient(90deg, rgba(10, 16, 15, 0.92), rgba(10, 16, 15, 0.34)), url('${cssUrl(settlement.imageUrl)}');` : "",
    projects,
    activeProjects: projects.filter(project => project.status !== "completed"),
    completedProjects: projects.filter(project => project.status === "completed"),
    recruitment,
    activeRecruitment: recruitment.filter(order => order.status !== "completed"),
    completedRecruitment: recruitment.filter(order => order.status === "completed"),
    constructionCatalog: constructionCatalogContext(settlement, data, permissions, summary),
    recruitableUnits: recruitableUnitsContext(settlement, data, permissions, summary, isGM),
    canManageConstruction: permissions.canEditConstruction,
    canManageRecruitment: permissions.canManageRecruitment,
    currentTurnNote: {
      ...note,
      updatedLabel: note.updated ? new Date(note.updated).toLocaleString() : "Not saved"
    },
    allTurnNotes: Object.entries(settlement.turnNotes).map(([userId, item]) => ({
      userId,
      authorName: item.authorName || userName(userId),
      text: item.text || "",
      updatedLabel: item.updated ? new Date(item.updated).toLocaleString() : "Not saved"
    })),
    eventLog: settlement.eventLog.map(entry => ({
      ...entry,
      createdLabel: entry.created ? new Date(entry.created).toLocaleString() : "",
      playerNotesText: (entry.playerNotes || []).map(playerNote => `${playerNote.authorName}: ${playerNote.text}`).join("\n")
    }))
  };
}

function summaryContext(summary) {
  return {
    totalPop: formatNumber(summary.totalPop),
    economicWorkers: formatNumber(summary.economicWorkers),
    militaryWorkers: formatNumber(summary.militaryWorkers),
    freePop: formatNumber(summary.freePop),
    totalMp: formatNumber(summary.totalMp),
    mpUsed: formatNumber(summary.mpUsed),
    mpRemaining: formatNumber(summary.mpRemaining),
    professionalSoldiers: formatNumber(summary.professionalSoldiers),
    militia: formatNumber(summary.militia),
    professionalCapacity: formatNumber(summary.professionalCapacity),
    militiaCapacity: formatNumber(summary.militiaCapacity),
    baseIncome: formatNumber(summary.baseIncome),
    buildingOutput: formatNumber(summary.buildingOutput),
    grossIncome: formatNumber(summary.grossIncome),
    militaryCost: formatNumber(summary.militaryCost),
    buildingUpkeep: formatNumber(summary.buildingUpkeep),
    upkeepDiscount: `${formatNumber(summary.upkeepDiscount)}%`,
    netIncome: formatSigned(summary.netIncome),
    totalSlots: formatNumber(summary.totalSlots),
    unlockedSlots: formatNumber(summary.unlockedSlots),
    usedSlots: formatNumber(summary.usedSlots),
    slotUsage: `${formatNumber(summary.usedSlots)} / ${formatNumber(summary.unlockedSlots)}`,
    economicSlots: `${formatNumber(summary.usedEconomicSlots)} / ${formatNumber(summary.economicSlots)}`,
    militarySlots: `${formatNumber(summary.usedMilitarySlots)} / ${formatNumber(summary.militarySlots)}`,
    cpThisMonth: formatNumber(summary.cpThisMonth),
    recruitmentCapacity: formatNumber(summary.recruitmentCapacity),
    recruitmentDiscount: `${formatNumber(summary.recruitmentDiscount)}%`,
    constructionBonus: formatNumber(summary.constructionBonus),
    growthRate: `${formatSigned(summary.growthRate)}%`,
    popChange: formatSigned(summary.popChange),
    projectedPop: formatNumber(summary.projectedPop)
  };
}

function buildingContext(building, settlement, data, permissions) {
  const output = buildingOutput(building, settlement);
  const recruitCapacity = buildingRecruitmentCapacity(building);
  return {
    ...building,
    categoryLabel: categoryLabel(building.category),
    categoryIcon: building.category === "military" ? "fa-shield-halved" : "fa-industry",
    activeChecked: building.active ? "checked" : "",
    specialChecked: building.special ? "checked" : "",
    gmOnlyChecked: building.gmOnly ? "checked" : "",
    canRecruitChecked: building.canRecruit ? "checked" : "",
    hasImage: Boolean(building.imageUrl),
    output: formatNumber(output.total),
    buildingUpkeepDisplay: formatNumber(building.buildingUpkeep),
    bonusOutput: formatNumber(output.bonus),
    workerCapacity: formatNumber(workerCapacity(building)),
    slotUseDisplay: formatNumber(slotUse(building)),
    recruitCapacity: formatNumber(recruitCapacity),
    hasRecruitment: recruitCapacity > 0 || recruitmentSourceCandidate(building),
    canEditFull: permissions.canEditBuildings,
    canEditAssignments: permissions.canEditAssignments,
    categoryOptions: CATEGORIES.map(option => ({ ...option, selected: option.value === building.category })),
    recruitTypeOptions: data.unitCatalog.map(option => ({ ...option, selected: option.id === building.recruitType })),
    unlockUnitOptions: data.unitCatalog.map(option => ({ ...option, checked: building.recruitableUnitIds.includes(option.id) })),
    recruitableUnitNames: building.recruitableUnitIds.map(id => troopType(id, data.unitCatalog).name).join(", ") || "None"
  };
}

function troopContext(troop, permissions, unitCatalog) {
  const type = troopType(troop.type, unitCatalog);
  const mode = troop.mode === "campaign" ? "campaign" : "garrison";
  const costPerTroop = mode === "campaign" ? troop.campaignCost : troop.garrisonCost;
  return {
    ...troop,
    displayName: troop.name || type.name,
    typeName: type.name,
    hasImage: Boolean(troop.imageUrl),
    roleProfessionalSelected: troop.role === "professional",
    roleMilitiaSelected: troop.role === "militia",
    garrisonCostDisplay: formatNumber(troop.garrisonCost),
    campaignCostDisplay: formatNumber(troop.campaignCost),
    cost: formatNumber(costPerTroop * troop.count),
    canEditFull: permissions.canEditMilitary,
    canEditAssignments: permissions.canEditAssignments,
    typeOptions: unitCatalog.map(option => ({ ...option, selected: option.id === troop.type })),
    roleOptions: TROOP_ROLES.map(option => ({ ...option, selected: option.value === troop.role })),
    garrisonSelected: mode === "garrison",
    campaignSelected: mode === "campaign"
  };
}

function recruitmentContext(order, settlement, permissions, unitCatalog, isGM) {
  const source = settlement.buildings.find(building => building.id === order.sourceBuildingId);
  const type = troopType(order.troopType, unitCatalog);
  const remaining = Math.max(0, order.targetCount - order.trained);
  const sourceOptions = recruitmentSources(settlement, order.troopType, isGM);
  if (source && !sourceOptions.some(option => option.id === source.id)) {
    sourceOptions.push({
      id: source.id,
      name: `${source.name} (inactive)`
    });
  }
  return {
    ...order,
    imageUrl: order.imageUrl || type.imageUrl,
    sourceName: source?.name || "Direct GM",
    troopTypeName: type.name,
    remaining: formatNumber(remaining),
    progress: `${formatNumber(order.trained)} / ${formatNumber(order.targetCount)}`,
    progressPercent: order.targetCount > 0 ? clamp(Math.round(order.trained / order.targetCount * 100), 0, 100) : 100,
    totalCost: formatNumber(order.crownPaid),
    statusLabel: RECRUITMENT_STATUSES.find(status => status.value === order.status)?.label || order.status,
    sourceOptions: sourceOptions.map(option => ({ ...option, selected: option.id === (order.sourceBuildingId || DIRECT_RECRUITMENT_SOURCE) })),
    troopTypeOptions: unitCatalog.map(option => ({ ...option, selected: option.id === order.troopType })),
    statusOptions: RECRUITMENT_STATUSES.map(option => ({ ...option, selected: option.value === order.status })),
    canEditFull: permissions.canEditMilitary,
    canManage: permissions.canManageRecruitment && order.status !== "completed"
  };
}

function recruitmentSources(settlement, unitId = "", includeDirect = false) {
  const sources = settlement.buildings
    .filter(building => building.active && recruitmentSourceCandidate(building) && (!unitId || sourceUnlocksUnit(building, unitId)))
    .map(building => ({
      id: building.id,
      name: recruitmentSourceLabel(building)
    }));
  if (includeDirect) sources.unshift({ id: DIRECT_RECRUITMENT_SOURCE, name: "Direct GM (no building requirement)" });
  return sources;
}

function projectContext(project, summary, permissions, settlement, data, index) {
  const crownRemaining = Math.max(0, project.requiredCrown - project.crownPaid);
  const cpRemaining = Math.max(0, project.requiredCp - project.cpPaid);
  const activeCount = Math.max(1, settlement.projects.filter(candidate => candidate.status === "inProgress").length);
  const cpRate = project.status === "inProgress" ? Math.max(0, Math.floor(summary.cpThisMonth / activeCount) + project.externalWorkers + project.bonusCp) : 0;
  const months = cpRemaining <= 0 ? "Complete" : cpRate > 0 ? String(Math.ceil(cpRemaining / cpRate)) : "Unknown";
  const item = data.catalog.find(candidate => candidate.id === project.catalogId);
  const activeProjects = settlement.projects.filter(candidate => candidate.status !== "completed");
  const queueIndex = activeProjects.findIndex(candidate => candidate.id === project.id);
  return {
    ...project,
    imageUrl: project.imageUrl || item?.imageUrl || "",
    hasImage: Boolean(project.imageUrl || item?.imageUrl),
    category: project.kind === "settlementUpgrade" ? "progression" : item?.category || "economic",
    categoryIcon: project.kind === "settlementUpgrade" ? "fa-landmark" : item?.category === "military" ? "fa-shield-halved" : "fa-industry",
    crownRemaining: formatNumber(crownRemaining),
    cpRemaining: formatNumber(cpRemaining),
    cpPaidDisplay: formatNumber(project.cpPaid),
    requiredCpDisplay: formatNumber(project.requiredCp),
    requiredCrownDisplay: formatNumber(project.requiredCrown),
    cpRate: formatNumber(cpRate),
    hiredCpPending: formatNumber(project.bonusCp),
    hireCostPerCp: formatNumber(data.rules.economy.constructionHireCostPerCp),
    canHireCp: permissions.canEditConstruction && project.status !== "completed" && settlement.treasure >= data.rules.economy.constructionHireCostPerCp,
    months,
    progressPercent: project.requiredCp > 0 ? clamp(Math.round(project.cpPaid / project.requiredCp * 100), 0, 100) : 100,
    statusLabel: PROJECT_STATUSES.find(status => status.value === project.status)?.label || project.status,
    queueNumber: queueIndex >= 0 ? queueIndex + 1 : index + 1,
    canMoveUp: permissions.canEditConstruction && queueIndex > 0,
    canMoveDown: permissions.canEditConstruction && queueIndex >= 0 && queueIndex < activeProjects.length - 1,
    canManage: permissions.canEditConstruction && project.status !== "completed",
    canEditFull: permissions.canEditConstruction,
    statusOptions: PROJECT_STATUSES.map(option => ({ ...option, selected: option.value === project.status }))
  };
}

function catalogBuildingContext(item, unitCatalog) {
  const recruitable = new Set(item.recruitableUnitIds || []);
  return {
    ...item,
    categoryLabel: categoryLabel(item.category),
    categoryIcon: item.category === "military" ? "fa-shield-halved" : "fa-industry",
    enabledChecked: item.enabled ? "checked" : "",
    specialChecked: item.special ? "checked" : "",
    gmOnlyChecked: item.gmOnly ? "checked" : "",
    canRecruitChecked: item.canRecruit ? "checked" : "",
    hasImage: Boolean(item.imageUrl),
    isBuiltIn: BUILDING_CATALOG.some(candidate => candidate.id === item.id),
    parentIdsText: item.parentIds.join(", "),
    parentNames: item.parentIds.map(id => BUILDING_CATALOG.find(candidate => candidate.id === id)?.name || id).join(", ") || "Chain Root",
    settlementTierLabel: tierName(item.settlementTier),
    settlementTierOptions: SETTLEMENT_TIER_IDS.map(id => ({ value: id, label: tierName(id), selected: id === item.settlementTier })),
    categoryOptions: CATEGORIES.map(option => ({ ...option, selected: option.value === item.category })),
    unitOptions: unitCatalog.map(unit => ({ ...unit, checked: recruitable.has(unit.id) }))
  };
}

function catalogUnitContext(item, rules = defaultRules()) {
  const upkeep = unitUpkeepFromRules(item, rules);
  return {
    ...item,
    hasImage: Boolean(item.imageUrl),
    enabledChecked: item.enabled ? "checked" : "",
    useRuleUpkeepChecked: item.useRuleUpkeep ? "checked" : "",
    roleLabel: TROOP_ROLES.find(role => role.value === item.role)?.label || item.role,
    roleOptions: TROOP_ROLES.map(option => ({ ...option, selected: option.value === item.role })),
    isBuiltIn: TROOP_TYPES.some(candidate => candidate.id === item.id),
    recruitCostDisplay: formatNumber(item.recruitCost),
    garrisonDisplay: formatNumber(upkeep.garrison),
    campaignDisplay: formatNumber(upkeep.campaign)
  };
}

function constructionCatalogContext(settlement, data, permissions, summary) {
  return settlementSlotsContext(settlement, data, permissions, summary, Boolean(game.user?.isGM))
    .flatMap(slot => slot.choices || []);
}

function constructionOptionContext(item, settlement, permissions, summary, data, slot, current, isGM = false) {
  const cost = constructionCost(item);
  const reasons = constructionBlockReasons(item, settlement, slot, current, data, permissions, isGM);
  return {
    ...item,
    slotId: slot.id,
    hasImage: Boolean(item.imageUrl),
    categoryLabel: categoryLabel(item.category),
    categoryIcon: item.category === "military" ? "fa-shield-halved" : "fa-industry",
    crownCostDisplay: formatNumber(cost.crown),
    cpCostDisplay: formatNumber(cost.cp),
    nodeTierLabel: `Tier ${item.nodeTier}`,
    actionLabel: current ? `Develop ${item.name}` : `Construct ${item.name}`,
    canQueue: permissions.canEditConstruction && reasons.length === 0,
    blocked: reasons.length > 0,
    blockReason: reasons.join(" "),
    requirementDisplay: item.requirement || item.terrain || "Any settlement"
  };
}

function settlementSlotsContext(settlement, data, permissions, summary, isGM) {
  const search = cleanString(uiState.constructionSearch).toLowerCase();
  const category = ["economic", "military"].includes(uiState.constructionCategory) ? uiState.constructionCategory : "all";
  return settlement.slots.map(slot => {
    const building = settlement.buildings.find(item => item.slotId === slot.id);
    const project = settlement.projects.find(item => item.kind === "building" && item.slotId === slot.id && item.status !== "completed");
    const candidates = project ? [] : data.catalog
      .filter(item => item.enabled && (isGM || !item.gmOnly))
      .filter(item => category === "all" || item.category === category)
      .filter(item => !search || [item.name, item.chainId, item.terrain, item.notes].join(" ").toLowerCase().includes(search))
      .filter(item => building ? item.parentIds.includes(building.catalogId) : item.parentIds.length === 0)
      .filter(item => slot.allowedCategory === "all" || item.category === slot.allowedCategory)
      .map(item => constructionOptionContext(item, settlement, permissions, summary, data, slot, building, isGM));
    return {
      ...slot,
      unlockedChecked: slot.unlocked ? "checked" : "",
      gmLockedChecked: slot.gmLocked ? "checked" : "",
      allowedCategoryOptions: SLOT_CATEGORIES.map(option => ({ ...option, selected: option.value === slot.allowedCategory })),
      occupied: Boolean(building),
      locked: !slot.unlocked,
      hasProject: Boolean(project),
      building: building ? buildingContext(building, settlement, data, permissions) : null,
      project: project ? projectContext(project, summary, permissions, settlement, data, settlement.projects.indexOf(project)) : null,
      choices: candidates,
      hasChoices: candidates.length > 0,
      unlockCostDisplay: formatNumber(slot.unlockCost),
      canUnlock: permissions.canEditConstruction && !slot.gmLocked && settlement.treasure >= slot.unlockCost
    };
  });
}

function buildingChainsContext(settlement, data, permissions, summary, isGM) {
  const category = ["economic", "military"].includes(uiState.constructionCategory) ? uiState.constructionCategory : "all";
  const groups = new Map();
  for (const item of data.catalog.filter(item => item.enabled && (category === "all" || item.category === category) && (isGM || !item.gmOnly))) {
    if (!groups.has(item.chainId)) groups.set(item.chainId, []);
    groups.get(item.chainId).push(item);
  }
  return Array.from(groups.entries()).map(([chainId, items]) => ({
    id: chainId,
    name: items.find(item => item.nodeTier === 1)?.name || items[0]?.name || chainId,
    category: items[0]?.category || "economic",
    nodes: items.sort((a, b) => a.nodeTier - b.nodeTier || a.name.localeCompare(b.name)).map(item => ({
      ...item,
      hasImage: Boolean(item.imageUrl),
      built: settlement.buildings.some(building => building.catalogId === item.id),
      queued: settlement.projects.some(project => project.catalogId === item.id && project.status !== "completed"),
      parentNames: item.parentIds.map(id => data.catalog.find(parent => parent.id === id)?.name || id).join(", ") || "Chain Root",
      unlockNames: item.recruitableUnitIds.map(id => troopType(id, data.unitCatalog).name).join(", "),
      crownCostDisplay: formatNumber(item.crownCost),
      cpCostDisplay: formatNumber(item.cpCost)
    }))
  }));
}

function settlementProgressionContext(settlement, data, permissions) {
  const current = tierRuleFor(settlement.tier, data.rules);
  const next = nextTierFor(settlement.tier, data.rules);
  const queued = settlement.projects.some(project => project.kind === "settlementUpgrade" && project.status !== "completed");
  const reasons = [];
  if (next && !settlement.overrides.ignorePopulationLimits && settlement.population < next.minPopulation) reasons.push(`Needs ${formatNumber(next.minPopulation - settlement.population)} more POP.`);
  if (next && settlement.treasure < next.promotionCost) reasons.push(`Needs ${formatNumber(next.promotionCost - settlement.treasure)} more Crown.`);
  if (queued) reasons.push("Progression is already queued.");
  return {
    current: tierRuleContext(current),
    next: next ? tierRuleContext(next) : null,
    hasNext: Boolean(next),
    queued,
    canQueue: Boolean(next && permissions.canEditConstruction && reasons.length === 0),
    blockedReason: reasons.join(" "),
    populationProgress: next ? clamp(Math.round(settlement.population / Math.max(1, next.minPopulation) * 100), 0, 100) : 100
  };
}

function tierRuleContext(tier) {
  return {
    ...tier,
    minPopulationDisplay: formatNumber(tier.minPopulation),
    promotionCostDisplay: formatNumber(tier.promotionCost),
    promotionCpDisplay: formatNumber(tier.promotionCp),
    slotUnlockCostDisplay: formatNumber(tier.slotUnlockCost)
  };
}

function rulesContext(rules) {
  return {
    ...rules,
    tiers: rules.tiers.map(tierRuleContext),
    economy: { ...rules.economy },
    construction: { ...rules.construction },
    military: { ...rules.military }
  };
}

function recruitableUnitsContext(settlement, data, permissions, summary, isGM) {
  const professionalQueued = settlement.recruitment
    .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === "professional")
    .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
  const militiaQueued = settlement.recruitment
    .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === "militia")
    .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
  const manpowerQueued = professionalQueued + militiaQueued;

  return data.unitCatalog.filter(unit => unit.enabled).map(unit => {
    const upkeep = unitUpkeepFromRules(unit, data.rules);
    const sources = recruitmentSources(settlement, unit.id, isGM);
    const discount = settlementRecruitmentDiscount(settlement);
    const effectiveRecruitCost = Math.max(0, Math.round(unit.recruitCost * (1 - discount / 100)));
    const roleQueued = unit.role === "militia" ? militiaQueued : professionalQueued;
    const roleCapacity = unit.role === "militia" ? summary.militiaCapacity : summary.professionalCapacity;
    const roleUsed = unit.role === "militia" ? summary.militia : summary.professionalSoldiers;
    const capacityRemaining = Math.max(0, roleCapacity - roleUsed - roleQueued);
    const manpowerRemaining = Math.max(0, summary.mpRemaining - manpowerQueued);
    const treasuryLimit = effectiveRecruitCost > 0 ? Math.floor(settlement.treasure / effectiveRecruitCost) : 9999;
    const maxRecruit = isGM ? 9999 : Math.max(0, Math.min(capacityRemaining, manpowerRemaining, treasuryLimit));
    const reasons = [];
    if (!sources.length) reasons.push("No completed building unlocks this unit.");
    if (!isGM && capacityRemaining <= 0) reasons.push(`${unit.role === "militia" ? "Militia" : "Professional"} capacity is full.`);
    if (!isGM && manpowerRemaining <= 0) reasons.push("No manpower remains.");
    if (!isGM && treasuryLimit <= 0) reasons.push("Not enough Crown.");

    return {
      ...unit,
      hasImage: Boolean(unit.imageUrl),
      roleLabel: TROOP_ROLES.find(role => role.value === unit.role)?.label || unit.role,
      recruitCostDisplay: formatNumber(effectiveRecruitCost),
      baseRecruitCostDisplay: formatNumber(unit.recruitCost),
      discountDisplay: `${formatNumber(discount)}%`,
      garrisonDisplay: formatNumber(upkeep.garrison),
      campaignDisplay: formatNumber(upkeep.campaign),
      sourceOptions: sources,
      sourceSummary: sources.map(source => source.name).join(", ") || "Locked",
      maxRecruit,
      defaultCount: Math.max(1, Math.min(10, maxRecruit || 1)),
      canQueue: permissions.canManageRecruitment && (isGM || reasons.length === 0),
      blocked: reasons.length > 0 && !isGM,
      blockReason: reasons.join(" ")
    };
  });
}

function userOptions(settlement) {
  const owners = new Set(settlement.ownerUserIds);
  return users().map(user => ({
    id: user.id,
    name: user.name || user.id,
    checked: owners.has(user.id)
  }));
}

function visibleSettlements(data) {
  if (game.user?.isGM) return data.settlements;
  return data.settlements.filter(settlement => settlement.ownerUserIds.includes(game.user.id));
}

function permissionsFor(settlement, isGM = Boolean(game.user?.isGM), userId = game.user?.id) {
  if (isGM) {
    return {
      canView: true,
      canEditBasics: true,
      canEditPopulation: true,
      canEditBuildings: true,
      canEditMilitary: true,
      canEditConstruction: true,
      canManageRecruitment: true,
      canEditGrowth: true,
      canEditAssignments: true,
      canWriteTurnNote: true,
      canProcessTurn: true
    };
  }

  const assigned = settlement.ownerUserIds.includes(userId);
  return {
    canView: assigned,
    canEditBasics: assigned && Boolean(settlement.permissions.playersCanEditBasics),
    canEditPopulation: false,
    canEditBuildings: false,
    canEditMilitary: false,
    canEditConstruction: assigned && Boolean(settlement.permissions.playersCanManageConstruction),
    canManageRecruitment: assigned && Boolean(settlement.permissions.playersCanManageRecruitment),
    canEditGrowth: false,
    canEditAssignments: assigned && Boolean(settlement.permissions.playersCanEditAssignments),
    canWriteTurnNote: assigned && Boolean(settlement.permissions.playersCanWriteTurnNotes),
    canProcessTurn: false
  };
}

function activateListeners(element) {
  const root = element.querySelector(".ds-root");
  if (!root) return;

  root.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.activeTab = event.currentTarget.dataset.tab || "overview";
      persistClientState();
      renderDsPanel();
    });
  });

  root.querySelectorAll("[data-select-settlement]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.selectedSettlementId = event.currentTarget.dataset.selectSettlement || "";
      persistClientState();
      renderDsPanel();
    });
  });

  root.querySelector("[data-search-settlements]")?.addEventListener("change", event => {
    uiState.search = event.currentTarget.value || "";
    persistClientState();
    renderDsPanel();
  });

  root.querySelector("[data-search-construction]")?.addEventListener("change", event => {
    uiState.constructionSearch = event.currentTarget.value || "";
    persistClientState();
    renderDsPanel();
  });

  root.querySelector("[data-search-catalog]")?.addEventListener("change", event => {
    uiState.catalogSearch = event.currentTarget.value || "";
    persistClientState();
    renderDsPanel();
  });

  root.querySelectorAll("[data-construction-category]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.constructionCategory = event.currentTarget.dataset.constructionCategory || "all";
      persistClientState();
      renderDsPanel();
    });
  });

  root.querySelectorAll("[data-catalog-kind]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.catalogKind = event.currentTarget.dataset.catalogKind === "units" ? "units" : "buildings";
      persistClientState();
      renderDsPanel();
    });
  });

  root.querySelectorAll("[data-file-picker]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openImagePicker(event.currentTarget);
    });
  });

  root.querySelectorAll("[data-action-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const confirmMessage = event.submitter?.dataset.confirm || event.currentTarget.dataset.confirm;
      if (confirmMessage && !globalThis.confirm(confirmMessage)) return;
      await sendAction(event.currentTarget.dataset.actionForm, formPayload(event.currentTarget));
    });
  });

  root.querySelectorAll("[data-click-action]").forEach(button => {
    button.addEventListener("click", async event => {
      event.preventDefault();
      const action = event.currentTarget.dataset.clickAction;
      if (!action) return;
      if (event.currentTarget.dataset.confirm && !globalThis.confirm(event.currentTarget.dataset.confirm)) return;
      await sendAction(action, { ...event.currentTarget.dataset });
    });
  });
}

function formPayload(form) {
  const formData = new FormData(form);
  const payload = {};
  for (const [key, value] of formData.entries()) {
    if (Object.hasOwn(payload, key)) payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
    else payload[key] = value;
  }
  form.querySelectorAll("input[type='checkbox'][data-bool][name]").forEach(input => {
    payload[input.name] = input.checked;
  });
  return payload;
}

function openImagePicker(button) {
  const form = button.closest("form");
  const selector = button.dataset.filePicker || "";
  const input = selector ? form?.querySelector(selector) || button.closest(".ds-input-action")?.querySelector("input") : button.closest(".ds-input-action")?.querySelector("input");
  if (!input) return;

  const Picker = globalThis.FilePicker;
  if (!Picker) {
    ui.notifications.warn("DS: Foundry FilePicker is not available here. You can paste an image path manually.");
    return;
  }

  new Picker({
    type: "image",
    current: input.value || "",
    callback: path => {
      input.value = path;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }).render(true);
}

function bindSocket() {
  game.socket.on(SOCKET_NAME, async packet => {
    if (!packet || typeof packet !== "object") return;

    if (packet.type === "refresh") {
      scheduleRefresh();
      return;
    }

    if (packet.type === "actionResult") {
      if (packet.targetUserId && packet.targetUserId !== game.user.id) return;
      resolvePendingAction(packet.requestId, true);
      return;
    }

    if (packet.type === "actionError") {
      if (packet.targetUserId && packet.targetUserId !== game.user.id) return;
      const handled = resolvePendingAction(packet.requestId, false, packet.message);
      if (!handled && packet.message) ui.notifications.warn(packet.message);
      return;
    }

    if (!packet.action) return;
    if (!game.user.isGM || !isResponsibleGM()) return;

    try {
      await processAction(packet.action, packet.payload || {}, packet.userId);
      game.socket.emit(SOCKET_NAME, { type: "actionResult", targetUserId: packet.userId, requestId: packet.requestId });
    } catch (error) {
      console.warn(`${MODULE_ID} | Rejected socket action`, error);
      game.socket.emit(SOCKET_NAME, {
        type: "actionError",
        targetUserId: packet.userId,
        requestId: packet.requestId,
        message: error.message || "DS action rejected."
      });
    }
  });
}

function waitForActionConfirmation(requestId) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      pendingActionRequests.delete(requestId);
      ui.notifications.warn("DS could not confirm that action.");
      resolve(false);
    }, ACTION_CONFIRM_TIMEOUT_MS);

    pendingActionRequests.set(requestId, { resolve, timeout });
  });
}

function resolvePendingAction(requestId, success, message = "") {
  if (!requestId || !pendingActionRequests.has(requestId)) return false;
  const pending = pendingActionRequests.get(requestId);
  pendingActionRequests.delete(requestId);
  clearTimeout(pending.timeout);
  if (!success && message) ui.notifications.warn(message);
  pending.resolve(Boolean(success));
  return true;
}

async function sendAction(action, payload = {}) {
  if (!action) return false;

  if (game.user.isGM && isResponsibleGM()) {
    try {
      return await processAction(action, payload, game.user.id);
    } catch (error) {
      ui.notifications.warn(error.message || "DS action rejected.");
      throw error;
    }
  }

  if (!hasResponsibleGM()) {
    ui.notifications.warn("A GM must be connected to update DS data.");
    return false;
  }

  const requestId = randomId();
  const confirmation = waitForActionConfirmation(requestId);
  game.socket.emit(SOCKET_NAME, {
    action,
    payload,
    userId: game.user.id,
    requestId,
    created: Date.now()
  });
  return confirmation;
}

async function processAction(action, payload, userId) {
  const user = users().find(candidate => candidate.id === userId);
  if (!user) throw new Error("DS user not found.");

  const data = getWorldData();
  switch (action) {
    case "addSettlement":
      requireGM(user);
      {
        const template = data.settlementTemplates.find(item => item.id === payload.templateId) || data.settlementTemplates[0] || starterSettlementTemplate();
        const settlement = defaultSettlement(template, data.rules);
        settlement.name = cleanString(payload.name) || settlement.name;
        data.settlements.unshift(settlement);
      }
      uiState.selectedSettlementId = data.settlements[0].id;
      break;
    case "deleteSettlement":
      requireGM(user);
      deleteById(data.settlements, payload.settlementId);
      uiState.selectedSettlementId = data.settlements[0]?.id || "";
      break;
    case "restoreSample":
      requireGM(user);
      upsertSample(data);
      uiState.selectedSettlementId = "de-laurent";
      break;
    case "setMonth":
      setMonth(data, payload, user);
      break;
    case "processSettlement":
      processSingleSettlement(data, payload, user);
      break;
    case "queueSettlementUpgrade":
      queueSettlementUpgrade(data, payload, user);
      break;
    case "hireConstructionCp":
      hireConstructionCp(data, payload, user);
      break;
    case "unlockSlot":
      unlockSlot(data, payload, user);
      break;
    case "updateSlot":
      updateSlot(data, payload, user);
      break;
    case "updateRulesEconomy":
      updateRulesEconomy(data, payload, user);
      break;
    case "updateRulesConstruction":
      updateRulesConstruction(data, payload, user);
      break;
    case "updateRulesMilitary":
      updateRulesMilitary(data, payload, user);
      break;
    case "updateRuleTier":
      updateRuleTier(data, payload, user);
      break;
    case "updateBasics":
      updateBasics(data, payload, user);
      break;
    case "updateVisuals":
      updateVisuals(data, payload, user);
      break;
    case "updatePopulation":
      updatePopulation(data, payload, user);
      break;
    case "updatePermissions":
      updatePermissions(data, payload, user);
      break;
    case "updateOverrides":
      updateOverrides(data, payload, user);
      break;
    case "addBuilding":
      addBuilding(data, payload, user);
      break;
    case "addCustomBuilding":
      addCustomBuilding(data, payload, user);
      break;
    case "updateBuilding":
      updateBuilding(data, payload, user);
      break;
    case "deleteBuilding":
      deleteBuilding(data, payload, user);
      break;
    case "addCatalogBuilding":
      addCatalogBuilding(data, payload, user);
      break;
    case "updateCatalogBuilding":
      updateCatalogBuilding(data, payload, user);
      break;
    case "deleteCatalogBuilding":
      deleteCatalogBuilding(data, payload, user);
      break;
    case "addTroop":
      addTroop(data, payload, user);
      break;
    case "updateTroop":
      updateTroop(data, payload, user);
      break;
    case "deleteTroop":
      deleteTroop(data, payload, user);
      break;
    case "addCatalogUnit":
      addCatalogUnit(data, payload, user);
      break;
    case "updateCatalogUnit":
      updateCatalogUnit(data, payload, user);
      break;
    case "deleteCatalogUnit":
      deleteCatalogUnit(data, payload, user);
      break;
    case "queueRecruitment":
      queueRecruitment(data, payload, user);
      break;
    case "cancelRecruitment":
      cancelRecruitment(data, payload, user);
      break;
    case "addRecruitment":
      addRecruitment(data, payload, user);
      break;
    case "updateRecruitment":
      updateRecruitment(data, payload, user);
      break;
    case "deleteRecruitment":
      deleteRecruitment(data, payload, user);
      break;
    case "addProject":
      addProject(data, payload, user);
      break;
    case "queueConstruction":
      queueConstruction(data, payload, user);
      break;
    case "cancelProject":
      cancelProject(data, payload, user);
      break;
    case "moveProject":
      moveProject(data, payload, user);
      break;
    case "updateProject":
      updateProject(data, payload, user);
      break;
    case "deleteProject":
      deleteProject(data, payload, user);
      break;
    case "updateGrowth":
      updateGrowth(data, payload, user);
      break;
    case "updateTurnNote":
      updateTurnNote(data, payload, user);
      break;
    case "processMonth":
      processMonth(data, payload, user);
      break;
    case "processTurn":
      processTurn(data, payload, user);
      break;
    default:
      throw new Error(`Unknown DS action: ${action}`);
  }

  await saveWorldData(data, action);
  return true;
}

function updateBasics(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditBasics) throw new Error("You cannot edit this settlement.");

  settlement.name = cleanString(payload.name) || settlement.name;
  settlement.region = cleanString(payload.region);
  settlement.type = tierName(settlement.tier, data.rules);
  settlement.terrainTags = splitTags(payload.terrainTags);
  settlement.biomeTags = splitTags(payload.biomeTags);
  settlement.notes = cleanString(payload.notes);

  if (user.isGM) {
    if (Object.hasOwn(payload, "imageUrl")) settlement.imageUrl = cleanString(payload.imageUrl);
    if (Object.hasOwn(payload, "portraitUrl")) settlement.portraitUrl = cleanString(payload.portraitUrl);
    if (Object.hasOwn(payload, "governorName")) settlement.governorName = cleanString(payload.governorName);
    if (Object.hasOwn(payload, "biomeDescription")) settlement.biomeDescription = cleanString(payload.biomeDescription);
    if (Object.hasOwn(payload, "systemNotes")) settlement.systemNotes = cleanString(payload.systemNotes);
    if (Object.hasOwn(payload, "ownerUserIds")) settlement.ownerUserIds = arrayPayload(payload.ownerUserIds).map(cleanString).filter(Boolean);
    settlement.gmNotes = cleanString(payload.gmNotes);
  }
}

function updateVisuals(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.imageUrl = cleanString(payload.imageUrl);
  settlement.portraitUrl = cleanString(payload.portraitUrl);
  settlement.governorName = cleanString(payload.governorName);
  settlement.biomeDescription = cleanString(payload.biomeDescription);
  settlement.systemNotes = cleanString(payload.systemNotes);
  settlement.ownerUserIds = arrayPayload(payload.ownerUserIds).map(cleanString).filter(Boolean);
}

function updatePopulation(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.population = Math.max(0, Math.trunc(toNumber(payload.population, settlement.population)));
  settlement.treasure = toNumber(payload.treasure, settlement.treasure);
  settlement.slotBonus = Math.max(0, Math.trunc(toNumber(payload.slotBonus, settlement.slotBonus)));
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
}

function setMonth(data, payload, user) {
  requireGM(user);
  data.month = Math.max(1, Math.trunc(toNumber(payload.month, data.month)));
}

function updateRulesEconomy(data, payload, user) {
  requireGM(user);
  data.rules.economy.taxPerFreePop = Math.max(0, toNumber(payload.taxPerFreePop, data.rules.economy.taxPerFreePop));
  data.rules.economy.incomeMultiplier = Math.max(0, toNumber(payload.incomeMultiplier, data.rules.economy.incomeMultiplier));
  data.rules.economy.constructionHireCostPerCp = Math.max(0, toNumber(payload.constructionHireCostPerCp, data.rules.economy.constructionHireCostPerCp));
}

function updateRulesConstruction(data, payload, user) {
  requireGM(user);
  data.rules.construction.cpPerFreePop = Math.max(0, toNumber(payload.cpPerFreePop, data.rules.construction.cpPerFreePop));
  data.rules.construction.overflowToNextProject = Boolean(payload.overflowToNextProject);
}

function updateRulesMilitary(data, payload, user) {
  requireGM(user);
  for (const key of ["professionalGarrisonPercent", "professionalCampaignPercent", "militiaGarrisonPercent", "militiaCampaignPercent"]) {
    data.rules.military[key] = Math.max(0, toNumber(payload[key], data.rules.military[key]));
  }
}

function updateRuleTier(data, payload, user) {
  requireGM(user);
  const tier = tierRuleFor(payload.tierId, data.rules);
  tier.name = cleanString(payload.name) || tier.name;
  tier.minPopulation = Math.max(0, Math.trunc(toNumber(payload.minPopulation, tier.minPopulation)));
  tier.openSlots = Math.max(0, Math.trunc(toNumber(payload.openSlots, tier.openSlots)));
  tier.maxSlots = Math.max(tier.openSlots, Math.trunc(toNumber(payload.maxSlots, tier.maxSlots)));
  tier.promotionCost = Math.max(0, toNumber(payload.promotionCost, tier.promotionCost));
  tier.promotionCp = Math.max(0, toNumber(payload.promotionCp, tier.promotionCp));
  tier.slotUnlockCost = Math.max(0, toNumber(payload.slotUnlockCost, tier.slotUnlockCost));
  tier.activeProjects = clamp(Math.trunc(toNumber(payload.activeProjects, tier.activeProjects)), 1, 5);
  tier.coreName = cleanString(payload.coreName) || tier.coreName;
  for (const settlement of data.settlements) {
    settlement.type = tierName(settlement.tier, data.rules);
    settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
  }
}

function unlockSlot(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot unlock settlement slots.");
  const slot = findById(settlement.slots, payload.slotId, "Settlement slot");
  if (slot.unlocked) return;
  if (slot.gmLocked && !user.isGM) throw new Error("This slot is locked by the GM.");
  const cost = user.isGM && Boolean(payload.free) ? 0 : slot.unlockCost;
  if (settlement.treasure < cost) throw new Error(`Unlocking this slot needs ${formatNumber(cost)} Crown.`);
  settlement.treasure -= cost;
  slot.unlocked = true;
}

function updateSlot(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const slot = findById(settlement.slots, payload.slotId, "Settlement slot");
  slot.label = cleanString(payload.label) || slot.label;
  slot.unlocked = Boolean(payload.unlocked);
  slot.gmLocked = Boolean(payload.gmLocked);
  slot.unlockCost = Math.max(0, toNumber(payload.unlockCost, slot.unlockCost));
  slot.allowedCategory = ["economic", "military"].includes(payload.allowedCategory) ? payload.allowedCategory : "all";
}

function updatePermissions(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.permissions.playersCanEditBasics = Boolean(payload.playersCanEditBasics);
  settlement.permissions.playersCanEditAssignments = Boolean(payload.playersCanEditAssignments);
  settlement.permissions.playersCanManageConstruction = Boolean(payload.playersCanManageConstruction);
  settlement.permissions.playersCanManageRecruitment = Boolean(payload.playersCanManageRecruitment);
  settlement.permissions.playersCanWriteTurnNotes = Boolean(payload.playersCanWriteTurnNotes);
}

function updateOverrides(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.overrides.ignorePopulationLimits = Boolean(payload.ignorePopulationLimits);
  settlement.overrides.ignoreManpowerLimits = Boolean(payload.ignoreManpowerLimits);
  settlement.overrides.ignoreMilitaryCapacity = Boolean(payload.ignoreMilitaryCapacity);
  settlement.overrides.ignoreBuildingRequirements = Boolean(payload.ignoreBuildingRequirements);
  settlement.overrides.ignoreSlotLimits = Boolean(payload.ignoreSlotLimits);
  settlement.overrides.ignoreGrowthLimits = Boolean(payload.ignoreGrowthLimits);
}

function addBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const item = data.catalog.find(candidate => candidate.id === payload.catalogId) || data.catalog[0];
  const slot = firstEmptySlot(settlement, item.category, true);
  if (!slot) throw new Error("No settlement slot is available for this building.");
  slot.unlocked = true;
  settlement.buildings.push(buildingFromCatalog(item, { slotId: slot.id }, data.unitCatalog));
}

function addCustomBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const slot = firstEmptySlot(settlement, "economic", true);
  if (!slot) throw new Error("No settlement slot is available for a custom building.");
  slot.unlocked = true;
  settlement.buildings.push(normalizeBuilding({
    id: randomId(),
    catalogId: "custom",
    slotId: slot.id,
    name: "Custom Building",
    category: "economic",
    active: true,
    level: 1,
    assignedPop: 0,
    workers: 5,
    rate: 0,
    flatOutput: 0,
    terrain: "Any",
    requirement: "",
    crownCost: 0,
    cpCost: 0,
    slot: "economic",
    slotUse: 1,
    imageUrl: "",
    special: true
  }, data.unitCatalog));
}

function updateBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const building = findById(settlement.buildings, payload.buildingId, "Building");
  const permissions = permissionsFor(settlement, user.isGM, user.id);

  if (user.isGM) {
    building.name = cleanString(payload.name) || building.name;
    building.category = categoryValue(payload.category);
    building.level = clamp(Math.trunc(toNumber(payload.level, building.level)), 1, 10);
    building.active = Boolean(payload.active);
    building.special = Boolean(payload.special);
    building.gmOnly = Boolean(payload.gmOnly);
    building.assignedPop = Math.max(0, toNumber(payload.assignedPop, building.assignedPop));
    building.workers = Math.max(0, toNumber(payload.workers, building.workers));
    building.rate = Math.max(0, toNumber(payload.rate, building.rate));
    building.flatOutput = toNumber(payload.flatOutput, building.flatOutput);
    building.buildingUpkeep = Math.max(0, toNumber(payload.buildingUpkeep, building.buildingUpkeep));
    if (Object.hasOwn(payload, "terrain")) building.terrain = cleanString(payload.terrain);
    if (Object.hasOwn(payload, "requirement")) building.requirement = cleanString(payload.requirement);
    building.crownCost = Math.max(0, toNumber(payload.crownCost, building.crownCost));
    building.cpCost = Math.max(0, toNumber(payload.cpCost, building.cpCost));
    building.slot = building.category;
    building.slotUse = Math.max(0, toNumber(payload.slotUse, building.slotUse));
    building.professionalCapacity = Math.max(0, toNumber(payload.professionalCapacity, building.professionalCapacity));
    building.militiaCapacity = Math.max(0, toNumber(payload.militiaCapacity, building.militiaCapacity));
    building.bonusEconomicSlots = toNumber(payload.bonusEconomicSlots, building.bonusEconomicSlots);
    building.bonusMilitarySlots = toNumber(payload.bonusMilitarySlots, building.bonusMilitarySlots);
    if (Object.hasOwn(payload, "recruitableUnitIds")) {
      building.recruitableUnitIds = arrayPayload(payload.recruitableUnitIds)
        .map(cleanString)
        .filter(id => data.unitCatalog.some(unit => unit.id === id));
      building.recruitType = building.recruitableUnitIds[0] || "";
    } else {
      building.recruitType = recruitTypeValue(payload.recruitType, data.unitCatalog);
      building.recruitableUnitIds = building.recruitType ? [building.recruitType] : building.recruitableUnitIds;
    }
    building.recruitPerLevel = Math.max(0, toNumber(payload.recruitPerLevel, building.recruitPerLevel));
    building.canRecruit = Boolean(payload.canRecruit);
    building.constructionBonus = Math.max(0, toNumber(payload.constructionBonus, building.constructionBonus));
    building.recruitmentDiscount = clamp(toNumber(payload.recruitmentDiscount, building.recruitmentDiscount), 0, 90);
    building.upkeepDiscount = clamp(toNumber(payload.upkeepDiscount, building.upkeepDiscount), 0, 90);
    building.growth = toNumber(payload.growth, building.growth);
    building.imageUrl = cleanString(payload.imageUrl);
    building.notes = cleanString(payload.notes);
    return;
  }

  if (!permissions.canEditAssignments) throw new Error("You cannot edit building assignments.");
  building.assignedPop = Math.max(0, toNumber(payload.assignedPop, building.assignedPop));
}

function deleteBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.buildings, payload.buildingId);
}

function addCatalogBuilding(data, payload, user) {
  requireGM(user);
  const id = `building-${randomId().toLowerCase()}`;
  data.catalog.push(normalizeCatalogItem({
    id,
    name: "New Building Template",
    category: "economic",
    terrain: "Any",
    workers: 5,
    crownCost: 500,
    cpCost: 250,
    slot: "economic",
    slotUse: 1,
    enabled: true,
    maxLevel: 1,
    chainId: id,
    nodeTier: 1,
    parentIds: [],
    settlementTier: "hamlet",
    notes: "Configure this template, then it will appear in Construction."
  }));
}

function updateCatalogBuilding(data, payload, user) {
  requireGM(user);
  const item = findById(data.catalog, payload.catalogId, "Building template");
  item.name = cleanString(payload.name) || item.name;
  item.category = categoryValue(payload.category);
  item.enabled = Boolean(payload.enabled);
  item.special = Boolean(payload.special);
  item.gmOnly = Boolean(payload.gmOnly);
  item.maxLevel = 1;
  item.chainId = cleanString(payload.chainId) || item.id;
  item.nodeTier = clamp(Math.trunc(toNumber(payload.nodeTier, item.nodeTier)), 1, 10);
  item.parentIds = splitTags(payload.parentIds);
  if (item.parentIds.includes(item.id)) throw new Error("A building node cannot be its own parent.");
  const missingParent = item.parentIds.find(id => !data.catalog.some(candidate => candidate.id === id));
  if (missingParent) throw new Error(`Parent building node ${missingParent} does not exist.`);
  if (catalogHasCycle(data.catalog, item.id)) throw new Error("This parent selection creates a building branch cycle.");
  item.settlementTier = settlementTierValue(payload.settlementTier);
  item.terrain = cleanString(payload.terrain) || "Any";
  if (Object.hasOwn(payload, "requirement")) item.requirement = cleanString(payload.requirement);
  if (Object.hasOwn(payload, "requires")) item.requires = cleanString(payload.requires);
  item.workers = Math.max(0, toNumber(payload.workers, item.workers));
  item.rate = Math.max(0, toNumber(payload.rate, item.rate));
  item.flatOutput = toNumber(payload.flatOutput, item.flatOutput);
  item.buildingUpkeep = Math.max(0, toNumber(payload.buildingUpkeep, item.buildingUpkeep));
  item.crownCost = Math.max(0, toNumber(payload.crownCost, item.crownCost));
  item.cpCost = Math.max(0, toNumber(payload.cpCost, item.cpCost));
  item.slot = item.category;
  item.slotUse = Math.max(0, toNumber(payload.slotUse, item.slotUse));
  item.professionalCapacity = Math.max(0, toNumber(payload.professionalCapacity, item.professionalCapacity));
  item.militiaCapacity = Math.max(0, toNumber(payload.militiaCapacity, item.militiaCapacity));
  item.bonusEconomicSlots = toNumber(payload.bonusEconomicSlots, item.bonusEconomicSlots);
  item.bonusMilitarySlots = toNumber(payload.bonusMilitarySlots, item.bonusMilitarySlots);
  item.recruitPerLevel = Math.max(0, toNumber(payload.recruitPerLevel, item.recruitPerLevel));
  item.canRecruit = Boolean(payload.canRecruit);
  item.constructionBonus = Math.max(0, toNumber(payload.constructionBonus, item.constructionBonus));
  item.recruitmentDiscount = clamp(toNumber(payload.recruitmentDiscount, item.recruitmentDiscount), 0, 90);
  item.upkeepDiscount = clamp(toNumber(payload.upkeepDiscount, item.upkeepDiscount), 0, 90);
  item.growth = toNumber(payload.growth, item.growth);
  item.recruitableUnitIds = arrayPayload(payload.recruitableUnitIds)
    .map(cleanString)
    .filter(id => data.unitCatalog.some(unit => unit.id === id));
  item.recruitType = item.recruitableUnitIds[0] || "";
  item.imageUrl = cleanString(payload.imageUrl);
  item.notes = cleanString(payload.notes);
}

function deleteCatalogBuilding(data, payload, user) {
  requireGM(user);
  const item = findById(data.catalog, payload.catalogId, "Building template");
  if (BUILDING_CATALOG.some(candidate => candidate.id === item.id)) throw new Error("Built-in templates can be disabled but not deleted.");
  const inUse = data.settlements.some(settlement =>
    settlement.buildings.some(building => building.catalogId === item.id) ||
    settlement.projects.some(project => project.catalogId === item.id && project.status !== "completed")
  );
  if (inUse) throw new Error("This building template is used by a settlement or active project.");
  deleteById(data.catalog, item.id);
}

function catalogHasCycle(catalog, startId) {
  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const item = catalog.find(candidate => candidate.id === id);
    for (const parentId of item?.parentIds || []) {
      if (visit(parentId)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return visit(startId);
}

function addTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const type = data.unitCatalog[0] || TROOP_TYPES[0];
  settlement.troops.push(normalizeTroop({ id: randomId(), type: type.id, count: 0, mode: "garrison", imageUrl: type.imageUrl, notes: "" }, data.unitCatalog));
}

function updateTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const troop = findById(settlement.troops, payload.troopId, "Troop");
  const permissions = permissionsFor(settlement, user.isGM, user.id);

  if (!user.isGM && !permissions.canEditAssignments) throw new Error("You cannot edit military assignments.");
  troop.name = cleanString(payload.name) || troop.name;
  troop.imageUrl = cleanString(payload.imageUrl) || troopType(troop.type, data.unitCatalog).imageUrl;
  if (user.isGM) {
    const type = troopType(payload.type, data.unitCatalog);
    troop.type = type.id;
    troop.role = troopRole(payload.role, type.role);
    troop.garrisonCost = Math.max(0, toNumber(payload.garrisonCost, troop.garrisonCost));
    troop.campaignCost = Math.max(0, toNumber(payload.campaignCost, troop.campaignCost));
  }
  if (user.isGM) troop.count = Math.max(0, Math.trunc(toNumber(payload.count, troop.count)));
  troop.mode = payload.mode === "campaign" ? "campaign" : "garrison";
  troop.notes = cleanString(payload.notes);
}

function deleteTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.troops, payload.troopId);
}

function addCatalogUnit(data, payload, user) {
  requireGM(user);
  const id = `unit-${randomId().toLowerCase()}`;
  data.unitCatalog.push(normalizeUnitCatalogItem({
    id,
    name: "New Unit Template",
    role: "professional",
    recruitCost: 100,
    garrison: 3,
    campaign: 8,
    tier: 1,
    enabled: true,
    description: "Assign this unit to one or more building templates."
  }));
}

function updateCatalogUnit(data, payload, user) {
  requireGM(user);
  const unit = findById(data.unitCatalog, payload.unitId, "Unit template");
  unit.name = cleanString(payload.name) || unit.name;
  unit.role = troopRole(payload.role, unit.role);
  unit.enabled = Boolean(payload.enabled);
  unit.recruitCost = Math.max(0, toNumber(payload.recruitCost, unit.recruitCost));
  unit.garrison = Math.max(0, toNumber(payload.garrison, unit.garrison));
  unit.campaign = Math.max(0, toNumber(payload.campaign, unit.campaign));
  unit.tier = clamp(Math.trunc(toNumber(payload.tier, unit.tier)), 1, 10);
  if (Object.hasOwn(payload, "useRuleUpkeep")) unit.useRuleUpkeep = Boolean(payload.useRuleUpkeep);
  unit.imageUrl = cleanString(payload.imageUrl);
  unit.description = cleanString(payload.description);
}

function deleteCatalogUnit(data, payload, user) {
  requireGM(user);
  const unit = findById(data.unitCatalog, payload.unitId, "Unit template");
  if (TROOP_TYPES.some(candidate => candidate.id === unit.id)) throw new Error("Built-in unit templates can be disabled but not deleted.");
  const inUse = data.settlements.some(settlement =>
    settlement.troops.some(troop => troop.type === unit.id) ||
    settlement.recruitment.some(order => order.troopType === unit.id && order.status !== "completed")
  );
  if (inUse) throw new Error("This unit template is used by a settlement or recruitment order.");
  data.catalog.forEach(building => {
    building.recruitableUnitIds = building.recruitableUnitIds.filter(id => id !== unit.id);
    if (building.recruitType === unit.id) building.recruitType = building.recruitableUnitIds[0] || "";
  });
  deleteById(data.unitCatalog, unit.id);
}

function queueRecruitment(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canManageRecruitment) throw new Error("You cannot manage recruitment for this settlement.");

  const unit = data.unitCatalog.find(candidate => candidate.id === cleanString(payload.unitId));
  if (!unit || !unit.enabled) throw new Error("This unit is not available for recruitment.");
  const count = Math.max(1, Math.trunc(toNumber(payload.targetCount, 1)));
  const requestedSourceId = cleanString(payload.sourceBuildingId);
  const direct = !requestedSourceId || requestedSourceId === DIRECT_RECRUITMENT_SOURCE;
  let source = null;

  if (direct && !user.isGM) throw new Error("Direct recruitment is GM only.");
  if (!direct) {
    source = findById(settlement.buildings, requestedSourceId, "Recruitment source");
    if (!source.active || !sourceUnlocksUnit(source, unit.id) || buildingRecruitmentCapacity(source) <= 0) {
      throw new Error(`${source.name} cannot recruit ${unit.name}.`);
    }
  }

  const summary = calculateSettlement(settlement, data);
  if (!direct && !settlement.overrides.ignoreMilitaryCapacity) {
    const queued = settlement.recruitment
      .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === unit.role)
      .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
    const used = unit.role === "militia" ? summary.militia : summary.professionalSoldiers;
    const capacity = unit.role === "militia" ? summary.militiaCapacity : summary.professionalCapacity;
    if (used + queued + count > capacity) throw new Error(`${unit.role === "militia" ? "Militia" : "Professional"} capacity is too low for this order.`);
  }

  if (!direct && !settlement.overrides.ignoreManpowerLimits) {
    const queued = settlement.recruitment
      .filter(order => order.status !== "completed")
      .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
    if (summary.mpRemaining - queued < count) throw new Error("Not enough manpower for this recruitment order.");
  }

  const discount = direct ? 0 : settlementRecruitmentDiscount(settlement, source);
  const costPerUnit = direct ? 0 : Math.max(0, Math.round(unit.recruitCost * (1 - discount / 100)));
  const totalCost = costPerUnit * count;
  if (settlement.treasure < totalCost) throw new Error(`Recruitment needs ${formatNumber(totalCost)} Crown.`);
  settlement.treasure -= totalCost;
  settlement.recruitment.push(normalizeRecruitment({
    id: randomId(),
    sourceBuildingId: direct ? "" : requestedSourceId,
    regimentName: cleanString(payload.regimentName) || unit.name,
    imageUrl: cleanString(payload.imageUrl) || unit.imageUrl,
    troopType: unit.id,
    targetCount: count,
    trained: 0,
    costPerUnit,
    crownPaid: totalCost,
    status: "inProgress",
    createdAt: Date.now(),
    notes: direct ? "Direct GM recruitment." : "Queued from recruitment roster."
  }, data.unitCatalog));
}

function cancelRecruitment(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canManageRecruitment) throw new Error("You cannot manage recruitment for this settlement.");
  const order = findById(settlement.recruitment, payload.recruitmentId, "Recruitment order");
  if (order.status === "completed") throw new Error("Completed recruitment cannot be cancelled.");
  const remaining = Math.max(0, order.targetCount - order.trained);
  const refund = Math.min(order.crownPaid, remaining * order.costPerUnit);
  settlement.treasure += refund;
  deleteById(settlement.recruitment, order.id);
}

function addRecruitment(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const type = data.unitCatalog[0] || TROOP_TYPES[0];
  settlement.recruitment.push(normalizeRecruitment({
    id: randomId(),
    sourceBuildingId: "",
    troopType: type.id,
    targetCount: 10,
    trained: 0,
    costPerUnit: 0,
    crownPaid: 0,
    status: "planned",
    notes: "Direct GM recruitment. Select a troop type, set count, then mark Recruiting or set Trained manually."
  }, data.unitCatalog));
}

function updateRecruitment(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const order = findById(settlement.recruitment, payload.recruitmentId, "Recruitment");
  requireGM(user);
  const sourceBuildingId = cleanString(payload.sourceBuildingId);
  if (!sourceBuildingId || sourceBuildingId === DIRECT_RECRUITMENT_SOURCE) {
    order.sourceBuildingId = "";
  } else {
    const source = findById(settlement.buildings, sourceBuildingId, "Recruitment source");
    order.sourceBuildingId = source.id;
  }
  order.troopType = troopType(payload.troopType, data.unitCatalog).id;
  order.regimentName = cleanString(payload.regimentName) || order.regimentName;
  order.imageUrl = cleanString(payload.imageUrl) || order.imageUrl;
  order.targetCount = Math.max(0, Math.trunc(toNumber(payload.targetCount, order.targetCount)));
  order.trained = clamp(Math.trunc(toNumber(payload.trained, order.trained)), 0, order.targetCount);
  order.status = recruitmentStatus(payload.status);
  order.notes = cleanString(payload.notes);
}

function deleteRecruitment(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.recruitment, payload.recruitmentId);
}

function addProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const slot = firstEmptySlot(settlement, "economic", true);
  const item = data.catalog.find(candidate => candidate.enabled && candidate.category === "economic" && !candidate.parentIds.length) || data.catalog[0];
  if (!slot || !item) throw new Error("No empty slot or building template is available.");
  slot.unlocked = true;
  settlement.projects.push(normalizeProject({
    id: randomId(),
    kind: "building",
    name: item.name,
    catalogId: item.id,
    slotId: slot.id,
    targetLevel: 1,
    requiredCrown: item.crownCost,
    crownPaid: 0,
    requiredCp: item.cpCost,
    cpPaid: 0,
    externalWorkers: 0,
    bonusCp: 0,
    status: "planned",
    notes: ""
  }));
  ensureActiveConstructionQueue(settlement, data);
}

function queueConstruction(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot manage construction for this settlement.");
  const item = findById(data.catalog, payload.catalogId, "Building template");
  if (!item.enabled || item.gmOnly && !user.isGM) throw new Error("This building is not available for construction.");

  const slot = findById(settlement.slots, payload.slotId, "Settlement slot");
  const current = settlement.buildings.find(building => building.slotId === slot.id);
  const reasons = constructionBlockReasons(item, settlement, slot, current, data, permissions, user.isGM);
  if (reasons.length) throw new Error(reasons.join(" "));
  const cost = constructionCost(item);
  settlement.treasure -= cost.crown;
  settlement.projects.push(normalizeProject({
    id: randomId(),
    kind: "building",
    name: current ? `${current.name} -> ${item.name}` : item.name,
    catalogId: item.id,
    slotId: slot.id,
    replacesBuildingId: current?.id || "",
    targetLevel: item.nodeTier,
    requiredCrown: cost.crown,
    crownPaid: cost.crown,
    requiredCp: cost.cp,
    cpPaid: 0,
    externalWorkers: 0,
    bonusCp: 0,
    status: "planned",
    imageUrl: item.imageUrl,
    queuedBy: user.id,
    createdAt: Date.now(),
    notes: "Queued from Construction."
  }));
  ensureActiveConstructionQueue(settlement, data);
}

function queueSettlementUpgrade(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot manage settlement progression.");
  const next = nextTierFor(settlement.tier, data.rules);
  if (!next) throw new Error("This settlement is already at the highest tier.");
  if (settlement.projects.some(project => project.kind === "settlementUpgrade" && project.status !== "completed")) {
    throw new Error("A settlement progression project is already queued.");
  }
  if (!settlement.overrides.ignorePopulationLimits && settlement.population < next.minPopulation) {
    throw new Error(`${next.name} requires ${formatNumber(next.minPopulation)} POP.`);
  }
  if (settlement.treasure < next.promotionCost) throw new Error(`${next.name} requires ${formatNumber(next.promotionCost)} Crown.`);
  settlement.treasure -= next.promotionCost;
  settlement.projects.push(normalizeProject({
    id: randomId(),
    kind: "settlementUpgrade",
    name: `Develop ${next.coreName}`,
    targetTier: next.id,
    requiredCrown: next.promotionCost,
    crownPaid: next.promotionCost,
    requiredCp: next.promotionCp,
    cpPaid: 0,
    status: "planned",
    queuedBy: user.id,
    createdAt: Date.now(),
    notes: `Settlement progression to ${next.name}.`
  }));
  ensureActiveConstructionQueue(settlement, data);
}

function hireConstructionCp(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot hire construction workers.");
  const project = findById(settlement.projects, payload.projectId, "Construction project");
  if (project.status === "completed") throw new Error("This project is already complete.");
  const cp = Math.max(1, Math.trunc(toNumber(payload.cp, 1)));
  const cost = cp * data.rules.economy.constructionHireCostPerCp;
  if (settlement.treasure < cost) throw new Error(`Hiring ${formatNumber(cp)} CP needs ${formatNumber(cost)} Crown.`);
  settlement.treasure -= cost;
  project.bonusCp += cp;
}

function cancelProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot manage construction for this settlement.");
  const project = findById(settlement.projects, payload.projectId, "Construction project");
  if (project.status === "completed") throw new Error("Completed construction cannot be cancelled.");
  settlement.treasure += Math.max(0, project.crownPaid);
  deleteById(settlement.projects, project.id);
  ensureActiveConstructionQueue(settlement, data);
}

function moveProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditConstruction) throw new Error("You cannot reorder construction for this settlement.");
  const index = settlement.projects.findIndex(project => project.id === payload.projectId);
  if (index < 0 || settlement.projects[index].status === "completed") throw new Error("Construction project not found.");
  const direction = payload.direction === "down" ? 1 : -1;
  let swapIndex = index + direction;
  while (swapIndex >= 0 && swapIndex < settlement.projects.length && settlement.projects[swapIndex].status === "completed") swapIndex += direction;
  if (swapIndex < 0 || swapIndex >= settlement.projects.length) return;
  [settlement.projects[index], settlement.projects[swapIndex]] = [settlement.projects[swapIndex], settlement.projects[index]];
  settlement.projects.forEach(project => {
    if (project.status === "inProgress") project.status = "planned";
  });
  ensureActiveConstructionQueue(settlement, data);
}

function ensureActiveConstructionQueue(settlement, data = null) {
  const candidates = settlement.projects.filter(project => project.status === "planned" || project.status === "inProgress");
  if (!candidates.length) return;
  const rules = data?.rules || defaultRules();
  const limit = tierRuleFor(settlement.tier, rules).activeProjects;
  candidates.forEach((project, index) => {
    project.status = index < limit ? "inProgress" : "planned";
  });
}

function updateProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const project = findById(settlement.projects, payload.projectId, "Project");
  requireGM(user);
  project.name = cleanString(payload.name) || project.name;
  project.catalogId = cleanString(payload.catalogId);
  project.targetLevel = clamp(Math.trunc(toNumber(payload.targetLevel, project.targetLevel)), 1, 10);
  project.requiredCrown = Math.max(0, toNumber(payload.requiredCrown, project.requiredCrown));
  project.crownPaid = Math.max(0, toNumber(payload.crownPaid, project.crownPaid));
  project.requiredCp = Math.max(0, toNumber(payload.requiredCp, project.requiredCp));
  project.cpPaid = Math.max(0, toNumber(payload.cpPaid, project.cpPaid));
  project.externalWorkers = Math.max(0, toNumber(payload.externalWorkers, project.externalWorkers));
  project.bonusCp = Math.max(0, toNumber(payload.bonusCp, project.bonusCp));
  project.cpAllocation = Math.max(1, toNumber(payload.cpAllocation, project.cpAllocation));
  project.status = projectStatus(payload.status);
  project.notes = cleanString(payload.notes);
  ensureActiveConstructionQueue(settlement, data);
}

function deleteProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.projects, payload.projectId);
  ensureActiveConstructionQueue(settlement, data);
}

function updateGrowth(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.growth.baseRate = toNumber(payload.baseRate, settlement.growth.baseRate);
  settlement.growth.safeBonus = toNumber(payload.safeBonus, settlement.growth.safeBonus);
  settlement.growth.foodBonus = toNumber(payload.foodBonus, settlement.growth.foodBonus);
  settlement.growth.migrationBonus = toNumber(payload.migrationBonus, settlement.growth.migrationBonus);
  settlement.growth.warPenalty = toNumber(payload.warPenalty, settlement.growth.warPenalty);
  settlement.growth.faminePenalty = toNumber(payload.faminePenalty, settlement.growth.faminePenalty);
  settlement.growth.plaguePenalty = toNumber(payload.plaguePenalty, settlement.growth.plaguePenalty);
  settlement.growth.taxPenalty = toNumber(payload.taxPenalty, settlement.growth.taxPenalty);
  settlement.growth.raidPenalty = toNumber(payload.raidPenalty, settlement.growth.raidPenalty);
  settlement.growth.otherModifier = toNumber(payload.otherModifier, settlement.growth.otherModifier);
  settlement.growth.overrideRate = cleanString(payload.overrideRate);
  settlement.growth.overridePopChange = cleanString(payload.overridePopChange);
  settlement.growth.roundDown = Boolean(payload.roundDown);
}

function updateTurnNote(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canWriteTurnNote) throw new Error("You cannot write a turn note for this settlement.");
  settlement.turnNotes[user.id] = {
    text: cleanString(payload.turnNote),
    authorName: user.name || "Player",
    updated: Date.now()
  };
}

function processMonth(data, payload, user) {
  processTurn(data, payload, user);
}

function processSingleSettlement(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const force = Boolean(payload.force);
  if (settlement.lastProcessedMonth === data.month && !force) {
    throw new Error(`${settlement.name} has already been processed for Month ${data.month}.`);
  }
  processSettlementTurn(data, settlement, cleanString(payload.gmTurnNote));
  ui.notifications.info(`DS: ${settlement.name} processed for Month ${data.month}.`);
}

function processTurn(data, payload, user) {
  requireGM(user);
  const gmTurnNote = cleanString(payload.gmTurnNote);
  const processedMonth = data.month;
  const pending = data.settlements.filter(settlement => settlement.lastProcessedMonth !== processedMonth);
  for (const settlement of pending) processSettlementTurn(data, settlement, gmTurnNote);
  data.month += 1;
  ui.notifications.info(`DS: Month ${processedMonth} closed; ${pending.length} pending settlement(s) processed.`);
}

function processSettlementTurn(data, settlement, gmTurnNote) {
  const before = calculateSettlement(settlement, data);
  const construction = processConstruction(settlement, data, before);
  const treasureBefore = toNumber(settlement.treasure, 0);

  settlement.treasure = treasureBefore + before.netIncome;
  const recruitmentResult = processRecruitment(settlement, data);
  const growth = calculateGrowth(settlement, before);
  settlement.population = Math.max(0, settlement.population + growth.popChange);
  const after = calculateSettlement(settlement, data);
  const playerNotes = Object.entries(settlement.turnNotes).map(([noteUserId, note]) => ({
    userId: noteUserId,
    authorName: note.authorName || userName(noteUserId),
    text: note.text || "",
    updated: note.updated || Date.now()
  })).filter(note => note.text);

  settlement.eventLog.unshift({
    id: randomId(),
    month: data.month,
    created: Date.now(),
    title: `Month ${data.month} Processed`,
    text: [
      `Gross Income: ${formatNumber(before.grossIncome)} Crown`,
      `Building Upkeep: ${formatNumber(before.buildingUpkeep)} Crown`,
      `Military Upkeep: ${formatNumber(before.militaryCost)} Crown`,
      `Net Income: ${formatSigned(before.netIncome)} Crown`,
      `Treasure: ${formatNumber(treasureBefore)} -> ${formatNumber(settlement.treasure)} Crown`,
      `Construction CP Applied: ${formatNumber(construction.cpApplied)}`,
      `Completed Projects: ${construction.completed.length ? construction.completed.map(project => project.name).join(", ") : "None"}`,
      `Recruitment: ${recruitmentResult.lines.length ? recruitmentResult.lines.join("; ") : "None"}`,
      `POP Change: ${formatSigned(growth.popChange)} (${formatSigned(growth.rate)}%)`,
      `New POP: ${formatNumber(after.totalPop)}`
    ].join("\n"),
    gmNote: gmTurnNote,
    playerNotes
  });

  settlement.eventLog = settlement.eventLog.slice(0, 100);
  settlement.turnNotes = {};
  settlement.lastProcessedMonth = data.month;
}

function processConstruction(settlement, data, summary) {
  settlement.projects.forEach(project => project.cpGeneratedThisMonth = 0);
  ensureActiveConstructionQueue(settlement, data);
  const active = settlement.projects.filter(project => project.status === "inProgress" && project.crownPaid >= project.requiredCrown);
  const completed = [];
  if (!active.length) return { cpApplied: 0, completed };

  const totalWeight = active.reduce((total, project) => total + Math.max(1, project.cpAllocation), 0);
  let baseRemaining = Math.max(0, Math.floor(summary.cpThisMonth));
  let carry = 0;
  let cpApplied = 0;

  active.forEach((project, index) => {
    const share = index === active.length - 1
      ? baseRemaining
      : Math.min(baseRemaining, Math.floor(summary.cpThisMonth * Math.max(1, project.cpAllocation) / totalWeight));
    baseRemaining -= share;
    const available = share + project.externalWorkers + project.bonusCp + carry;
    const remaining = Math.max(0, project.requiredCp - project.cpPaid);
    const applied = Math.min(available, remaining);
    project.cpPaid += applied;
    project.cpGeneratedThisMonth += applied;
    cpApplied += applied;
    project.bonusCp = 0;
    carry = data.rules.construction.overflowToNextProject ? Math.max(0, available - applied) : 0;
    if (project.cpPaid >= project.requiredCp) {
      project.status = "completed";
      completed.push(project);
      completeProject(settlement, data, project);
    }
  });

  if (carry > 0 && data.rules.construction.overflowToNextProject) {
    for (const project of settlement.projects.filter(item => item.status === "planned" && item.crownPaid >= item.requiredCrown)) {
      const remaining = Math.max(0, project.requiredCp - project.cpPaid);
      const applied = Math.min(carry, remaining);
      project.cpPaid += applied;
      project.cpGeneratedThisMonth += applied;
      cpApplied += applied;
      carry -= applied;
      if (project.cpPaid >= project.requiredCp) {
        project.status = "completed";
        completed.push(project);
        completeProject(settlement, data, project);
      }
      if (carry <= 0) break;
    }
  }

  ensureActiveConstructionQueue(settlement, data);
  return { cpApplied, completed };
}

function completeProject(settlement, data, project) {
  if (project.kind === "settlementUpgrade") {
    settlement.tier = settlementTierValue(project.targetTier);
    settlement.type = tierName(settlement.tier, data.rules);
    settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
    return;
  }
  const item = data.catalog.find(candidate => candidate.id === project.catalogId);
  if (!item) return;
  const existing = settlement.buildings.find(building => building.id === project.replacesBuildingId)
    || settlement.buildings.find(building => building.slotId === project.slotId);
  if (existing) {
    const upgraded = buildingFromCatalog(item, {
      id: existing.id,
      slotId: project.slotId || existing.slotId,
      level: item.nodeTier,
      assignedPop: Math.min(existing.assignedPop, Math.max(0, item.workers * item.nodeTier)),
      active: existing.active,
      imageUrl: existing.imageUrl || item.imageUrl,
      notes: existing.notes || `Developed from project: ${project.name}`
    }, data.unitCatalog);
    Object.assign(existing, upgraded);
    return;
  }
  settlement.buildings.push(buildingFromCatalog(item, {
    id: randomId(),
    slotId: project.slotId,
    level: item.nodeTier,
    assignedPop: 0,
    notes: `Completed from project: ${project.name}`
  }, data.unitCatalog));
}

function processRecruitment(settlement, data) {
  const capacityBySource = new Map(
    settlement.buildings
      .filter(building => building.active && buildingRecruitmentCapacity(building) > 0)
      .map(building => [building.id, buildingRecruitmentCapacity(building)])
  );
  const lines = [];
  const summary = calculateSettlement(settlement, data);
  let professionalRemaining = settlement.overrides.ignoreMilitaryCapacity ? Number.POSITIVE_INFINITY : Math.max(0, summary.professionalCapacity - summary.professionalSoldiers);
  let militiaRemaining = settlement.overrides.ignoreMilitaryCapacity ? Number.POSITIVE_INFINITY : Math.max(0, summary.militiaCapacity - summary.militia);
  let manpowerRemaining = settlement.overrides.ignoreManpowerLimits ? Number.POSITIVE_INFINITY : Math.max(0, summary.mpRemaining);

  for (const order of settlement.recruitment) {
    if (order.status !== "inProgress") continue;
    const source = settlement.buildings.find(building => building.id === order.sourceBuildingId);
    const remaining = Math.max(0, order.targetCount - order.trained);
    if (!source && !order.sourceBuildingId) {
      if (remaining <= 0) continue;
      order.trained += remaining;
      addRecruitsToTroops(settlement, order, remaining, data);
      lines.push(`${formatNumber(remaining)} ${troopType(order.troopType, data.unitCatalog).name} by Direct GM`);
      order.status = "completed";
      continue;
    }

    if (!source) continue;

    const available = capacityBySource.get(source.id) || 0;
    const type = troopType(order.troopType, data.unitCatalog);
    const roleRemaining = type.role === "militia" ? militiaRemaining : professionalRemaining;
    const trainedNow = Math.min(available, remaining, roleRemaining, manpowerRemaining);
    if (trainedNow <= 0) continue;

    order.trained += trainedNow;
    capacityBySource.set(source.id, Math.max(0, available - trainedNow));
    addRecruitsToTroops(settlement, order, trainedNow, data);
    if (type.role === "militia") militiaRemaining -= trainedNow;
    else professionalRemaining -= trainedNow;
    manpowerRemaining -= trainedNow;
    lines.push(`${formatNumber(trainedNow)} ${type.name} from ${source.name}`);

    if (order.trained >= order.targetCount) order.status = "completed";
  }

  return { lines };
}

function addRecruitsToTroops(settlement, order, amount, data) {
  const unitCatalog = data.unitCatalog || TROOP_TYPES;
  const type = troopType(order.troopType, unitCatalog);
  const upkeep = unitUpkeepFromRules(type, data.rules || defaultRules());
  const existing = order.regimentId ? settlement.troops.find(troop => troop.id === order.regimentId) : null;

  if (existing) {
    existing.count += amount;
    return;
  }

  const regiment = normalizeTroop({
    id: randomId(),
    name: order.regimentName || type.name,
    type: type.id,
    role: type.role,
    count: amount,
    mode: "garrison",
    garrisonCost: upkeep.garrison,
    campaignCost: upkeep.campaign,
    imageUrl: order.imageUrl || type.imageUrl,
    sourceRecruitmentId: order.id,
    notes: `Recruited from ${order.sourceBuildingId || "Direct GM"}`
  }, unitCatalog);
  order.regimentId = regiment.id;
  settlement.troops.push(regiment);
}

async function ensureWorldData() {
  await saveWorldData(getWorldData(), "ready", { silent: true });
}

async function saveWorldData(data, reason, options = {}) {
  if (!game.user.isGM) throw new Error("Only a GM client can save DS data.");
  await game.settings.set(MODULE_ID, DATA_SETTING, normalizeData(data));
  if (!options.silent) game.socket.emit(SOCKET_NAME, { type: "refresh", reason, stamp: Date.now() });
  scheduleRefresh();
}

function getWorldData() {
  return normalizeData(game.settings.get(MODULE_ID, DATA_SETTING) || defaultWorldData());
}

function defaultWorldData() {
  const rules = defaultRules();
  return {
    schemaVersion: SCHEMA_VERSION,
    month: 1,
    rules,
    settlementTemplates: [starterSettlementTemplate()],
    catalog: BUILDING_CATALOG.map(item => ({ ...item })),
    unitCatalog: TROOP_TYPES.map(item => ({ ...item })),
    settlements: [sampleSettlement(rules)]
  };
}

function starterSettlementTemplate() {
  return {
    id: "starter-village",
    name: "Starter Village",
    description: "A clean player settlement with no inherited buildings or troops.",
    tier: "village",
    population: 100,
    treasure: 0,
    terrainTags: [],
    biomeTags: [],
    buildings: []
  };
}

function defaultSettlement(template = starterSettlementTemplate(), rules = defaultRules()) {
  return normalizeSettlement({
    id: randomId(),
    name: "New Settlement",
    region: "",
    type: tierName(template.tier, rules),
    tier: template.tier,
    terrainTags: template.terrainTags || [],
    biomeTags: template.biomeTags || [],
    ownerUserIds: [],
    imageUrl: "",
    portraitUrl: "",
    governorName: "",
    biomeDescription: "",
    systemNotes: "",
    population: template.population ?? 100,
    treasure: template.treasure ?? 0,
    slotBonus: 0,
    economicSlotBonus: 0,
    militarySlotBonus: 0,
    lastProcessedMonth: 0,
    permissions: defaultPermissions(),
    overrides: defaultOverrides(),
    buildings: template.buildings || [],
    troops: [],
    recruitment: [],
    projects: [],
    growth: defaultGrowth(),
    turnNotes: {},
    eventLog: [],
    notes: "",
    gmNotes: ""
  }, TROOP_TYPES, BUILDING_CATALOG, rules);
}

function sampleSettlement(rules = defaultRules()) {
  return normalizeSettlement({
    id: "de-laurent",
    name: "De Laurent",
    region: "Hilly Farmlands",
    type: "Village",
    tier: "village",
    terrainTags: ["Hills", "Farmlands", "Forest"],
    biomeTags: ["Farmlands"],
    ownerUserIds: [],
    imageUrl: "",
    portraitUrl: "",
    governorName: "Minister of State",
    biomeDescription: "Hilly farmlands with nearby forest access. Strong food base, useful hunting routes, and room for estate-focused special buildings.",
    systemNotes: "Districts use building slots. Assign POP to buildings for output, keep Free POP for income and CP, then process the month from GM Controls.",
    population: 309,
    treasure: 0,
    slotBonus: 0,
    economicSlotBonus: 0,
    militarySlotBonus: 0,
    lastProcessedMonth: 0,
    permissions: defaultPermissions(),
    overrides: defaultOverrides(),
    buildings: [
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "lumber-camp"), { id: "dl-lumber", assignedPop: 10 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "hunting-lodge"), { id: "dl-hunting", level: 2, workers: 20, assignedPop: 20 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "cattle-ranch"), { id: "dl-ranch", level: 2, workers: 20, assignedPop: 20 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "high-yield-crop-field"), { id: "dl-crop", assignedPop: 20 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "laurent-manor"), { id: "dl-manor", assignedPop: 5 })
    ],
    troops: [
      { id: "dl-maa", type: "men-at-arms", count: 70, mode: "garrison", notes: "" },
      { id: "dl-sergeants", type: "sergeant", count: 5, mode: "garrison", notes: "" },
      { id: "dl-militia", type: "militia", count: 25, mode: "garrison", notes: "" }
    ],
    recruitment: [],
    projects: [
      {
        id: "dl-grain-mill",
        name: "Grain Mill",
        catalogId: "grain-mill",
        targetLevel: 1,
        requiredCrown: 1000,
        crownPaid: 1000,
        requiredCp: 350,
        cpPaid: 0,
        externalWorkers: 116,
        bonusCp: 0,
        cpGeneratedThisMonth: 0,
        status: "inProgress",
        notes: "Free POP and 116 hired workers contribute CP to this project."
      }
    ],
    growth: {
      baseRate: 0.5,
      safeBonus: 0,
      foodBonus: 0.25,
      migrationBonus: 0,
      warPenalty: -0.75,
      faminePenalty: 0,
      plaguePenalty: 0,
      taxPenalty: 0,
      raidPenalty: 0,
      otherModifier: 3,
      overrideRate: "",
      overridePopChange: "",
      roundDown: true
    },
    turnNotes: {},
    eventLog: [
      {
        id: "dl-start",
        month: 0,
        created: Date.now(),
        title: "De Laurent Registered",
        text: "De Laurent is a player settlement and is not used as a reusable template.",
        gmNote: "",
        playerNotes: []
      }
    ],
    notes: "Player settlement. Never overwrite this settlement from a template.",
    gmNotes: ""
  }, TROOP_TYPES, BUILDING_CATALOG, rules);
}

function upsertSample(data) {
  if (data.settlements.some(settlement => settlement.id === "de-laurent")) return;
  data.settlements.unshift(sampleSettlement(data.rules));
}

function defaultRules() {
  return {
    tiers: [
      tierRule("hamlet", "Hamlet", 0, 2, 3, 0, 0, 2000, 1, "Hamlet Center"),
      tierRule("village", "Village", 100, 4, 6, 4000, 700, 5000, 1, "Village Hall"),
      tierRule("town", "Town", 500, 7, 9, 15000, 2200, 12000, 2, "Town Hall"),
      tierRule("city", "City", 2000, 10, 12, 50000, 7000, 30000, 2, "City Hall"),
      tierRule("metropolis", "Metropolis", 8000, 14, 16, 150000, 20000, 75000, 3, "Grand Hall")
    ],
    economy: {
      taxPerFreePop: 5,
      incomeMultiplier: 1,
      constructionHireCostPerCp: 10
    },
    construction: {
      cpPerFreePop: 1,
      overflowToNextProject: true
    },
    military: {
      professionalGarrisonPercent: 3,
      professionalCampaignPercent: 8,
      militiaGarrisonPercent: 1,
      militiaCampaignPercent: 4
    }
  };
}

function tierRule(id, name, minPopulation, openSlots, maxSlots, promotionCost, promotionCp, slotUnlockCost, activeProjects, coreName) {
  return { id, name, minPopulation, openSlots, maxSlots, promotionCost, promotionCp, slotUnlockCost, activeProjects, coreName };
}

function defaultPermissions() {
  return {
    playersCanEditBasics: false,
    playersCanEditAssignments: true,
    playersCanManageConstruction: true,
    playersCanManageRecruitment: true,
    playersCanWriteTurnNotes: true
  };
}

function defaultOverrides() {
  return {
    ignorePopulationLimits: false,
    ignoreManpowerLimits: false,
    ignoreMilitaryCapacity: false,
    ignoreBuildingRequirements: false,
    ignoreSlotLimits: false,
    ignoreGrowthLimits: false
  };
}

function defaultGrowth() {
  return {
    baseRate: 0.5,
    safeBonus: 0,
    foodBonus: 0,
    migrationBonus: 0,
    warPenalty: 0,
    faminePenalty: 0,
    plaguePenalty: 0,
    taxPenalty: 0,
    raidPenalty: 0,
    otherModifier: 0,
    overrideRate: "",
    overridePopChange: "",
    roundDown: true
  };
}

function buildingFromCatalog(item, overrides = {}, unitCatalog = TROOP_TYPES) {
  const source = item || BUILDING_CATALOG[0];
  return normalizeBuilding({
    id: randomId(),
    catalogId: source.id,
    name: source.name,
    category: source.category,
    active: true,
    level: 1,
    assignedPop: 0,
    workers: source.workers,
    rate: source.rate,
    flatOutput: source.flatOutput || 0,
    buildingUpkeep: source.buildingUpkeep || 0,
    terrain: source.terrain,
    requirement: source.requirement || "",
    crownCost: source.crownCost,
    cpCost: source.cpCost,
    slot: source.slot,
    slotUse: source.slotUse || 0,
    professionalCapacity: source.professionalCapacity || 0,
    militiaCapacity: source.militiaCapacity || 0,
    bonusEconomicSlots: source.bonusEconomicSlots || 0,
    bonusMilitarySlots: source.bonusMilitarySlots || 0,
    recruitType: source.recruitType || "",
    recruitPerLevel: source.recruitPerLevel || 0,
    canRecruit: Boolean(source.canRecruit),
    recruitableUnitIds: source.recruitableUnitIds || (source.recruitType ? [source.recruitType] : []),
    chainId: source.chainId || source.id,
    nodeTier: source.nodeTier || 1,
    parentIds: source.parentIds || [],
    settlementTier: source.settlementTier || "hamlet",
    constructionBonus: source.constructionBonus || 0,
    recruitmentDiscount: source.recruitmentDiscount || 0,
    upkeepDiscount: source.upkeepDiscount || 0,
    requires: source.requires || "",
    bonus: source.bonus || 0,
    growth: source.growth || 0,
    imageUrl: source.imageUrl || "",
    special: Boolean(source.special),
    gmOnly: Boolean(source.gmOnly),
    notes: source.notes || "",
    ...overrides
  }, unitCatalog);
}

function normalizeData(raw) {
  const fallback = defaultWorldData();
  const source = clone(raw || {});
  const sourceSchema = Math.max(1, Math.trunc(toNumber(source.schemaVersion, 1)));
  const migrateLegacy = sourceSchema < SCHEMA_VERSION;
  const rules = normalizeRules(source.rules || fallback.rules);
  const unitCatalog = normalizeUnitCatalog(source.unitCatalog || fallback.unitCatalog, migrateLegacy);
  const catalog = normalizeCatalog(source.catalog || fallback.catalog, unitCatalog, migrateLegacy);
  const settlements = Array.isArray(source.settlements) && source.settlements.length
    ? source.settlements.map(item => normalizeSettlement(item, unitCatalog, catalog, rules, migrateLegacy))
    : fallback.settlements.map(item => normalizeSettlement(item, unitCatalog, catalog, rules));
  return {
    schemaVersion: SCHEMA_VERSION,
    month: Math.max(1, Math.trunc(toNumber(source.month, fallback.month))),
    rules,
    settlementTemplates: normalizeSettlementTemplates(source.settlementTemplates || fallback.settlementTemplates),
    catalog,
    unitCatalog,
    settlements
  };
}

function normalizeRules(value) {
  const fallback = defaultRules();
  const source = value && typeof value === "object" ? value : {};
  const sourceTiers = Array.isArray(source.tiers) ? source.tiers : [];
  return {
    tiers: fallback.tiers.map(base => {
      const item = sourceTiers.find(candidate => cleanString(candidate?.id) === base.id) || {};
      return {
        id: base.id,
        name: cleanString(item.name) || base.name,
        minPopulation: Math.max(0, Math.trunc(toNumber(item.minPopulation, base.minPopulation))),
        openSlots: Math.max(0, Math.trunc(toNumber(item.openSlots, base.openSlots))),
        maxSlots: Math.max(1, Math.trunc(toNumber(item.maxSlots, base.maxSlots))),
        promotionCost: Math.max(0, toNumber(item.promotionCost, base.promotionCost)),
        promotionCp: Math.max(0, toNumber(item.promotionCp, base.promotionCp)),
        slotUnlockCost: Math.max(0, toNumber(item.slotUnlockCost, base.slotUnlockCost)),
        activeProjects: clamp(Math.trunc(toNumber(item.activeProjects, base.activeProjects)), 1, 5),
        coreName: cleanString(item.coreName) || base.coreName
      };
    }),
    economy: {
      taxPerFreePop: Math.max(0, toNumber(source.economy?.taxPerFreePop, fallback.economy.taxPerFreePop)),
      incomeMultiplier: Math.max(0, toNumber(source.economy?.incomeMultiplier, fallback.economy.incomeMultiplier)),
      constructionHireCostPerCp: Math.max(0, toNumber(source.economy?.constructionHireCostPerCp, fallback.economy.constructionHireCostPerCp))
    },
    construction: {
      cpPerFreePop: Math.max(0, toNumber(source.construction?.cpPerFreePop, fallback.construction.cpPerFreePop)),
      overflowToNextProject: source.construction?.overflowToNextProject === undefined
        ? fallback.construction.overflowToNextProject
        : Boolean(source.construction.overflowToNextProject)
    },
    military: {
      professionalGarrisonPercent: Math.max(0, toNumber(source.military?.professionalGarrisonPercent, fallback.military.professionalGarrisonPercent)),
      professionalCampaignPercent: Math.max(0, toNumber(source.military?.professionalCampaignPercent, fallback.military.professionalCampaignPercent)),
      militiaGarrisonPercent: Math.max(0, toNumber(source.military?.militiaGarrisonPercent, fallback.military.militiaGarrisonPercent)),
      militiaCampaignPercent: Math.max(0, toNumber(source.military?.militiaCampaignPercent, fallback.military.militiaCampaignPercent))
    }
  };
}

function normalizeSettlementTemplates(items) {
  const source = Array.isArray(items) && items.length ? items : [starterSettlementTemplate()];
  return source.map(item => ({
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Settlement Template",
    description: cleanString(item?.description),
    tier: settlementTierValue(item?.tier),
    population: Math.max(0, Math.trunc(toNumber(item?.population, 100))),
    treasure: Math.max(0, toNumber(item?.treasure, 0)),
    terrainTags: normalizeTags(item?.terrainTags),
    biomeTags: normalizeTags(item?.biomeTags),
    buildings: Array.isArray(item?.buildings) ? clone(item.buildings) : []
  }));
}

function normalizeCatalog(items, unitCatalog = TROOP_TYPES, migrateLegacy = false) {
  const merged = new Map(BUILDING_CATALOG.map(item => [item.id, { ...item }]));
  if (Array.isArray(items)) {
    for (const item of items) {
      const normalized = normalizeCatalogItem(item, unitCatalog);
      const builtIn = merged.get(normalized.id);
      if (!Array.isArray(item?.recruitableUnitIds) && builtIn?.recruitableUnitIds?.length) {
        normalized.recruitableUnitIds = [...builtIn.recruitableUnitIds];
        normalized.recruitType = normalized.recruitableUnitIds[0] || normalized.recruitType;
      }
      if (migrateLegacy && builtIn) {
        merged.set(normalized.id, {
          ...normalized,
          ...builtIn,
          imageUrl: normalized.imageUrl || builtIn.imageUrl || "",
          enabled: item?.enabled === undefined ? builtIn.enabled !== false : Boolean(item.enabled),
          gmOnly: item?.gmOnly === undefined ? Boolean(builtIn.gmOnly) : Boolean(item.gmOnly)
        });
      } else {
        merged.set(normalized.id, { ...(builtIn || {}), ...normalized });
      }
    }
  }
  return Array.from(merged.values()).map(item => normalizeCatalogItem(item, unitCatalog));
}

function normalizeCatalogItem(item, unitCatalog = TROOP_TYPES) {
  const legacyRecruitType = recruitTypeValue(item?.recruitType, unitCatalog);
  const recruitableUnitIds = (Array.isArray(item?.recruitableUnitIds) ? item.recruitableUnitIds : legacyRecruitType ? [legacyRecruitType] : [])
    .map(cleanString)
    .filter((id, index, values) => unitCatalog.some(unit => unit.id === id) && values.indexOf(id) === index);
  return {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Building",
    category: item?.category === "military" || item?.slot === "military" ? "military" : "economic",
    terrain: cleanString(item?.terrain) || "Any",
    requirement: cleanString(item?.requirement),
    workers: Math.max(0, toNumber(item?.workers, 0)),
    rate: Math.max(0, toNumber(item?.rate, 0)),
    flatOutput: toNumber(item?.flatOutput, 0),
    buildingUpkeep: Math.max(0, toNumber(item?.buildingUpkeep, 0)),
    crownCost: Math.max(0, toNumber(item?.crownCost, 0)),
    cpCost: Math.max(0, toNumber(item?.cpCost, 0)),
    slot: item?.slot === "military" ? "military" : "economic",
    slotUse: Math.max(0, toNumber(item?.slotUse, 0)),
    professionalCapacity: Math.max(0, toNumber(item?.professionalCapacity, 0)),
    militiaCapacity: Math.max(0, toNumber(item?.militiaCapacity, 0)),
    bonusEconomicSlots: toNumber(item?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(item?.bonusMilitarySlots, 0),
    recruitType: recruitableUnitIds[0] || legacyRecruitType,
    recruitPerLevel: Math.max(0, toNumber(item?.recruitPerLevel, 0)),
    canRecruit: item?.canRecruit === undefined ? recruitableUnitIds.length > 0 && toNumber(item?.recruitPerLevel, 0) > 0 : Boolean(item.canRecruit),
    recruitableUnitIds,
    chainId: cleanString(item?.chainId) || cleanString(item?.id) || randomId(),
    nodeTier: clamp(Math.trunc(toNumber(item?.nodeTier, 1)), 1, 10),
    parentIds: (Array.isArray(item?.parentIds) ? item.parentIds : splitTags(item?.parentIds)).map(cleanString).filter(Boolean),
    settlementTier: settlementTierValue(item?.settlementTier),
    constructionBonus: Math.max(0, toNumber(item?.constructionBonus, 0)),
    recruitmentDiscount: clamp(toNumber(item?.recruitmentDiscount, 0), 0, 90),
    upkeepDiscount: clamp(toNumber(item?.upkeepDiscount, 0), 0, 90),
    imageUrl: cleanString(item?.imageUrl),
    enabled: item?.enabled === undefined ? true : Boolean(item.enabled),
    maxLevel: clamp(Math.trunc(toNumber(item?.maxLevel, 1)), 1, 10),
    special: Boolean(item?.special || item?.category === "special"),
    gmOnly: Boolean(item?.gmOnly),
    notes: cleanString(item?.notes),
    requires: cleanString(item?.requires),
    bonus: toNumber(item?.bonus, 0),
    forestBonus: toNumber(item?.forestBonus, 0),
    grainMillBonus: toNumber(item?.grainMillBonus, 0),
    butcherBonus: toNumber(item?.butcherBonus, 0),
    growth: toNumber(item?.growth, 0)
  };
}

function normalizeUnitCatalog(items, migrateLegacy = false) {
  const merged = new Map(TROOP_TYPES.map(item => [item.id, { ...item }]));
  if (Array.isArray(items)) {
    for (const item of items) {
      const normalized = normalizeUnitCatalogItem(item);
      const builtIn = merged.get(normalized.id);
      if (migrateLegacy && builtIn) {
        merged.set(normalized.id, {
          ...normalized,
          ...builtIn,
          imageUrl: normalized.imageUrl || builtIn.imageUrl || "",
          enabled: item?.enabled === undefined ? builtIn.enabled !== false : Boolean(item.enabled)
        });
      } else {
        merged.set(normalized.id, { ...(builtIn || {}), ...normalized });
      }
    }
  }
  return Array.from(merged.values()).map(normalizeUnitCatalogItem);
}

function normalizeUnitCatalogItem(item) {
  return {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Unit",
    role: troopRole(item?.role, "professional"),
    recruitCost: Math.max(0, toNumber(item?.recruitCost, 0)),
    garrison: Math.max(0, toNumber(item?.garrison, 0)),
    campaign: Math.max(0, toNumber(item?.campaign, 0)),
    tier: clamp(Math.trunc(toNumber(item?.tier, 1)), 1, 10),
    useRuleUpkeep: item?.useRuleUpkeep === undefined ? true : Boolean(item.useRuleUpkeep),
    enabled: item?.enabled === undefined ? true : Boolean(item.enabled),
    imageUrl: cleanString(item?.imageUrl),
    description: cleanString(item?.description)
  };
}

function normalizeSettlement(item, unitCatalog = TROOP_TYPES, catalog = BUILDING_CATALOG, rules = defaultRules(), migrateLegacy = false) {
  const tier = settlementTierValue(item?.tier || item?.type);
  const buildings = Array.isArray(item?.buildings)
    ? item.buildings.map(building => normalizeBuilding(building, unitCatalog, catalog.find(template => template.id === building?.catalogId), migrateLegacy))
    : [];
  const projects = Array.isArray(item?.projects) ? item.projects.map(normalizeProject) : [];
  const settlement = {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Unnamed Settlement",
    region: cleanString(item?.region),
    type: tierName(tier, rules),
    tier,
    terrainTags: normalizeTags(item?.terrainTags),
    biomeTags: normalizeTags(item?.biomeTags),
    ownerUserIds: Array.isArray(item?.ownerUserIds) ? item.ownerUserIds.map(cleanString).filter(Boolean) : [],
    imageUrl: cleanString(item?.imageUrl),
    portraitUrl: cleanString(item?.portraitUrl),
    governorName: cleanString(item?.governorName),
    biomeDescription: cleanString(item?.biomeDescription),
    systemNotes: cleanString(item?.systemNotes),
    population: Math.max(0, Math.trunc(toNumber(item?.population, 0))),
    treasure: toNumber(item?.treasure, 0),
    slotBonus: Math.max(0, Math.trunc(toNumber(item?.slotBonus, toNumber(item?.economicSlotBonus, 0) + toNumber(item?.militarySlotBonus, 0)))),
    economicSlotBonus: Math.trunc(toNumber(item?.economicSlotBonus, 0)),
    militarySlotBonus: Math.trunc(toNumber(item?.militarySlotBonus, 0)),
    lastProcessedMonth: Math.max(0, Math.trunc(toNumber(item?.lastProcessedMonth, 0))),
    permissions: { ...defaultPermissions(), ...(item?.permissions || {}) },
    overrides: { ...defaultOverrides(), ...(item?.overrides || {}) },
    buildings,
    troops: Array.isArray(item?.troops) ? item.troops.map(troop => normalizeTroop(troop, unitCatalog, migrateLegacy)) : [],
    recruitment: Array.isArray(item?.recruitment) ? item.recruitment.map(order => normalizeRecruitment(order, unitCatalog)) : [],
    projects,
    slots: [],
    growth: normalizeGrowth(item?.growth),
    turnNotes: normalizeTurnNotes(item?.turnNotes),
    eventLog: Array.isArray(item?.eventLog) ? item.eventLog.map(normalizeEventLog).filter(Boolean).slice(0, 100) : [],
    notes: cleanString(item?.notes),
    gmNotes: cleanString(item?.gmNotes)
  };
  settlement.slots = normalizeSettlementSlots(item?.slots, settlement, rules);
  return settlement;
}

function normalizeBuilding(item, unitCatalog = TROOP_TYPES, catalogItem = null, migrateLegacy = false) {
  const isBuiltIn = Boolean(catalogItem && BUILDING_CATALOG.some(candidate => candidate.id === catalogItem.id));
  const source = migrateLegacy && isBuiltIn ? {
    ...item,
    ...catalogItem,
    id: item?.id,
    catalogId: item?.catalogId,
    name: cleanString(item?.name) || catalogItem.name,
    level: item?.level,
    active: item?.active,
    assignedPop: item?.assignedPop,
    imageUrl: cleanString(item?.imageUrl) || catalogItem.imageUrl,
    notes: cleanString(item?.notes) || catalogItem.notes,
    slotId: item?.slotId
  } : (item || {});
  const legacyRecruitType = recruitTypeValue(source?.recruitType, unitCatalog);
  const inheritedUnitIds = catalogItem?.recruitableUnitIds?.length ? catalogItem.recruitableUnitIds : legacyRecruitType ? [legacyRecruitType] : [];
  const recruitableUnitIds = (Array.isArray(source?.recruitableUnitIds) ? source.recruitableUnitIds : inheritedUnitIds)
    .map(cleanString)
    .filter((id, index, values) => unitCatalog.some(unit => unit.id === id) && values.indexOf(id) === index);
  return {
    id: cleanString(source?.id) || randomId(),
    catalogId: cleanString(source?.catalogId),
    slotId: cleanString(source?.slotId),
    name: cleanString(source?.name) || "Building",
    category: source?.category === "military" || source?.slot === "military" ? "military" : "economic",
    active: source?.active === undefined ? true : Boolean(source.active),
    level: clamp(Math.trunc(toNumber(source?.level, 1)), 1, 10),
    assignedPop: Math.max(0, toNumber(source?.assignedPop, 0)),
    workers: Math.max(0, toNumber(source?.workers, 0), migrateLegacy ? toNumber(source?.assignedPop, 0) : 0),
    rate: Math.max(0, toNumber(source?.rate, 0)),
    flatOutput: toNumber(source?.flatOutput, 0),
    buildingUpkeep: Math.max(0, toNumber(source?.buildingUpkeep, 0)),
    terrain: cleanString(source?.terrain) || "Any",
    requirement: cleanString(source?.requirement),
    crownCost: Math.max(0, toNumber(source?.crownCost, 0)),
    cpCost: Math.max(0, toNumber(source?.cpCost, 0)),
    slot: source?.category === "military" || source?.slot === "military" ? "military" : "economic",
    slotUse: Math.max(0, toNumber(source?.slotUse, 1)),
    professionalCapacity: Math.max(0, toNumber(source?.professionalCapacity, 0)),
    militiaCapacity: Math.max(0, toNumber(source?.militiaCapacity, 0)),
    bonusEconomicSlots: toNumber(source?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(source?.bonusMilitarySlots, 0),
    recruitType: recruitableUnitIds[0] || legacyRecruitType,
    recruitPerLevel: Math.max(0, toNumber(source?.recruitPerLevel, 0)),
    canRecruit: source?.canRecruit === undefined ? recruitableUnitIds.length > 0 && toNumber(source?.recruitPerLevel, 0) > 0 : Boolean(source.canRecruit),
    recruitableUnitIds,
    chainId: cleanString(source?.chainId) || cleanString(source?.catalogId),
    nodeTier: clamp(Math.trunc(toNumber(source?.nodeTier, 1)), 1, 10),
    parentIds: (Array.isArray(source?.parentIds) ? source.parentIds : splitTags(source?.parentIds)).map(cleanString).filter(Boolean),
    settlementTier: settlementTierValue(source?.settlementTier),
    constructionBonus: Math.max(0, toNumber(source?.constructionBonus, 0)),
    recruitmentDiscount: clamp(toNumber(source?.recruitmentDiscount, 0), 0, 90),
    upkeepDiscount: clamp(toNumber(source?.upkeepDiscount, 0), 0, 90),
    requires: cleanString(source?.requires),
    bonus: toNumber(source?.bonus, 0),
    growth: toNumber(source?.growth, 0),
    imageUrl: cleanString(source?.imageUrl),
    special: Boolean(source?.special || source?.category === "special"),
    gmOnly: Boolean(source?.gmOnly),
    notes: cleanString(source?.notes)
  };
}

function normalizeTroop(item, unitCatalog = TROOP_TYPES, migrateLegacy = false) {
  const type = troopType(item?.type, unitCatalog);
  const oldDefaults = {
    watchman: [40, 60],
    "men-at-arms": [65, 95],
    archer: [80, 120],
    sergeant: [120, 180],
    cavalry: [330, 480],
    knight: [900, 1300],
    militia: [0, 0]
  }[type.id];
  const storedGarrison = toNumber(item?.garrisonCost, type.garrison);
  const storedCampaign = toNumber(item?.campaignCost, type.campaign);
  const useNewDefaults = migrateLegacy && oldDefaults && storedGarrison === oldDefaults[0] && storedCampaign === oldDefaults[1];
  return {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || type.name,
    type: type.id,
    role: troopRole(item?.role, type.role),
    count: Math.max(0, Math.trunc(toNumber(item?.count, 0))),
    mode: item?.mode === "campaign" ? "campaign" : "garrison",
    garrisonCost: Math.max(0, useNewDefaults ? type.garrison : storedGarrison),
    campaignCost: Math.max(0, useNewDefaults ? type.campaign : storedCampaign),
    imageUrl: cleanString(item?.imageUrl) || type.imageUrl,
    sourceRecruitmentId: cleanString(item?.sourceRecruitmentId),
    notes: cleanString(item?.notes)
  };
}

function normalizeRecruitment(item, unitCatalog = TROOP_TYPES) {
  const targetCount = Math.max(0, Math.trunc(toNumber(item?.targetCount, 0)));
  const sourceBuildingId = cleanString(item?.sourceBuildingId);
  return {
    id: cleanString(item?.id) || randomId(),
    sourceBuildingId: sourceBuildingId === DIRECT_RECRUITMENT_SOURCE ? "" : sourceBuildingId,
    regimentId: cleanString(item?.regimentId),
    regimentName: cleanString(item?.regimentName),
    imageUrl: cleanString(item?.imageUrl),
    troopType: troopType(item?.troopType, unitCatalog).id,
    targetCount,
    trained: clamp(Math.trunc(toNumber(item?.trained, 0)), 0, targetCount),
    costPerUnit: Math.max(0, toNumber(item?.costPerUnit, 0)),
    crownPaid: Math.max(0, toNumber(item?.crownPaid, 0)),
    createdAt: Math.max(0, toNumber(item?.createdAt, 0)),
    status: recruitmentStatus(item?.status),
    notes: cleanString(item?.notes)
  };
}

function normalizeProject(item) {
  return {
    id: cleanString(item?.id) || randomId(),
    kind: item?.kind === "settlementUpgrade" ? "settlementUpgrade" : "building",
    name: cleanString(item?.name) || "Construction Project",
    catalogId: cleanString(item?.catalogId),
    slotId: cleanString(item?.slotId),
    replacesBuildingId: cleanString(item?.replacesBuildingId),
    targetTier: settlementTierValue(item?.targetTier),
    targetLevel: clamp(Math.trunc(toNumber(item?.targetLevel, 1)), 1, 10),
    requiredCrown: Math.max(0, toNumber(item?.requiredCrown, 0)),
    crownPaid: Math.max(0, toNumber(item?.crownPaid, 0)),
    requiredCp: Math.max(0, toNumber(item?.requiredCp, 0)),
    cpPaid: Math.max(0, toNumber(item?.cpPaid, 0)),
    externalWorkers: Math.max(0, toNumber(item?.externalWorkers, 0)),
    bonusCp: Math.max(0, toNumber(item?.bonusCp, 0)),
    cpAllocation: Math.max(1, toNumber(item?.cpAllocation, 1)),
    cpGeneratedThisMonth: Math.max(0, toNumber(item?.cpGeneratedThisMonth, 0)),
    imageUrl: cleanString(item?.imageUrl),
    queuedBy: cleanString(item?.queuedBy),
    createdAt: Math.max(0, toNumber(item?.createdAt, 0)),
    status: projectStatus(item?.status),
    notes: cleanString(item?.notes)
  };
}

function normalizeSettlementSlots(items, settlement, rules) {
  const tier = tierRuleFor(settlement.tier, rules);
  const source = Array.isArray(items) ? items : [];
  const buildingProjects = settlement.projects.filter(project => project.kind === "building");
  const requiredSlots = Math.max(
    1,
    tier.maxSlots + settlement.slotBonus,
    source.length,
    settlement.buildings.length + buildingProjects.filter(project => !project.replacesBuildingId).length
  );
  const slots = Array.from({ length: requiredSlots }, (_, index) => {
    const raw = source.find(item => Math.trunc(toNumber(item?.index, -1)) === index) || source[index] || {};
    const lockedPosition = index >= tier.openSlots + settlement.slotBonus;
    const gmLocked = Boolean(raw.gmLocked);
    return {
      id: cleanString(raw.id) || `slot-${index + 1}`,
      index,
      label: cleanString(raw.label) || `District ${index + 1}`,
      unlocked: gmLocked ? Boolean(raw.unlocked) : !lockedPosition || Boolean(raw.unlocked),
      gmLocked,
      unlockCost: Math.max(0, toNumber(raw.unlockCost, tier.slotUnlockCost * Math.max(1, index - tier.openSlots + 1))),
      allowedCategory: ["economic", "military"].includes(raw.allowedCategory) ? raw.allowedCategory : "all"
    };
  });

  const occupied = new Set();
  for (const building of settlement.buildings) {
    let slot = slots.find(candidate => candidate.id === building.slotId && !occupied.has(candidate.id));
    if (!slot) slot = slots.find(candidate => !occupied.has(candidate.id) && candidate.unlocked) || slots.find(candidate => !occupied.has(candidate.id));
    if (!slot) continue;
    slot.unlocked = true;
    building.slotId = slot.id;
    occupied.add(slot.id);
  }

  for (const project of buildingProjects) {
    const replaced = settlement.buildings.find(building => building.id === project.replacesBuildingId);
    if (replaced) {
      project.slotId = replaced.slotId;
      continue;
    }
    let slot = slots.find(candidate => candidate.id === project.slotId && !occupied.has(candidate.id));
    if (!slot) slot = slots.find(candidate => candidate.unlocked && !occupied.has(candidate.id));
    if (!slot) slot = slots.find(candidate => !occupied.has(candidate.id));
    if (!slot) continue;
    slot.unlocked = true;
    project.slotId = slot.id;
    occupied.add(slot.id);
  }

  return slots;
}

function normalizeGrowth(item) {
  const growth = { ...defaultGrowth(), ...(item || {}) };
  growth.roundDown = item?.roundDown === undefined ? true : Boolean(item.roundDown);
  for (const key of ["baseRate", "safeBonus", "foodBonus", "migrationBonus", "warPenalty", "faminePenalty", "plaguePenalty", "taxPenalty", "raidPenalty", "otherModifier"]) {
    growth[key] = toNumber(growth[key], 0);
  }
  growth.overrideRate = cleanString(growth.overrideRate);
  growth.overridePopChange = cleanString(growth.overridePopChange);
  return growth;
}

function normalizeTurnNotes(notes) {
  const result = {};
  if (!notes || typeof notes !== "object") return result;
  for (const [userId, note] of Object.entries(notes)) {
    result[userId] = {
      text: cleanString(note?.text),
      authorName: cleanString(note?.authorName) || userName(userId),
      updated: toNumber(note?.updated, Date.now())
    };
  }
  return result;
}

function normalizeEventLog(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: cleanString(entry.id) || randomId(),
    month: Math.trunc(toNumber(entry.month, 0)),
    created: toNumber(entry.created, Date.now()),
    title: cleanString(entry.title) || "DS Event",
    text: cleanString(entry.text),
    gmNote: cleanString(entry.gmNote),
    playerNotes: Array.isArray(entry.playerNotes) ? entry.playerNotes.map(note => ({
      userId: cleanString(note.userId),
      authorName: cleanString(note.authorName),
      text: cleanString(note.text),
      updated: toNumber(note.updated, 0)
    })) : []
  };
}

function calculateSettlement(settlement, data = {}) {
  const rules = data?.rules || defaultRules();
  const activeBuildings = settlement.buildings.filter(building => building.active);
  const economicWorkers = activeBuildings.filter(building => assignmentKind(building) === "economic").reduce((total, building) => total + building.assignedPop, 0);
  const militaryWorkers = activeBuildings.filter(building => assignmentKind(building) === "military").reduce((total, building) => total + building.assignedPop, 0);
  const professionalSoldiers = settlement.troops.filter(troop => troop.role === "professional").reduce((total, troop) => total + troop.count, 0);
  const militia = settlement.troops.filter(troop => troop.role === "militia").reduce((total, troop) => total + troop.count, 0);
  const freePopRaw = settlement.population - economicWorkers - militaryWorkers;
  const freePop = Math.max(0, freePopRaw);
  const baseIncome = freePop * rules.economy.taxPerFreePop;
  const buildingOutputTotal = activeBuildings.reduce((total, building) => total + buildingOutput(building, settlement).total, 0);
  const grossIncome = Math.round((baseIncome + buildingOutputTotal) * rules.economy.incomeMultiplier);
  const buildingUpkeep = activeBuildings.reduce((total, building) => total + Math.max(0, building.buildingUpkeep), 0);
  const militaryCostRaw = settlement.troops.reduce((total, troop) => {
    const mode = troop.mode === "campaign" ? "campaign" : "garrison";
    return total + troop.count * (mode === "campaign" ? troop.campaignCost : troop.garrisonCost);
  }, 0);
  const upkeepDiscount = settlementUpkeepDiscount(settlement);
  const militaryCost = Math.round(militaryCostRaw * (1 - upkeepDiscount / 100));
  const activeProjectSlots = new Set(settlement.projects.filter(project => project.kind === "building" && project.status !== "completed").map(project => project.slotId));
  const unlockedSlots = settlement.slots.filter(slot => slot.unlocked).length;
  const usedSlots = new Set([...activeBuildings.map(building => building.slotId), ...activeProjectSlots]).size;
  const economicSlots = settlement.slots.filter(slot => slot.unlocked && slot.allowedCategory !== "military").length;
  const militarySlots = settlement.slots.filter(slot => slot.unlocked && slot.allowedCategory !== "economic").length;
  const usedEconomicSlots = activeBuildings.filter(building => building.category === "economic").length;
  const usedMilitarySlots = activeBuildings.filter(building => building.category === "military").length;
  const professionalCapacity = activeBuildings.reduce((total, building) => total + building.professionalCapacity, 0);
  const militiaCapacity = activeBuildings.reduce((total, building) => total + building.militiaCapacity, 0);
  const recruitmentCapacity = activeBuildings.reduce((total, building) => total + buildingRecruitmentCapacity(building), 0);
  const constructionBonus = activeBuildings.reduce((total, building) => total + building.constructionBonus, 0);
  const cpThisMonth = Math.max(0, Math.floor(freePop * rules.construction.cpPerFreePop + constructionBonus));
  const growth = calculateGrowth(settlement, { totalPop: settlement.population });

  return {
    totalPop: settlement.population,
    economicWorkers,
    militaryWorkers,
    freePopRaw,
    freePop,
    totalMp: settlement.population,
    professionalSoldiers,
    militia,
    mpUsed: professionalSoldiers + militia,
    mpRemaining: settlement.population - professionalSoldiers - militia,
    baseIncome,
    buildingOutput: buildingOutputTotal,
    grossIncome,
    buildingUpkeep,
    militaryCost,
    militaryCostRaw,
    upkeepDiscount,
    netIncome: grossIncome - buildingUpkeep - militaryCost,
    totalSlots: settlement.slots.length,
    unlockedSlots,
    usedSlots,
    economicSlots,
    militarySlots,
    usedEconomicSlots,
    usedMilitarySlots,
    professionalCapacity,
    militiaCapacity,
    recruitmentCapacity,
    recruitmentDiscount: settlementRecruitmentDiscount(settlement),
    constructionBonus,
    cpThisMonth,
    growthRate: growth.rate,
    popChange: growth.popChange,
    projectedPop: Math.max(0, settlement.population + growth.popChange)
  };
}

function calculateGrowth(settlement, summary) {
  const growth = settlement.growth;
  const buildingGrowth = settlement.buildings.reduce((total, building) => {
    return total + (building.active ? toNumber(building.growth, 0) : 0);
  }, 0);
  const rawRate = cleanString(growth.overrideRate) !== ""
    ? toNumber(growth.overrideRate, 0)
    : growth.baseRate + growth.safeBonus + growth.foodBonus + growth.migrationBonus + growth.warPenalty + growth.faminePenalty + growth.plaguePenalty + growth.taxPenalty + growth.raidPenalty + growth.otherModifier + buildingGrowth;
  const rate = settlement.overrides.ignoreGrowthLimits ? rawRate : clamp(rawRate, -5, 5);
  const overridePopChange = cleanString(growth.overridePopChange);
  const calculated = summary.totalPop * rate / 100;
  const popChange = overridePopChange !== "" ? Math.trunc(toNumber(overridePopChange, 0)) : growth.roundDown ? Math.floor(calculated) : Math.round(calculated);
  return { rate, popChange };
}

function buildingOutput(building, settlement) {
  if (!building.active || assignmentKind(building) !== "economic") return { base: 0, bonus: 0, total: 0 };
  const assigned = Math.min(building.assignedPop, workerCapacity(building));
  const base = assigned * building.rate + building.flatOutput;
  const bonus = buildingBonus(building, settlement);
  return { base, bonus, total: base + bonus };
}

function buildingBonus(building, settlement) {
  const has = id => settlement.buildings.some(candidate => candidate.active && candidate.catalogId === id);
  if (building.requires && has(building.requires)) return Math.max(0, toNumber(building.bonus, 0));
  return 0;
}

function buildWarnings(settlement, data, summary = calculateSettlement(settlement, data)) {
  const warnings = [];
  const overrides = settlement.overrides;

  if (summary.freePopRaw < 0 && !overrides.ignorePopulationLimits) warnings.push(`Assigned POP exceeds Total POP by ${formatNumber(Math.abs(summary.freePopRaw))}.`);
  if (summary.mpUsed > summary.totalMp && !overrides.ignoreManpowerLimits) warnings.push(`MP used exceeds Total MP by ${formatNumber(summary.mpUsed - summary.totalMp)}.`);
  if (summary.professionalSoldiers > summary.professionalCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Professional soldiers exceed capacity by ${formatNumber(summary.professionalSoldiers - summary.professionalCapacity)}.`);
  if (summary.militia > summary.militiaCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Militia exceeds capacity by ${formatNumber(summary.militia - summary.militiaCapacity)}.`);
  if (summary.usedSlots > summary.unlockedSlots && !overrides.ignoreSlotLimits) warnings.push(`Unlocked district slots exceeded by ${formatNumber(summary.usedSlots - summary.unlockedSlots)}.`);

  for (const building of settlement.buildings.filter(item => item.active)) {
    if (building.assignedPop > workerCapacity(building)) warnings.push(`${building.name}: assigned workers exceed level capacity.`);
    if (!terrainRequirementMet(building, settlement) && !overrides.ignoreBuildingRequirements) warnings.push(`${building.name}: terrain requirement is not met.`);
  }

  return warnings;
}

function terrainRequirementMet(building, settlement) {
  const terrain = cleanString(building.terrain).toLowerCase();
  if (!terrain || terrain === "any" || terrain === "any settlement") return true;
  const tags = [...settlement.terrainTags, ...settlement.biomeTags, settlement.region, settlement.type].map(tag => cleanString(tag).toLowerCase()).filter(Boolean);
  return tags.some(tag => terrain.includes(tag) || tag.includes(terrain));
}

function terrainRequirementMetForItem(item, settlement) {
  const requirement = cleanString(item?.terrain);
  const populationMatch = requirement.match(/([\d,]+)\s*\+?\s*POP/i);
  if (populationMatch) return settlement.population >= toNumber(populationMatch[1].replace(/,/g, ""), 0);
  if (/\brequired\b/i.test(requirement)) return true;
  return terrainRequirementMet({ ...item, active: true }, settlement);
}

function constructionRequirementMessage(item) {
  const requirement = cleanString(item?.terrain) || "Any";
  const populationMatch = requirement.match(/([\d,]+)\s*\+?\s*POP/i);
  if (populationMatch) return `Requires ${populationMatch[1]} POP.`;
  return `Requires terrain or region: ${requirement}.`;
}

function workerCapacity(building) {
  return building.workers;
}

function buildingRecruitmentCapacity(building) {
  if (!building.active || !building.canRecruit) return 0;
  return Math.max(0, toNumber(building.recruitPerLevel, 0));
}

function recruitmentSourceCandidate(building) {
  return Boolean(building.canRecruit) && buildingRecruitmentCapacity(building) > 0 && Boolean(building.recruitableUnitIds?.length);
}

function sourceUnlocksUnit(building, unitId) {
  if (!unitId) return true;
  return (building.recruitableUnitIds || []).includes(unitId) || building.recruitType === unitId;
}

function recruitmentSourceLabel(building) {
  const capacity = buildingRecruitmentCapacity(building);
  if (capacity > 0) return `${building.name} (${formatNumber(capacity)}/month)`;
  return `${building.name} (recruitment disabled)`;
}

function slotUse(building) {
  if (building.slotUse > 0) return building.slotUse;
  if (building.level >= 5) return 3;
  if (building.level >= 3) return 2;
  return 1;
}

function slotUseAtLevel(item, level) {
  if (toNumber(item?.slotUse, 0) > 0) return toNumber(item.slotUse, 0);
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

function constructionCost(item) {
  return {
    crown: Math.max(0, toNumber(item?.crownCost, 0)),
    cp: Math.max(0, toNumber(item?.cpCost, 0))
  };
}

function settlementRecruitmentDiscount(settlement, source = null) {
  const total = settlement.buildings
    .filter(building => building.active)
    .reduce((sum, building) => sum + Math.max(0, building.recruitmentDiscount), 0);
  const sourceBonus = source && !settlement.buildings.includes(source) ? Math.max(0, source.recruitmentDiscount) : 0;
  return clamp(total + sourceBonus, 0, 50);
}

function settlementUpkeepDiscount(settlement) {
  return clamp(settlement.buildings
    .filter(building => building.active)
    .reduce((sum, building) => sum + Math.max(0, building.upkeepDiscount), 0), 0, 60);
}

function unitUpkeepFromRules(unit, rules = defaultRules()) {
  if (!unit.useRuleUpkeep) return { garrison: unit.garrison, campaign: unit.campaign };
  const militia = unit.role === "militia";
  const garrisonPercent = militia ? rules.military.militiaGarrisonPercent : rules.military.professionalGarrisonPercent;
  const campaignPercent = militia ? rules.military.militiaCampaignPercent : rules.military.professionalCampaignPercent;
  return {
    garrison: Math.max(0, Math.round(unit.recruitCost * garrisonPercent / 100)),
    campaign: Math.max(0, Math.round(unit.recruitCost * campaignPercent / 100))
  };
}

function firstEmptySlot(settlement, category = "economic", includeLocked = false) {
  const occupied = new Set([
    ...settlement.buildings.map(building => building.slotId),
    ...settlement.projects.filter(project => project.kind === "building" && project.status !== "completed").map(project => project.slotId)
  ]);
  return settlement.slots.find(slot =>
    !occupied.has(slot.id) &&
    (includeLocked || slot.unlocked) &&
    (slot.allowedCategory === "all" || slot.allowedCategory === category)
  ) || null;
}

function constructionBlockReasons(item, settlement, slot, current, data, permissions, isGM = false) {
  const reasons = [];
  if (!permissions.canEditConstruction) reasons.push("You cannot manage construction.");
  if (!slot.unlocked) reasons.push(`Unlock ${slot.label} first.`);
  if (slot.gmLocked && !isGM) reasons.push("This slot is locked by the GM.");
  if (slot.allowedCategory !== "all" && slot.allowedCategory !== item.category) reasons.push(`${slot.label} only accepts ${slot.allowedCategory} buildings.`);
  if (settlement.projects.some(project => project.kind === "building" && project.slotId === slot.id && project.status !== "completed")) reasons.push("This slot already has a queued project.");
  if (current) {
    if (!(item.parentIds || []).includes(current.catalogId)) reasons.push(`${item.name} is not a direct branch of ${current.name}.`);
  } else if ((item.parentIds || []).length) {
    reasons.push("This building requires its parent building in the selected slot.");
  }
  if (!settlement.overrides.ignoreBuildingRequirements) {
    if (tierIndex(settlement.tier) < tierIndex(item.settlementTier)) reasons.push(`Requires ${tierName(item.settlementTier, data.rules)}.`);
    if (!terrainRequirementMetForItem(item, settlement)) reasons.push(constructionRequirementMessage(item));
    if (item.requires && !settlement.buildings.some(building => building.active && building.catalogId === item.requires)) {
      reasons.push(`Requires ${data.catalog.find(candidate => candidate.id === item.requires)?.name || item.requires}.`);
    }
  }
  if (settlement.treasure < item.crownCost) reasons.push(`Needs ${formatNumber(item.crownCost - settlement.treasure)} more Crown.`);
  return reasons;
}

function assignmentKind(building) {
  return building.category === "military" || building.professionalCapacity > 0 || building.militiaCapacity > 0 ? "military" : "economic";
}

function slotKind(building) {
  return building.slot === "military" || building.category === "military" ? "military" : "economic";
}

function findSettlement(data, id) {
  return findById(data.settlements, id, "Settlement");
}

function findById(items, id, label) {
  const item = items.find(candidate => candidate.id === id);
  if (!item) throw new Error(`${label} not found.`);
  return item;
}

function deleteById(items, id) {
  const index = items.findIndex(item => item.id === id);
  if (index >= 0) items.splice(index, 1);
}

function requireGM(user) {
  if (!user?.isGM) throw new Error("This DS action is GM only.");
}

function categoryValue(value) {
  const clean = cleanString(value);
  return CATEGORIES.some(category => category.value === clean) ? clean : "economic";
}

function categoryLabel(value) {
  return CATEGORIES.find(category => category.value === value)?.label || "Economic";
}

function settlementTierValue(value) {
  const clean = cleanString(value).toLowerCase();
  if (SETTLEMENT_TIER_IDS.includes(clean)) return clean;
  return SETTLEMENT_TIER_IDS.find(id => clean.includes(id)) || "village";
}

function tierRuleFor(value, rules = defaultRules()) {
  const id = settlementTierValue(value);
  return rules.tiers.find(tier => tier.id === id) || rules.tiers[1] || defaultRules().tiers[1];
}

function tierName(value, rules = defaultRules()) {
  return tierRuleFor(value, rules).name;
}

function tierIndex(value) {
  return Math.max(0, SETTLEMENT_TIER_IDS.indexOf(settlementTierValue(value)));
}

function nextTierFor(value, rules = defaultRules()) {
  return rules.tiers[tierIndex(value) + 1] || null;
}

function projectStatus(value) {
  const clean = cleanString(value);
  return PROJECT_STATUSES.some(status => status.value === clean) ? clean : "planned";
}

function recruitmentStatus(value) {
  const clean = cleanString(value);
  return RECRUITMENT_STATUSES.some(status => status.value === clean) ? clean : "planned";
}

function troopRole(value, fallback = "professional") {
  const clean = cleanString(value);
  return TROOP_ROLES.some(role => role.value === clean) ? clean : fallback;
}

function recruitTypeValue(value, unitCatalog = TROOP_TYPES) {
  const clean = cleanString(value);
  return unitCatalog.some(type => type.id === clean) ? clean : "";
}

function troopType(id, unitCatalog = TROOP_TYPES) {
  return unitCatalog.find(type => type.id === id) || unitCatalog[0] || TROOP_TYPES[0];
}

function ownerNames(settlement) {
  const names = settlement.ownerUserIds.map(userName).filter(Boolean);
  return names.length ? names.join(", ") : "Unassigned";
}

function userName(userId) {
  return users().find(user => user.id === userId)?.name || userId || "Unknown";
}

function users() {
  if (game.users?.contents) return game.users.contents;
  if (game.users instanceof Map) return Array.from(game.users.values());
  return Array.from(game.users || []);
}

function activeGMs() {
  return users().filter(user => user.active && user.isGM);
}

function isResponsibleGM() {
  const gm = activeGMs().sort((a, b) => a.id.localeCompare(b.id))[0];
  return Boolean(gm && gm.id === game.user.id);
}

function hasResponsibleGM() {
  return activeGMs().length > 0;
}

function loadClientState() {
  const state = game.settings.get(MODULE_ID, CLIENT_SETTING) || {};
  const storedTab = cleanString(state.activeTab);
  uiState.activeTab = ["domain", "growth"].includes(storedTab) ? "town" : storedTab || uiState.activeTab;
  uiState.selectedSettlementId = cleanString(state.selectedSettlementId);
  uiState.search = cleanString(state.search);
  uiState.constructionCategory = ["all", "economic", "military"].includes(state.constructionCategory) ? state.constructionCategory : "all";
  uiState.constructionSearch = cleanString(state.constructionSearch);
  uiState.catalogKind = state.catalogKind === "units" ? "units" : "buildings";
  uiState.catalogSearch = cleanString(state.catalogSearch);
}

function persistClientState() {
  game.settings.set(MODULE_ID, CLIENT_SETTING, {
    activeTab: uiState.activeTab,
    selectedSettlementId: uiState.selectedSettlementId,
    search: uiState.search,
    constructionCategory: uiState.constructionCategory,
    constructionSearch: uiState.constructionSearch,
    catalogKind: uiState.catalogKind,
    catalogSearch: uiState.catalogSearch
  });
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(cleanString).filter(Boolean);
  return splitTags(value);
}

function splitTags(value) {
  return cleanString(value).split(",").map(part => part.trim()).filter(Boolean);
}

function arrayPayload(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function cleanString(value) {
  return String(value ?? "").trim();
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Math.round(toNumber(value, 0) * 100) / 100);
}

function formatSigned(value) {
  const number = Math.round(toNumber(value, 0) * 100) / 100;
  return `${number >= 0 ? "+" : ""}${formatNumber(number)}`;
}

function cssUrl(value) {
  return cleanString(value).replace(/\\/g, "/").replace(/'/g, "%27").replace(/\)/g, "%29");
}

function clone(value) {
  return foundry.utils.deepClone(value);
}

function randomId() {
  return foundry.utils.randomID();
}
