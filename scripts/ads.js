const MODULE_ID = "astargon-domain-system";
const DATA_SETTING = "worldData";
const CLIENT_SETTING = "clientState";
const SOCKET_NAME = `module.${MODULE_ID}`;
const TEMPLATE_PATH = `modules/${MODULE_ID}/templates/ads-panel.hbs`;
const ACTION_CONFIRM_TIMEOUT_MS = 6000;

const TABS = [
  { id: "overview", label: "Overview", icon: "fa-landmark" },
  { id: "population", label: "Population", icon: "fa-users" },
  { id: "economy", label: "Economy", icon: "fa-coins" },
  { id: "buildings", label: "Buildings", icon: "fa-building-columns" },
  { id: "military", label: "Military", icon: "fa-shield-halved" },
  { id: "construction", label: "Construction", icon: "fa-hammer" },
  { id: "growth", label: "Growth", icon: "fa-seedling" },
  { id: "turnNote", label: "Turn Note", icon: "fa-feather" },
  { id: "eventLog", label: "Event Log", icon: "fa-scroll" },
  { id: "gmControls", label: "GM Controls", icon: "fa-sliders" }
];

const BUILDING_CATEGORIES = [
  { value: "economic", label: "Economic" },
  { value: "military", label: "Military" },
  { value: "special", label: "Special" },
  { value: "specialMilitary", label: "Special Military" }
];

const PROJECT_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "inProgress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" }
];

const TROOP_TYPES = [
  { key: "watchman", label: "Watchman / Guard", group: "professional", garrison: 40, campaign: 60 },
  { key: "manAtArms", label: "Man-at-Arms", group: "professional", garrison: 65, campaign: 95 },
  { key: "archer", label: "Archer / Crossbowman", group: "professional", garrison: 80, campaign: 120 },
  { key: "sergeant", label: "Sergeant", group: "professional", garrison: 120, campaign: 180 },
  { key: "cavalry", label: "Cavalry Trooper", group: "professional", garrison: 330, campaign: 480 },
  { key: "knight", label: "Knight", group: "professional", garrison: 900, campaign: 1300 },
  { key: "militia", label: "Militia", group: "militia", garrison: 0, campaign: 0 }
];

const DEFAULT_BUILDING_CATALOG = [
  catalog("lumber-camp", "Lumber Camp", "economic", "Forest", "", 10, 70, 800, 400, "1 per 100 POP"),
  catalog("hunting-lodge", "Hunting Lodge", "economic", "Any", "", 10, 60, 600, 300, "1 per 100 POP", "Forest biome: +300 Crown"),
  catalog("stone-quarry", "Stone Quarry", "economic", "Hills or Mountains", "", 20, 80, 1200, 500, "Based on stone availability"),
  catalog("iron-mine", "Iron Mine", "economic", "Any", "Iron resource nearby", 20, 120, 2000, 700, "2 per 200 POP"),
  catalog("grain-mill", "Grain Mill", "economic", "Any", "", 10, 60, 1000, 350, "1 per 100 POP"),
  catalog("market-hall", "Market Hall", "economic", "Any", "More than 1000 POP", 50, 100, 3000, 1000, "1000 POP required", "", 1000),
  catalog("fishing-wharf", "Fishing Wharf", "economic", "Coast, River, or Lake", "", 15, 70, 900, 400, "1 per 100 POP"),
  catalog("cattle-ranch", "Cattle Ranch", "economic", "Grassland, Farmlands, or Plains", "", 10, 65, 900, 400, "1 per 100 POP"),
  catalog("high-yield-crop-field", "High Yield Crop Field", "economic", "Farmlands", "", 20, 60, 700, 300, "1 per 100 POP", "Grain Mill present: +300 Crown"),
  catalog("sheep-pasture", "Sheep Pasture", "economic", "Hills or Plains", "", 10, 55, 600, 300, "1 per 100 POP"),
  catalog("weavers-workshop", "Weavers Workshop", "economic", "Any Settlement", "", 10, 65, 1200, 450, "1 per 100 POP", "Sheep Pasture present: +150 Crown"),
  catalog("brewery", "Brewery", "economic", "Town or Grain Region", "", 10, 100, 1400, 500, "1 per 100 POP"),
  catalog("winery", "Winery", "economic", "Hills or Warm Vine Region", "", 20, 100, 2000, 800, "1 per 200 POP"),
  catalog("orchard-farm", "Orchard Farm", "economic", "Plains or Farmlands", "", 10, 60, 800, 300, "1 per 100 POP"),
  catalog("cider-mill", "Cider Mill", "economic", "Any", "Orchard Farm must be present", 10, 60, 900, 350, "1 per Orchard Farm"),
  catalog("butchers-house", "Butchers House", "economic", "Any Settlement", "", 10, 50, 600, 250, "1 per 100 POP", "+100 Crown for each Ranch, Hunting Lodge, and Pasture"),
  catalog("tannery", "Tannery", "economic", "Any", "Hunting Lodge must be present", 10, 70, 1000, 450, "1 per 100 POP"),
  catalog("herbalist-garden", "Herbalist Garden", "economic", "Grassland or Forest Edge", "", 10, 50, 700, 300, "1 per 100 POP"),
  catalog("apothecary", "Apothecary", "economic", "Town or City", "", 10, 50, 1500, 600, "1 per 200 POP", "Herbalist Garden present: +150 Crown; +0.25% growth"),
  catalog("saltworks", "Saltworks", "economic", "Any", "Salt Mine must be present", 20, 100, 2200, 750, "1 per 100 POP"),
  catalog("leatherworker-workshop", "Leatherworker Workshop", "economic", "Any Settlement", "Hunting Lodge must be present", 10, 90, 1500, 500, "1 per 100 POP", "Tannery present: +100 Crown"),
  catalog("clay-kiln", "Clay Kiln or Pottery Workshop", "economic", "Any", "Clay Soil", 10, 80, 1200, 400, "1 per 100 POP"),
  catalog("apiary", "Apiary", "economic", "Forest Edge or Flower Valley", "", 10, 75, 500, 200, "1 per 100 POP"),
  catalog("horse-breeding-stable", "Horse Breeding Stable", "economic", "Plains or Grassland", "", 20, 60, 2000, 700, "1 per 200 POP"),
  catalog("goat-farm", "Goat Farm", "economic", "Hills or Rocky Region", "", 10, 45, 500, 200, "1 per 100 POP"),
  {
    key: "barracks",
    name: "Barracks",
    category: "military",
    terrain: "Any",
    requirement: "",
    baseWorkers: 5,
    baseRate: 0,
    flatOutput: 0,
    crownCost: 2000,
    cpCost: 600,
    limit: "",
    bonus: "Supports 100 professional soldiers",
    basePopRequirement: 100,
    slotType: "military",
    capacityProfessional: 100,
    capacityMilitia: 0,
    bonusEconomicSlots: 0,
    bonusMilitarySlots: 0,
    custom: false
  },
  {
    key: "town-watch-post",
    name: "Town Watch Post",
    category: "military",
    terrain: "Any",
    requirement: "",
    baseWorkers: 2,
    baseRate: 0,
    flatOutput: 0,
    crownCost: 400,
    cpCost: 200,
    limit: "",
    bonus: "Provides 20 militia with free upkeep",
    basePopRequirement: 100,
    slotType: "military",
    capacityProfessional: 0,
    capacityMilitia: 20,
    bonusEconomicSlots: 0,
    bonusMilitarySlots: 0,
    custom: false
  }
];

let adsApp = null;
const pendingActionRequests = new Map();

const uiState = {
  activeTab: "overview",
  selectedSettlementId: "",
  search: ""
};

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

