const MODULE_ID = "ds";
const DATA_SETTING = "worldData";
const CLIENT_SETTING = "clientState";
const SOCKET_NAME = `module.${MODULE_ID}`;
const TEMPLATE_PATH = `modules/${MODULE_ID}/templates/ds-panel.hbs`;
const ACTION_CONFIRM_TIMEOUT_MS = 15000;
const DIRECT_RECRUITMENT_SOURCE = "__direct__";
const SCHEMA_VERSION = 3;

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

const UNIT_QUALITIES = [
  { value: 1, label: "Levy" },
  { value: 2, label: "Trained" },
  { value: 3, label: "Veteran" },
  { value: 4, label: "Elite" },
  { value: 5, label: "Legendary" }
];

const EVENT_SEVERITIES = [
  { value: "disaster", label: "Disaster" },
  { value: "setback", label: "Setback" },
  { value: "neutral", label: "Quiet" },
  { value: "opportunity", label: "Opportunity" },
  { value: "boon", label: "Boon" }
];

const TROOP_TYPES = [
  unit("militia", "Militia", "militia", 150, 2, 6, 1, "Rapidly raised local levies.", { quality: 1, melee: 2, ranged: 1, defense: 2, morale: 2, mobility: 3, charge: 1, siege: 0 }),
  unit("watchman", "Watchman / Guard", "professional", 350, 8, 20, 1, "Local guards trained for settlement defense.", { quality: 2, melee: 3, ranged: 1, defense: 4, morale: 4, mobility: 3, charge: 1, siege: 0 }),
  unit("spearman", "Spearman", "professional", 500, 14, 38, 2, "Shielded line infantry trained to hold ground.", { quality: 2, melee: 5, ranged: 1, defense: 6, morale: 5, mobility: 3, charge: 2, siege: 0 }),
  unit("men-at-arms", "Man-at-Arms", "professional", 800, 24, 64, 2, "Disciplined professional infantry.", { quality: 2, melee: 6, ranged: 1, defense: 7, morale: 6, mobility: 3, charge: 3, siege: 0 }),
  unit("archer", "Archer", "professional", 700, 21, 56, 2, "Ranged troops trained in the archery branch.", { quality: 2, melee: 2, ranged: 6, defense: 3, morale: 5, mobility: 4, charge: 1, siege: 0 }),
  unit("crossbowman", "Crossbowman", "professional", 1100, 33, 88, 3, "Armored ranged troops requiring an advanced range.", { quality: 3, melee: 3, ranged: 7, defense: 5, morale: 6, mobility: 3, charge: 1, siege: 1 }),
  unit("sergeant", "Sergeant", "professional", 1800, 54, 144, 3, "Veteran infantry leaders and retainers.", { quality: 3, melee: 7, ranged: 2, defense: 7, morale: 8, mobility: 4, charge: 4, siege: 1 }),
  unit("mounted-scout", "Mounted Scout", "professional", 1600, 48, 128, 3, "Fast mounted troops trained at a stable.", { quality: 3, melee: 4, ranged: 4, defense: 4, morale: 6, mobility: 8, charge: 5, siege: 0 }),
  unit("cavalry", "Cavalry Trooper", "professional", 3000, 90, 240, 4, "Professional cavalry requiring a developed stable branch.", { quality: 4, melee: 7, ranged: 1, defense: 6, morale: 7, mobility: 8, charge: 8, siege: 0, requiredTags: ["horses"] }),
  unit("knight", "Knight", "professional", 7000, 210, 560, 5, "Elite armored cavalry and noble retainers.", { quality: 5, melee: 9, ranged: 1, defense: 9, morale: 9, mobility: 7, charge: 10, siege: 1, requiredTags: ["horses"], special: true, maxPerSettlement: 200 }),
  unit("siege-crew", "Siege Crew", "professional", 2500, 75, 200, 3, "Engineers and crew trained for siege equipment.", { quality: 3, melee: 2, ranged: 2, defense: 3, morale: 6, mobility: 2, charge: 0, siege: 10, requiredTags: ["iron"] })
];

const BUILDING_CATALOG = [
  eco("land-clearance", "Land Clearance", "Any", 10, 25, 20000, 800, { chainId: "land", nodeTier: 1, materialCost: 100, buildingUpkeep: 750, foodOutput: 250, materialsOutput: 50, uniqueChain: true }),
  eco("farmstead", "Farmstead", "Farmlands or Plains", 20, 35, 65000, 2500, { chainId: "land", nodeTier: 2, parentIds: ["land-clearance"], materialCost: 500, buildingUpkeep: 2500, foodOutput: 900, growth: 0.2, settlementTier: "village", uniqueChain: true }),
  eco("grain-estate", "Grain Estate", "Farmlands or Plains", 35, 55, 220000, 8000, { chainId: "land", nodeTier: 3, parentIds: ["farmstead"], materialCost: 1800, buildingUpkeep: 9000, foodOutput: 2200, growth: 0.35, settlementTier: "town", uniqueChain: true }),
  eco("tannery", "Tannery Quarter", "Any", 30, 140, 210000, 7500, { chainId: "land", nodeTier: 3, parentIds: ["farmstead"], flatOutput: 5000, materialCost: 1600, buildingUpkeep: 10000, materialsOutput: 1100, settlementTier: "town", uniqueChain: true }),
  eco("horse-ranch", "Horse Ranch", "Plains or Grassland", 30, 90, 260000, 8500, { chainId: "land", nodeTier: 3, parentIds: ["farmstead"], flatOutput: 3000, materialCost: 1900, buildingUpkeep: 12000, foodOutput: 1300, materialsOutput: 400, grantsTags: ["horses"], recruitmentDiscount: 5, settlementTier: "town", uniqueChain: true }),
  eco("grand-granary", "Grand Granary", "Any", 45, 70, 700000, 24000, { chainId: "land", nodeTier: 4, parentIds: ["grain-estate"], flatOutput: 10000, materialCost: 6000, buildingUpkeep: 30000, foodOutput: 5000, growth: 0.6, publicOrder: 3, mitigationTags: ["famine"], settlementTier: "city", uniqueChain: true }),
  eco("leatherworkers-guild", "Leatherworkers Guild", "Any", 45, 280, 680000, 22000, { chainId: "land", nodeTier: 4, parentIds: ["tannery"], flatOutput: 18000, materialCost: 5500, buildingUpkeep: 34000, materialsOutput: 2800, upkeepDiscount: 3, settlementTier: "city", uniqueChain: true }),
  eco("royal-stud", "Royal Stud", "Plains or Grassland", 45, 220, 850000, 26000, { chainId: "land", nodeTier: 4, parentIds: ["horse-ranch"], flatOutput: 15000, materialCost: 7000, buildingUpkeep: 42000, foodOutput: 2500, materialsOutput: 800, grantsTags: ["horses"], recruitmentDiscount: 10, settlementTier: "city", uniqueChain: true }),
  eco("agrarian-heartland", "Agrarian Heartland", "Any", 70, 180, 2600000, 75000, { chainId: "land", nodeTier: 5, parentIds: ["grand-granary"], flatOutput: 50000, materialCost: 22000, buildingUpkeep: 120000, foodOutput: 14000, growth: 1, publicOrder: 8, mitigationTags: ["famine", "migration"], special: true, settlementTier: "metropolis", uniqueChain: true }),
  eco("royal-manufactory", "Royal Manufactory", "Any", 70, 650, 2800000, 80000, { chainId: "land", nodeTier: 5, parentIds: ["leatherworkers-guild"], flatOutput: 90000, materialCost: 24000, buildingUpkeep: 145000, materialsOutput: 7500, upkeepDiscount: 8, special: true, settlementTier: "metropolis", uniqueChain: true }),
  eco("imperial-stud", "Imperial Stud", "Plains or Grassland", 65, 520, 3200000, 90000, { chainId: "land", nodeTier: 5, parentIds: ["royal-stud"], flatOutput: 80000, materialCost: 26000, buildingUpkeep: 170000, foodOutput: 5500, materialsOutput: 2500, grantsTags: ["horses"], recruitmentDiscount: 15, special: true, settlementTier: "metropolis", uniqueChain: true }),

  eco("survey-camp", "Survey Camp", "Any", 8, 20, 25000, 900, { chainId: "resource", nodeTier: 1, materialCost: 50, buildingUpkeep: 900, materialsOutput: 250, uniqueChain: true }),
  eco("stone-quarry", "Stone Quarry", "Hills or Mountains", 20, 40, 75000, 2700, { chainId: "resource", nodeTier: 2, parentIds: ["survey-camp"], materialCost: 400, buildingUpkeep: 3200, materialsOutput: 850, settlementTier: "village", uniqueChain: true }),
  eco("iron-mine", "Iron Mine", "Iron, Hills, or Mountains", 20, 55, 90000, 3000, { chainId: "resource", nodeTier: 2, parentIds: ["survey-camp"], materialCost: 450, buildingUpkeep: 4000, materialsOutput: 700, grantsTags: ["iron"], settlementTier: "village", uniqueChain: true }),
  eco("masonry-district", "Masonry District", "Any", 35, 130, 240000, 8500, { chainId: "resource", nodeTier: 3, parentIds: ["stone-quarry"], flatOutput: 5000, materialCost: 1700, buildingUpkeep: 11000, materialsOutput: 1800, constructionBonus: 100, settlementTier: "town", uniqueChain: true }),
  eco("ironworks", "Ironworks", "Any", 35, 170, 280000, 9500, { chainId: "resource", nodeTier: 3, parentIds: ["iron-mine"], flatOutput: 7000, materialCost: 2000, buildingUpkeep: 14000, materialsOutput: 1700, grantsTags: ["iron"], recruitmentDiscount: 3, settlementTier: "town", uniqueChain: true }),
  eco("builders-guild", "Builders Guild", "Any", 50, 320, 780000, 26000, { chainId: "resource", nodeTier: 4, parentIds: ["masonry-district"], flatOutput: 20000, materialCost: 6500, buildingUpkeep: 38000, materialsOutput: 4300, constructionBonus: 350, settlementTier: "city", uniqueChain: true }),
  eco("grand-foundry", "Grand Foundry", "Any", 50, 420, 900000, 30000, { chainId: "resource", nodeTier: 4, parentIds: ["ironworks"], flatOutput: 26000, materialCost: 7500, buildingUpkeep: 48000, materialsOutput: 4000, grantsTags: ["iron"], recruitmentDiscount: 7, upkeepDiscount: 4, settlementTier: "city", uniqueChain: true }),
  eco("monumental-works", "Monumental Works", "Any", 80, 850, 3000000, 85000, { chainId: "resource", nodeTier: 5, parentIds: ["builders-guild"], flatOutput: 100000, materialCost: 26000, buildingUpkeep: 155000, materialsOutput: 11500, constructionBonus: 1100, publicOrder: 5, special: true, settlementTier: "metropolis", uniqueChain: true }),
  eco("industrial-complex", "Industrial Complex", "Any", 80, 1050, 3400000, 95000, { chainId: "resource", nodeTier: 5, parentIds: ["grand-foundry"], flatOutput: 120000, materialCost: 30000, buildingUpkeep: 190000, materialsOutput: 10000, grantsTags: ["iron"], recruitmentDiscount: 12, upkeepDiscount: 8, special: true, settlementTier: "metropolis", uniqueChain: true }),

  eco("trading-post", "Trading Post", "Any", 10, 75, 30000, 1000, { chainId: "commerce", nodeTier: 1, flatOutput: 1000, materialCost: 100, buildingUpkeep: 800, uniqueChain: true }),
  eco("market-town", "Market District", "Any", 20, 150, 85000, 2800, { chainId: "commerce", nodeTier: 2, parentIds: ["trading-post"], flatOutput: 4000, materialCost: 500, buildingUpkeep: 2500, settlementTier: "village", uniqueChain: true }),
  eco("river-jetty", "River Jetty", "Coast, River, or Lake", 20, 110, 95000, 3200, { chainId: "commerce", nodeTier: 2, parentIds: ["trading-post"], flatOutput: 2500, materialCost: 650, buildingUpkeep: 3000, foodOutput: 600, settlementTier: "village", uniqueChain: true }),
  eco("merchants-guild", "Merchants Guild", "Any", 35, 300, 260000, 9000, { chainId: "commerce", nodeTier: 3, parentIds: ["market-town"], flatOutput: 12000, materialCost: 1800, buildingUpkeep: 7000, settlementTier: "town", uniqueChain: true }),
  eco("trade-harbor", "Trade Harbor", "Coast, River, or Lake", 40, 260, 320000, 10500, { chainId: "commerce", nodeTier: 3, parentIds: ["river-jetty"], flatOutput: 10000, materialCost: 2400, buildingUpkeep: 9500, foodOutput: 1400, materialsOutput: 300, settlementTier: "town", uniqueChain: true }),
  eco("grand-bazaar", "Grand Bazaar", "Any", 50, 600, 850000, 28000, { chainId: "commerce", nodeTier: 4, parentIds: ["merchants-guild"], flatOutput: 40000, materialCost: 7000, buildingUpkeep: 22000, publicOrder: 2, settlementTier: "city", uniqueChain: true }),
  eco("grand-harbor", "Grand Harbor", "Coast, River, or Lake", 60, 520, 980000, 32000, { chainId: "commerce", nodeTier: 4, parentIds: ["trade-harbor"], flatOutput: 35000, materialCost: 8500, buildingUpkeep: 30000, foodOutput: 3000, materialsOutput: 1000, settlementTier: "city", uniqueChain: true }),
  eco("world-market", "World Market", "Any", 75, 1200, 3200000, 90000, { chainId: "commerce", nodeTier: 5, parentIds: ["grand-bazaar"], flatOutput: 150000, materialCost: 26000, buildingUpkeep: 65000, publicOrder: 5, eventRollBonus: 3, special: true, settlementTier: "metropolis", uniqueChain: true }),
  eco("imperial-port", "Imperial Port", "Coast, River, or Lake", 85, 1050, 3600000, 100000, { chainId: "commerce", nodeTier: 5, parentIds: ["grand-harbor"], flatOutput: 135000, materialCost: 30000, buildingUpkeep: 85000, foodOutput: 7500, materialsOutput: 3500, eventRollBonus: 2, special: true, settlementTier: "metropolis", uniqueChain: true }),

  eco("village-commons", "Village Commons", "Any", 6, 15, 18000, 700, { chainId: "civic", nodeTier: 1, materialCost: 80, buildingUpkeep: 1200, publicOrder: 3, eventRollBonus: 1, uniqueChain: true }),
  eco("tavern-quarter", "Tavern Quarter", "Any", 15, 95, 70000, 2400, { chainId: "civic", nodeTier: 2, parentIds: ["village-commons"], flatOutput: 2000, materialCost: 450, buildingUpkeep: 4500, publicOrder: 6, settlementTier: "village", uniqueChain: true }),
  eco("shrine-district", "Shrine District", "Any", 12, 45, 75000, 2600, { chainId: "civic", nodeTier: 2, parentIds: ["village-commons"], flatOutput: 800, materialCost: 500, buildingUpkeep: 5000, publicOrder: 8, growth: 0.15, settlementTier: "village", uniqueChain: true }),
  eco("festival-hall", "Festival Hall", "Any", 25, 180, 230000, 8000, { chainId: "civic", nodeTier: 3, parentIds: ["tavern-quarter"], flatOutput: 6000, materialCost: 1700, buildingUpkeep: 15000, publicOrder: 12, eventRollBonus: 2, settlementTier: "town", uniqueChain: true }),
  eco("temple-school", "Temple School", "Any", 25, 120, 250000, 8500, { chainId: "civic", nodeTier: 3, parentIds: ["shrine-district"], flatOutput: 3000, materialCost: 1900, buildingUpkeep: 16000, publicOrder: 14, growth: 0.35, mitigationTags: ["plague", "unrest"], settlementTier: "town", uniqueChain: true }),
  eco("grand-theatre", "Grand Theatre", "Any", 40, 380, 720000, 24000, { chainId: "civic", nodeTier: 4, parentIds: ["festival-hall"], flatOutput: 18000, materialCost: 6000, buildingUpkeep: 52000, publicOrder: 20, eventRollBonus: 4, settlementTier: "city", uniqueChain: true }),
  eco("cathedral-academy", "Cathedral Academy", "Any", 40, 260, 760000, 26000, { chainId: "civic", nodeTier: 4, parentIds: ["temple-school"], flatOutput: 10000, materialCost: 6500, buildingUpkeep: 58000, publicOrder: 22, growth: 0.65, mitigationTags: ["plague", "unrest", "famine"], settlementTier: "city", uniqueChain: true }),
  eco("cultural-capital", "Cultural Capital", "Any", 65, 800, 2900000, 82000, { chainId: "civic", nodeTier: 5, parentIds: ["grand-theatre"], flatOutput: 65000, materialCost: 23000, buildingUpkeep: 210000, publicOrder: 35, eventRollBonus: 8, special: true, settlementTier: "metropolis", uniqueChain: true }),
  eco("sacred-university", "Sacred University", "Any", 65, 620, 3100000, 88000, { chainId: "civic", nodeTier: 5, parentIds: ["cathedral-academy"], flatOutput: 50000, materialCost: 25000, buildingUpkeep: 230000, publicOrder: 38, growth: 1, mitigationTags: ["plague", "unrest", "famine", "migration"], special: true, settlementTier: "metropolis", uniqueChain: true }),

  mil("muster-field", "Muster Field", 8, 30000, 1200, { chainId: "recruitment", nodeTier: 1, materialCost: 200, buildingUpkeep: 1500, professionalCapacity: 25, militiaCapacity: 120, canRecruit: true, recruitPerLevel: 20, recruitableUnitIds: ["militia", "watchman"], defense: 10, uniqueChain: true }),
  mil("infantry-yard", "Infantry Yard", 15, 90000, 3200, { chainId: "recruitment", nodeTier: 2, parentIds: ["muster-field"], materialCost: 800, buildingUpkeep: 5000, professionalCapacity: 180, militiaCapacity: 150, canRecruit: true, recruitPerLevel: 18, recruitableUnitIds: ["watchman", "spearman", "men-at-arms"], defense: 18, settlementTier: "village", uniqueChain: true }),
  mil("archery-range", "Archery Range", 15, 90000, 3200, { chainId: "recruitment", nodeTier: 2, parentIds: ["muster-field"], materialCost: 800, buildingUpkeep: 5000, professionalCapacity: 150, militiaCapacity: 120, canRecruit: true, recruitPerLevel: 18, recruitableUnitIds: ["watchman", "archer"], defense: 14, settlementTier: "village", uniqueChain: true }),
  mil("drill-hall", "Drill Hall", 25, 280000, 9500, { chainId: "recruitment", nodeTier: 3, parentIds: ["infantry-yard"], materialCost: 2400, buildingUpkeep: 16000, professionalCapacity: 380, militiaCapacity: 200, canRecruit: true, recruitPerLevel: 30, recruitableUnitIds: ["spearman", "men-at-arms", "sergeant"], defense: 28, settlementTier: "town", uniqueChain: true }),
  mil("stable", "Stable Compound", 25, 340000, 11000, { chainId: "recruitment", nodeTier: 3, parentIds: ["infantry-yard"], terrain: "Horses, Plains, or Grassland", materialCost: 2800, buildingUpkeep: 20000, professionalCapacity: 280, canRecruit: true, recruitPerLevel: 12, recruitableUnitIds: ["mounted-scout"], requiredTagsAny: ["horses", "plains", "grassland"], defense: 20, settlementTier: "town", uniqueChain: true }),
  mil("marksmen-range", "Marksmen Range", 25, 300000, 10000, { chainId: "recruitment", nodeTier: 3, parentIds: ["archery-range"], materialCost: 2500, buildingUpkeep: 17500, professionalCapacity: 320, canRecruit: true, recruitPerLevel: 28, recruitableUnitIds: ["archer", "crossbowman"], defense: 22, settlementTier: "town", uniqueChain: true }),
  mil("royal-barracks", "Royal Barracks", 40, 850000, 28000, { chainId: "recruitment", nodeTier: 4, parentIds: ["drill-hall"], materialCost: 7500, buildingUpkeep: 52000, professionalCapacity: 800, militiaCapacity: 300, canRecruit: true, recruitPerLevel: 55, recruitableUnitIds: ["spearman", "men-at-arms", "sergeant"], defense: 45, upkeepDiscount: 5, settlementTier: "city", uniqueChain: true }),
  mil("cavalry-yard", "Cavalry Yard", 40, 980000, 32000, { chainId: "recruitment", nodeTier: 4, parentIds: ["stable"], materialCost: 8500, buildingUpkeep: 65000, professionalCapacity: 600, canRecruit: true, recruitPerLevel: 24, recruitableUnitIds: ["mounted-scout", "cavalry"], requiredTagsAny: ["horses"], defense: 38, settlementTier: "city", uniqueChain: true }),
  mil("rangers-lodge", "Rangers Lodge", 40, 900000, 30000, { chainId: "recruitment", nodeTier: 4, parentIds: ["marksmen-range"], materialCost: 8000, buildingUpkeep: 58000, professionalCapacity: 650, canRecruit: true, recruitPerLevel: 48, recruitableUnitIds: ["archer", "crossbowman", "sergeant"], defense: 35, settlementTier: "city", uniqueChain: true }),
  mil("war-college", "War College", 70, 3400000, 95000, { chainId: "recruitment", nodeTier: 5, parentIds: ["royal-barracks"], materialCost: 30000, buildingUpkeep: 240000, professionalCapacity: 1800, militiaCapacity: 500, canRecruit: true, recruitPerLevel: 100, recruitableUnitIds: ["spearman", "men-at-arms", "sergeant"], defense: 80, upkeepDiscount: 12, special: true, settlementTier: "metropolis", uniqueChain: true }),
  mil("knightly-order", "Knightly Order", 65, 4000000, 110000, { chainId: "recruitment", nodeTier: 5, parentIds: ["cavalry-yard"], materialCost: 36000, buildingUpkeep: 300000, professionalCapacity: 1200, canRecruit: true, recruitPerLevel: 40, recruitableUnitIds: ["mounted-scout", "cavalry", "knight"], requiredTagsAny: ["horses"], defense: 75, recruitmentDiscount: 10, special: true, settlementTier: "metropolis", uniqueChain: true }),
  mil("imperial-marksmen", "Imperial Marksmen Academy", 65, 3600000, 100000, { chainId: "recruitment", nodeTier: 5, parentIds: ["rangers-lodge"], materialCost: 32000, buildingUpkeep: 260000, professionalCapacity: 1500, canRecruit: true, recruitPerLevel: 85, recruitableUnitIds: ["archer", "crossbowman", "sergeant"], defense: 65, special: true, settlementTier: "metropolis", uniqueChain: true }),

  mil("watch-post", "Watch Post", 5, 22000, 800, { chainId: "defense", nodeTier: 1, materialCost: 100, buildingUpkeep: 1000, defense: 20, publicOrder: 2, uniqueChain: true }),
  mil("palisade", "Palisade", 10, 70000, 2600, { chainId: "defense", nodeTier: 2, parentIds: ["watch-post"], materialCost: 700, buildingUpkeep: 4000, defense: 60, publicOrder: 3, mitigationTags: ["raid"], settlementTier: "village", uniqueChain: true }),
  mil("stone-walls", "Stone Walls", 20, 260000, 9000, { chainId: "defense", nodeTier: 3, parentIds: ["palisade"], materialCost: 3000, buildingUpkeep: 14000, defense: 160, publicOrder: 5, mitigationTags: ["raid"], settlementTier: "town", uniqueChain: true }),
  mil("citadel", "Citadel", 35, 900000, 30000, { chainId: "defense", nodeTier: 4, parentIds: ["stone-walls"], materialCost: 10000, buildingUpkeep: 60000, defense: 420, professionalCapacity: 250, publicOrder: 8, mitigationTags: ["raid", "unrest"], settlementTier: "city", uniqueChain: true }),
  mil("grand-fortress", "Grand Fortress", 60, 3800000, 105000, { chainId: "defense", nodeTier: 5, parentIds: ["citadel"], materialCost: 38000, buildingUpkeep: 280000, defense: 1100, professionalCapacity: 700, publicOrder: 15, mitigationTags: ["raid", "unrest", "disaster"], special: true, settlementTier: "metropolis", uniqueChain: true }),

  mil("engineer-camp", "Engineer Camp", 8, 28000, 1000, { chainId: "siege", nodeTier: 1, materialCost: 150, buildingUpkeep: 1400, materialsOutput: 80, constructionBonus: 20, uniqueChain: true }),
  mil("siege-yard", "Siege Yard", 15, 85000, 3000, { chainId: "siege", nodeTier: 2, parentIds: ["engineer-camp"], materialCost: 850, buildingUpkeep: 5200, materialsOutput: 200, constructionBonus: 60, settlementTier: "village", uniqueChain: true }),
  mil("siege-workshop", "Siege Workshop", 25, 300000, 10500, { chainId: "siege", nodeTier: 3, parentIds: ["siege-yard"], materialCost: 2800, buildingUpkeep: 18000, materialsOutput: 500, professionalCapacity: 120, canRecruit: true, recruitPerLevel: 8, recruitableUnitIds: ["siege-crew"], constructionBonus: 140, requiredTagsAny: ["iron"], settlementTier: "town", uniqueChain: true }),
  mil("royal-arsenal", "Royal Arsenal", 40, 920000, 31000, { chainId: "siege", nodeTier: 4, parentIds: ["siege-workshop"], materialCost: 9000, buildingUpkeep: 65000, materialsOutput: 1200, professionalCapacity: 320, canRecruit: true, recruitPerLevel: 18, recruitableUnitIds: ["siege-crew", "sergeant"], constructionBonus: 320, requiredTagsAny: ["iron"], settlementTier: "city", uniqueChain: true }),
  mil("grand-arsenal", "Grand Arsenal", 65, 3900000, 108000, { chainId: "siege", nodeTier: 5, parentIds: ["royal-arsenal"], materialCost: 36000, buildingUpkeep: 290000, materialsOutput: 3500, professionalCapacity: 800, canRecruit: true, recruitPerLevel: 40, recruitableUnitIds: ["siege-crew", "sergeant"], constructionBonus: 800, requiredTagsAny: ["iron"], defense: 100, special: true, settlementTier: "metropolis", uniqueChain: true }),

  mil("manor-house", "Manor House", 4, 20000, 700, { chainId: "laurent-estate", nodeTier: 1, materialCost: 100, buildingUpkeep: 1000, professionalCapacity: 50, militiaCapacity: 20, canRecruit: true, recruitPerLevel: 8, recruitableUnitIds: ["militia", "watchman"], bonusEconomicSlots: 1, special: true, gmOnly: true, uniqueChain: true }),
  mil("laurent-manor", "Laurent Manor", 5, 0, 0, { chainId: "laurent-estate", nodeTier: 2, parentIds: ["manor-house"], materialCost: 0, buildingUpkeep: 6000, slotUse: 2, professionalCapacity: 200, militiaCapacity: 100, canRecruit: true, recruitPerLevel: 20, recruitableUnitIds: ["militia", "watchman", "spearman", "men-at-arms", "archer"], bonusEconomicSlots: 2, defense: 100, publicOrder: 6, special: true, gmOnly: true, settlementTier: "village", uniqueChain: true, notes: "De Laurent's fortified noble estate; preserved as a player settlement building." }),
  mil("fortified-estate", "Fortified Estate", 18, 420000, 14000, { chainId: "laurent-estate", nodeTier: 3, parentIds: ["laurent-manor"], materialCost: 3500, buildingUpkeep: 28000, professionalCapacity: 450, militiaCapacity: 250, canRecruit: true, recruitPerLevel: 35, recruitableUnitIds: ["militia", "watchman", "spearman", "men-at-arms", "archer", "sergeant"], bonusEconomicSlots: 2, defense: 240, publicOrder: 10, special: true, gmOnly: true, settlementTier: "town", uniqueChain: true }),
  mil("ducal-seat", "Ducal Seat", 35, 1200000, 38000, { chainId: "laurent-estate", nodeTier: 4, parentIds: ["fortified-estate"], materialCost: 11000, buildingUpkeep: 85000, professionalCapacity: 900, militiaCapacity: 450, canRecruit: true, recruitPerLevel: 60, recruitableUnitIds: ["watchman", "spearman", "men-at-arms", "archer", "sergeant", "cavalry"], bonusEconomicSlots: 3, bonusMilitarySlots: 1, defense: 520, publicOrder: 18, special: true, gmOnly: true, settlementTier: "city", uniqueChain: true }),
  mil("grand-domain", "Grand Domain", 60, 4500000, 120000, { chainId: "laurent-estate", nodeTier: 5, parentIds: ["ducal-seat"], materialCost: 42000, buildingUpkeep: 320000, professionalCapacity: 2000, militiaCapacity: 900, canRecruit: true, recruitPerLevel: 100, recruitableUnitIds: ["watchman", "spearman", "men-at-arms", "archer", "crossbowman", "sergeant", "cavalry", "knight"], bonusEconomicSlots: 4, bonusMilitarySlots: 2, defense: 1300, publicOrder: 30, eventRollBonus: 5, special: true, gmOnly: true, settlementTier: "metropolis", uniqueChain: true })
];

