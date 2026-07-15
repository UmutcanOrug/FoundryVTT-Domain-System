import { createRequire } from "node:module";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Handlebars = require("C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/handlebars");
const testDir = path.dirname(fileURLToPath(import.meta.url));
const moduleDir = path.resolve(testDir, "..");
const source = fs.readFileSync(path.join(moduleDir, "scripts", "ds.js"), "utf8");
const template = fs.readFileSync(path.join(moduleDir, "templates", "ds-panel.hbs"), "utf8");
const workshopTemplate = fs.readFileSync(path.join(moduleDir, "templates", "ds-workshop.hbs"), "utf8");
let idCounter = 0;

class MockApplicationV2 {
  async _prepareContext() { return {}; }
  async _onRender() {}
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
  innerWidth: 1440,
  innerHeight: 900,
  Hooks: { once() {} },
  Handlebars,
  CONST: { KEYBINDING_PRECEDENCE: { NORMAL: 0 } },
  foundry: {
    applications: { api: { ApplicationV2: MockApplicationV2, HandlebarsApplicationMixin: Base => class extends Base {} } },
    utils: { deepClone: value => structuredClone(value), randomID: () => `preview-${++idCounter}` }
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

vm.runInContext(`${source}\n;globalThis.__preview = { defaultWorldData, buildContext, buildWorkshopContext, registerHandlebarsHelpers, uiState };`, context, { filename: "ds.js" });
context.__preview.registerHandlebarsHelpers();
const render = Handlebars.compile(template);
const renderWorkshop = Handlebars.compile(workshopTemplate);
const data = context.__preview.defaultWorldData();
const previewImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#263128"/><path d="M18 96h124L112 50 86 76 64 58z" fill="#c8a35e"/><circle cx="48" cy="34" r="12" fill="#78a77d"/></svg>')}`;
data.catalog.forEach((item, index) => { if (index % 3 === 0) item.imageUrl = previewImage; });
data.unitCatalog.forEach((item, index) => { if (index % 2 === 0) item.imageUrl = previewImage; });
data.settlements[0].treasure = 250000;
data.settlements[0].troops[0].count = 58;
data.settlements[0].ownerUserIds = [player.id];
data.settlements[0].pendingEvents = [{
  id: "preview-event",
  eventId: "merchant-caravan",
  month: data.month,
  rawRoll: 73,
  modifier: 2,
  finalRoll: 75,
  name: "Merchant Caravan",
  description: "A wealthy caravan chooses the settlement as its seasonal market.",
  severity: "opportunity",
  effects: { incomePercent: 15, recruitmentCostPercent: -5 },
  duration: 2,
  mitigationText: "Market security prevented losses.",
  status: "pending",
  imageUrl: "",
  created: Date.now()
}];
data.settlements[0].recruitment.push({
  id: "preview-replenishment",
  kind: "replenishment",
  sourceBuildingId: "",
  regimentId: "dl-maa",
  regimentName: "Men-at-Arms",
  imageUrl: "",
  actorUuid: "",
  troopType: "men-at-arms",
  targetCount: 12,
  trained: 0,
  costPerUnit: 228,
  crownPaid: 2736,
  status: "inProgress",
  createdAt: Date.now(),
  notes: "Independent month-end replenishment preview."
});
data.settlements[0].turnSnapshots = [{
  id: "preview-snapshot",
  month: data.month,
  created: Date.now(),
  reason: `Before Month ${data.month}`,
  state: structuredClone(data.settlements[0])
}];

const previews = [
  ["overview", "buildings"],
  ["overview-picker", "buildings"],
  ["town", "buildings"],
  ["construction", "buildings"],
  ["recruitment", "buildings"],
  ["rules", "buildings"],
  ["catalog-buildings", "buildings"],
  ["catalog-units", "units"],
  ["catalog-events", "events"],
  ["catalog-categories", "categories"],
  ["catalog-policies", "policies"],
  ["gm", "buildings"]
];

for (const [name, catalogKind] of previews) {
  context.__preview.uiState.activeTab = name.startsWith("catalog") ? "catalog" : name.startsWith("overview") ? "overview" : name;
  context.__preview.uiState.catalogKind = catalogKind;
  context.__preview.uiState.selectedDistrictSlotId = name === "overview-picker" ? data.settlements[0].buildings.find(item => item.catalogId === "farmstead")?.slotId || "slot-4" : "";
  const html = render(context.__preview.buildContext(data));
  fs.writeFileSync(path.join(testDir, `ui-preview-${name}.html`), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DS ${name} Preview</title><link rel="stylesheet" href="../styles/ds.css?v=0116">
<style>html,body{margin:0;width:100%;height:100%;background:#0d0f0d}.ds-window,.window-content{width:100%;height:100%}.fa-solid:before{content:"+";font-size:.72em}</style>
</head><body><div class="ds-window"><div class="window-content">${html}</div></div></body></html>`, "utf8");
}

context.game.user = player;
for (const name of ["player-construction", "player-recruitment"]) {
  context.__preview.uiState.activeTab = name.replace("player-", "");
  const html = render(context.__preview.buildContext(data));
  fs.writeFileSync(path.join(testDir, `ui-preview-${name}.html`), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DS ${name} Preview</title><link rel="stylesheet" href="../styles/ds.css?v=0116">
<style>html,body{margin:0;width:100%;height:100%;background:#0d0f0d}.ds-window,.window-content{width:100%;height:100%}.fa-solid:before{content:"+";font-size:.72em}</style>
</head><body><div class="ds-window"><div class="window-content">${html}</div></div></body></html>`, "utf8");
}

context.game.user = gm;
for (const kind of ["building", "unit", "regiment"]) {
  const html = renderWorkshop(context.__preview.buildWorkshopContext(data, kind, data.settlements[0].id));
  fs.writeFileSync(path.join(testDir, `ui-preview-workshop-${kind}.html`), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DS ${kind} Workshop Preview</title><link rel="stylesheet" href="../styles/ds.css?v=0116">
<style>html,body{margin:0;width:100%;height:100%;background:#0d0f0d}.ds-workshop-window,.window-content{width:100%;height:100%}.fa-solid:before{content:"+";font-size:.72em}</style>
</head><body><div class="ds-workshop-window"><div class="window-content">${html}</div></div></body></html>`, "utf8");
}

console.log(`Rendered ${previews.length + 5} DS UI previews`);
