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

vm.runInContext(`${source}\n;globalThis.__preview = { defaultWorldData, buildContext, registerHandlebarsHelpers, uiState };`, context, { filename: "ds.js" });
context.__preview.registerHandlebarsHelpers();
const render = Handlebars.compile(template);
const data = context.__preview.defaultWorldData();
data.settlements[0].treasure = 25000;
data.settlements[0].ownerUserIds = [player.id];

const previews = [
  ["overview", "buildings"],
  ["town", "buildings"],
  ["construction", "buildings"],
  ["recruitment", "buildings"],
  ["rules", "buildings"],
  ["catalog-buildings", "buildings"],
  ["catalog-units", "units"],
  ["gm", "buildings"]
];

for (const [name, catalogKind] of previews) {
  context.__preview.uiState.activeTab = name.startsWith("catalog") ? "catalog" : name;
  context.__preview.uiState.catalogKind = catalogKind;
  const html = render(context.__preview.buildContext(data));
  fs.writeFileSync(path.join(testDir, `ui-preview-${name}.html`), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DS ${name} Preview</title><link rel="stylesheet" href="../styles/ds.css">
<style>html,body{margin:0;width:100%;height:100%;background:#0d0f0d}.ds-window,.window-content{width:100%;height:100%}.fa-solid:before{content:"◆";font-size:.72em}</style>
</head><body><div class="ds-window"><div class="window-content">${html}</div></div></body></html>`, "utf8");
}

context.game.user = player;
for (const name of ["player-construction", "player-recruitment"]) {
  context.__preview.uiState.activeTab = name.replace("player-", "");
  const html = render(context.__preview.buildContext(data));
  fs.writeFileSync(path.join(testDir, `ui-preview-${name}.html`), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DS ${name} Preview</title><link rel="stylesheet" href="../styles/ds.css">
<style>html,body{margin:0;width:100%;height:100%;background:#0d0f0d}.ds-window,.window-content{width:100%;height:100%}.fa-solid:before{content:"◆";font-size:.72em}</style>
</head><body><div class="ds-window"><div class="window-content">${html}</div></div></body></html>`, "utf8");
}

console.log(`Rendered ${previews.length + 2} DS UI previews`);