const LEGACY_BUILDING_IDS = [
  "lumber-camp", "sawmill", "carpenters-guild", "shipwright-yard", "hunting-lodge", "leatherworker-workshop",
  "masons-yard", "bloomery", "weaponsmith", "armorer", "high-yield-crop-field", "grain-mill", "estate-farms",
  "cattle-ranch", "stockyards", "horse-breeding-stable", "fishing-wharf", "harbor", "shipyard", "orchard-farm",
  "cider-mill", "vintners-guild", "herbalist-garden", "apothecary", "physicians-guild", "village-market",
  "market-hall", "trade-depot", "royal-exchange", "warehouse", "barracks", "town-watch-post", "guard-house",
  "garrison-command", "engineers-yard", "knightly-stables"
];

const LEGACY_BUILDING_MAP = {
  "lumber-camp": "survey-camp",
  "hunting-lodge": "tannery",
  "cattle-ranch": "horse-ranch",
  "high-yield-crop-field": "farmstead",
  "grain-mill": "grain-estate",
  "barracks": "muster-field",
  "town-watch-post": "watch-post",
  "engineers-yard": "engineer-camp"
};

const EVENT_CATALOG = [
  monthEvent("catastrophic-fire", "Catastrophic Fire", 1, 5, "disaster", "A major fire tears through workshops and storehouses.", { crown: -30000, food: -300, materials: -700, publicOrder: -12 }, { tags: ["disaster"], mitigationTags: ["disaster"] }),
  monthEvent("devastating-raid", "Devastating Raid", 6, 14, "disaster", "Raiders strike the settlement and carry away supplies.", { crown: -22000, food: -500, materials: -350, publicOrder: -10 }, { tags: ["raid"], mitigationTags: ["raid"], defenseDivisor: 20 }),
  monthEvent("failed-harvest", "Failed Harvest", 15, 24, "setback", "Poor weather and blight reduce the month's food stores.", { food: -700, publicOrder: -6, population: -2 }, { tags: ["famine"], mitigationTags: ["famine"] }),
  monthEvent("labor-dispute", "Labor Dispute", 25, 34, "setback", "Workers demand concessions and projects lose momentum.", { crown: -10000, materials: -150, publicOrder: -5 }, { tags: ["unrest"], mitigationTags: ["unrest"] }),
  monthEvent("quiet-month", "Quiet Month", 35, 58, "neutral", "The month passes without a major disturbance.", { publicOrder: 1 }),
  monthEvent("local-festival", "Local Festival", 59, 70, "opportunity", "A successful festival draws visitors and raises morale.", { crown: 12000, food: -150, publicOrder: 6 }, { tags: ["culture"] }),
  monthEvent("merchant-caravan", "Merchant Caravan", 71, 82, "opportunity", "A wealthy caravan chooses the settlement as its seasonal market.", { crown: 25000, materials: 250, publicOrder: 2 }, { tags: ["trade"] }),
  monthEvent("abundant-harvest", "Abundant Harvest", 83, 91, "boon", "Favorable conditions produce an exceptional harvest.", { food: 1200, crown: 15000, population: 4, publicOrder: 4 }, { tags: ["migration"] }),
  monthEvent("royal-contract", "Royal Contract", 92, 97, "boon", "A prestigious contract brings money, materials, and skilled labor.", { crown: 50000, materials: 900, publicOrder: 5 }),
  monthEvent("golden-month", "Golden Month", 98, 100, "boon", "Trade, harvest, and civic confidence all peak at once.", { crown: 100000, food: 1800, materials: 1500, population: 10, publicOrder: 10 }, { tags: ["migration", "trade"] })
];

let dsApp = null;
const pendingActionRequests = new Map();
let actionQueue = Promise.resolve();

const uiState = {
  activeTab: "overview",
  selectedSettlementId: "",
  search: "",
  constructionCategory: "all",
  constructionSearch: "",
  catalogKind: "buildings",
  catalogSearch: ""
};

function unit(id, name, role, recruitCost, garrison, campaign, tier, description, extra = {}) {
  return {
    id,
    name,
    role,
    recruitCost,
    garrison,
    campaign,
    tier,
    quality: 1,
    melee: 1,
    ranged: 1,
    defense: 1,
    morale: 1,
    mobility: 1,
    charge: 0,
    siege: 0,
    powerModifier: 0,
    manpowerCost: 1,
    requiredTags: [],
    special: false,
    maxPerSettlement: 0,
    useRuleUpkeep: true,
    enabled: true,
    imageUrl: "",
    actorUuid: "",
    description,
    ...extra
  };
}

function monthEvent(id, name, minRoll, maxRoll, severity, description, effects = {}, extra = {}) {
  return {
    id,
    name,
    minRoll,
    maxRoll,
    severity,
    description,
    effects: {
      crown: 0,
      food: 0,
      materials: 0,
      population: 0,
      publicOrder: 0,
      ...effects
    },
    tags: [],
    mitigationTags: [],
    defenseDivisor: 0,
    enabled: true,
    imageUrl: "",
    ...extra
  };
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
    materialCost: 0,
    foodCost: 0,
    foodOutput: 0,
    materialsOutput: 0,
    foodUpkeep: 0,
    materialsUpkeep: 0,
    publicOrder: 0,
    defense: 0,
    eventRollBonus: 0,
    grantsTags: [],
    requiredTagsAny: [],
    mitigationTags: [],
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
    uniqueChain: true,
    maxPerSettlement: 1,
    enabled: true,
    maxLevel: 5,
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
    materialCost: 0,
    foodCost: 0,
    foodOutput: 0,
    materialsOutput: 0,
    foodUpkeep: 0,
    materialsUpkeep: 0,
    publicOrder: 0,
    defense: 0,
    eventRollBonus: 0,
    grantsTags: [],
    requiredTagsAny: [],
    mitigationTags: [],
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
    uniqueChain: true,
    maxPerSettlement: 1,
    enabled: true,
    maxLevel: 5,
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
  const catalogEvents = data.eventCatalog
    .filter(item => !catalogSearch || [item.name, item.severity, item.description, ...(item.tags || [])].join(" ").toLowerCase().includes(catalogSearch))
    .map(catalogEventContext);

  return {
    moduleId: MODULE_ID,
    isGM,
    month: data.month,
    processedSettlementCount: data.settlements.filter(settlement => settlement.lastProcessedMonth === data.month).length,
    pendingSettlementCount: data.settlements.filter(settlement => settlement.lastProcessedMonth !== data.month).length,
    pendingWorldEventCount: data.settlements.reduce((total, settlement) => total + settlement.pendingEvents.filter(event => event.status === "pending").length, 0),
    hasWorldPendingEvents: data.settlements.some(settlement => settlement.pendingEvents.some(event => event.status === "pending")),
    activeTab: uiState.activeTab,
    search: uiState.search,
    constructionSearch: uiState.constructionSearch,
    constructionCategory: uiState.constructionCategory,
    catalogKind: uiState.catalogKind,
    catalogSearch: uiState.catalogSearch,
    catalogBuildingsActive: uiState.catalogKind === "buildings",
    catalogUnitsActive: uiState.catalogKind === "units",
    catalogEventsActive: uiState.catalogKind === "events",
    tabs,
    settlements: filtered.map(settlement => settlementListContext(settlement, data)),
    selected: selected ? selectedContext(selected, data, isGM) : null,
    userOptions: selected ? userOptions(selected) : [],
    catalog: data.catalog,
    catalogBuildings,
    catalogUnits,
    catalogEvents,
    gmBuildingOptions: data.catalog
      .filter(item => item.enabled)
      .sort((a, b) => a.category.localeCompare(b.category) || a.chainId.localeCompare(b.chainId) || a.nodeTier - b.nodeTier || a.name.localeCompare(b.name))
      .map(item => ({
        id: item.id,
        name: item.name,
        label: `${categoryLabel(item.category)} / ${tierName(item.settlementTier, data.rules)} / T${item.nodeTier} / ${item.name}`
      })),
    unitCatalog: data.unitCatalog,
    rules: rulesContext(data.rules),
    tierRules: data.rules.tiers.map(tier => tierRuleContext(tier)),
    settlementTemplates: data.settlementTemplates.map(template => ({
      ...template,
      isBuiltIn: starterSettlementTemplates().some(candidate => candidate.id === template.id),
      terrainTagsText: template.terrainTags.join(", "),
      biomeTagsText: template.biomeTags.join(", "),
      buildingCount: template.buildings.length,
      tierOptions: data.rules.tiers.map(tier => ({ ...tier, selected: tier.id === template.tier }))
    })),
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
    canProcessThisMonth: settlement.lastProcessedMonth !== data.month && !settlement.pendingEvents.some(event => event.status === "pending"),
    warnings: buildWarnings(settlement, data, summary).length
  };
}