function catalog(key, name, category, terrain, requirement, baseWorkers, baseRate, crownCost, cpCost, limit, bonus = "", basePopRequirement = 100) {
  return {
    key,
    name,
    category,
    terrain,
    requirement,
    baseWorkers,
    baseRate,
    flatOutput: 0,
    crownCost,
    cpCost,
    limit,
    bonus,
    basePopRequirement,
    slotType: category === "military" ? "military" : "economic",
    capacityProfessional: 0,
    capacityMilitia: 0,
    bonusEconomicSlots: 0,
    bonusMilitarySlots: 0,
    custom: false
  };
}

function registerSettings() {
  game.settings.register(MODULE_ID, DATA_SETTING, {
    name: "ADS World Data",
    scope: "world",
    config: false,
    type: Object,
    default: defaultWorldData()
  });

  game.settings.register(MODULE_ID, CLIENT_SETTING, {
    name: "ADS Client State",
    scope: "client",
    config: false,
    type: Object,
    default: {}
  });
}

function registerKeybinding() {
  game.keybindings.register(MODULE_ID, "toggleAdsPanel", {
    name: "ADS: Toggle Domain Panel",
    hint: "Open or close the Astargon Domain System panel.",
    editable: [{ key: "KeyK" }],
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
    onDown: () => {
      toggleAdsPanel();
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
    selected: (a, b) => a === b ? "selected" : ""
  };

  for (const [name, fn] of Object.entries(helpers)) {
    if (!Handlebars.helpers[name]) Handlebars.registerHelper(name, fn);
  }
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class AstargonDomainApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "astargon-domain-system",
    classes: ["ads-window"],
    tag: "section",
    window: {
      title: "ADS: Astargon Domain System",
      icon: "fa-solid fa-landmark",
      resizable: true
    },
    position: {
      width: 1240,
      height: 780
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
  globalThis.AstargonDomainSystem = {
    open: openAdsPanel,
    close: closeAdsPanel,
    toggle: toggleAdsPanel,
    getData: getWorldData
  };
}

function openAdsPanel() {
  const data = getWorldData();
  const visible = visibleSettlements(data);
  if (!game.user.isGM && !visible.length) {
    ui.notifications.warn("ADS: You do not have an assigned settlement yet.");
    return false;
  }

  if (!adsApp) {
    adsApp = new AstargonDomainApplication({
      position: defaultPanelPosition()
    });
  }
  return adsApp.render(true);
}

function defaultPanelPosition() {
  const width = Math.min(1240, Math.max(940, (globalThis.innerWidth || 1280) - 40));
  const height = Math.min(780, Math.max(650, (globalThis.innerHeight || 820) - 40));
  return { width, height };
}

async function closeAdsPanel() {
  if (!adsApp?.rendered) return;
  await adsApp.close();
}

function toggleAdsPanel() {
  if (adsApp?.rendered) return closeAdsPanel();
  return openAdsPanel();
}

function renderAdsPanel() {
  if (adsApp?.rendered) adsApp.render(false);
}

function scheduleRefresh() {
  setTimeout(renderAdsPanel, 50);
}

function buildContext(rawData) {
  const data = normalizeData(rawData);
  const isGM = Boolean(game.user?.isGM);
  const allVisible = visibleSettlements(data);
  const search = cleanString(uiState.search).toLowerCase();
  const filtered = search
    ? allVisible.filter(settlement => {
      const haystack = [
        settlement.name,
        settlement.region,
        settlement.type,
        ...(settlement.terrainTags || []),
        ...(settlement.biomeTags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(search);
    })
    : allVisible;

  let selected = allVisible.find(settlement => settlement.id === uiState.selectedSettlementId) || filtered[0] || allVisible[0] || null;
  if (selected) uiState.selectedSettlementId = selected.id;

  const selectedContext = selected ? settlementContext(selected, data, isGM) : null;
  const tabs = TABS
    .filter(tab => isGM || tab.id !== "gmControls")
    .map(tab => ({ ...tab, active: tab.id === uiState.activeTab }));

  if (!tabs.some(tab => tab.active)) {
    uiState.activeTab = "overview";
    tabs.forEach(tab => tab.active = tab.id === "overview");
  }

  return {
    moduleId: MODULE_ID,
    isGM,
    currentMonth: data.currentMonth,
    activeTab: uiState.activeTab,
    search: uiState.search,
    tabs,
    settlements: filtered.map(settlement => settlementListContext(settlement, data, settlement.id === selected?.id)),
    hasVisibleSettlements: allVisible.length > 0,
    selected: selectedContext,
    userOptions: userOptions(selected),
    catalogOptions: data.buildingCatalog.map(item => ({
      key: item.key,
      name: `${item.name} (${categoryLabel(item.category)})`
    })),
    troopTypeOptions: TROOP_TYPES,
    projectStatuses: PROJECT_STATUSES,
    buildingCategories: BUILDING_CATEGORIES
  };
}

function settlementListContext(settlement, data, active) {
  const summary = calculateSettlement(settlement, data);
  return {
    id: settlement.id,
    name: settlement.name,
    region: settlement.region,
    type: settlement.type,
    active,
    pop: formatNumber(summary.totalPop),
    netIncome: formatSigned(summary.netIncome),
    warnings: buildWarnings(settlement, data, summary).length
  };
}

function settlementContext(settlement, data, isGM) {
  const summary = calculateSettlement(settlement, data);
  const permissions = permissionsFor(settlement, isGM);
  const warnings = buildWarnings(settlement, data, summary);
  const currentNote = settlement.turnNotes[game.user.id] || { text: "", authorName: game.user.name || "Player", updated: 0 };

  return {
    ...settlement,
    access: permissions,
    canEditBasics: permissions.canEditBasics,
    canEditAssignments: permissions.canEditAssignments,
    canWriteTurnNote: permissions.canWriteTurnNote,
    terrainTagsText: (settlement.terrainTags || []).join(", "),
    biomeTagsText: (settlement.biomeTags || []).join(", "),
    ownerNames: ownerNames(settlement),
    summary: summaryContext(summary),
    warnings,
    hasWarnings: warnings.length > 0,
    currentTurnNote: {
      ...currentNote,
      updatedLabel: currentNote.updated ? new Date(currentNote.updated).toLocaleString() : "Not saved"
    },
    allTurnNotes: Object.entries(settlement.turnNotes || {}).map(([userId, note]) => ({
      userId,
      authorName: note.authorName || userName(userId),
      text: note.text || "",
      updatedLabel: note.updated ? new Date(note.updated).toLocaleString() : "Not saved"
    })),
    buildings: settlement.buildings.map(building => buildingContext(building, settlement, data, summary, permissions)),
    troops: settlement.troops.map(troop => troopContext(troop, permissions)),
    construction: settlement.construction.map(project => projectContext(project, settlement, data, summary, permissions)),
    eventLog: settlement.eventLog.slice(0, 40).map(entry => ({
      ...entry,
      createdLabel: entry.created ? new Date(entry.created).toLocaleString() : "",
      playerNotesText: (entry.playerNotes || []).map(note => `${note.authorName}: ${note.text}`).join("\n")
    }))
  };
}

function summaryContext(summary) {
  return {
    totalPop: formatNumber(summary.totalPop),
    economicWorkers: formatNumber(summary.economicWorkers),
    militaryBuildingWorkers: formatNumber(summary.militaryBuildingWorkers),
    professionalSoldiers: formatNumber(summary.professionalSoldiers),
    militia: formatNumber(summary.militia),
    freePop: formatNumber(summary.freePop),
    totalMp: formatNumber(summary.totalMp),
    mpUsed: formatNumber(summary.mpUsed),
    mpRemaining: formatNumber(summary.mpRemaining),
    grossIncome: formatNumber(summary.grossIncome),
    baseIncome: formatNumber(summary.baseIncome),
    buildingOutput: formatNumber(summary.buildingOutput),
    militaryCost: formatNumber(summary.militaryCost),
    netIncome: formatSigned(summary.netIncome),
    economicSlots: `${formatNumber(summary.usedEconomicSlots)} / ${formatNumber(summary.economicSlots)}`,
    militarySlots: `${formatNumber(summary.usedMilitarySlots)} / ${formatNumber(summary.militarySlots)}`,
    professionalCapacity: formatNumber(summary.professionalCapacity),
    militiaCapacity: formatNumber(summary.militiaCapacity),
    cpThisMonth: formatNumber(summary.cpThisMonth),
    growthRate: `${formatSigned(summary.growthRate)}%`,
    popChange: formatSigned(summary.popChange),
    projectedPop: formatNumber(summary.projectedPop)
  };
}

function buildingContext(building, settlement, data, summary, permissions) {
  const output = buildingOutput(building, settlement, data);
  const workerCapacity = workerCapacityForLevel(building);
  const slotUsage = slotUsageForLevel(building);
  return {
    ...building,
    categoryLabel: categoryLabel(building.category),
    activeChecked: building.active ? "checked" : "",
    specialChecked: building.special ? "checked" : "",
    gmOnlyChecked: building.gmOnly ? "checked" : "",
    output: formatNumber(output.total),
    bonusOutput: formatNumber(output.bonus),
    workerCapacity: formatNumber(workerCapacity),
    slotUsageDisplay: formatNumber(slotUsage),
    canEditFull: permissions.canEditBuildings,
    canEditAssignments: permissions.canEditAssignments,
    categoryOptions: BUILDING_CATEGORIES.map(option => ({ ...option, selected: option.value === building.category }))
  };
}

function troopContext(troop, permissions) {
  const type = troopType(troop.typeKey);
  const mode = troop.mode === "campaign" ? "campaign" : "garrison";
  const cost = Number(troop.count || 0) * Number(type[mode] || 0);
  return {
    ...troop,
    typeLabel: type.label,
    group: type.group,
    mode,
    monthlyCost: formatNumber(cost),
    typeOptions: TROOP_TYPES.map(option => ({ ...option, selected: option.key === troop.typeKey })),
    garrisonSelected: mode === "garrison",
    campaignSelected: mode === "campaign",
    canEditFull: permissions.canEditMilitary,
    canEditAssignments: permissions.canEditAssignments
  };
}

function projectContext(project, settlement, data, summary, permissions) {
  const requiredCrown = Math.max(0, Number(project.requiredCrown || 0));
  const crownPaid = Math.max(0, Number(project.crownPaid || 0));
  const requiredCp = Math.max(0, Number(project.requiredCp || 0));
  const cpPaid = Math.max(0, Number(project.cpPaid || 0));
  const crownRemaining = Math.max(0, requiredCrown - crownPaid);
  const cpRemaining = Math.max(0, requiredCp - cpPaid);
  const cpRate = Math.max(0, summary.freePop + Number(project.externalWorkers || 0) + Number(project.bonusCp || 0));
  const months = cpRemaining <= 0 ? 0 : cpRate > 0 ? Math.ceil(cpRemaining / cpRate) : "";
  return {
    ...project,
    crownRemaining: formatNumber(crownRemaining),
    cpRemaining: formatNumber(cpRemaining),
    cpRate: formatNumber(cpRate),
    monthsDisplay: months === "" ? "Unknown" : months === 0 ? "Complete" : `${months}`,
    canEditFull: permissions.canEditConstruction,
    statusOptions: PROJECT_STATUSES.map(option => ({ ...option, selected: option.value === project.status }))
  };
}

function userOptions(settlement) {
  const selected = new Set(settlement?.ownerUserIds || []);
  return users().map(user => ({
    id: user.id,
    name: user.name || user.id,
    checked: selected.has(user.id)
  }));
}

function visibleSettlements(data) {
  if (game.user?.isGM) return data.settlements;
  return data.settlements.filter(settlement => (settlement.ownerUserIds || []).includes(game.user.id));
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
      canEditGrowth: true,
      canEditAssignments: true,
      canWriteTurnNote: true,
      canProcessTurn: true
    };
  }

  const assigned = (settlement.ownerUserIds || []).includes(userId);
  const settings = settlement.permissions || {};
  return {
    canView: assigned,
    canEditBasics: assigned && Boolean(settings.playersCanEditBasics),
    canEditPopulation: false,
    canEditBuildings: false,
    canEditMilitary: false,
    canEditConstruction: false,
    canEditGrowth: false,
    canEditAssignments: assigned && Boolean(settings.playersCanEditAssignments),
    canWriteTurnNote: assigned && Boolean(settings.playersCanWriteTurnNotes),
    canProcessTurn: false
  };
}

function activateListeners(element) {
  const root = element.querySelector(".ads-root");
  if (!root) return;

  root.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.activeTab = event.currentTarget.dataset.tab || "overview";
      persistClientState();
      renderAdsPanel();
    });
  });

  root.querySelectorAll("[data-select-settlement]").forEach(button => {
    button.addEventListener("click", event => {
      uiState.selectedSettlementId = event.currentTarget.dataset.selectSettlement || "";
      persistClientState();
      renderAdsPanel();
    });
  });

  root.querySelector("[data-search-settlements]")?.addEventListener("input", event => {
    uiState.search = event.currentTarget.value || "";
    persistClientState();
    renderAdsPanel();
  });

  root.querySelectorAll("[data-action-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const action = event.currentTarget.dataset.actionForm;
      if (!action) return;
      await sendAction(action, formPayload(event.currentTarget));
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
    if (Object.hasOwn(payload, key)) {
      payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
    } else {
      payload[key] = value;
    }
  }

  form.querySelectorAll("input[type='checkbox'][data-bool][name]").forEach(input => {
    payload[input.name] = input.checked;
  });

  return payload;
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
      game.socket.emit(SOCKET_NAME, {
        type: "actionResult",
        targetUserId: packet.userId,
        requestId: packet.requestId
      });
    } catch (error) {
      console.warn(`${MODULE_ID} | Rejected socket action`, error);
      game.socket.emit(SOCKET_NAME, {
        type: "actionError",
        targetUserId: packet.userId,
        requestId: packet.requestId,
        message: error.message || "ADS action rejected."
      });
    }
  });
}