function selectedContext(settlement, data, isGM) {
  const summary = calculateSettlement(settlement, data);
  const permissions = permissionsFor(settlement, isGM);
  const warnings = buildWarnings(settlement, data, summary);
  const note = settlement.turnNotes[game.user.id] || { text: "", authorName: game.user.name || "Player", updated: 0 };
  const buildingCards = settlement.buildings.map(building => buildingContext(building, settlement, data, permissions));
  const troopCards = settlement.troops.map(troop => troopContext(troop, permissions, data.unitCatalog, data.rules));
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
    food: formatNumber(settlement.food),
    foodValue: settlement.food,
    materials: formatNumber(settlement.materials),
    materialsValue: settlement.materials,
    publicOrderValue: settlement.publicOrder,
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
    districtStyle: settlement.districtBackgroundUrl ? `background-image: linear-gradient(rgba(9, 15, 13, ${settlement.backgroundOverlay / 100}), rgba(9, 15, 13, ${settlement.backgroundOverlay / 100})), url('${cssUrl(settlement.districtBackgroundUrl)}');` : "",
    tierOptions: data.rules.tiers.map(tier => ({ ...tier, selected: tier.id === settlement.tier })),
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
    pendingEvents: settlement.pendingEvents.filter(event => event.status === "pending").map(pendingEventContext),
    resolvedEvents: settlement.pendingEvents.filter(event => event.status !== "pending").map(pendingEventContext),
    hasPendingEvents: settlement.pendingEvents.some(event => event.status === "pending"),
    turnSnapshots: settlement.turnSnapshots.map(snapshot => ({ ...snapshot, createdLabel: new Date(snapshot.created).toLocaleString() })),
    hasTurnSnapshots: settlement.turnSnapshots.length > 0,
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
    civilianPopulation: formatNumber(summary.civilianPopulation),
    economicWorkers: formatNumber(summary.economicWorkers),
    militaryWorkers: formatNumber(summary.militaryWorkers),
    assignedWorkers: formatNumber(summary.assignedWorkers),
    freePop: formatNumber(summary.freePop),
    troopManpowerUsed: formatNumber(summary.troopManpowerUsed),
    manpowerPool: formatNumber(summary.manpowerPool),
    manpowerQueued: formatNumber(summary.manpowerQueued),
    manpowerAvailable: formatNumber(summary.manpowerAvailable),
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
    foodStored: formatNumber(summary.foodStored),
    foodProduction: formatNumber(summary.foodProduction),
    foodConsumption: formatNumber(summary.foodConsumption),
    foodBalance: formatSigned(summary.foodBalance),
    foodAfterTurn: formatNumber(summary.foodAfterTurn),
    materialsStored: formatNumber(summary.materialsStored),
    materialsProduction: formatNumber(summary.materialsProduction),
    materialsUpkeep: formatNumber(summary.materialsUpkeep),
    materialsBalance: formatSigned(summary.materialsBalance),
    materialsAfterTurn: formatNumber(summary.materialsAfterTurn),
    publicOrder: formatNumber(summary.effectivePublicOrder),
    defense: formatNumber(summary.defense),
    armyPower: formatNumber(summary.armyPower),
    garrisonPower: formatNumber(summary.garrisonPower),
    strategicTags: summary.strategicTags.join(", ") || "None",
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
    uniqueChainChecked: building.uniqueChain ? "checked" : "",
    hasImage: Boolean(building.imageUrl),
    output: formatNumber(output.total),
    foodOutputDisplay: formatNumber(output.food),
    materialsOutputDisplay: formatNumber(output.materials),
    staffingPercent: formatNumber(Math.round(output.staffing * 100)),
    grantsTagsText: building.grantsTags.join(", "),
    requiredTagsAnyText: building.requiredTagsAny.join(", "),
    mitigationTagsText: building.mitigationTags.join(", "),
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

function troopContext(troop, permissions, unitCatalog, rules = defaultRules()) {
  const type = troopType(troop.type, unitCatalog);
  const mode = troop.mode === "campaign" ? "campaign" : "garrison";
  const upkeep = troop.useRuleUpkeep ? unitUpkeepFromRules(type, rules) : { garrison: troop.garrisonCost, campaign: troop.campaignCost };
  const costPerTroop = mode === "campaign" ? upkeep.campaign : upkeep.garrison;
  return {
    ...troop,
    displayName: troop.name || type.name,
    typeName: type.name,
    hasImage: Boolean(troop.imageUrl),
    roleProfessionalSelected: troop.role === "professional",
    roleMilitiaSelected: troop.role === "militia",
    garrisonCostDisplay: formatNumber(upkeep.garrison),
    campaignCostDisplay: formatNumber(upkeep.campaign),
    cost: formatNumber(costPerTroop * troop.count),
    qualityLabel: UNIT_QUALITIES.find(option => option.value === type.quality)?.label || `Tier ${type.quality}`,
    combatRating: formatNumber(unitCombatRating(type)),
    power: formatNumber(regimentPower(troop, unitCatalog)),
    manpowerUse: formatNumber(troopManpowerUse(troop, unitCatalog)),
    melee: formatNumber(type.melee),
    ranged: formatNumber(type.ranged),
    defense: formatNumber(type.defense),
    morale: formatNumber(type.morale),
    mobility: formatNumber(type.mobility),
    charge: formatNumber(type.charge),
    siege: formatNumber(type.siege),
    hasActor: Boolean(troop.actorUuid || type.actorUuid),
    actorUuid: troop.actorUuid || type.actorUuid,
    useRuleUpkeepChecked: troop.useRuleUpkeep ? "checked" : "",
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
    requiredMaterialsDisplay: formatNumber(project.requiredMaterials),
    requiredFoodDisplay: formatNumber(project.requiredFood),
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
    uniqueChainChecked: item.uniqueChain ? "checked" : "",
    hasImage: Boolean(item.imageUrl),
    isBuiltIn: BUILDING_CATALOG.some(candidate => candidate.id === item.id),
    parentIdsText: item.parentIds.join(", "),
    grantsTagsText: item.grantsTags.join(", "),
    requiredTagsAnyText: item.requiredTagsAny.join(", "),
    mitigationTagsText: item.mitigationTags.join(", "),
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
    specialChecked: item.special ? "checked" : "",
    roleLabel: TROOP_ROLES.find(role => role.value === item.role)?.label || item.role,
    qualityLabel: UNIT_QUALITIES.find(quality => quality.value === item.quality)?.label || item.quality,
    combatRating: formatNumber(unitCombatRating(item)),
    requiredTagsText: item.requiredTags.join(", "),
    roleOptions: TROOP_ROLES.map(option => ({ ...option, selected: option.value === item.role })),
    qualityOptions: UNIT_QUALITIES.map(option => ({ ...option, selected: option.value === item.quality })),
    isBuiltIn: TROOP_TYPES.some(candidate => candidate.id === item.id),
    recruitCostDisplay: formatNumber(item.recruitCost),
    garrisonDisplay: formatNumber(upkeep.garrison),
    campaignDisplay: formatNumber(upkeep.campaign)
  };
}

function catalogEventContext(item) {
  return {
    ...item,
    enabledChecked: item.enabled ? "checked" : "",
    isBuiltIn: EVENT_CATALOG.some(candidate => candidate.id === item.id),
    severityLabel: EVENT_SEVERITIES.find(option => option.value === item.severity)?.label || item.severity,
    severityOptions: EVENT_SEVERITIES.map(option => ({ ...option, selected: option.value === item.severity })),
    tagsText: item.tags.join(", "),
    mitigationTagsText: item.mitigationTags.join(", "),
    hasImage: Boolean(item.imageUrl),
    effectsText: eventEffectsText(item.effects)
  };
}

function pendingEventContext(item) {
  return {
    ...item,
    severityLabel: EVENT_SEVERITIES.find(option => option.value === item.severity)?.label || item.severity,
    effectsText: eventEffectsText(item.effects),
    createdLabel: new Date(item.created).toLocaleString(),
    hasImage: Boolean(item.imageUrl)
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
    materialCostDisplay: formatNumber(cost.materials),
    foodCostDisplay: formatNumber(cost.food),
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
    const primaryBuilding = settlement.buildings.find(item => item.slotId === slot.id);
    const supportBuilding = settlement.buildings.find(item => (item.extraSlotIds || []).includes(slot.id));
    const building = primaryBuilding || supportBuilding;
    const primaryProject = settlement.projects.find(item => item.kind === "building" && item.slotId === slot.id && item.status !== "completed");
    const supportProject = settlement.projects.find(item => item.kind === "building" && (item.reservedSlotIds || []).includes(slot.id) && item.status !== "completed");
    const project = primaryProject || supportProject;
    const supportSlot = Boolean(supportBuilding || supportProject);
    const candidates = project ? [] : data.catalog
      .filter(item => item.enabled && (isGM || !item.gmOnly))
      .filter(item => category === "all" || item.category === category)
      .filter(item => !search || [item.name, item.chainId, item.terrain, item.notes].join(" ").toLowerCase().includes(search))
      .filter(item => !supportSlot)
      .filter(item => primaryBuilding ? item.parentIds.includes(primaryBuilding.catalogId) : item.parentIds.length === 0)
      .filter(item => slot.allowedCategory === "all" || item.category === slot.allowedCategory)
      .map(item => constructionOptionContext(item, settlement, permissions, summary, data, slot, primaryBuilding, isGM));
    return {
      ...slot,
      availableForDirectAdd: !building && !project,
      unlockedChecked: slot.unlocked ? "checked" : "",
      gmLockedChecked: slot.gmLocked ? "checked" : "",
      allowedCategoryOptions: SLOT_CATEGORIES.map(option => ({ ...option, selected: option.value === slot.allowedCategory })),
      occupied: Boolean(building),
      supportSlot,
      supportLabel: supportBuilding ? `Supports ${supportBuilding.name}` : supportProject ? `Reserved for ${supportProject.name}` : "",
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
      isRoot: item.parentIds.length === 0,
      parentNames: item.parentIds.map(id => data.catalog.find(parent => parent.id === id)?.name || id).join(", ") || "Chain Root",
      unlockNames: item.recruitableUnitIds.map(id => troopType(id, data.unitCatalog).name).join(", "),
      crownCostDisplay: formatNumber(item.crownCost),
      cpCostDisplay: formatNumber(item.cpCost),
      materialCostDisplay: formatNumber(item.materialCost),
      foodOutputDisplay: formatSigned(item.foodOutput),
      materialsOutputDisplay: formatSigned(item.materialsOutput)
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
  if (next && settlement.materials < next.promotionMaterials) reasons.push(`Needs ${formatNumber(next.promotionMaterials - settlement.materials)} more Materials.`);
  if (next && settlement.food < next.promotionFood) reasons.push(`Needs ${formatNumber(next.promotionFood - settlement.food)} more Food.`);
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
    promotionMaterialsDisplay: formatNumber(tier.promotionMaterials),
    promotionFoodDisplay: formatNumber(tier.promotionFood),
    slotUnlockCostDisplay: formatNumber(tier.slotUnlockCost)
  };
}

function rulesContext(rules) {
  return {
    ...rules,
    tiers: rules.tiers.map(tierRuleContext),
    economy: { ...rules.economy },
    construction: { ...rules.construction },
    military: { ...rules.military },
    growth: { ...rules.growth },
    events: { ...rules.events }
  };
}

function recruitableUnitsContext(settlement, data, permissions, summary, isGM) {
  const professionalQueued = settlement.recruitment
    .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === "professional")
    .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
  const militiaQueued = settlement.recruitment
    .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === "militia")
    .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
  return data.unitCatalog.filter(unit => unit.enabled).map(unit => {
    const upkeep = unitUpkeepFromRules(unit, data.rules);
    const sources = recruitmentSources(settlement, unit.id, isGM);
    const discount = settlementRecruitmentDiscount(settlement, null, data.rules);
    const effectiveRecruitCost = Math.max(0, Math.round(unit.recruitCost * (1 - discount / 100)));
    const roleQueued = unit.role === "militia" ? militiaQueued : professionalQueued;
    const roleCapacity = unit.role === "militia" ? summary.militiaCapacity : summary.professionalCapacity;
    const roleUsed = unit.role === "militia" ? summary.militia : summary.professionalSoldiers;
    const capacityRemaining = Math.max(0, roleCapacity - roleUsed - roleQueued);
    const manpowerRemaining = unit.manpowerCost > 0 ? Math.floor(summary.manpowerAvailable / unit.manpowerCost) : 9999;
    const treasuryLimit = effectiveRecruitCost > 0 ? Math.floor(settlement.treasure / effectiveRecruitCost) : 9999;
    const existingCount = settlement.troops.filter(troop => troop.type === unit.id).reduce((total, troop) => total + troop.count, 0);
    const sameQueued = settlement.recruitment.filter(order => order.status !== "completed" && order.troopType === unit.id).reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
    const unitLimit = unit.maxPerSettlement > 0 ? Math.max(0, unit.maxPerSettlement - existingCount - sameQueued) : 9999;
    const tagMissing = unit.requiredTags.find(tag => !settlementGrantedTags(settlement).has(tag.toLowerCase()));
    const maxRecruit = isGM ? 9999 : Math.max(0, Math.min(capacityRemaining, manpowerRemaining, treasuryLimit, unitLimit));
    const reasons = [];
    if (!sources.length) reasons.push("No completed building unlocks this unit.");
    if (!isGM && capacityRemaining <= 0) reasons.push(`${unit.role === "militia" ? "Militia" : "Professional"} capacity is full.`);
    if (!isGM && manpowerRemaining <= 0) reasons.push("No manpower remains.");
    if (!isGM && treasuryLimit <= 0) reasons.push("Not enough Crown.");
    if (!isGM && unitLimit <= 0) reasons.push(`${unit.name} settlement limit reached.`);
    if (!isGM && tagMissing) reasons.push(`Requires strategic resource: ${tagMissing}.`);

    return {
      ...unit,
      hasImage: Boolean(unit.imageUrl),
      roleLabel: TROOP_ROLES.find(role => role.value === unit.role)?.label || unit.role,
      qualityLabel: UNIT_QUALITIES.find(option => option.value === unit.quality)?.label || `Tier ${unit.quality}`,
      combatRating: formatNumber(unitCombatRating(unit)),
      manpowerCostDisplay: formatNumber(unit.manpowerCost),
      requiredTagsText: unit.requiredTags.join(", ") || "None",
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
      uiState.catalogKind = ["buildings", "units", "events"].includes(event.currentTarget.dataset.catalogKind) ? event.currentTarget.dataset.catalogKind : "buildings";
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

  root.querySelectorAll("[data-open-actor]").forEach(button => {
    button.addEventListener("click", async event => {
      event.preventDefault();
      const uuid = cleanString(event.currentTarget.dataset.openActor);
      if (!uuid || !globalThis.fromUuid) return;
      const actor = await globalThis.fromUuid(uuid);
      if (actor?.documentName !== "Actor" && actor?.constructor?.metadata?.name !== "Actor") {
        ui.notifications.warn("DS: Linked UUID is not an Actor.");
        return;
      }
      actor.sheet?.render(true);
    });
  });

  root.querySelectorAll("[data-actor-drop]").forEach(input => {
    input.addEventListener("dragover", event => event.preventDefault());
    input.addEventListener("drop", async event => {
      event.preventDefault();
      let dragData = {};
      try {
        dragData = globalThis.TextEditor?.getDragEventData?.(event) || JSON.parse(event.dataTransfer?.getData("text/plain") || "{}");
      } catch (_error) {
        dragData = {};
      }
      const uuid = cleanString(dragData.uuid || (dragData.type === "Actor" ? `Actor.${dragData.id}` : ""));
      if (!uuid || !globalThis.fromUuid) return;
      const actor = await globalThis.fromUuid(uuid);
      if (actor?.documentName !== "Actor" && actor?.constructor?.metadata?.name !== "Actor") {
        ui.notifications.warn("DS: Drop an Actor here.");
        return;
      }
      input.value = uuid;
      input.dispatchEvent(new Event("input", { bubbles: true }));
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
      await enqueueAction(packet.action, packet.payload || {}, packet.userId);
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
      return await enqueueAction(action, payload, game.user.id);
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
    case "addSettlementTemplate":
      addSettlementTemplate(data, payload, user);
      break;
    case "saveSettlementAsTemplate":
      saveSettlementAsTemplate(data, payload, user);
      break;
    case "updateSettlementTemplate":
      updateSettlementTemplate(data, payload, user);
      break;
    case "deleteSettlementTemplate":
      deleteSettlementTemplate(data, payload, user);
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
    case "setSettlementTier":
      setSettlementTier(data, payload, user);
      break;
    case "processSettlement":
      await processSingleSettlement(data, payload, user);
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
    case "updateRulesGrowth":
      updateRulesGrowth(data, payload, user);
      break;
    case "updateRulesEvents":
      updateRulesEvents(data, payload, user);
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
    case "applyCatalogBuilding":
      applyCatalogBuilding(data, payload, user);
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
    case "applyCatalogUnit":
      applyCatalogUnit(data, payload, user);
      break;
    case "deleteCatalogUnit":
      deleteCatalogUnit(data, payload, user);
      break;
    case "addCatalogEvent":
      addCatalogEvent(data, payload, user);
      break;
    case "updateCatalogEvent":
      updateCatalogEvent(data, payload, user);
      break;
    case "deleteCatalogEvent":
      deleteCatalogEvent(data, payload, user);
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
      await processMonth(data, payload, user);
      break;
    case "processTurn":
      await processTurn(data, payload, user);
      break;
    case "resolveMonthEvent":
      resolveMonthEvent(data, payload, user);
      break;
    case "rerollMonthEvent":
      await rerollMonthEvent(data, payload, user);
      break;
    case "undoSettlementTurn":
      undoSettlementTurn(data, payload, user);
      break;
    default:
      throw new Error(`Unknown DS action: ${action}`);
  }

  await saveWorldData(data, action);
  return true;
}

function enqueueAction(action, payload, userId) {
  const task = actionQueue.then(() => processAction(action, payload, userId));
  actionQueue = task.catch(() => undefined);
  return task;
}

function addSettlementTemplate(data, payload, user) {
  requireGM(user);
  const id = `template-${randomId().toLowerCase()}`;
  const normalized = normalizeSettlementTemplates([{
    id,
    name: cleanString(payload.name) || "New Settlement Template",
    description: "Custom settlement template.",
    tier: "hamlet",
    population: 50,
    treasure: 25000,
    food: 350,
    materials: 120,
    publicOrder: 50,
    terrainTags: [],
    biomeTags: [],
    buildings: []
  }]).find(item => item.id === id);
  data.settlementTemplates.push(normalized);
}

function saveSettlementAsTemplate(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const id = `template-${randomId().toLowerCase()}`;
  const normalized = normalizeSettlementTemplates([{
    id,
    name: cleanString(payload.name) || `${settlement.name} Template`,
    description: cleanString(payload.description) || `Saved from ${settlement.name}.`,
    tier: settlement.tier,
    population: settlement.population,
    treasure: settlement.treasure,
    food: settlement.food,
    materials: settlement.materials,
    publicOrder: settlement.publicOrder,
    manpowerBonus: settlement.manpowerBonus,
    terrainTags: settlement.terrainTags,
    biomeTags: settlement.biomeTags,
    buildings: settlement.buildings.map(building => ({ ...clone(building), id: randomId(), slotId: "", extraSlotIds: [] }))
  }]).find(item => item.id === id);
  data.settlementTemplates.push(normalized);
}

function updateSettlementTemplate(data, payload, user) {
  requireGM(user);
  const template = findById(data.settlementTemplates, payload.templateId, "Settlement template");
  template.name = cleanString(payload.name) || template.name;
  template.description = cleanString(payload.description);
  template.tier = settlementTierValue(payload.tier);
  template.population = Math.max(0, Math.trunc(toNumber(payload.population, template.population)));
  template.treasure = Math.max(0, toNumber(payload.treasure, template.treasure));
  template.food = Math.max(0, toNumber(payload.food, template.food));
  template.materials = Math.max(0, toNumber(payload.materials, template.materials));
  template.publicOrder = clamp(toNumber(payload.publicOrder, template.publicOrder), 0, 100);
  template.manpowerBonus = toNumber(payload.manpowerBonus, template.manpowerBonus);
  template.terrainTags = splitTags(payload.terrainTags);
  template.biomeTags = splitTags(payload.biomeTags);
}

function deleteSettlementTemplate(data, payload, user) {
  requireGM(user);
  const template = findById(data.settlementTemplates, payload.templateId, "Settlement template");
  if (starterSettlementTemplates().some(candidate => candidate.id === template.id)) throw new Error("Built-in settlement templates cannot be deleted.");
  deleteById(data.settlementTemplates, template.id);
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
  settlement.districtBackgroundUrl = cleanString(payload.districtBackgroundUrl);
  settlement.backgroundOverlay = clamp(toNumber(payload.backgroundOverlay, settlement.backgroundOverlay), 0, 90);
  settlement.ownerUserIds = arrayPayload(payload.ownerUserIds).map(cleanString).filter(Boolean);
}

function updatePopulation(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  settlement.population = Math.max(0, Math.trunc(toNumber(payload.population, settlement.population)));
  settlement.treasure = toNumber(payload.treasure, settlement.treasure);
  settlement.food = Math.max(0, toNumber(payload.food, settlement.food));
  settlement.materials = Math.max(0, toNumber(payload.materials, settlement.materials));
  settlement.publicOrder = clamp(toNumber(payload.publicOrder, settlement.publicOrder), 0, 100);
  settlement.manpowerBonus = toNumber(payload.manpowerBonus, settlement.manpowerBonus);
  settlement.manpowerOverride = cleanString(payload.manpowerOverride);
  settlement.slotBonus = Math.max(0, Math.trunc(toNumber(payload.slotBonus, settlement.slotBonus)));
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
}

function setMonth(data, payload, user) {
  requireGM(user);
  data.month = Math.max(1, Math.trunc(toNumber(payload.month, data.month)));
}

function setSettlementTier(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const oldTier = settlement.tier;
  settlement.tier = settlementTierValue(payload.tier);
  settlement.type = tierName(settlement.tier, data.rules);
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
  settlement.eventLog.unshift({
    id: randomId(),
    month: data.month,
    created: Date.now(),
    title: "Settlement Tier Set by GM",
    text: `${tierName(oldTier, data.rules)} -> ${tierName(settlement.tier, data.rules)}`,
    gmNote: cleanString(payload.note),
    playerNotes: []
  });
}

function updateRulesEconomy(data, payload, user) {
  requireGM(user);
  data.rules.economy.taxPerFreePop = Math.max(0, toNumber(payload.taxPerFreePop, data.rules.economy.taxPerFreePop));
  data.rules.economy.incomeMultiplier = Math.max(0, toNumber(payload.incomeMultiplier, data.rules.economy.incomeMultiplier));
  data.rules.economy.constructionHireCostPerCp = Math.max(0, toNumber(payload.constructionHireCostPerCp, data.rules.economy.constructionHireCostPerCp));
  data.rules.economy.foodPerPop = Math.max(0, toNumber(payload.foodPerPop, data.rules.economy.foodPerPop));
  data.rules.economy.subsistenceFoodPerFreePop = Math.max(0, toNumber(payload.subsistenceFoodPerFreePop, data.rules.economy.subsistenceFoodPerFreePop));
  data.rules.economy.recruitmentDiscountCap = clamp(toNumber(payload.recruitmentDiscountCap, data.rules.economy.recruitmentDiscountCap), 0, 100);
  data.rules.economy.upkeepDiscountCap = clamp(toNumber(payload.upkeepDiscountCap, data.rules.economy.upkeepDiscountCap), 0, 100);
}

function updateRulesConstruction(data, payload, user) {
  requireGM(user);
  data.rules.construction.cpPerFreePop = Math.max(0, toNumber(payload.cpPerFreePop, data.rules.construction.cpPerFreePop));
  data.rules.construction.overflowToNextProject = Boolean(payload.overflowToNextProject);
  data.rules.construction.cancellationRefundPercent = clamp(toNumber(payload.cancellationRefundPercent, data.rules.construction.cancellationRefundPercent), 0, 100);
  data.rules.construction.snapshotLimit = clamp(Math.trunc(toNumber(payload.snapshotLimit, data.rules.construction.snapshotLimit)), 1, 20);
}

function updateRulesMilitary(data, payload, user) {
  requireGM(user);
  for (const key of ["professionalGarrisonPercent", "professionalCampaignPercent", "militiaGarrisonPercent", "militiaCampaignPercent"]) {
    data.rules.military[key] = Math.max(0, toNumber(payload[key], data.rules.military[key]));
  }
  data.rules.military.manpowerRate = clamp(toNumber(payload.manpowerRate, data.rules.military.manpowerRate), 0, 100);
}

function updateRulesGrowth(data, payload, user) {
  requireGM(user);
  data.rules.growth.minimumRate = toNumber(payload.minimumRate, data.rules.growth.minimumRate);
  data.rules.growth.maximumRate = Math.max(data.rules.growth.minimumRate, toNumber(payload.maximumRate, data.rules.growth.maximumRate));
}

function updateRulesEvents(data, payload, user) {
  requireGM(user);
  data.rules.events.enabled = Boolean(payload.enabled);
  data.rules.events.publicOrderRollStep = Math.max(1, toNumber(payload.publicOrderRollStep, data.rules.events.publicOrderRollStep));
  data.rules.events.foodShortagePenalty = Math.max(0, toNumber(payload.foodShortagePenalty, data.rules.events.foodShortagePenalty));
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
  tier.promotionMaterials = Math.max(0, toNumber(payload.promotionMaterials, tier.promotionMaterials));
  tier.promotionFood = Math.max(0, toNumber(payload.promotionFood, tier.promotionFood));
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
  const requestedSlot = settlement.slots.find(candidate => candidate.id === payload.slotId);
  const slot = requestedSlot && !settlement.buildings.some(building => [building.slotId, ...(building.extraSlotIds || [])].includes(requestedSlot.id))
    ? requestedSlot
    : firstEmptySlot(settlement, item.category, true);
  if (!slot) throw new Error("No settlement slot is available for this building.");
  slot.unlocked = true;
  settlement.buildings.push(buildingFromCatalog(item, { slotId: slot.id, assignedPop: Math.min(item.workers, toNumber(payload.assignedPop, item.workers)) }, data.unitCatalog));
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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
    building.level = clamp(Math.trunc(toNumber(payload.level, building.level)), 1, 5);
    building.active = Boolean(payload.active);
    building.special = Boolean(payload.special);
    building.gmOnly = Boolean(payload.gmOnly);
    building.assignedPop = Math.max(0, toNumber(payload.assignedPop, building.assignedPop));
    building.workers = Math.max(0, toNumber(payload.workers, building.workers));
    building.assignedPop = Math.min(building.assignedPop, building.workers);
    building.rate = Math.max(0, toNumber(payload.rate, building.rate));
    building.flatOutput = toNumber(payload.flatOutput, building.flatOutput);
    building.buildingUpkeep = Math.max(0, toNumber(payload.buildingUpkeep, building.buildingUpkeep));
    building.materialCost = Math.max(0, toNumber(payload.materialCost, building.materialCost));
    building.foodCost = Math.max(0, toNumber(payload.foodCost, building.foodCost));
    building.foodOutput = toNumber(payload.foodOutput, building.foodOutput);
    building.materialsOutput = toNumber(payload.materialsOutput, building.materialsOutput);
    building.foodUpkeep = Math.max(0, toNumber(payload.foodUpkeep, building.foodUpkeep));
    building.materialsUpkeep = Math.max(0, toNumber(payload.materialsUpkeep, building.materialsUpkeep));
    building.publicOrder = toNumber(payload.publicOrder, building.publicOrder);
    building.defense = Math.max(0, toNumber(payload.defense, building.defense));
    building.eventRollBonus = toNumber(payload.eventRollBonus, building.eventRollBonus);
    building.grantsTags = splitTags(payload.grantsTags);
    building.requiredTagsAny = splitTags(payload.requiredTagsAny);
    building.mitigationTags = splitTags(payload.mitigationTags);
    if (Object.hasOwn(payload, "terrain")) building.terrain = cleanString(payload.terrain);
    if (Object.hasOwn(payload, "requirement")) building.requirement = cleanString(payload.requirement);
    building.crownCost = Math.max(0, toNumber(payload.crownCost, building.crownCost));
    building.cpCost = Math.max(0, toNumber(payload.cpCost, building.cpCost));
    building.slot = building.category;
    building.slotUse = Math.max(1, Math.trunc(toNumber(payload.slotUse, building.slotUse)));
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
    building.uniqueChain = Boolean(payload.uniqueChain);
    building.maxPerSettlement = Math.max(0, Math.trunc(toNumber(payload.maxPerSettlement, building.maxPerSettlement)));
    building.imageUrl = cleanString(payload.imageUrl);
    building.notes = cleanString(payload.notes);
    settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
    return;
  }

  if (!permissions.canEditAssignments) throw new Error("You cannot edit building assignments.");
  building.assignedPop = clamp(toNumber(payload.assignedPop, building.assignedPop), 0, building.workers);
}

function deleteBuilding(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.buildings, payload.buildingId);
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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
    crownCost: 20000,
    cpCost: 800,
    materialCost: 100,
    slot: "economic",
    slotUse: 1,
    enabled: true,
    maxLevel: 5,
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
  item.maxLevel = 5;
  item.chainId = cleanString(payload.chainId) || item.id;
  item.nodeTier = clamp(Math.trunc(toNumber(payload.nodeTier, item.nodeTier)), 1, 5);
  item.parentIds = splitTags(payload.parentIds);
  if (item.parentIds.includes(item.id)) throw new Error("A building node cannot be its own parent.");
  const missingParent = item.parentIds.find(id => !data.catalog.some(candidate => candidate.id === id));
  if (missingParent) throw new Error(`Parent building node ${missingParent} does not exist.`);
  if (item.nodeTier === 1 && item.parentIds.length) throw new Error("Tier 1 building nodes must be branch roots.");
  if (item.nodeTier > 1 && !item.parentIds.length) throw new Error(`Tier ${item.nodeTier} building nodes need a Tier ${item.nodeTier - 1} parent.`);
  const invalidParent = item.parentIds.map(id => data.catalog.find(candidate => candidate.id === id)).find(parent => parent && (parent.nodeTier !== item.nodeTier - 1 || parent.category !== item.category));
  if (invalidParent) throw new Error("Parent nodes must use the same category and the immediately preceding tier.");
  if (catalogHasCycle(data.catalog, item.id)) throw new Error("This parent selection creates a building branch cycle.");
  item.settlementTier = SETTLEMENT_TIER_IDS[item.nodeTier - 1];
  item.terrain = cleanString(payload.terrain) || "Any";
  if (Object.hasOwn(payload, "requirement")) item.requirement = cleanString(payload.requirement);
  if (Object.hasOwn(payload, "requires")) item.requires = cleanString(payload.requires);
  item.workers = Math.max(0, toNumber(payload.workers, item.workers));
  item.rate = Math.max(0, toNumber(payload.rate, item.rate));
  item.flatOutput = toNumber(payload.flatOutput, item.flatOutput);
  item.buildingUpkeep = Math.max(0, toNumber(payload.buildingUpkeep, item.buildingUpkeep));
  item.crownCost = Math.max(0, toNumber(payload.crownCost, item.crownCost));
  item.cpCost = Math.max(0, toNumber(payload.cpCost, item.cpCost));
  item.materialCost = Math.max(0, toNumber(payload.materialCost, item.materialCost));
  item.foodCost = Math.max(0, toNumber(payload.foodCost, item.foodCost));
  item.foodOutput = toNumber(payload.foodOutput, item.foodOutput);
  item.materialsOutput = toNumber(payload.materialsOutput, item.materialsOutput);
  item.foodUpkeep = Math.max(0, toNumber(payload.foodUpkeep, item.foodUpkeep));
  item.materialsUpkeep = Math.max(0, toNumber(payload.materialsUpkeep, item.materialsUpkeep));
  item.publicOrder = toNumber(payload.publicOrder, item.publicOrder);
  item.defense = Math.max(0, toNumber(payload.defense, item.defense));
  item.eventRollBonus = toNumber(payload.eventRollBonus, item.eventRollBonus);
  item.grantsTags = splitTags(payload.grantsTags);
  item.requiredTagsAny = splitTags(payload.requiredTagsAny);
  item.mitigationTags = splitTags(payload.mitigationTags);
  item.slot = item.category;
  item.slotUse = Math.max(1, Math.trunc(toNumber(payload.slotUse, item.slotUse)));
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
  item.uniqueChain = Boolean(payload.uniqueChain);
  item.maxPerSettlement = Math.max(0, Math.trunc(toNumber(payload.maxPerSettlement, item.maxPerSettlement)));
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

function applyCatalogBuilding(data, payload, user) {
  requireGM(user);
  const item = findById(data.catalog, payload.catalogId, "Building template");
  let updated = 0;
  for (const settlement of data.settlements) {
    for (const building of settlement.buildings.filter(candidate => candidate.catalogId === item.id)) {
      const refreshed = buildingFromCatalog(item, {
        id: building.id,
        slotId: building.slotId,
        extraSlotIds: building.extraSlotIds,
        assignedPop: Math.min(building.assignedPop, item.workers),
        active: building.active,
        imageUrl: building.imageUrl || item.imageUrl,
        notes: building.notes
      }, data.unitCatalog);
      Object.assign(building, refreshed);
      updated += 1;
    }
    settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
  }
  ui.notifications.info(`DS: Updated ${updated} existing building instance(s).`);
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
  troop.actorUuid = cleanString(payload.actorUuid) || troopType(troop.type, data.unitCatalog).actorUuid;
  if (user.isGM) {
    const type = troopType(payload.type, data.unitCatalog);
    troop.type = type.id;
    troop.role = troopRole(payload.role, type.role);
    troop.garrisonCost = Math.max(0, toNumber(payload.garrisonCost, troop.garrisonCost));
    troop.campaignCost = Math.max(0, toNumber(payload.campaignCost, troop.campaignCost));
    troop.useRuleUpkeep = Boolean(payload.useRuleUpkeep);
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
    recruitCost: 500,
    garrison: 15,
    campaign: 40,
    tier: 1,
    quality: 2,
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
  unit.tier = clamp(Math.trunc(toNumber(payload.tier, unit.tier)), 1, 5);
  unit.quality = clamp(Math.trunc(toNumber(payload.quality, unit.quality)), 1, 5);
  for (const key of ["melee", "ranged", "defense", "morale", "mobility", "charge", "siege"]) unit[key] = clamp(toNumber(payload[key], unit[key]), 0, 10);
  unit.powerModifier = toNumber(payload.powerModifier, unit.powerModifier);
  unit.manpowerCost = Math.max(0, toNumber(payload.manpowerCost, unit.manpowerCost));
  unit.requiredTags = splitTags(payload.requiredTags);
  unit.special = Boolean(payload.special);
  unit.maxPerSettlement = Math.max(0, Math.trunc(toNumber(payload.maxPerSettlement, unit.maxPerSettlement)));
  if (Object.hasOwn(payload, "useRuleUpkeep")) unit.useRuleUpkeep = Boolean(payload.useRuleUpkeep);
  unit.imageUrl = cleanString(payload.imageUrl);
  unit.actorUuid = cleanString(payload.actorUuid);
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

function applyCatalogUnit(data, payload, user) {
  requireGM(user);
  const unit = findById(data.unitCatalog, payload.unitId, "Unit template");
  let updated = 0;
  for (const settlement of data.settlements) {
    for (const troop of settlement.troops.filter(candidate => candidate.type === unit.id)) {
      troop.role = unit.role;
      if (!troop.imageUrl) troop.imageUrl = unit.imageUrl;
      if (!troop.actorUuid) troop.actorUuid = unit.actorUuid;
      if (troop.useRuleUpkeep) {
        const upkeep = unitUpkeepFromRules(unit, data.rules);
        troop.garrisonCost = upkeep.garrison;
        troop.campaignCost = upkeep.campaign;
      }
      updated += 1;
    }
  }
  ui.notifications.info(`DS: Updated ${updated} existing regiment instance(s).`);
}

function addCatalogEvent(data, payload, user) {
  requireGM(user);
  data.eventCatalog.push(normalizeMonthEvent({
    id: `event-${randomId().toLowerCase()}`,
    name: "New Month Event",
    minRoll: 35,
    maxRoll: 65,
    severity: "neutral",
    description: "Describe the event and configure the suggested effects.",
    enabled: true
  }));
}

function updateCatalogEvent(data, payload, user) {
  requireGM(user);
  const event = findById(data.eventCatalog, payload.eventId, "Month event template");
  event.name = cleanString(payload.name) || event.name;
  event.minRoll = clamp(Math.trunc(toNumber(payload.minRoll, event.minRoll)), 1, 100);
  event.maxRoll = clamp(Math.trunc(toNumber(payload.maxRoll, event.maxRoll)), event.minRoll, 100);
  event.severity = EVENT_SEVERITIES.some(option => option.value === payload.severity) ? payload.severity : event.severity;
  event.description = cleanString(payload.description);
  event.effects.crown = toNumber(payload.crown, event.effects.crown);
  event.effects.food = toNumber(payload.food, event.effects.food);
  event.effects.materials = toNumber(payload.materials, event.effects.materials);
  event.effects.population = Math.trunc(toNumber(payload.population, event.effects.population));
  event.effects.publicOrder = toNumber(payload.publicOrder, event.effects.publicOrder);
  event.tags = splitTags(payload.tags);
  event.mitigationTags = splitTags(payload.mitigationTags);
  event.defenseDivisor = Math.max(0, toNumber(payload.defenseDivisor, event.defenseDivisor));
  event.enabled = Boolean(payload.enabled);
  event.imageUrl = cleanString(payload.imageUrl);
}

function deleteCatalogEvent(data, payload, user) {
  requireGM(user);
  const event = findById(data.eventCatalog, payload.eventId, "Month event template");
  if (EVENT_CATALOG.some(candidate => candidate.id === event.id)) throw new Error("Built-in month events can be disabled but not deleted.");
  deleteById(data.eventCatalog, event.id);
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
  const availableTags = settlementGrantedTags(settlement);
  const missingTag = unit.requiredTags.find(tag => !availableTags.has(tag.toLowerCase()));
  if (!direct && missingTag) throw new Error(`${unit.name} requires strategic resource: ${missingTag}.`);
  if (!direct && unit.maxPerSettlement > 0) {
    const existing = settlement.troops.filter(troop => troop.type === unit.id).reduce((total, troop) => total + troop.count, 0);
    const queued = settlement.recruitment.filter(order => order.status !== "completed" && order.troopType === unit.id).reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
    if (existing + queued + count > unit.maxPerSettlement) throw new Error(`${unit.name} settlement limit is ${formatNumber(unit.maxPerSettlement)}.`);
  }
  if (!direct && !settlement.overrides.ignoreMilitaryCapacity) {
    const queued = settlement.recruitment
      .filter(order => order.status !== "completed" && troopType(order.troopType, data.unitCatalog).role === unit.role)
      .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained), 0);
    const used = unit.role === "militia" ? summary.militia : summary.professionalSoldiers;
    const capacity = unit.role === "militia" ? summary.militiaCapacity : summary.professionalCapacity;
    if (used + queued + count > capacity) throw new Error(`${unit.role === "militia" ? "Militia" : "Professional"} capacity is too low for this order.`);
  }

  if (!direct && !settlement.overrides.ignoreManpowerLimits) {
    const requiredManpower = count * unit.manpowerCost;
    if (summary.manpowerAvailable < requiredManpower) throw new Error(`Recruitment needs ${formatNumber(requiredManpower)} manpower; ${formatNumber(summary.manpowerAvailable)} remains.`);
  }

  const discount = direct ? 0 : settlementRecruitmentDiscount(settlement, source, data.rules);
  const costPerUnit = direct ? 0 : Math.max(0, Math.round(unit.recruitCost * (1 - discount / 100)));
  const totalCost = costPerUnit * count;
  if (settlement.treasure < totalCost) throw new Error(`Recruitment needs ${formatNumber(totalCost)} Crown.`);
  settlement.treasure -= totalCost;
  const order = normalizeRecruitment({
    id: randomId(),
    sourceBuildingId: direct ? "" : requestedSourceId,
    regimentName: cleanString(payload.regimentName) || unit.name,
    imageUrl: cleanString(payload.imageUrl) || unit.imageUrl,
    actorUuid: cleanString(payload.actorUuid) || unit.actorUuid,
    troopType: unit.id,
    targetCount: count,
    trained: 0,
    costPerUnit,
    crownPaid: totalCost,
    status: "inProgress",
    createdAt: Date.now(),
    notes: direct ? "Direct GM recruitment." : "Queued from recruitment roster."
  }, data.unitCatalog);
  settlement.recruitment.push(order);
  if (direct) {
    order.trained = count;
    order.status = "completed";
    addRecruitsToTroops(settlement, order, count, data);
  }
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
  order.actorUuid = cleanString(payload.actorUuid) || order.actorUuid;
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
    targetSlotUse: item.slotUse,
    requiredCrown: item.crownCost,
    crownPaid: 0,
    requiredMaterials: item.materialCost,
    materialsPaid: 0,
    requiredFood: item.foodCost,
    foodPaid: 0,
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
  settlement.materials -= cost.materials;
  settlement.food -= cost.food;
  settlement.projects.push(normalizeProject({
    id: randomId(),
    kind: "building",
    name: current ? `${current.name} -> ${item.name}` : item.name,
    catalogId: item.id,
    slotId: slot.id,
    replacesBuildingId: current?.id || "",
    targetLevel: item.nodeTier,
    targetSlotUse: item.slotUse,
    requiredCrown: cost.crown,
    crownPaid: cost.crown,
    requiredMaterials: cost.materials,
    materialsPaid: cost.materials,
    requiredFood: cost.food,
    foodPaid: cost.food,
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
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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
  if (settlement.materials < next.promotionMaterials) throw new Error(`${next.name} requires ${formatNumber(next.promotionMaterials)} Materials.`);
  if (settlement.food < next.promotionFood) throw new Error(`${next.name} requires ${formatNumber(next.promotionFood)} Food.`);
  settlement.treasure -= next.promotionCost;
  settlement.materials -= next.promotionMaterials;
  settlement.food -= next.promotionFood;
  settlement.projects.push(normalizeProject({
    id: randomId(),
    kind: "settlementUpgrade",
    name: `Develop ${next.coreName}`,
    targetTier: next.id,
    requiredCrown: next.promotionCost,
    crownPaid: next.promotionCost,
    requiredMaterials: next.promotionMaterials,
    materialsPaid: next.promotionMaterials,
    requiredFood: next.promotionFood,
    foodPaid: next.promotionFood,
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
  const progress = project.requiredCp > 0 ? clamp(project.cpPaid / project.requiredCp, 0, 1) : 0;
  const refundableFraction = data.rules.construction.cancellationRefundPercent / 100 * (1 - progress);
  settlement.treasure += Math.round(Math.max(0, project.crownPaid) * refundableFraction);
  settlement.materials += Math.round(Math.max(0, project.materialsPaid) * refundableFraction);
  settlement.food += Math.round(Math.max(0, project.foodPaid) * refundableFraction);
  deleteById(settlement.projects, project.id);
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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
  project.targetLevel = clamp(Math.trunc(toNumber(payload.targetLevel, project.targetLevel)), 1, 5);
  project.targetSlotUse = Math.max(1, Math.trunc(toNumber(payload.targetSlotUse, project.targetSlotUse)));
  project.requiredCrown = Math.max(0, toNumber(payload.requiredCrown, project.requiredCrown));
  project.crownPaid = Math.max(0, toNumber(payload.crownPaid, project.crownPaid));
  project.requiredMaterials = Math.max(0, toNumber(payload.requiredMaterials, project.requiredMaterials));
  project.materialsPaid = Math.max(0, toNumber(payload.materialsPaid, project.materialsPaid));
  project.requiredFood = Math.max(0, toNumber(payload.requiredFood, project.requiredFood));
  project.foodPaid = Math.max(0, toNumber(payload.foodPaid, project.foodPaid));
  project.requiredCp = Math.max(0, toNumber(payload.requiredCp, project.requiredCp));
  project.cpPaid = Math.max(0, toNumber(payload.cpPaid, project.cpPaid));
  project.externalWorkers = Math.max(0, toNumber(payload.externalWorkers, project.externalWorkers));
  project.bonusCp = Math.max(0, toNumber(payload.bonusCp, project.bonusCp));
  project.cpAllocation = Math.max(1, toNumber(payload.cpAllocation, project.cpAllocation));
  project.status = projectStatus(payload.status);
  project.notes = cleanString(payload.notes);
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
  ensureActiveConstructionQueue(settlement, data);
}

function deleteProject(data, payload, user) {
  const settlement = findSettlement(data, payload.settlementId);
  requireGM(user);
  deleteById(settlement.projects, payload.projectId);
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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

async function processMonth(data, payload, user) {
  await processTurn(data, payload, user);
}

async function processSingleSettlement(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const force = Boolean(payload.force);
  assertNoPendingMonthEvents([settlement]);
  if (settlement.lastProcessedMonth === data.month && !force) {
    throw new Error(`${settlement.name} has already been processed for Month ${data.month}.`);
  }
  await processSettlementTurn(data, settlement, cleanString(payload.gmTurnNote));
  ui.notifications.info(`DS: ${settlement.name} processed for Month ${data.month}.`);
}

async function processTurn(data, payload, user) {
  requireGM(user);
  assertNoPendingMonthEvents(data.settlements);
  const gmTurnNote = cleanString(payload.gmTurnNote);
  const processedMonth = data.month;
  const pending = data.settlements.filter(settlement => settlement.lastProcessedMonth !== processedMonth);
  for (const settlement of pending) await processSettlementTurn(data, settlement, gmTurnNote);
  data.month += 1;
  ui.notifications.info(`DS: Month ${processedMonth} closed; ${pending.length} pending settlement(s) processed.`);
}

function assertNoPendingMonthEvents(settlements) {
  const blocked = settlements.filter(settlement => settlement.pendingEvents.some(event => event.status === "pending"));
  if (!blocked.length) return;
  throw new Error(`Resolve pending month events before processing: ${blocked.map(settlement => settlement.name).join(", ")}.`);
}

async function processSettlementTurn(data, settlement, gmTurnNote) {
  createTurnSnapshot(settlement, data, `Before Month ${data.month}`);
  const before = calculateSettlement(settlement, data);
  const construction = processConstruction(settlement, data, before);
  const treasureBefore = toNumber(settlement.treasure, 0);
  const foodBefore = toNumber(settlement.food, 0);
  const materialsBefore = toNumber(settlement.materials, 0);
  const publicOrderBefore = toNumber(settlement.publicOrder, 50);

  settlement.treasure = treasureBefore + before.netIncome;
  settlement.food = Math.max(0, foodBefore + before.foodBalance);
  settlement.materials = Math.max(0, materialsBefore + before.materialsBalance);
  if (before.foodShortage > 0) {
    const penalty = clamp(Math.ceil(before.foodShortage / Math.max(1, settlement.population) * 10), 1, 15);
    settlement.publicOrder = clamp(settlement.publicOrder - penalty, 0, 100);
  } else if (before.foodBalance > 0) {
    settlement.publicOrder = clamp(settlement.publicOrder + 1, 0, 100);
  }
  const recruitmentResult = processRecruitment(settlement, data);
  const growth = calculateGrowth(settlement, before, data.rules);
  settlement.population = Math.max(0, settlement.population + growth.popChange);
  const after = calculateSettlement(settlement, data);
  const monthEvent = await createPendingMonthEvent(data, settlement, data.month);
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
      `Food: ${formatNumber(foodBefore)} -> ${formatNumber(settlement.food)} (${formatSigned(before.foodBalance)})`,
      `Materials: ${formatNumber(materialsBefore)} -> ${formatNumber(settlement.materials)} (${formatSigned(before.materialsBalance)})`,
      `Public Order: ${formatNumber(publicOrderBefore)} -> ${formatNumber(after.effectivePublicOrder)}`,
      `Construction CP Applied: ${formatNumber(construction.cpApplied)}`,
      `Completed Projects: ${construction.completed.length ? construction.completed.map(project => project.name).join(", ") : "None"}`,
      `Recruitment: ${recruitmentResult.lines.length ? recruitmentResult.lines.join("; ") : "None"}`,
      `POP Change: ${formatSigned(growth.popChange)} (${formatSigned(growth.rate)}%)`,
      `New POP: ${formatNumber(after.totalPop)}`,
      `Month Event: ${monthEvent ? `${monthEvent.rawRoll}${monthEvent.modifier ? ` ${formatSigned(monthEvent.modifier)}` : ""} -> ${monthEvent.finalRoll} / ${monthEvent.name} (GM approval pending)` : "Disabled"}`
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
  const active = settlement.projects.filter(project => project.status === "inProgress"
    && project.crownPaid >= project.requiredCrown
    && project.materialsPaid >= project.requiredMaterials
    && project.foodPaid >= project.requiredFood);
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
    for (const project of settlement.projects.filter(item => item.status === "planned"
      && item.crownPaid >= item.requiredCrown
      && item.materialsPaid >= item.requiredMaterials
      && item.foodPaid >= item.requiredFood)) {
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
      assignedPop: Math.min(existing.assignedPop, Math.max(0, item.workers)),
      active: existing.active,
      imageUrl: item.imageUrl || existing.imageUrl,
      notes: existing.notes || `Developed from project: ${project.name}`
    }, data.unitCatalog);
    Object.assign(existing, upgraded);
    settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
    return;
  }
  settlement.buildings.push(buildingFromCatalog(item, {
    id: randomId(),
    slotId: project.slotId,
    level: item.nodeTier,
    assignedPop: 0,
    notes: `Completed from project: ${project.name}`
  }, data.unitCatalog));
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
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
  let manpowerRemaining = settlement.overrides.ignoreManpowerLimits ? Number.POSITIVE_INFINITY : Math.max(0, summary.manpowerPool);

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
    const manpowerRecruitLimit = type.manpowerCost > 0 ? Math.floor(manpowerRemaining / type.manpowerCost) : Number.POSITIVE_INFINITY;
    const trainedNow = Math.min(available, remaining, roleRemaining, manpowerRecruitLimit);
    if (trainedNow <= 0) continue;

    order.trained += trainedNow;
    capacityBySource.set(source.id, Math.max(0, available - trainedNow));
    addRecruitsToTroops(settlement, order, trainedNow, data);
    if (type.role === "militia") militiaRemaining -= trainedNow;
    else professionalRemaining -= trainedNow;
    manpowerRemaining -= trainedNow * type.manpowerCost;
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
    useRuleUpkeep: type.useRuleUpkeep,
    imageUrl: order.imageUrl || type.imageUrl,
    actorUuid: order.actorUuid || type.actorUuid,
    sourceRecruitmentId: order.id,
    notes: `Recruited from ${order.sourceBuildingId || "Direct GM"}`
  }, unitCatalog);
  order.regimentId = regiment.id;
  settlement.troops.push(regiment);
}

function createTurnSnapshot(settlement, data, reason) {
  const state = {
    tier: settlement.tier,
    type: settlement.type,
    population: settlement.population,
    treasure: settlement.treasure,
    food: settlement.food,
    materials: settlement.materials,
    publicOrder: settlement.publicOrder,
    lastProcessedMonth: settlement.lastProcessedMonth,
    buildings: clone(settlement.buildings),
    troops: clone(settlement.troops),
    recruitment: clone(settlement.recruitment),
    projects: clone(settlement.projects),
    slots: clone(settlement.slots),
    growth: clone(settlement.growth),
    turnNotes: clone(settlement.turnNotes),
    pendingEvents: clone(settlement.pendingEvents),
    eventLog: clone(settlement.eventLog)
  };
  settlement.turnSnapshots.unshift({ id: randomId(), month: data.month, created: Date.now(), reason, state });
  settlement.turnSnapshots = settlement.turnSnapshots.slice(0, data.rules.construction.snapshotLimit);
}

function undoSettlementTurn(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const snapshot = payload.snapshotId
    ? findById(settlement.turnSnapshots, payload.snapshotId, "Turn snapshot")
    : settlement.turnSnapshots[0];
  if (!snapshot) throw new Error("No settlement snapshot is available.");
  const remainingSnapshots = settlement.turnSnapshots.filter(item => item.id !== snapshot.id);
  Object.assign(settlement, clone(snapshot.state));
  settlement.turnSnapshots = remainingSnapshots;
  settlement.slots = normalizeSettlementSlots(settlement.slots, settlement, data.rules);
}

async function rollD100() {
  if (globalThis.Roll) {
    const roll = await new Roll("1d100").evaluate();
    return clamp(Math.trunc(toNumber(roll.total, 50)), 1, 100);
  }
  return Math.floor(Math.random() * 100) + 1;
}

async function createPendingMonthEvent(data, settlement, month, replaceEventId = "") {
  if (!data.rules.events.enabled) return null;
  const rawRoll = await rollD100();
  const summary = calculateSettlement(settlement, data);
  const orderModifier = Math.trunc((summary.effectivePublicOrder - 50) / data.rules.events.publicOrderRollStep);
  const shortageModifier = summary.foodShortage > 0 ? -Math.max(1, Math.trunc(data.rules.events.foodShortagePenalty)) : 0;
  const modifier = orderModifier + summary.eventRollBonus + shortageModifier;
  const finalRoll = clamp(rawRoll + modifier, 1, 100);
  const candidates = data.eventCatalog.filter(event => event.enabled && finalRoll >= event.minRoll && finalRoll <= event.maxRoll);
  const template = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || data.eventCatalog.find(event => event.enabled) || normalizeMonthEvent({});
  const effects = clone(template.effects);
  const mitigations = new Set(settlement.buildings.filter(building => building.active && buildingStaffing(building) > 0).flatMap(building => building.mitigationTags || []).map(tag => tag.toLowerCase()));
  const matchedMitigation = template.mitigationTags.find(tag => mitigations.has(tag.toLowerCase()));
  let mitigationText = "";
  if (matchedMitigation) {
    for (const key of Object.keys(effects)) if (effects[key] < 0) effects[key] = Math.ceil(effects[key] * 0.5);
    mitigationText = `${matchedMitigation} protection halved negative effects.`;
  }
  if (template.defenseDivisor > 0 && summary.defense > 0) {
    const reduction = clamp(summary.defense / (summary.defense + template.defenseDivisor * 25), 0, 0.75);
    for (const key of ["crown", "food", "materials", "population", "publicOrder"]) if (effects[key] < 0) effects[key] = Math.ceil(effects[key] * (1 - reduction));
    mitigationText = [mitigationText, `Defense reduced losses by ${formatNumber(Math.round(reduction * 100))}%.`].filter(Boolean).join(" ");
  }
  const pending = normalizePendingEvent({
    id: replaceEventId || randomId(),
    eventId: template.id,
    month,
    rawRoll,
    modifier,
    finalRoll,
    name: template.name,
    description: template.description,
    severity: template.severity,
    effects,
    mitigationText,
    status: "pending",
    imageUrl: template.imageUrl,
    created: Date.now()
  });
  const existingIndex = replaceEventId ? settlement.pendingEvents.findIndex(event => event.id === replaceEventId) : -1;
  if (existingIndex >= 0) settlement.pendingEvents[existingIndex] = pending;
  else settlement.pendingEvents.unshift(pending);
  settlement.pendingEvents = settlement.pendingEvents.slice(0, 25);
  return pending;
}

function resolveMonthEvent(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const event = findById(settlement.pendingEvents, payload.eventId, "Month event");
  if (event.status !== "pending") throw new Error("This month event has already been resolved.");
  const accepted = payload.resolution !== "ignore";
  for (const key of ["crown", "food", "materials", "population", "publicOrder"]) {
    if (Object.hasOwn(payload, key)) event.effects[key] = toNumber(payload[key], event.effects[key]);
  }
  event.status = accepted ? "accepted" : "ignored";
  if (accepted) {
    settlement.treasure += event.effects.crown;
    settlement.food = Math.max(0, settlement.food + event.effects.food);
    settlement.materials = Math.max(0, settlement.materials + event.effects.materials);
    settlement.population = Math.max(0, settlement.population + Math.trunc(event.effects.population));
    settlement.publicOrder = clamp(settlement.publicOrder + event.effects.publicOrder, 0, 100);
  }
  settlement.eventLog.unshift({
    id: randomId(),
    month: event.month,
    created: Date.now(),
    title: `${accepted ? "Month Event" : "Ignored Event"}: ${event.name}`,
    text: accepted ? eventEffectsText(event.effects) : "No effects applied.",
    gmNote: cleanString(payload.gmNote) || event.description,
    playerNotes: []
  });
  settlement.eventLog = settlement.eventLog.slice(0, 100);
}

async function rerollMonthEvent(data, payload, user) {
  requireGM(user);
  const settlement = findSettlement(data, payload.settlementId);
  const event = findById(settlement.pendingEvents, payload.eventId, "Month event");
  if (event.status !== "pending") throw new Error("Only pending month events can be rerolled.");
  await createPendingMonthEvent(data, settlement, event.month, event.id);
}

function eventEffectsText(effects) {
  return [
    `Crown ${formatSigned(effects.crown)}`,
    `Food ${formatSigned(effects.food)}`,
    `Materials ${formatSigned(effects.materials)}`,
    `POP ${formatSigned(effects.population)}`,
    `Public Order ${formatSigned(effects.publicOrder)}`
  ].join(" / ");
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
    settlementTemplates: starterSettlementTemplates(),
    catalog: BUILDING_CATALOG.map(item => ({ ...item })),
    unitCatalog: TROOP_TYPES.map(item => ({ ...item })),
    eventCatalog: EVENT_CATALOG.map(item => clone(item)),
    settlements: [sampleSettlement(rules)]
  };
}

function starterSettlementTemplate() {
  return starterSettlementTemplates().find(item => item.id === "starter-village");
}

function starterSettlementTemplates() {
  const makeBuilding = (catalogId, overrides = {}) => buildingFromCatalog(
    BUILDING_CATALOG.find(item => item.id === catalogId),
    { id: randomId(), ...overrides }
  );
  return [
    {
      id: "blank-hamlet",
      name: "Blank Hamlet",
      description: "An empty Hamlet for a fully custom settlement.",
      tier: "hamlet",
      population: 50,
      treasure: 25000,
      food: 350,
      materials: 120,
      publicOrder: 50,
      terrainTags: [],
      biomeTags: [],
      buildings: []
    },
    {
      id: "starter-hamlet",
      name: "Starter Hamlet",
      description: "A modest Hamlet with land development and basic security.",
      tier: "hamlet",
      population: 80,
      treasure: 60000,
      food: 800,
      materials: 400,
      publicOrder: 55,
      terrainTags: ["Plains"],
      biomeTags: [],
      buildings: [
        makeBuilding("land-clearance", { assignedPop: 10 }),
        makeBuilding("watch-post", { assignedPop: 5 })
      ]
    },
    {
      id: "starter-village",
      name: "Starter Village",
      description: "A functioning Village with food, trade, and a small muster ground.",
      tier: "village",
      population: 180,
      treasure: 180000,
      food: 2500,
      materials: 1200,
      publicOrder: 58,
      terrainTags: ["Plains", "Farmlands"],
      biomeTags: [],
      buildings: [
        makeBuilding("farmstead", { assignedPop: 20 }),
        makeBuilding("trading-post", { assignedPop: 10 }),
        makeBuilding("muster-field", { assignedPop: 8 })
      ]
    },
    {
      id: "starter-town",
      name: "Starter Town",
      description: "A developed Town prepared for sustained domain play.",
      tier: "town",
      population: 650,
      treasure: 600000,
      food: 8000,
      materials: 4000,
      publicOrder: 62,
      terrainTags: ["Plains", "Farmlands", "Hills", "Iron"],
      biomeTags: [],
      buildings: [
        makeBuilding("grain-estate", { assignedPop: 35 }),
        makeBuilding("merchants-guild", { assignedPop: 35 }),
        makeBuilding("drill-hall", { assignedPop: 25 }),
        makeBuilding("stone-walls", { assignedPop: 20 })
      ]
    }
  ];
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
    food: template.food ?? 0,
    materials: template.materials ?? 0,
    publicOrder: template.publicOrder ?? 50,
    manpowerBonus: template.manpowerBonus ?? 0,
    manpowerOverride: "",
    slotBonus: 0,
    economicSlotBonus: 0,
    militarySlotBonus: 0,
    lastProcessedMonth: 0,
    permissions: defaultPermissions(),
    overrides: defaultOverrides(),
    buildings: (template.buildings || []).map(building => ({ ...clone(building), id: randomId(), slotId: "" })),
    troops: [],
    recruitment: [],
    projects: [],
    pendingEvents: [],
    turnSnapshots: [],
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
    food: 3000,
    materials: 1500,
    publicOrder: 58,
    manpowerBonus: 0,
    manpowerOverride: "",
    slotBonus: 0,
    economicSlotBonus: 0,
    militarySlotBonus: 0,
    lastProcessedMonth: 0,
    permissions: defaultPermissions(),
    overrides: defaultOverrides(),
    buildings: [
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "survey-camp"), { id: "dl-lumber", name: "Lumber Camp", assignedPop: 8, foodOutput: 0, materialsOutput: 350 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "tannery"), { id: "dl-hunting", name: "Hunting Lodge", workers: 20, assignedPop: 20, foodOutput: 700, materialsOutput: 250 }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "horse-ranch"), { id: "dl-ranch", name: "Cattle Ranch", terrain: "Farmlands or Hills", workers: 20, assignedPop: 20, foodOutput: 900, grantsTags: [] }),
      buildingFromCatalog(BUILDING_CATALOG.find(item => item.id === "farmstead"), { id: "dl-crop", name: "High Yield Crop Field", assignedPop: 20, foodOutput: 1100 }),
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
        name: "Grain Estate",
        catalogId: "grain-estate",
        targetLevel: 3,
        requiredCrown: 220000,
        crownPaid: 220000,
        requiredMaterials: 1800,
        materialsPaid: 1800,
        requiredFood: 0,
        foodPaid: 0,
        requiredCp: 8000,
        cpPaid: 0,
        externalWorkers: 0,
        bonusCp: 0,
        cpGeneratedThisMonth: 0,
        status: "inProgress",
        notes: "Free POP contributes CP to this project."
      }
    ],
    pendingEvents: [],
    turnSnapshots: [],
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
      tierRule("hamlet", "Hamlet", 0, 3, 4, 0, 0, 0, 0, 25000, 1, "Hamlet Center"),
      tierRule("village", "Village", 100, 5, 7, 100000, 3000, 500, 500, 75000, 1, "Village Hall"),
      tierRule("town", "Town", 500, 8, 10, 400000, 12000, 2500, 2000, 250000, 2, "Town Hall"),
      tierRule("city", "City", 2000, 12, 14, 1500000, 40000, 10000, 8000, 800000, 3, "City Hall"),
      tierRule("metropolis", "Metropolis", 8000, 16, 18, 5000000, 120000, 35000, 25000, 2000000, 4, "Grand Hall")
    ],
    economy: {
      taxPerFreePop: 25,
      incomeMultiplier: 1,
      constructionHireCostPerCp: 100,
      foodPerPop: 1,
      subsistenceFoodPerFreePop: 0.25,
      recruitmentDiscountCap: 50,
      upkeepDiscountCap: 60
    },
    construction: {
      cpPerFreePop: 1,
      overflowToNextProject: true,
      cancellationRefundPercent: 75,
      snapshotLimit: 5
    },
    military: {
      professionalGarrisonPercent: 3,
      professionalCampaignPercent: 8,
      militiaGarrisonPercent: 1,
      militiaCampaignPercent: 4,
      manpowerRate: 25
    },
    growth: {
      minimumRate: -5,
      maximumRate: 5
    },
    events: {
      enabled: true,
      publicOrderRollStep: 10,
      foodShortagePenalty: 5
    }
  };
}

function tierRule(id, name, minPopulation, openSlots, maxSlots, promotionCost, promotionCp, promotionMaterials, promotionFood, slotUnlockCost, activeProjects, coreName) {
  return { id, name, minPopulation, openSlots, maxSlots, promotionCost, promotionCp, promotionMaterials, promotionFood, slotUnlockCost, activeProjects, coreName };
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
    materialCost: source.materialCost || 0,
    foodCost: source.foodCost || 0,
    foodOutput: source.foodOutput || 0,
    materialsOutput: source.materialsOutput || 0,
    foodUpkeep: source.foodUpkeep || 0,
    materialsUpkeep: source.materialsUpkeep || 0,
    publicOrder: source.publicOrder || 0,
    defense: source.defense || 0,
    eventRollBonus: source.eventRollBonus || 0,
    grantsTags: source.grantsTags || [],
    requiredTagsAny: source.requiredTagsAny || [],
    mitigationTags: source.mitigationTags || [],
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
    uniqueChain: Boolean(source.uniqueChain),
    maxPerSettlement: source.maxPerSettlement ?? 1,
    notes: source.notes || "",
    ...overrides
  }, unitCatalog);
}