function waitForActionConfirmation(requestId) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      pendingActionRequests.delete(requestId);
      ui.notifications.warn("ADS could not confirm that action.");
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
  if (game.user.isGM && isResponsibleGM()) {
    try {
      return await processAction(action, payload, game.user.id);
    } catch (error) {
      ui.notifications.warn(error.message || "ADS action rejected.");
      throw error;
    }
  }

  if (!hasResponsibleGM()) {
    ui.notifications.warn("A GM must be connected to update ADS data.");
    return false;
  }

  const requestId = randomId();
  const confirmation = waitForActionConfirmation(requestId);
  try {
    game.socket.emit(SOCKET_NAME, {
      action,
      payload,
      userId: game.user.id,
      requestId,
      created: Date.now()
    });
  } catch (error) {
    resolvePendingAction(requestId, false, error.message || "ADS could not send that action.");
  }
  return confirmation;
}

async function processAction(action, payload, userId) {
  const user = users().find(candidate => candidate.id === userId);
  if (!user) throw new Error("ADS user not found.");

  const data = getWorldData();
  switch (action) {
    case "addSettlement":
      requireGM(user);
      data.settlements.unshift(defaultSettlement());
      uiState.selectedSettlementId = data.settlements[0].id;
      break;
    case "deleteSettlement":
      requireGM(user);
      deleteById(data.settlements, payload.settlementId);
      uiState.selectedSettlementId = data.settlements[0]?.id || "";
      break;
    case "restoreDeLaurent":
      requireGM(user);
      upsertDeLaurent(data);
      uiState.selectedSettlementId = "de-laurent";
      break;
    case "updateSettlementBasics":
      updateSettlementBasics(data, payload, user);
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
    case "addBuildingFromCatalog":
      addBuildingFromCatalog(data, payload, user);
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
    case "addTroop":
      addTroop(data, payload, user);
      break;
    case "updateTroop":
      updateTroop(data, payload, user);
      break;
    case "deleteTroop":
      deleteTroop(data, payload, user);
      break;
    case "addProject":
      addProject(data, payload, user);
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
      await processMonthlyTurn(data, payload, user);
      break;
    default:
      throw new Error(`Unknown ADS action: ${action}`);
  }

  await saveWorldData(data, action);
  return true;
}