function normalizeData(raw) {
  const fallback = defaultWorldData();
  const source = clone(raw || {});
  const sourceSchema = Math.max(1, Math.trunc(toNumber(source.schemaVersion, 1)));
  const migrateLegacy = sourceSchema < SCHEMA_VERSION;
  const rules = normalizeRules(source.rules || fallback.rules, migrateLegacy);
  const unitCatalog = normalizeUnitCatalog(source.unitCatalog || fallback.unitCatalog, migrateLegacy);
  const catalog = normalizeCatalog(source.catalog || fallback.catalog, unitCatalog, migrateLegacy);
  const eventCatalog = normalizeEventCatalog(source.eventCatalog || fallback.eventCatalog);
  const settlements = Array.isArray(source.settlements) && source.settlements.length
    ? source.settlements.map(item => normalizeSettlement(item, unitCatalog, catalog, rules, migrateLegacy))
    : fallback.settlements.map(item => normalizeSettlement(item, unitCatalog, catalog, rules));
  return {
    schemaVersion: SCHEMA_VERSION,
    month: Math.max(1, Math.trunc(toNumber(source.month, fallback.month))),
    rules,
    settlementTemplates: normalizeSettlementTemplates(source.settlementTemplates || fallback.settlementTemplates, migrateLegacy),
    catalog,
    unitCatalog,
    eventCatalog,
    settlements
  };
}