function updateSettlementBasics(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const permissions = permissionsFor(settlement, user.isGM, user.id);
  if (!permissions.canEditBasics) throw new Error("You cannot edit this settlement.");

  if (user.isGM || permissions.canEditBasics) {
    if (Object.hasOwn(payload, "name")) settlement.name = cleanString(payload.name) || settlement.name;
    if (Object.hasOwn(payload, "region")) settlement.region = cleanString(payload.region);
    if (Object.hasOwn(payload, "type")) settlement.type = cleanString(payload.type);
    if (Object.hasOwn(payload, "terrainTags")) settlement.terrainTags = splitTags(payload.terrainTags);
    if (Object.hasOwn(payload, "biomeTags")) settlement.biomeTags = splitTags(payload.biomeTags);
    if (Object.hasOwn(payload, "notes")) settlement.notes = cleanString(payload.notes);
  }

  if (user.isGM) {
    settlement.ownerUserIds = arrayPayload(payload.ownerUserIds).map(cleanString).filter(Boolean);
    settlement.gmNotes = cleanString(payload.gmNotes);
  }
}

function updatePopulation(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.population.total = Math.max(0, Math.trunc(toNumber(payload.totalPop, settlement.population.total)));
  settlement.slots.economicBonus = Math.trunc(toNumber(payload.economicSlotBonus, settlement.slots.economicBonus));
  settlement.slots.militaryBonus = Math.trunc(toNumber(payload.militarySlotBonus, settlement.slots.militaryBonus));
}

function updatePermissions(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.permissions.playersCanEditBasics = Boolean(payload.playersCanEditBasics);
  settlement.permissions.playersCanEditAssignments = Boolean(payload.playersCanEditAssignments);
  settlement.permissions.playersCanWriteTurnNotes = Boolean(payload.playersCanWriteTurnNotes);
}

function updateOverrides(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.manualOverrides.ignorePopulationLimits = Boolean(payload.ignorePopulationLimits);
  settlement.manualOverrides.ignoreManpowerLimits = Boolean(payload.ignoreManpowerLimits);
  settlement.manualOverrides.ignoreMilitaryCapacity = Boolean(payload.ignoreMilitaryCapacity);
  settlement.manualOverrides.ignoreBuildingRequirements = Boolean(payload.ignoreBuildingRequirements);
  settlement.manualOverrides.ignoreSlotLimits = Boolean(payload.ignoreSlotLimits);
  settlement.manualOverrides.ignoreGrowthLimits = Boolean(payload.ignoreGrowthLimits);
}

function addBuildingFromCatalog(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const item = data.buildingCatalog.find(candidate => candidate.key === payload.catalogKey) || data.buildingCatalog[0];
  if (!item) throw new Error("No building catalog item found.");
  settlement.buildings.push(buildingFromCatalog(item, { id: randomId() }));
}

function addCustomBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.buildings.push(normalizeBuilding({
    id: randomId(),
    catalogKey: "custom",
    name: "Custom Building",
    category: "special",
    level: 1,
    active: true,
    assignedPop: 0,
    baseWorkers: 10,
    baseRate: 0,
    flatOutput: 0,
    crownCost: 0,
    cpCost: 0,
    terrain: "Any",
    requirement: "",
    limit: "",
    notes: "",
    special: true,
    gmOnly: false
  }));
}

function updateBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const building = findById(settlement.buildings, payload.buildingId, "Building");
  const permissions = permissionsFor(settlement, user.isGM, user.id);

  if (user.isGM) {
    building.name = cleanString(payload.name) || building.name;
    building.category = normalizeCategory(payload.category);
    building.level = clamp(Math.trunc(toNumber(payload.level, building.level)), 1, 5);
    building.active = Boolean(payload.active);
    building.special = Boolean(payload.special);
    building.gmOnly = Boolean(payload.gmOnly);
    building.terrain = cleanString(payload.terrain);
    building.requirement = cleanString(payload.requirement);
    building.baseWorkers = Math.max(0, toNumber(payload.baseWorkers, building.baseWorkers));
    building.assignedPop = Math.max(0, toNumber(payload.assignedPop, building.assignedPop));
    building.baseRate = Math.max(0, toNumber(payload.baseRate, building.baseRate));
    building.flatOutput = toNumber(payload.flatOutput, building.flatOutput);
    building.crownCost = Math.max(0, toNumber(payload.crownCost, building.crownCost));
    building.cpCost = Math.max(0, toNumber(payload.cpCost, building.cpCost));
    building.slotUsage = Math.max(0, toNumber(payload.slotUsage, building.slotUsage));
    building.basePopRequirement = Math.max(0, toNumber(payload.basePopRequirement, building.basePopRequirement));
    building.capacityProfessional = Math.max(0, toNumber(payload.capacityProfessional, building.capacityProfessional));
    building.capacityMilitia = Math.max(0, toNumber(payload.capacityMilitia, building.capacityMilitia));
    building.bonusEconomicSlots = toNumber(payload.bonusEconomicSlots, building.bonusEconomicSlots);
    building.bonusMilitarySlots = toNumber(payload.bonusMilitarySlots, building.bonusMilitarySlots);
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

function addTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.troops.push(normalizeTroop({
    id: randomId(),
    typeKey: "watchman",
    count: 0,
    mode: "garrison",
    notes: ""
  }));
}

function updateTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const troop = findById(settlement.troops, payload.troopId, "Troop");
  const permissions = permissionsFor(settlement, user.isGM, user.id);

  if (user.isGM) {
    troop.typeKey = troopType(payload.typeKey).key;
    troop.count = Math.max(0, Math.trunc(toNumber(payload.count, troop.count)));
    troop.mode = payload.mode === "campaign" ? "campaign" : "garrison";
    troop.notes = cleanString(payload.notes);
    return;
  }

  if (!permissions.canEditAssignments) throw new Error("You cannot edit military assignments.");
  troop.count = Math.max(0, Math.trunc(toNumber(payload.count, troop.count)));
  troop.mode = payload.mode === "campaign" ? "campaign" : "garrison";
  troop.notes = cleanString(payload.notes);
}

function deleteTroop(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.troops, payload.troopId);
}

function addProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  const catalogItem = data.buildingCatalog[0];
  settlement.construction.push(normalizeProject({
    id: randomId(),
    name: "New Construction Project",
    catalogKey: catalogItem?.key || "",
    targetLevel: 1,
    requiredCrown: catalogItem?.crownCost || 0,
    crownPaid: 0,
    requiredCp: catalogItem?.cpCost || 0,
    cpPaid: 0,
    externalWorkers: 0,
    bonusCp: 0,
    status: "planned",
    notes: ""
  }));
}

function updateProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  const project = findById(settlement.construction, payload.projectId, "Project");
  requireGM(user);
  project.name = cleanString(payload.name) || project.name;
  project.catalogKey = cleanString(payload.catalogKey);
  project.targetLevel = clamp(Math.trunc(toNumber(payload.targetLevel, project.targetLevel)), 1, 5);
  project.requiredCrown = Math.max(0, toNumber(payload.requiredCrown, project.requiredCrown));
  project.crownPaid = Math.max(0, toNumber(payload.crownPaid, project.crownPaid));
  project.requiredCp = Math.max(0, toNumber(payload.requiredCp, project.requiredCp));
  project.cpPaid = Math.max(0, toNumber(payload.cpPaid, project.cpPaid));
  project.externalWorkers = Math.max(0, toNumber(payload.externalWorkers, project.externalWorkers));
  project.bonusCp = Math.max(0, toNumber(payload.bonusCp, project.bonusCp));
  project.status = statusValue(payload.status);
  project.notes = cleanString(payload.notes);
}

function deleteProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.construction, payload.projectId);
}

function updateGrowth(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.growth.baseRate = toNumber(payload.baseRate, settlement.growth.baseRate);
  settlement.growth.safeBonus = toNumber(payload.safeBonus, settlement.growth.safeBonus);
  settlement.growth.foodSurplusBonus = toNumber(payload.foodSurplusBonus, settlement.growth.foodSurplusBonus);
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

async function processMonthlyTurn(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);

  const before = calculateSettlement(settlement, data);
  const activeProjects = settlement.construction.filter(project => project.status === "inProgress");
  let cpPool = before.freePop + activeProjects.reduce((total, project) => total + Number(project.externalWorkers || 0) + Number(project.bonusCp || 0), 0);
  const completed = [];

  for (const project of activeProjects) {
    const remaining = Math.max(0, Number(project.requiredCp || 0) - Number(project.cpPaid || 0));
    const applied = Math.min(cpPool, remaining);
    project.cpPaid = Math.max(0, Number(project.cpPaid || 0) + applied);
    project.cpGeneratedThisMonth = applied;
    cpPool = Math.max(0, cpPool - applied);

    if (project.cpPaid >= project.requiredCp && project.crownPaid >= project.requiredCrown) {
      project.status = "completed";
      completed.push(project);
      completeProject(settlement, data, project);
    }
  }

  const growth = calculateGrowth(settlement, before);
  settlement.population.total = Math.max(0, settlement.population.total + growth.popChange);
  const after = calculateSettlement(settlement, data);
  const playerNotes = Object.entries(settlement.turnNotes || {}).map(([noteUserId, note]) => ({
    userId: noteUserId,
    authorName: note.authorName || userName(noteUserId),
    text: note.text || "",
    updated: note.updated || Date.now()
  })).filter(note => note.text);

  settlement.eventLog.unshift({
    id: randomId(),
    month: data.currentMonth,
    created: Date.now(),
    title: `Month ${data.currentMonth} Processed`,
    text: buildEventText(before, after, growth, completed),
    gmNote: cleanString(payload.gmTurnNote),
    playerNotes,
    report: {
      grossIncome: before.grossIncome,
      militaryCost: before.militaryCost,
      netIncome: before.netIncome,
      cpGenerated: before.freePop + activeProjects.reduce((total, project) => total + Number(project.externalWorkers || 0) + Number(project.bonusCp || 0), 0),
      popChange: growth.popChange
    }
  });

  settlement.eventLog = settlement.eventLog.slice(0, 100);
  settlement.turnNotes = {};
  data.currentMonth += 1;
  ui.notifications.info(`ADS: ${settlement.name} monthly turn processed.`);
}

function completeProject(settlement, data, project) {
  const catalogItem = data.buildingCatalog.find(item => item.key === project.catalogKey);
  if (!catalogItem) return;
  settlement.buildings.push(buildingFromCatalog(catalogItem, {
    id: randomId(),
    level: project.targetLevel,
    assignedPop: 0,
    notes: `Completed from project: ${project.name}`
  }));
}

function buildEventText(before, after, growth, completed) {
  const completedNames = completed.length ? completed.map(project => project.name).join(", ") : "None";
  return [
    `Gross Income: ${formatNumber(before.grossIncome)} Crown`,
    `Military Cost: ${formatNumber(before.militaryCost)} Crown`,
    `Net Income: ${formatSigned(before.netIncome)} Crown`,
    `CP Generated: ${formatNumber(before.cpThisMonth)}`,
    `Completed Projects: ${completedNames}`,
    `POP Change: ${formatSigned(growth.popChange)} (${formatSigned(growth.rate)}%)`,
    `New POP: ${formatNumber(after.totalPop)}`
  ].join("\n");
}

async function ensureWorldData() {
  await saveWorldData(getWorldData(), "ready", { silent: true });
}

async function saveWorldData(data, reason, options = {}) {
  if (!game.user.isGM) throw new Error("Only a GM client can save ADS data.");
  await game.settings.set(MODULE_ID, DATA_SETTING, normalizeData(data));
  if (!options.silent) game.socket.emit(SOCKET_NAME, { type: "refresh", reason, stamp: Date.now() });
  scheduleRefresh();
}

function getWorldData() {
  return normalizeData(game.settings.get(MODULE_ID, DATA_SETTING) || defaultWorldData());
}

function defaultWorldData() {
  return {
    currentMonth: 1,
    buildingCatalog: DEFAULT_BUILDING_CATALOG.map(item => ({ ...item })),
    settlements: [defaultDeLaurentSettlement()]
  };
}

function defaultSettlement() {
  return normalizeSettlement({
    id: randomId(),
    name: "New Settlement",
    region: "",
    type: "Village",
    terrainTags: [],
    biomeTags: [],
    ownerUserIds: [],
    population: { total: 100 },
    slots: { economicBonus: 0, militaryBonus: 0 },
    permissions: defaultPermissions(),
    manualOverrides: defaultOverrides(),
    buildings: [],
    troops: [],
    construction: [],
    growth: defaultGrowth(),
    turnNotes: {},
    eventLog: [],
    notes: "",
    gmNotes: ""
  });
}

function defaultDeLaurentSettlement() {
  const buildings = [
    buildingFromCatalog(DEFAULT_BUILDING_CATALOG.find(item => item.key === "lumber-camp"), { id: "de-laurent-lumber", level: 1, assignedPop: 10 }),
    buildingFromCatalog(DEFAULT_BUILDING_CATALOG.find(item => item.key === "hunting-lodge"), { id: "de-laurent-hunting", level: 2, assignedPop: 20 }),
    buildingFromCatalog(DEFAULT_BUILDING_CATALOG.find(item => item.key === "cattle-ranch"), { id: "de-laurent-ranch", level: 2, assignedPop: 20 }),
    buildingFromCatalog(DEFAULT_BUILDING_CATALOG.find(item => item.key === "high-yield-crop-field"), { id: "de-laurent-crop", level: 1, assignedPop: 20 }),
    normalizeBuilding({
      id: "de-laurent-manor",
      catalogKey: "laurent-manor",
      name: "Laurent Manor",
      category: "specialMilitary",
      terrain: "Hilly Farmlands",
      requirement: "",
      level: 1,
      active: true,
      assignedPop: 5,
      baseWorkers: 5,
      baseRate: 0,
      flatOutput: 0,
      crownCost: 0,
      cpCost: 0,
      slotUsage: 2,
      slotType: "military",
      basePopRequirement: 0,
      capacityProfessional: 200,
      capacityMilitia: 25,
      bonusEconomicSlots: 2,
      bonusMilitarySlots: 0,
      special: true,
      gmOnly: true,
      notes: "Fortified noble estate containing quarters, armory, logistics space, kitchen, stables, and administration."
    })
  ];

  return normalizeSettlement({
    id: "de-laurent",
    name: "De Laurent",
    region: "Hilly Farmlands",
    type: "Village",
    terrainTags: ["Hills", "Farmlands", "Forest"],
    biomeTags: ["Farmlands"],
    ownerUserIds: [],
    population: { total: 309 },
    slots: { economicBonus: 0, militaryBonus: 0 },
    permissions: defaultPermissions(),
    manualOverrides: defaultOverrides(),
    buildings,
    troops: [
      { id: "de-laurent-maa", typeKey: "manAtArms", count: 70, mode: "garrison", notes: "" },
      { id: "de-laurent-sergeants", typeKey: "sergeant", count: 5, mode: "garrison", notes: "" },
      { id: "de-laurent-militia", typeKey: "militia", count: 25, mode: "garrison", notes: "" }
    ],
    construction: [
      {
        id: "de-laurent-grain-mill-project",
        name: "Grain Mill Level 1",
        catalogKey: "grain-mill",
        targetLevel: 1,
        requiredCrown: 1000,
        crownPaid: 1000,
        requiredCp: 350,
        cpPaid: 0,
        externalWorkers: 116,
        bonusCp: 0,
        cpGeneratedThisMonth: 0,
        status: "inProgress",
        notes: "234 Free POP plus 116 hired workers completes this project this month."
      }
    ],
    growth: {
      baseRate: 0.5,
      safeBonus: 0,
      foodSurplusBonus: 0.25,
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
        id: "de-laurent-seed-log",
        month: 0,
        created: Date.now(),
        title: "De Laurent Template Loaded",
        text: "Initial ADS test settlement created from the Astargon domain notes.",
        gmNote: "",
        playerNotes: []
      }
    ],
    notes: "Test settlement and template for ADS.",
    gmNotes: ""
  });
}