function normalizeRules(value, migrateLegacy = false) {
  const fallback = defaultRules();
  const source = value && typeof value === "object" ? value : {};
  const sourceTiers = Array.isArray(source.tiers) ? source.tiers : [];
  const oldTiers = {
    hamlet: { minPopulation: 0, openSlots: 2, maxSlots: 3, promotionCost: 0, promotionCp: 0, slotUnlockCost: 2000, activeProjects: 1 },
    village: { minPopulation: 100, openSlots: 4, maxSlots: 6, promotionCost: 4000, promotionCp: 700, slotUnlockCost: 5000, activeProjects: 1 },
    town: { minPopulation: 500, openSlots: 7, maxSlots: 9, promotionCost: 15000, promotionCp: 2200, slotUnlockCost: 12000, activeProjects: 2 },
    city: { minPopulation: 2000, openSlots: 10, maxSlots: 12, promotionCost: 50000, promotionCp: 7000, slotUnlockCost: 30000, activeProjects: 2 },
    metropolis: { minPopulation: 8000, openSlots: 14, maxSlots: 16, promotionCost: 150000, promotionCp: 20000, slotUnlockCost: 75000, activeProjects: 3 }
  };
  const migratedNumber = (item, base, key) => {
    const current = toNumber(item?.[key], base[key]);
    const old = oldTiers[base.id]?.[key];
    return migrateLegacy && old !== undefined && current === old ? base[key] : current;
  };
  return {
    tiers: fallback.tiers.map(base => {
      const item = sourceTiers.find(candidate => cleanString(candidate?.id) === base.id) || {};
      return {
        id: base.id,
        name: cleanString(item.name) || base.name,
        minPopulation: Math.max(0, Math.trunc(migratedNumber(item, base, "minPopulation"))),
        openSlots: Math.max(0, Math.trunc(migratedNumber(item, base, "openSlots"))),
        maxSlots: Math.max(1, Math.trunc(migratedNumber(item, base, "maxSlots"))),
        promotionCost: Math.max(0, migratedNumber(item, base, "promotionCost")),
        promotionCp: Math.max(0, migratedNumber(item, base, "promotionCp")),
        promotionMaterials: Math.max(0, toNumber(item.promotionMaterials, base.promotionMaterials)),
        promotionFood: Math.max(0, toNumber(item.promotionFood, base.promotionFood)),
        slotUnlockCost: Math.max(0, migratedNumber(item, base, "slotUnlockCost")),
        activeProjects: clamp(Math.trunc(migratedNumber(item, base, "activeProjects")), 1, 5),
        coreName: cleanString(item.coreName) || base.coreName
      };
    }),
    economy: {
      taxPerFreePop: Math.max(0, migrateLegacy && toNumber(source.economy?.taxPerFreePop, 5) === 5 ? fallback.economy.taxPerFreePop : toNumber(source.economy?.taxPerFreePop, fallback.economy.taxPerFreePop)),
      incomeMultiplier: Math.max(0, toNumber(source.economy?.incomeMultiplier, fallback.economy.incomeMultiplier)),
      constructionHireCostPerCp: Math.max(0, migrateLegacy && toNumber(source.economy?.constructionHireCostPerCp, 10) === 10 ? fallback.economy.constructionHireCostPerCp : toNumber(source.economy?.constructionHireCostPerCp, fallback.economy.constructionHireCostPerCp)),
      foodPerPop: Math.max(0, toNumber(source.economy?.foodPerPop, fallback.economy.foodPerPop)),
      subsistenceFoodPerFreePop: Math.max(0, toNumber(source.economy?.subsistenceFoodPerFreePop, fallback.economy.subsistenceFoodPerFreePop)),
      recruitmentDiscountCap: clamp(toNumber(source.economy?.recruitmentDiscountCap, fallback.economy.recruitmentDiscountCap), 0, 100),
      upkeepDiscountCap: clamp(toNumber(source.economy?.upkeepDiscountCap, fallback.economy.upkeepDiscountCap), 0, 100)
    },
    construction: {
      cpPerFreePop: Math.max(0, toNumber(source.construction?.cpPerFreePop, fallback.construction.cpPerFreePop)),
      overflowToNextProject: source.construction?.overflowToNextProject === undefined
        ? fallback.construction.overflowToNextProject
        : Boolean(source.construction.overflowToNextProject),
      cancellationRefundPercent: clamp(toNumber(source.construction?.cancellationRefundPercent, fallback.construction.cancellationRefundPercent), 0, 100),
      snapshotLimit: clamp(Math.trunc(toNumber(source.construction?.snapshotLimit, fallback.construction.snapshotLimit)), 1, 20)
    },
    military: {
      professionalGarrisonPercent: Math.max(0, toNumber(source.military?.professionalGarrisonPercent, fallback.military.professionalGarrisonPercent)),
      professionalCampaignPercent: Math.max(0, toNumber(source.military?.professionalCampaignPercent, fallback.military.professionalCampaignPercent)),
      militiaGarrisonPercent: Math.max(0, toNumber(source.military?.militiaGarrisonPercent, fallback.military.militiaGarrisonPercent)),
      militiaCampaignPercent: Math.max(0, toNumber(source.military?.militiaCampaignPercent, fallback.military.militiaCampaignPercent)),
      manpowerRate: clamp(toNumber(source.military?.manpowerRate, fallback.military.manpowerRate), 0, 100)
    },
    growth: {
      minimumRate: toNumber(source.growth?.minimumRate, fallback.growth.minimumRate),
      maximumRate: toNumber(source.growth?.maximumRate, fallback.growth.maximumRate)
    },
    events: {
      enabled: source.events?.enabled === undefined ? fallback.events.enabled : Boolean(source.events.enabled),
      publicOrderRollStep: Math.max(1, toNumber(source.events?.publicOrderRollStep, fallback.events.publicOrderRollStep)),
      foodShortagePenalty: Math.max(0, toNumber(source.events?.foodShortagePenalty, fallback.events.foodShortagePenalty))
    }
  };
}

function normalizeSettlementTemplates(items, migrateLegacy = false) {
  const defaults = starterSettlementTemplates();
  const source = Array.isArray(items) && items.length ? items : defaults;
  const normalizeTemplate = item => ({
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || "Settlement Template",
    description: cleanString(item?.description),
    tier: settlementTierValue(item?.tier),
    population: Math.max(0, Math.trunc(toNumber(item?.population, 100))),
    treasure: Math.max(0, toNumber(item?.treasure, 0)),
    food: Math.max(0, toNumber(item?.food, 0)),
    materials: Math.max(0, toNumber(item?.materials, 0)),
    publicOrder: clamp(toNumber(item?.publicOrder, 50), 0, 100),
    manpowerBonus: toNumber(item?.manpowerBonus, 0),
    terrainTags: normalizeTags(item?.terrainTags),
    biomeTags: normalizeTags(item?.biomeTags),
    buildings: Array.isArray(item?.buildings) ? clone(item.buildings) : []
  });
  const merged = new Map(defaults.map(item => [item.id, normalizeTemplate(item)]));
  for (const item of source) {
    const normalized = normalizeTemplate(item);
    const base = merged.get(normalized.id);
    merged.set(normalized.id, migrateLegacy && base ? { ...normalized, ...base } : { ...(base || {}), ...normalized });
  }
  return Array.from(merged.values());
}