function defaultPermissions() {
  return {
    playersCanEditBasics: false,
    playersCanEditAssignments: true,
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
    foodSurplusBonus: 0,
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

function buildingFromCatalog(item, overrides = {}) {
  const source = item || DEFAULT_BUILDING_CATALOG[0];
  return normalizeBuilding({
    id: randomId(),
    catalogKey: source.key,
    name: source.name,
    category: source.category,
    terrain: source.terrain,
    requirement: source.requirement,
    level: 1,
    active: true,
    assignedPop: 0,
    baseWorkers: source.baseWorkers,
    baseRate: source.baseRate,
    flatOutput: source.flatOutput,
    crownCost: source.crownCost,
    cpCost: source.cpCost,
    slotUsage: 0,
    slotType: source.slotType,
    basePopRequirement: source.basePopRequirement,
    capacityProfessional: source.capacityProfessional,
    capacityMilitia: source.capacityMilitia,
    bonusEconomicSlots: source.bonusEconomicSlots,
    bonusMilitarySlots: source.bonusMilitarySlots,
    special: source.category === "special" || source.category === "specialMilitary",
    gmOnly: false,
    limit: source.limit,
    bonus: source.bonus,
    notes: "",
    ...overrides
  });
}

function normalizeData(raw) {
  const fallback = defaultWorldData();
  const source = clone(raw || {});
  const data = {
    currentMonth: Math.max(1, Math.trunc(toNumber(source.currentMonth, fallback.currentMonth))),
    buildingCatalog: normalizeCatalog(source.buildingCatalog || fallback.buildingCatalog),
    settlements: Array.isArray(source.settlements) && source.settlements.length
      ? source.settlements.map(normalizeSettlement)
      : fallback.settlements
  };
  return data;
}

function normalizeCatalog(items) {
  const merged = new Map(DEFAULT_BUILDING_CATALOG.map(item => [item.key, { ...item }]));
  if (Array.isArray(items)) {
    for (const item of items) {
      const normalized = normalizeCatalogItem(item);
      merged.set(normalized.key, { ...(merged.get(normalized.key) || {}), ...normalized });
    }
  }
  return Array.from(merged.values());
}

function normalizeCatalogItem(item) {
  return {
    key: cleanString(item?.key) || randomId(),
    name: cleanString(item?.name) || "Custom Building",
    category: normalizeCategory(item?.category),
    terrain: cleanString(item?.terrain) || "Any",
    requirement: cleanString(item?.requirement),
    baseWorkers: Math.max(0, toNumber(item?.baseWorkers, 0)),
    baseRate: Math.max(0, toNumber(item?.baseRate, 0)),
    flatOutput: toNumber(item?.flatOutput, 0),
    crownCost: Math.max(0, toNumber(item?.crownCost, 0)),
    cpCost: Math.max(0, toNumber(item?.cpCost, 0)),
    limit: cleanString(item?.limit),
    bonus: cleanString(item?.bonus),
    basePopRequirement: Math.max(0, toNumber(item?.basePopRequirement, 100)),
    slotType: item?.slotType === "military" ? "military" : "economic",
    capacityProfessional: Math.max(0, toNumber(item?.capacityProfessional, 0)),
    capacityMilitia: Math.max(0, toNumber(item?.capacityMilitia, 0)),
    bonusEconomicSlots: toNumber(item?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(item?.bonusMilitarySlots, 0),
    custom: Boolean(item?.custom)
  };
}

function normalizeSettlement(item) {
  const settlement = {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Unnamed Settlement",
    region: cleanString(item?.region),
    type: cleanString(item?.type) || "Village",
    terrainTags: Array.isArray(item?.terrainTags) ? item.terrainTags.map(cleanString).filter(Boolean) : splitTags(item?.terrainTags),
    biomeTags: Array.isArray(item?.biomeTags) ? item.biomeTags.map(cleanString).filter(Boolean) : splitTags(item?.biomeTags),
    ownerUserIds: Array.isArray(item?.ownerUserIds) ? item.ownerUserIds.map(cleanString).filter(Boolean) : [],
    population: {
      total: Math.max(0, Math.trunc(toNumber(item?.population?.total ?? item?.totalPop, 0)))
    },
    slots: {
      economicBonus: Math.trunc(toNumber(item?.slots?.economicBonus, 0)),
      militaryBonus: Math.trunc(toNumber(item?.slots?.militaryBonus, 0))
    },
    permissions: { ...defaultPermissions(), ...(item?.permissions || {}) },
    manualOverrides: { ...defaultOverrides(), ...(item?.manualOverrides || {}) },
    buildings: Array.isArray(item?.buildings) ? item.buildings.map(normalizeBuilding) : [],
    troops: Array.isArray(item?.troops) ? item.troops.map(normalizeTroop) : [],
    construction: Array.isArray(item?.construction) ? item.construction.map(normalizeProject) : [],
    growth: { ...defaultGrowth(), ...(item?.growth || {}) },
    turnNotes: normalizeTurnNotes(item?.turnNotes),
    eventLog: Array.isArray(item?.eventLog) ? item.eventLog.map(normalizeEventLog).filter(Boolean) : [],
    notes: cleanString(item?.notes),
    gmNotes: cleanString(item?.gmNotes)
  };

  settlement.growth.roundDown = item?.growth?.roundDown === undefined ? true : Boolean(item.growth.roundDown);
  return settlement;
}

function normalizeBuilding(item) {
  return {
    id: cleanString(item?.id) || randomId(),
    catalogKey: cleanString(item?.catalogKey),
    name: cleanString(item?.name) || "Unnamed Building",
    category: normalizeCategory(item?.category),
    terrain: cleanString(item?.terrain) || "Any",
    requirement: cleanString(item?.requirement),
    level: clamp(Math.trunc(toNumber(item?.level, 1)), 1, 5),
    active: item?.active === undefined ? true : Boolean(item.active),
    assignedPop: Math.max(0, toNumber(item?.assignedPop, 0)),
    baseWorkers: Math.max(0, toNumber(item?.baseWorkers, 0)),
    baseRate: Math.max(0, toNumber(item?.baseRate, 0)),
    flatOutput: toNumber(item?.flatOutput, 0),
    crownCost: Math.max(0, toNumber(item?.crownCost, 0)),
    cpCost: Math.max(0, toNumber(item?.cpCost, 0)),
    slotUsage: Math.max(0, toNumber(item?.slotUsage, 0)),
    slotType: item?.slotType === "military" ? "military" : "",
    basePopRequirement: Math.max(0, toNumber(item?.basePopRequirement, 100)),
    capacityProfessional: Math.max(0, toNumber(item?.capacityProfessional, 0)),
    capacityMilitia: Math.max(0, toNumber(item?.capacityMilitia, 0)),
    bonusEconomicSlots: toNumber(item?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(item?.bonusMilitarySlots, 0),
    special: Boolean(item?.special),
    gmOnly: Boolean(item?.gmOnly),
    limit: cleanString(item?.limit),
    bonus: cleanString(item?.bonus),
    notes: cleanString(item?.notes)
  };
}

function normalizeTroop(item) {
  return {
    id: cleanString(item?.id) || randomId(),
    typeKey: troopType(item?.typeKey).key,
    count: Math.max(0, Math.trunc(toNumber(item?.count, 0))),
    mode: item?.mode === "campaign" ? "campaign" : "garrison",
    notes: cleanString(item?.notes)
  };
}

function normalizeProject(item) {
  return {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Construction Project",
    catalogKey: cleanString(item?.catalogKey),
    targetLevel: clamp(Math.trunc(toNumber(item?.targetLevel, 1)), 1, 5),
    requiredCrown: Math.max(0, toNumber(item?.requiredCrown, 0)),
    crownPaid: Math.max(0, toNumber(item?.crownPaid, 0)),
    requiredCp: Math.max(0, toNumber(item?.requiredCp, 0)),
    cpPaid: Math.max(0, toNumber(item?.cpPaid, 0)),
    externalWorkers: Math.max(0, toNumber(item?.externalWorkers, 0)),
    bonusCp: Math.max(0, toNumber(item?.bonusCp, 0)),
    cpGeneratedThisMonth: Math.max(0, toNumber(item?.cpGeneratedThisMonth, 0)),
    status: statusValue(item?.status),
    notes: cleanString(item?.notes)
  };
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
    title: cleanString(entry.title) || "ADS Event",
    text: cleanString(entry.text),
    gmNote: cleanString(entry.gmNote),
    playerNotes: Array.isArray(entry.playerNotes) ? entry.playerNotes.map(note => ({
      userId: cleanString(note.userId),
      authorName: cleanString(note.authorName),
      text: cleanString(note.text),
      updated: toNumber(note.updated, 0)
    })) : [],
    report: entry.report || {}
  };
}

function calculateSettlement(settlement, data) {
  const totalPop = Math.max(0, Number(settlement.population.total || 0));
  const activeBuildings = settlement.buildings.filter(building => building.active);
  const economicWorkers = activeBuildings
    .filter(building => assignmentKind(building) === "economic")
    .reduce((total, building) => total + Number(building.assignedPop || 0), 0);
  const militaryBuildingWorkers = activeBuildings
    .filter(building => assignmentKind(building) === "military")
    .reduce((total, building) => total + Number(building.assignedPop || 0), 0);
  const professionalSoldiers = settlement.troops
    .filter(troop => troopType(troop.typeKey).group === "professional")
    .reduce((total, troop) => total + Number(troop.count || 0), 0);
  const militia = settlement.troops
    .filter(troop => troopType(troop.typeKey).group === "militia")
    .reduce((total, troop) => total + Number(troop.count || 0), 0);
  const rawFreePop = totalPop - economicWorkers - militaryBuildingWorkers;
  const freePop = Math.max(0, rawFreePop);
  const buildingOutputTotal = activeBuildings.reduce((total, building) => total + buildingOutput(building, settlement, data).total, 0);
  const baseIncome = freePop * 20;
  const militaryCost = settlement.troops.reduce((total, troop) => {
    const type = troopType(troop.typeKey);
    const mode = troop.mode === "campaign" ? "campaign" : "garrison";
    return total + Number(troop.count || 0) * Number(type[mode] || 0);
  }, 0);
  const economicSlots = Math.floor(totalPop / 100) + Number(settlement.slots.economicBonus || 0) + activeBuildings.reduce((total, building) => total + Number(building.bonusEconomicSlots || 0), 0);
  const militarySlots = Math.floor(totalPop / 100) + Number(settlement.slots.militaryBonus || 0) + activeBuildings.reduce((total, building) => total + Number(building.bonusMilitarySlots || 0), 0);
  const usedEconomicSlots = activeBuildings
    .filter(building => slotKind(building) === "economic")
    .reduce((total, building) => total + slotUsageForLevel(building), 0);
  const usedMilitarySlots = activeBuildings
    .filter(building => slotKind(building) === "military")
    .reduce((total, building) => total + slotUsageForLevel(building), 0);
  const professionalCapacity = activeBuildings.reduce((total, building) => total + Number(building.capacityProfessional || 0), 0);
  const militiaCapacity = activeBuildings.reduce((total, building) => total + Number(building.capacityMilitia || 0), 0);
  const cpThisMonth = freePop + settlement.construction
    .filter(project => project.status === "inProgress")
    .reduce((total, project) => total + Number(project.externalWorkers || 0) + Number(project.bonusCp || 0), 0);
  const growth = calculateGrowth(settlement, { totalPop });

  return {
    totalPop,
    economicWorkers,
    militaryBuildingWorkers,
    professionalSoldiers,
    militia,
    rawFreePop,
    freePop,
    totalMp: totalPop,
    mpUsed: professionalSoldiers + militia,
    mpRemaining: totalPop - professionalSoldiers - militia,
    baseIncome,
    buildingOutput: buildingOutputTotal,
    grossIncome: baseIncome + buildingOutputTotal,
    militaryCost,
    netIncome: baseIncome + buildingOutputTotal - militaryCost,
    economicSlots,
    militarySlots,
    usedEconomicSlots,
    usedMilitarySlots,
    professionalCapacity,
    militiaCapacity,
    cpThisMonth,
    growthRate: growth.rate,
    popChange: growth.popChange,
    projectedPop: Math.max(0, totalPop + growth.popChange)
  };
}

function calculateGrowth(settlement, summary) {
  const growth = settlement.growth || defaultGrowth();
  const rawRate = cleanString(growth.overrideRate) !== ""
    ? toNumber(growth.overrideRate, 0)
    : [
      growth.baseRate,
      growth.safeBonus,
      growth.foodSurplusBonus,
      growth.migrationBonus,
      growth.warPenalty,
      growth.faminePenalty,
      growth.plaguePenalty,
      growth.taxPenalty,
      growth.raidPenalty,
      growth.otherModifier,
      apothecaryGrowthBonus(settlement)
    ].reduce((total, value) => total + toNumber(value, 0), 0);
  const rate = settlement.manualOverrides?.ignoreGrowthLimits ? rawRate : clamp(rawRate, -5, 5);
  const totalPop = Number(summary.totalPop || settlement.population.total || 0);
  const overridePopChange = cleanString(growth.overridePopChange);
  const popChange = overridePopChange !== ""
    ? Math.trunc(toNumber(overridePopChange, 0))
    : growth.roundDown
      ? Math.floor(totalPop * rate / 100)
      : Math.round(totalPop * rate / 100);
  return { rate, popChange };
}

function buildingOutput(building, settlement, data) {
  if (!building.active || assignmentKind(building) !== "economic") return { base: 0, bonus: 0, total: 0 };
  const assignedPop = Math.min(Number(building.assignedPop || 0), workerCapacityForLevel(building));
  const base = assignedPop * Number(building.baseRate || 0) + Number(building.flatOutput || 0);
  const bonus = buildingBonus(building, settlement, data);
  return {
    base,
    bonus,
    total: base + bonus
  };
}

function buildingBonus(building, settlement) {
  const key = building.catalogKey;
  const has = catalogKey => settlement.buildings.some(candidate => candidate.active && candidate.catalogKey === catalogKey);
  const countByKeys = keys => settlement.buildings.filter(candidate => candidate.active && keys.includes(candidate.catalogKey)).length;
  const biomeTags = (settlement.biomeTags || []).map(tag => tag.toLowerCase());
  let bonus = 0;

  if (key === "hunting-lodge" && biomeTags.some(tag => tag.includes("forest"))) bonus += 300;
  if (key === "high-yield-crop-field" && has("grain-mill")) bonus += 300;
  if (key === "weavers-workshop" && has("sheep-pasture")) bonus += 150;
  if (key === "butchers-house") bonus += 100 * countByKeys(["cattle-ranch", "hunting-lodge", "sheep-pasture", "goat-farm"]);
  if (key === "apothecary" && has("herbalist-garden")) bonus += 150;
  if (key === "leatherworker-workshop" && has("tannery")) bonus += 100;
  return bonus;
}

function apothecaryGrowthBonus(settlement) {
  return settlement.buildings.some(building => building.active && building.catalogKey === "apothecary") ? 0.25 : 0;
}

function workerCapacityForLevel(building) {
  return Math.max(0, Number(building.baseWorkers || 0)) * clamp(Math.trunc(toNumber(building.level, 1)), 1, 5);
}

function slotUsageForLevel(building) {
  if (Number(building.slotUsage || 0) > 0) return Number(building.slotUsage || 0);
  const level = clamp(Math.trunc(toNumber(building.level, 1)), 1, 5);
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

function assignmentKind(building) {
  if (building.category === "military" || building.category === "specialMilitary") return "military";
  if (Number(building.capacityProfessional || 0) > 0 || Number(building.capacityMilitia || 0) > 0) return "military";
  return "economic";
}

function slotKind(building) {
  if (building.slotType === "military") return "military";
  if (building.category === "military" || building.category === "specialMilitary") return "military";
  return "economic";
}

function buildWarnings(settlement, data, summary = calculateSettlement(settlement, data)) {
  const warnings = [];
  const overrides = settlement.manualOverrides || {};

  if (summary.rawFreePop < 0 && !overrides.ignorePopulationLimits) warnings.push(`Assigned POP exceeds Total POP by ${formatNumber(Math.abs(summary.rawFreePop))}.`);
  if (summary.mpUsed > summary.totalMp && !overrides.ignoreManpowerLimits) warnings.push(`MP used exceeds Total MP by ${formatNumber(summary.mpUsed - summary.totalMp)}.`);
  if (summary.professionalSoldiers > summary.professionalCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Professional soldiers exceed military capacity by ${formatNumber(summary.professionalSoldiers - summary.professionalCapacity)}.`);
  if (summary.militia > summary.militiaCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Militia exceeds militia capacity by ${formatNumber(summary.militia - summary.militiaCapacity)}.`);
  if (summary.usedEconomicSlots > summary.economicSlots && !overrides.ignoreSlotLimits) warnings.push(`Economic building slots exceeded by ${formatNumber(summary.usedEconomicSlots - summary.economicSlots)}.`);
  if (summary.usedMilitarySlots > summary.militarySlots && !overrides.ignoreSlotLimits) warnings.push(`Military building slots exceeded by ${formatNumber(summary.usedMilitarySlots - summary.militarySlots)}.`);

  for (const building of settlement.buildings) {
    if (!building.active) continue;
    if (Number(building.assignedPop || 0) > workerCapacityForLevel(building)) warnings.push(`${building.name}: workers exceed level capacity.`);
    if (building.basePopRequirement && settlement.population.total < building.basePopRequirement * Math.pow(2, Math.max(0, building.level - 1)) && !overrides.ignoreBuildingRequirements) {
      warnings.push(`${building.name}: population requirement is not met.`);
    }
    if (!terrainRequirementMet(building, settlement) && !overrides.ignoreBuildingRequirements) warnings.push(`${building.name}: terrain requirement is not met.`);
  }

  for (const project of settlement.construction) {
    if (project.status !== "completed" && Number(project.crownPaid || 0) < Number(project.requiredCrown || 0)) warnings.push(`${project.name}: Crown payment is incomplete.`);
    if (project.status !== "completed" && Number(project.cpPaid || 0) < Number(project.requiredCp || 0)) warnings.push(`${project.name}: CP payment is incomplete.`);
  }

  return warnings;
}

function terrainRequirementMet(building, settlement) {
  const terrain = cleanString(building.terrain).toLowerCase();
  if (!terrain || terrain === "any" || terrain === "any settlement") return true;
  const tags = [...(settlement.terrainTags || []), ...(settlement.biomeTags || []), settlement.region, settlement.type]
    .map(tag => cleanString(tag).toLowerCase())
    .filter(Boolean);
  return tags.some(tag => terrain.includes(tag) || tag.includes(terrain));
}

function upsertDeLaurent(data) {
  const next = defaultDeLaurentSettlement();
  const index = data.settlements.findIndex(settlement => settlement.id === next.id);
  if (index >= 0) data.settlements[index] = next;
  else data.settlements.unshift(next);
}

function requireGM(user) {
  if (!user?.isGM) throw new Error("This ADS action is GM only.");
}

function findSettlement(data, settlementId) {
  return findById(data.settlements, settlementId, "Settlement");
}

function findById(items, id, label = "Item") {
  const item = items.find(candidate => candidate.id === id);
  if (!item) throw new Error(`${label} not found.`);
  return item;
}

function deleteById(items, id) {
  const index = items.findIndex(item => item.id === id);
  if (index >= 0) items.splice(index, 1);
}

function troopType(key) {
  return TROOP_TYPES.find(type => type.key === key) || TROOP_TYPES[0];
}

function categoryLabel(category) {
  return BUILDING_CATEGORIES.find(option => option.value === category)?.label || "Special";
}

function normalizeCategory(value) {
  const clean = cleanString(value);
  return BUILDING_CATEGORIES.some(option => option.value === clean) ? clean : "economic";
}

function statusValue(value) {
  const clean = cleanString(value);
  return PROJECT_STATUSES.some(option => option.value === clean) ? clean : "planned";
}

function ownerNames(settlement) {
  const names = (settlement.ownerUserIds || []).map(userName).filter(Boolean);
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
  uiState.activeTab = cleanString(state.activeTab) || uiState.activeTab;
  uiState.selectedSettlementId = cleanString(state.selectedSettlementId);
  uiState.search = cleanString(state.search);
}

function persistClientState() {
  game.settings.set(MODULE_ID, CLIENT_SETTING, {
    activeTab: uiState.activeTab,
    selectedSettlementId: uiState.selectedSettlementId,
    search: uiState.search
  });
}

function splitTags(value) {
  if (Array.isArray(value)) return value.map(cleanString).filter(Boolean);
  return cleanString(value).split(",").map(item => item.trim()).filter(Boolean);
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

function clone(value) {
  return foundry.utils.deepClone(value);
}

function randomId() {
  return foundry.utils.randomID();
}