function normalizeCatalog(items, unitCatalog = TROOP_TYPES, migrateLegacy = false) {
  const merged = new Map(BUILDING_CATALOG.map(item => [item.id, { ...item }]));
  if (Array.isArray(items)) {
    for (const item of items) {
      const rawId = cleanString(item?.id);
      if (migrateLegacy && LEGACY_BUILDING_IDS.includes(rawId) && !BUILDING_CATALOG.some(candidate => candidate.id === rawId)) continue;
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
  const nodeTier = clamp(Math.trunc(toNumber(item?.nodeTier, 1)), 1, 5);
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
    materialCost: Math.max(0, toNumber(item?.materialCost, 0)),
    foodCost: Math.max(0, toNumber(item?.foodCost, 0)),
    foodOutput: toNumber(item?.foodOutput, 0),
    materialsOutput: toNumber(item?.materialsOutput, 0),
    foodUpkeep: Math.max(0, toNumber(item?.foodUpkeep, 0)),
    materialsUpkeep: Math.max(0, toNumber(item?.materialsUpkeep, 0)),
    publicOrder: toNumber(item?.publicOrder, 0),
    defense: Math.max(0, toNumber(item?.defense, 0)),
    eventRollBonus: toNumber(item?.eventRollBonus, 0),
    grantsTags: normalizeTags(item?.grantsTags),
    requiredTagsAny: normalizeTags(item?.requiredTagsAny),
    mitigationTags: normalizeTags(item?.mitigationTags),
    slot: item?.slot === "military" ? "military" : "economic",
    slotUse: Math.max(1, Math.trunc(toNumber(item?.slotUse, 1))),
    professionalCapacity: Math.max(0, toNumber(item?.professionalCapacity, 0)),
    militiaCapacity: Math.max(0, toNumber(item?.militiaCapacity, 0)),
    bonusEconomicSlots: toNumber(item?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(item?.bonusMilitarySlots, 0),
    recruitType: recruitableUnitIds[0] || legacyRecruitType,
    recruitPerLevel: Math.max(0, toNumber(item?.recruitPerLevel, 0)),
    canRecruit: item?.canRecruit === undefined ? recruitableUnitIds.length > 0 && toNumber(item?.recruitPerLevel, 0) > 0 : Boolean(item.canRecruit),
    recruitableUnitIds,
    chainId: cleanString(item?.chainId) || cleanString(item?.id) || randomId(),
    nodeTier,
    parentIds: (Array.isArray(item?.parentIds) ? item.parentIds : splitTags(item?.parentIds)).map(cleanString).filter(Boolean),
    settlementTier: SETTLEMENT_TIER_IDS[nodeTier - 1],
    constructionBonus: Math.max(0, toNumber(item?.constructionBonus, 0)),
    recruitmentDiscount: clamp(toNumber(item?.recruitmentDiscount, 0), 0, 90),
    upkeepDiscount: clamp(toNumber(item?.upkeepDiscount, 0), 0, 90),
    imageUrl: cleanString(item?.imageUrl),
    enabled: item?.enabled === undefined ? true : Boolean(item.enabled),
    maxLevel: 5,
    uniqueChain: item?.uniqueChain === undefined ? false : Boolean(item.uniqueChain),
    maxPerSettlement: Math.max(0, Math.trunc(toNumber(item?.maxPerSettlement, 1))),
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
    tier: clamp(Math.trunc(toNumber(item?.tier, 1)), 1, 5),
    quality: clamp(Math.trunc(toNumber(item?.quality, 1)), 1, 5),
    melee: clamp(toNumber(item?.melee, 1), 0, 10),
    ranged: clamp(toNumber(item?.ranged, 1), 0, 10),
    defense: clamp(toNumber(item?.defense, 1), 0, 10),
    morale: clamp(toNumber(item?.morale, 1), 0, 10),
    mobility: clamp(toNumber(item?.mobility, 1), 0, 10),
    charge: clamp(toNumber(item?.charge, 0), 0, 10),
    siege: clamp(toNumber(item?.siege, 0), 0, 10),
    powerModifier: toNumber(item?.powerModifier, 0),
    manpowerCost: Math.max(0, toNumber(item?.manpowerCost, 1)),
    requiredTags: normalizeTags(item?.requiredTags),
    special: Boolean(item?.special),
    maxPerSettlement: Math.max(0, Math.trunc(toNumber(item?.maxPerSettlement, 0))),
    useRuleUpkeep: item?.useRuleUpkeep === undefined ? true : Boolean(item.useRuleUpkeep),
    enabled: item?.enabled === undefined ? true : Boolean(item.enabled),
    imageUrl: cleanString(item?.imageUrl),
    actorUuid: cleanString(item?.actorUuid),
    description: cleanString(item?.description)
  };
}

function normalizeSettlement(item, unitCatalog = TROOP_TYPES, catalog = BUILDING_CATALOG, rules = defaultRules(), migrateLegacy = false) {
  const tier = settlementTierValue(item?.tier || item?.type);
  const buildings = Array.isArray(item?.buildings)
    ? item.buildings.map(building => {
      const mappedCatalogId = migrateLegacy ? LEGACY_BUILDING_MAP[building?.catalogId] || building?.catalogId : building?.catalogId;
      const mapped = { ...building, catalogId: mappedCatalogId };
      return normalizeBuilding(mapped, unitCatalog, catalog.find(template => template.id === mappedCatalogId), migrateLegacy);
    })
    : [];
  const projects = Array.isArray(item?.projects) ? item.projects.map(project => normalizeProject({
    ...project,
    catalogId: migrateLegacy ? LEGACY_BUILDING_MAP[project?.catalogId] || project?.catalogId : project?.catalogId
  })) : [];
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
    food: Math.max(0, toNumber(item?.food, Math.max(0, toNumber(item?.population, 0) * 4))),
    materials: Math.max(0, toNumber(item?.materials, Math.max(100, toNumber(item?.population, 0) * 2))),
    publicOrder: clamp(toNumber(item?.publicOrder, 50), 0, 100),
    manpowerBonus: toNumber(item?.manpowerBonus, 0),
    manpowerOverride: cleanString(item?.manpowerOverride),
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
    districtBackgroundUrl: cleanString(item?.districtBackgroundUrl || item?.imageUrl),
    backgroundOverlay: clamp(toNumber(item?.backgroundOverlay, 55), 0, 90),
    pendingEvents: Array.isArray(item?.pendingEvents) ? item.pendingEvents.map(normalizePendingEvent).filter(Boolean).slice(0, 25) : [],
    turnSnapshots: Array.isArray(item?.turnSnapshots) ? item.turnSnapshots.map(normalizeTurnSnapshot).filter(Boolean).slice(0, rules.construction.snapshotLimit) : [],
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
  const nodeTier = clamp(Math.trunc(toNumber(source?.nodeTier, 1)), 1, 5);
  return {
    id: cleanString(source?.id) || randomId(),
    catalogId: cleanString(source?.catalogId),
    slotId: cleanString(source?.slotId),
    name: cleanString(source?.name) || "Building",
    category: source?.category === "military" || source?.slot === "military" ? "military" : "economic",
    active: source?.active === undefined ? true : Boolean(source.active),
    level: clamp(Math.trunc(toNumber(source?.level, 1)), 1, 5),
    assignedPop: Math.max(0, toNumber(source?.assignedPop, 0)),
    workers: Math.max(0, toNumber(source?.workers, 0), migrateLegacy ? toNumber(source?.assignedPop, 0) : 0),
    rate: Math.max(0, toNumber(source?.rate, 0)),
    flatOutput: toNumber(source?.flatOutput, 0),
    buildingUpkeep: Math.max(0, toNumber(source?.buildingUpkeep, 0)),
    terrain: cleanString(source?.terrain) || "Any",
    requirement: cleanString(source?.requirement),
    crownCost: Math.max(0, toNumber(source?.crownCost, 0)),
    cpCost: Math.max(0, toNumber(source?.cpCost, 0)),
    materialCost: Math.max(0, toNumber(source?.materialCost, 0)),
    foodCost: Math.max(0, toNumber(source?.foodCost, 0)),
    foodOutput: toNumber(source?.foodOutput, 0),
    materialsOutput: toNumber(source?.materialsOutput, 0),
    foodUpkeep: Math.max(0, toNumber(source?.foodUpkeep, 0)),
    materialsUpkeep: Math.max(0, toNumber(source?.materialsUpkeep, 0)),
    publicOrder: toNumber(source?.publicOrder, 0),
    defense: Math.max(0, toNumber(source?.defense, 0)),
    eventRollBonus: toNumber(source?.eventRollBonus, 0),
    grantsTags: normalizeTags(source?.grantsTags),
    requiredTagsAny: normalizeTags(source?.requiredTagsAny),
    mitigationTags: normalizeTags(source?.mitigationTags),
    slot: source?.category === "military" || source?.slot === "military" ? "military" : "economic",
    slotUse: Math.max(1, Math.trunc(toNumber(source?.slotUse, 1))),
    extraSlotIds: normalizeTags(source?.extraSlotIds),
    professionalCapacity: Math.max(0, toNumber(source?.professionalCapacity, 0)),
    militiaCapacity: Math.max(0, toNumber(source?.militiaCapacity, 0)),
    bonusEconomicSlots: toNumber(source?.bonusEconomicSlots, 0),
    bonusMilitarySlots: toNumber(source?.bonusMilitarySlots, 0),
    recruitType: recruitableUnitIds[0] || legacyRecruitType,
    recruitPerLevel: Math.max(0, toNumber(source?.recruitPerLevel, 0)),
    canRecruit: source?.canRecruit === undefined ? recruitableUnitIds.length > 0 && toNumber(source?.recruitPerLevel, 0) > 0 : Boolean(source.canRecruit),
    recruitableUnitIds,
    chainId: cleanString(source?.chainId) || cleanString(source?.catalogId),
    nodeTier,
    parentIds: (Array.isArray(source?.parentIds) ? source.parentIds : splitTags(source?.parentIds)).map(cleanString).filter(Boolean),
    settlementTier: SETTLEMENT_TIER_IDS[nodeTier - 1],
    constructionBonus: Math.max(0, toNumber(source?.constructionBonus, 0)),
    recruitmentDiscount: clamp(toNumber(source?.recruitmentDiscount, 0), 0, 90),
    upkeepDiscount: clamp(toNumber(source?.upkeepDiscount, 0), 0, 90),
    requires: cleanString(source?.requires),
    bonus: toNumber(source?.bonus, 0),
    growth: toNumber(source?.growth, 0),
    imageUrl: cleanString(source?.imageUrl),
    special: Boolean(source?.special || source?.category === "special"),
    gmOnly: Boolean(source?.gmOnly),
    uniqueChain: Boolean(source?.uniqueChain),
    maxPerSettlement: Math.max(0, Math.trunc(toNumber(source?.maxPerSettlement, 1))),
    notes: cleanString(source?.notes)
  };
}

function normalizeTroop(item, unitCatalog = TROOP_TYPES, migrateLegacy = false) {
  const type = troopType(item?.type, unitCatalog);
  const oldDefaults = {
    militia: [1, 4], watchman: [2, 6], spearman: [4, 10], "men-at-arms": [6, 16], archer: [5, 14],
    crossbowman: [8, 20], sergeant: [15, 38], "mounted-scout": [14, 36], cavalry: [27, 72],
    knight: [54, 144], "siege-crew": [20, 52]
  }[type.id];
  const storedGarrison = toNumber(item?.garrisonCost, type.garrison);
  const storedCampaign = toNumber(item?.campaignCost, type.campaign);
  const useNewDefaults = Boolean(migrateLegacy && oldDefaults && storedGarrison === oldDefaults[0] && storedCampaign === oldDefaults[1]);
  const currentUpkeep = unitUpkeepFromRules(type, defaultRules());
  return {
    id: cleanString(item?.id) || randomId(),
    name: cleanString(item?.name) || type.name,
    type: type.id,
    role: troopRole(item?.role, type.role),
    count: Math.max(0, Math.trunc(toNumber(item?.count, 0))),
    mode: item?.mode === "campaign" ? "campaign" : "garrison",
    garrisonCost: Math.max(0, useNewDefaults ? currentUpkeep.garrison : storedGarrison),
    campaignCost: Math.max(0, useNewDefaults ? currentUpkeep.campaign : storedCampaign),
    useRuleUpkeep: item?.useRuleUpkeep === undefined ? Boolean(type.useRuleUpkeep) : Boolean(item.useRuleUpkeep),
    imageUrl: cleanString(item?.imageUrl) || type.imageUrl,
    actorUuid: cleanString(item?.actorUuid) || type.actorUuid,
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
    actorUuid: cleanString(item?.actorUuid),
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
    targetLevel: clamp(Math.trunc(toNumber(item?.targetLevel, 1)), 1, 5),
    targetSlotUse: Math.max(1, Math.trunc(toNumber(item?.targetSlotUse, 1))),
    reservedSlotIds: normalizeTags(item?.reservedSlotIds),
    requiredCrown: Math.max(0, toNumber(item?.requiredCrown, 0)),
    crownPaid: Math.max(0, toNumber(item?.crownPaid, 0)),
    requiredMaterials: Math.max(0, toNumber(item?.requiredMaterials, 0)),
    materialsPaid: Math.max(0, toNumber(item?.materialsPaid, 0)),
    requiredFood: Math.max(0, toNumber(item?.requiredFood, 0)),
    foodPaid: Math.max(0, toNumber(item?.foodPaid, 0)),
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
  const activeBuildings = settlement.buildings.filter(building => building.active);
  const economicBuildingBonus = Math.max(0, Math.trunc(activeBuildings.reduce((total, building) => total + building.bonusEconomicSlots, 0)));
  const militaryBuildingBonus = Math.max(0, Math.trunc(activeBuildings.reduce((total, building) => total + building.bonusMilitarySlots, 0)));
  const totalBonusSlots = settlement.slotBonus + economicBuildingBonus + militaryBuildingBonus;
  const occupiedDemand = settlement.buildings.reduce((total, building) => total + Math.max(1, building.slotUse), 0)
    + buildingProjects.filter(project => !project.replacesBuildingId && project.status !== "completed").reduce((total, project) => total + Math.max(1, project.targetSlotUse), 0);
  const requiredSlots = Math.max(
    1,
    tier.maxSlots + totalBonusSlots,
    source.length,
    occupiedDemand
  );
  const slots = Array.from({ length: requiredSlots }, (_, index) => {
    const raw = source.find(item => Math.trunc(toNumber(item?.index, -1)) === index) || source[index] || {};
    const lockedPosition = index >= tier.openSlots + totalBonusSlots;
    const gmLocked = Boolean(raw.gmLocked);
    const bonusOffset = index - (tier.maxSlots + settlement.slotBonus);
    const bonusCategory = bonusOffset >= 0
      ? bonusOffset < economicBuildingBonus ? "economic" : bonusOffset < economicBuildingBonus + militaryBuildingBonus ? "military" : "all"
      : "all";
    return {
      id: cleanString(raw.id) || `slot-${index + 1}`,
      index,
      label: cleanString(raw.label) || `District ${index + 1}`,
      unlocked: gmLocked ? Boolean(raw.unlocked) : !lockedPosition || Boolean(raw.unlocked),
      gmLocked,
      unlockCost: Math.max(0, toNumber(raw.unlockCost, tier.slotUnlockCost * Math.max(1, index - tier.openSlots + 1))),
      allowedCategory: ["economic", "military"].includes(raw.allowedCategory) ? raw.allowedCategory : bonusCategory,
      reservedByBuildingId: "",
      reservedByProjectId: ""
    };
  });

  const occupied = new Set();
  const claimSlot = preferredIds => {
    const preferred = normalizeTags(preferredIds);
    return preferred.map(id => slots.find(slot => slot.id === id && !occupied.has(slot.id))).find(Boolean)
      || slots.find(slot => slot.unlocked && !occupied.has(slot.id))
      || slots.find(slot => !occupied.has(slot.id));
  };
  for (const building of settlement.buildings) {
    const slot = claimSlot([building.slotId]);
    if (!slot) continue;
    slot.unlocked = true;
    building.slotId = slot.id;
    occupied.add(slot.id);
    const extraSlotIds = [];
    for (let index = 1; index < Math.max(1, building.slotUse); index += 1) {
      const extra = claimSlot(building.extraSlotIds);
      if (!extra) break;
      extra.unlocked = true;
      extra.reservedByBuildingId = building.id;
      extraSlotIds.push(extra.id);
      occupied.add(extra.id);
    }
    building.extraSlotIds = extraSlotIds;
  }

  for (const project of buildingProjects) {
    const replaced = settlement.buildings.find(building => building.id === project.replacesBuildingId);
    if (replaced) {
      project.slotId = replaced.slotId;
      project.reservedSlotIds = [...replaced.extraSlotIds];
      continue;
    }
    const slot = claimSlot([project.slotId]);
    if (!slot) continue;
    slot.unlocked = true;
    project.slotId = slot.id;
    occupied.add(slot.id);
    const reservedSlotIds = [];
    for (let index = 1; index < Math.max(1, project.targetSlotUse); index += 1) {
      const extra = claimSlot(project.reservedSlotIds);
      if (!extra) break;
      extra.unlocked = true;
      extra.reservedByProjectId = project.id;
      reservedSlotIds.push(extra.id);
      occupied.add(extra.id);
    }
    project.reservedSlotIds = reservedSlotIds;
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

function normalizeEventCatalog(items) {
  const merged = new Map(EVENT_CATALOG.map(item => [item.id, clone(item)]));
  if (Array.isArray(items)) {
    for (const item of items) {
      const normalized = normalizeMonthEvent(item);
      const builtIn = merged.get(normalized.id);
      merged.set(normalized.id, { ...(builtIn || {}), ...normalized, effects: { ...(builtIn?.effects || {}), ...normalized.effects } });
    }
  }
  return Array.from(merged.values()).map(normalizeMonthEvent);
}

function normalizeMonthEvent(item) {
  const severity = EVENT_SEVERITIES.some(option => option.value === item?.severity) ? item.severity : "neutral";
  const effects = item?.effects && typeof item.effects === "object" ? item.effects : {};
  const minRoll = clamp(Math.trunc(toNumber(item?.minRoll, 1)), 1, 100);
  const maxRoll = clamp(Math.trunc(toNumber(item?.maxRoll, minRoll)), minRoll, 100);
  return {
    id: cleanString(item?.id) || `event-${randomId().toLowerCase()}`,
    name: cleanString(item?.name) || "Month Event",
    minRoll,
    maxRoll,
    severity,
    description: cleanString(item?.description),
    effects: {
      crown: toNumber(effects.crown, 0),
      food: toNumber(effects.food, 0),
      materials: toNumber(effects.materials, 0),
      population: Math.trunc(toNumber(effects.population, 0)),
      publicOrder: toNumber(effects.publicOrder, 0)
    },
    tags: normalizeTags(item?.tags),
    mitigationTags: normalizeTags(item?.mitigationTags),
    defenseDivisor: Math.max(0, toNumber(item?.defenseDivisor, 0)),
    enabled: item?.enabled === undefined ? true : Boolean(item.enabled),
    imageUrl: cleanString(item?.imageUrl)
  };
}

function normalizePendingEvent(item) {
  if (!item || typeof item !== "object") return null;
  const effects = item.effects && typeof item.effects === "object" ? item.effects : {};
  return {
    id: cleanString(item.id) || randomId(),
    eventId: cleanString(item.eventId),
    month: Math.max(1, Math.trunc(toNumber(item.month, 1))),
    rawRoll: clamp(Math.trunc(toNumber(item.rawRoll, 50)), 1, 100),
    modifier: Math.trunc(toNumber(item.modifier, 0)),
    finalRoll: clamp(Math.trunc(toNumber(item.finalRoll, item.rawRoll)), 1, 100),
    name: cleanString(item.name) || "Month Event",
    description: cleanString(item.description),
    severity: EVENT_SEVERITIES.some(option => option.value === item.severity) ? item.severity : "neutral",
    effects: {
      crown: toNumber(effects.crown, 0),
      food: toNumber(effects.food, 0),
      materials: toNumber(effects.materials, 0),
      population: Math.trunc(toNumber(effects.population, 0)),
      publicOrder: toNumber(effects.publicOrder, 0)
    },
    mitigationText: cleanString(item.mitigationText),
    status: ["pending", "accepted", "ignored"].includes(item.status) ? item.status : "pending",
    imageUrl: cleanString(item.imageUrl),
    created: Math.max(0, toNumber(item.created, Date.now()))
  };
}

function normalizeTurnSnapshot(item) {
  if (!item || typeof item !== "object" || !item.state || typeof item.state !== "object") return null;
  return {
    id: cleanString(item.id) || randomId(),
    month: Math.max(1, Math.trunc(toNumber(item.month, 1))),
    created: Math.max(0, toNumber(item.created, Date.now())),
    reason: cleanString(item.reason) || "Before month processing",
    state: clone(item.state)
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
  const economicWorkers = activeBuildings.filter(building => assignmentKind(building) === "economic").reduce((total, building) => total + assignedWorkers(building), 0);
  const militaryWorkers = activeBuildings.filter(building => assignmentKind(building) === "military").reduce((total, building) => total + assignedWorkers(building), 0);
  const professionalSoldiers = settlement.troops.filter(troop => troop.role === "professional").reduce((total, troop) => total + troop.count, 0);
  const militia = settlement.troops.filter(troop => troop.role === "militia").reduce((total, troop) => total + troop.count, 0);
  const troopManpowerUsed = settlement.troops.reduce((total, troop) => total + troopManpowerUse(troop, data.unitCatalog), 0);
  const civilianPopulationRaw = settlement.population - troopManpowerUsed;
  const civilianPopulation = Math.max(0, civilianPopulationRaw);
  const freePopRaw = civilianPopulationRaw - economicWorkers - militaryWorkers;
  const freePop = Math.max(0, freePopRaw);
  const baseIncome = freePop * rules.economy.taxPerFreePop;
  const buildingOutputs = activeBuildings.map(building => buildingOutput(building, settlement));
  const buildingOutputTotal = buildingOutputs.reduce((total, output) => total + output.total, 0);
  const grossIncome = Math.round((baseIncome + buildingOutputTotal) * rules.economy.incomeMultiplier);
  const buildingUpkeep = activeBuildings.reduce((total, building) => total + Math.max(0, building.buildingUpkeep), 0);
  const militaryCostRaw = settlement.troops.reduce((total, troop) => {
    const mode = troop.mode === "campaign" ? "campaign" : "garrison";
    const type = troopType(troop.type, data.unitCatalog || TROOP_TYPES);
    const upkeep = troop.useRuleUpkeep ? unitUpkeepFromRules(type, rules) : { garrison: troop.garrisonCost, campaign: troop.campaignCost };
    return total + troop.count * (mode === "campaign" ? upkeep.campaign : upkeep.garrison);
  }, 0);
  const upkeepDiscount = settlementUpkeepDiscount(settlement, rules);
  const militaryCost = Math.round(militaryCostRaw * (1 - upkeepDiscount / 100));
  const activeBuildingProjects = settlement.projects.filter(project => project.kind === "building" && project.status !== "completed");
  const activeProjectSlots = new Set(activeBuildingProjects.flatMap(project => [project.slotId, ...(project.reservedSlotIds || [])]).filter(Boolean));
  const activeBuildingSlots = new Set(activeBuildings.flatMap(building => [building.slotId, ...(building.extraSlotIds || [])]).filter(Boolean));
  const unlockedSlots = settlement.slots.filter(slot => slot.unlocked).length;
  const usedSlots = new Set([...activeBuildingSlots, ...activeProjectSlots]).size;
  const economicSlots = settlement.slots.filter(slot => slot.unlocked && slot.allowedCategory !== "military").length;
  const militarySlots = settlement.slots.filter(slot => slot.unlocked && slot.allowedCategory !== "economic").length;
  const usedEconomicSlots = new Set(activeBuildings.filter(building => building.category === "economic").flatMap(building => [building.slotId, ...(building.extraSlotIds || [])])).size;
  const usedMilitarySlots = new Set(activeBuildings.filter(building => building.category === "military").flatMap(building => [building.slotId, ...(building.extraSlotIds || [])])).size;
  const professionalCapacity = Math.floor(activeBuildings.reduce((total, building) => total + building.professionalCapacity * buildingStaffing(building), 0));
  const militiaCapacity = Math.floor(activeBuildings.reduce((total, building) => total + building.militiaCapacity * buildingStaffing(building), 0));
  const recruitmentCapacity = activeBuildings.reduce((total, building) => total + buildingRecruitmentCapacity(building), 0);
  const constructionBonus = Math.floor(activeBuildings.reduce((total, building) => total + building.constructionBonus * buildingStaffing(building), 0));
  const cpThisMonth = Math.max(0, Math.floor(freePop * rules.construction.cpPerFreePop + constructionBonus));
  const subsistenceFood = Math.floor(freePop * rules.economy.subsistenceFoodPerFreePop);
  const buildingFood = Math.round(buildingOutputs.reduce((total, output) => total + output.food, 0));
  const buildingMaterials = Math.round(buildingOutputs.reduce((total, output) => total + output.materials, 0));
  const foodUpkeep = Math.round(activeBuildings.reduce((total, building) => total + building.foodUpkeep, 0));
  const materialsUpkeep = Math.round(activeBuildings.reduce((total, building) => total + building.materialsUpkeep, 0));
  const foodProduction = subsistenceFood + buildingFood;
  const foodConsumption = Math.round(settlement.population * rules.economy.foodPerPop + foodUpkeep);
  const foodBalance = foodProduction - foodConsumption;
  const foodAfterTurn = settlement.food + foodBalance;
  const foodShortage = Math.max(0, -foodAfterTurn);
  const materialsProduction = buildingMaterials;
  const materialsBalance = materialsProduction - materialsUpkeep;
  const queuedManpower = settlement.recruitment
    .filter(order => order.status !== "completed")
    .reduce((total, order) => total + Math.max(0, order.targetCount - order.trained) * troopType(order.troopType, data.unitCatalog || TROOP_TYPES).manpowerCost, 0);
  const calculatedManpower = Math.floor(freePop * rules.military.manpowerRate / 100) + settlement.manpowerBonus;
  const manpowerPool = cleanString(settlement.manpowerOverride) !== ""
    ? Math.max(0, Math.trunc(toNumber(settlement.manpowerOverride, 0)))
    : Math.max(0, Math.trunc(calculatedManpower));
  const manpowerAvailable = Math.max(0, manpowerPool - queuedManpower);
  const buildingPublicOrder = activeBuildings.reduce((total, building) => total + building.publicOrder * buildingStaffing(building), 0);
  const effectivePublicOrder = clamp(Math.round(settlement.publicOrder + buildingPublicOrder), 0, 100);
  const eventRollBonus = Math.round(activeBuildings.reduce((total, building) => total + building.eventRollBonus * buildingStaffing(building), 0));
  const buildingDefense = Math.round(activeBuildings.reduce((total, building) => total + building.defense * buildingStaffing(building), 0));
  const armyPower = Math.round(settlement.troops.reduce((total, troop) => total + regimentPower(troop, data.unitCatalog || TROOP_TYPES), 0));
  const garrisonPower = Math.round(settlement.troops.filter(troop => troop.mode !== "campaign").reduce((total, troop) => total + regimentPower(troop, data.unitCatalog || TROOP_TYPES), 0));
  const defense = Math.round(buildingDefense + garrisonPower * 0.5);
  const strategicTags = Array.from(settlementGrantedTags(settlement));
  const growth = calculateGrowth(settlement, { totalPop: settlement.population, foodShortage, effectivePublicOrder }, rules);

  return {
    totalPop: settlement.population,
    civilianPopulation,
    civilianPopulationRaw,
    economicWorkers,
    militaryWorkers,
    assignedWorkers: economicWorkers + militaryWorkers,
    freePopRaw,
    freePop,
    troopManpowerUsed,
    manpowerPool,
    manpowerQueued: queuedManpower,
    manpowerAvailable,
    totalMp: manpowerPool,
    professionalSoldiers,
    militia,
    mpUsed: queuedManpower,
    mpRemaining: manpowerAvailable,
    baseIncome,
    buildingOutput: buildingOutputTotal,
    grossIncome,
    buildingUpkeep,
    militaryCost,
    militaryCostRaw,
    upkeepDiscount,
    netIncome: grossIncome - buildingUpkeep - militaryCost,
    foodStored: settlement.food,
    foodProduction,
    foodConsumption,
    foodBalance,
    foodAfterTurn: Math.max(0, foodAfterTurn),
    foodShortage,
    materialsStored: settlement.materials,
    materialsProduction,
    materialsUpkeep,
    materialsBalance,
    materialsAfterTurn: Math.max(0, settlement.materials + materialsBalance),
    publicOrderBase: settlement.publicOrder,
    buildingPublicOrder,
    effectivePublicOrder,
    eventRollBonus,
    defense,
    buildingDefense,
    armyPower,
    garrisonPower,
    strategicTags,
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
    recruitmentDiscount: settlementRecruitmentDiscount(settlement, null, rules),
    constructionBonus,
    cpThisMonth,
    growthRate: growth.rate,
    popChange: growth.popChange,
    projectedPop: Math.max(0, settlement.population + growth.popChange),
    pendingEventCount: settlement.pendingEvents.filter(event => event.status === "pending").length
  };
}

function calculateGrowth(settlement, summary, rules = defaultRules()) {
  const growth = settlement.growth;
  const buildingGrowth = settlement.buildings.reduce((total, building) => {
    return total + (building.active ? toNumber(building.growth, 0) * buildingStaffing(building) : 0);
  }, 0);
  const foodPenalty = summary.foodShortage > 0 ? -Math.max(0, rules.events.foodShortagePenalty) : 0;
  const orderModifier = (toNumber(summary.effectivePublicOrder, 50) - 50) / 100;
  const rawRate = cleanString(growth.overrideRate) !== ""
    ? toNumber(growth.overrideRate, 0)
    : growth.baseRate + growth.safeBonus + growth.foodBonus + growth.migrationBonus + growth.warPenalty + growth.faminePenalty + growth.plaguePenalty + growth.taxPenalty + growth.raidPenalty + growth.otherModifier + buildingGrowth + foodPenalty + orderModifier;
  const rate = settlement.overrides.ignoreGrowthLimits ? rawRate : clamp(rawRate, rules.growth.minimumRate, rules.growth.maximumRate);
  const overridePopChange = cleanString(growth.overridePopChange);
  const calculated = summary.totalPop * rate / 100;
  const popChange = overridePopChange !== "" ? Math.trunc(toNumber(overridePopChange, 0)) : growth.roundDown ? Math.floor(calculated) : Math.round(calculated);
  return { rate, popChange, foodPenalty, orderModifier, buildingGrowth };
}

function buildingOutput(building, settlement) {
  if (!building.active) return { base: 0, bonus: 0, total: 0, food: 0, materials: 0, staffing: 0 };
  const staffing = buildingStaffing(building);
  const assigned = assignedWorkers(building);
  const base = assigned * building.rate + building.flatOutput * staffing;
  const bonus = buildingBonus(building, settlement) * staffing;
  return {
    base,
    bonus,
    total: base + bonus,
    food: building.foodOutput * staffing,
    materials: building.materialsOutput * staffing,
    staffing
  };
}

function buildingBonus(building, settlement) {
  const has = id => settlement.buildings.some(candidate => candidate.active && candidate.catalogId === id);
  if (building.requires && has(building.requires)) return Math.max(0, toNumber(building.bonus, 0));
  return 0;
}

function buildWarnings(settlement, data, summary = calculateSettlement(settlement, data)) {
  const warnings = [];
  const overrides = settlement.overrides;

  if (summary.civilianPopulationRaw < 0 && !overrides.ignoreManpowerLimits) warnings.push(`Army manpower exceeds Total POP by ${formatNumber(Math.abs(summary.civilianPopulationRaw))}.`);
  if (summary.freePopRaw < 0 && !overrides.ignorePopulationLimits) warnings.push(`Workers and soldiers exceed Total POP by ${formatNumber(Math.abs(summary.freePopRaw))}.`);
  if (summary.manpowerQueued > summary.manpowerPool && !overrides.ignoreManpowerLimits) warnings.push(`Recruitment reserves ${formatNumber(summary.manpowerQueued - summary.manpowerPool)} more manpower than available.`);
  if (summary.professionalSoldiers > summary.professionalCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Professional soldiers exceed capacity by ${formatNumber(summary.professionalSoldiers - summary.professionalCapacity)}.`);
  if (summary.militia > summary.militiaCapacity && !overrides.ignoreMilitaryCapacity) warnings.push(`Militia exceeds capacity by ${formatNumber(summary.militia - summary.militiaCapacity)}.`);
  if (summary.usedSlots > summary.unlockedSlots && !overrides.ignoreSlotLimits) warnings.push(`Unlocked district slots exceeded by ${formatNumber(summary.usedSlots - summary.unlockedSlots)}.`);
  if (summary.foodShortage > 0) warnings.push(`Projected food shortage: ${formatNumber(summary.foodShortage)} Food.`);

  for (const building of settlement.buildings.filter(item => item.active)) {
    if (building.assignedPop > workerCapacity(building)) warnings.push(`${building.name}: assigned workers exceed capacity by ${formatNumber(building.assignedPop - workerCapacity(building))}.`);
    if (building.workers > 0 && building.assignedPop <= 0) warnings.push(`${building.name}: unstaffed and producing no effects.`);
    if ((building.extraSlotIds || []).length < Math.max(0, building.slotUse - 1) && !overrides.ignoreSlotLimits) warnings.push(`${building.name}: needs ${formatNumber(building.slotUse)} district slots.`);
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
  const availableTags = settlementGrantedTags(settlement);
  const requiredTagsAny = normalizeTags(item?.requiredTagsAny).map(tag => tag.toLowerCase());
  if (requiredTagsAny.length && !requiredTagsAny.some(tag => availableTags.has(tag))) return false;
  const requirement = cleanString(item?.terrain);
  const populationMatch = requirement.match(/([\d,]+)\s*\+?\s*POP/i);
  if (populationMatch) return settlement.population >= toNumber(populationMatch[1].replace(/,/g, ""), 0);
  if (/\brequired\b/i.test(requirement)) return true;
  return terrainRequirementMet({ ...item, active: true }, settlement);
}

function constructionRequirementMessage(item) {
  const tags = normalizeTags(item?.requiredTagsAny);
  if (tags.length) return `Requires one of: ${tags.join(", ")}.`;
  const requirement = cleanString(item?.terrain) || "Any";
  const populationMatch = requirement.match(/([\d,]+)\s*\+?\s*POP/i);
  if (populationMatch) return `Requires ${populationMatch[1]} POP.`;
  return `Requires terrain or region: ${requirement}.`;
}

function workerCapacity(building) {
  return building.workers;
}

function assignedWorkers(building) {
  return Math.min(Math.max(0, toNumber(building?.assignedPop, 0)), Math.max(0, workerCapacity(building)));
}

function buildingStaffing(building) {
  if (!building?.active) return 0;
  const capacity = workerCapacity(building);
  if (capacity <= 0) return 1;
  return clamp(toNumber(building.assignedPop, 0) / capacity, 0, 1);
}

function buildingRecruitmentCapacity(building) {
  if (!building.active || !building.canRecruit) return 0;
  return Math.max(0, Math.floor(toNumber(building.recruitPerLevel, 0) * buildingStaffing(building)));
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
  return Math.max(1, Math.trunc(toNumber(building?.slotUse, 1)));
}

function slotUseAtLevel(item, level) {
  return Math.max(1, Math.trunc(toNumber(item?.slotUse, 1)));
}

function constructionCost(item) {
  return {
    crown: Math.max(0, toNumber(item?.crownCost, 0)),
    cp: Math.max(0, toNumber(item?.cpCost, 0)),
    materials: Math.max(0, toNumber(item?.materialCost, 0)),
    food: Math.max(0, toNumber(item?.foodCost, 0))
  };
}

function settlementRecruitmentDiscount(settlement, source = null, rules = defaultRules()) {
  const total = settlement.buildings
    .filter(building => building.active)
    .reduce((sum, building) => sum + Math.max(0, building.recruitmentDiscount) * buildingStaffing(building), 0);
  const sourceBonus = source && !settlement.buildings.includes(source) ? Math.max(0, source.recruitmentDiscount) * buildingStaffing(source) : 0;
  return clamp(total + sourceBonus, 0, rules.economy.recruitmentDiscountCap);
}

function settlementUpkeepDiscount(settlement, rules = defaultRules()) {
  return clamp(settlement.buildings
    .filter(building => building.active)
    .reduce((sum, building) => sum + Math.max(0, building.upkeepDiscount) * buildingStaffing(building), 0), 0, rules.economy.upkeepDiscountCap);
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
    ...settlement.buildings.flatMap(building => [building.slotId, ...(building.extraSlotIds || [])]),
    ...settlement.projects.filter(project => project.kind === "building" && project.status !== "completed").flatMap(project => [project.slotId, ...(project.reservedSlotIds || [])])
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
  if (slot.reservedByBuildingId || slot.reservedByProjectId) reasons.push("This slot supports another multi-slot building.");
  if (slot.allowedCategory !== "all" && slot.allowedCategory !== item.category) reasons.push(`${slot.label} only accepts ${slot.allowedCategory} buildings.`);
  if (settlement.projects.some(project => project.kind === "building" && project.slotId === slot.id && project.status !== "completed")) reasons.push("This slot already has a queued project.");
  if (current) {
    if (!(item.parentIds || []).includes(current.catalogId)) reasons.push(`${item.name} is not a direct branch of ${current.name}.`);
  } else if ((item.parentIds || []).length) {
    reasons.push("This building requires its parent building in the selected slot.");
  }
  const existingFamily = settlement.buildings.some(building => building.id !== current?.id && building.chainId === item.chainId)
    || settlement.projects.some(project => project.status !== "completed" && project.slotId !== slot.id && data.catalog.find(candidate => candidate.id === project.catalogId)?.chainId === item.chainId);
  if (!current && item.uniqueChain && existingFamily) reasons.push(`Only one ${item.chainId} district family is allowed in this settlement.`);
  const sameNodeCount = settlement.buildings.filter(building => building.id !== current?.id && building.catalogId === item.id).length;
  if (item.maxPerSettlement > 0 && sameNodeCount >= item.maxPerSettlement) reasons.push(`${item.name} limit reached.`);
  const additionalSlots = Math.max(0, slotUse(item) - slotUse(current || { slotUse: 1 }));
  if (additionalSlots > 0 && !settlement.overrides.ignoreSlotLimits) {
    const occupied = new Set([
      ...settlement.buildings.filter(building => building.id !== current?.id).flatMap(building => [building.slotId, ...(building.extraSlotIds || [])]),
      ...settlement.projects.filter(project => project.status !== "completed" && project.slotId !== slot.id).flatMap(project => [project.slotId, ...(project.reservedSlotIds || [])])
    ]);
    const available = settlement.slots.filter(candidate => candidate.unlocked && !candidate.gmLocked && candidate.id !== slot.id && !occupied.has(candidate.id)).length;
    if (available < additionalSlots) reasons.push(`Needs ${formatNumber(additionalSlots)} additional unlocked district slot(s).`);
  }
  if (!settlement.overrides.ignoreBuildingRequirements) {
    if (tierIndex(settlement.tier) < tierIndex(item.settlementTier)) reasons.push(`Requires ${tierName(item.settlementTier, data.rules)}.`);
    if (!terrainRequirementMetForItem(item, settlement)) reasons.push(constructionRequirementMessage(item));
    if (item.requires && !settlement.buildings.some(building => building.active && building.catalogId === item.requires)) {
      reasons.push(`Requires ${data.catalog.find(candidate => candidate.id === item.requires)?.name || item.requires}.`);
    }
  }
  if (settlement.treasure < item.crownCost) reasons.push(`Needs ${formatNumber(item.crownCost - settlement.treasure)} more Crown.`);
  if (settlement.materials < item.materialCost) reasons.push(`Needs ${formatNumber(item.materialCost - settlement.materials)} more Materials.`);
  if (settlement.food < item.foodCost) reasons.push(`Needs ${formatNumber(item.foodCost - settlement.food)} more Food.`);
  return reasons;
}

function settlementGrantedTags(settlement) {
  const tags = new Set([...settlement.terrainTags, ...settlement.biomeTags, settlement.region, settlement.type]
    .map(tag => cleanString(tag).toLowerCase()).filter(Boolean));
  for (const building of settlement.buildings.filter(item => item.active && buildingStaffing(item) > 0)) {
    for (const tag of normalizeTags(building.grantsTags)) tags.add(tag.toLowerCase());
  }
  return tags;
}

function troopManpowerUse(troop, unitCatalog = TROOP_TYPES) {
  const type = troopType(troop.type, unitCatalog);
  return Math.max(0, troop.count * type.manpowerCost);
}

function unitCombatRating(unit) {
  const weighted = unit.melee + unit.ranged * 0.85 + unit.defense + unit.morale + unit.mobility * 0.5 + unit.charge * 0.65 + unit.siege * 0.45;
  const qualityFactor = 0.75 + unit.quality * 0.25;
  return Math.max(0.1, Math.round((weighted / 5 * qualityFactor + unit.powerModifier) * 10) / 10);
}

function regimentPower(troop, unitCatalog = TROOP_TYPES) {
  return Math.max(0, troop.count * unitCombatRating(troopType(troop.type, unitCatalog)));
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
  uiState.catalogKind = ["buildings", "units", "events"].includes(state.catalogKind) ? state.catalogKind : "buildings";
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
