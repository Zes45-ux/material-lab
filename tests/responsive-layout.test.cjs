const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("responsive CSS exposes bounded desktop workspace tokens", () => {
  const css = read("js/styles.css");

  assert.match(css, /--topbar-height:\s*clamp\(56px,/);
  assert.match(css, /--rail-width:\s*clamp\(232px,/);
  assert.match(css, /--inspector-width:\s*clamp\(312px,/);
  assert.match(css, /--stage-gutter:\s*clamp\(16px,/);
  assert.match(css, /--panel-pad:\s*clamp\(16px,/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?grid-row:\s*1\s*\/\s*-1/);
  assert.match(css, /@media\s*\(min-width:\s*1920px\)/);
  assert.match(css, /@media\s*\(min-width:\s*1920px\)[\s\S]*?\.material-grid[\s\S]*?repeat\(3,/);
});

test("responsive UI exposes mobile dock and mutually exclusive sheets", () => {
  const ui = read("js/components/ui.js");
  const css = read("js/styles.css");
  const index = read("index.html");

  assert.match(ui, /mobileSheet:\s*null/);
  assert.match(ui, /openMobileSheet\s*\(/);
  assert.match(ui, /closeMobileSheets\s*\(/);
  assert.match(ui, /className="mobile-dock"/);
  assert.match(ui, /aria-controls="material-rail"/);
  assert.match(ui, /aria-controls="material-inspector"/);
  assert.match(index, /data-inspector-open=["']false["']/);
  assert.match(ui, /dataset\.inspectorOpen/);
  assert.match(css, /\.mobile-dock\s*\{/);
  assert.match(css, /\.mobile-dock\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.mobile-dock\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /#background\[data-inspector-open="true"\]\s+#canvas-stage/);
});

test("mobile sheets expose modal focus handoff and keep focus inside the open sheet", () => {
  const ui = read("js/components/ui.js");

  assert.equal((ui.match(/role="dialog"/g) || []).length, 2);
  assert.match(ui, /aria-modal=\{mobileSheet === "materials"\}/);
  assert.match(ui, /aria-modal=\{open\}/);
  assert.match(ui, /mobilePanelRefs/);
  assert.match(ui, /mobileDockRefs/);
  assert.match(ui, /handleMobileSheetKeyDown/);
  assert.match(ui, /querySelectorAll\(/);
  assert.match(ui, /focus\(\)/);
});

test("brush-size dock control is independent from the materials sheet", () => {
  const ui = read("js/components/ui.js");
  const brushIcon = ui.indexOf('<span className="mobile-dock-icon"');
  const brushEnd = ui.indexOf("</button>", brushIcon);
  const brushButton = ui.slice(ui.lastIndexOf("<button", brushIcon), brushEnd);

  assert.notEqual(brushIcon, -1);
  assert.notEqual(brushEnd, -1);
  assert.doesNotMatch(brushButton, /is-active|aria-expanded/);
  assert.match(brushButton, /aria-controls="material-rail"/);
  assert.match(brushButton, /aria-label=\{["']笔刷大小/);
});

test("canvas layout uses computed gutter, clamps the canvas, and coalesces observer updates", () => {
  const layout = read("js/layout.js");

  assert.match(layout, /getComputedStyle\(stage\)/);
  assert.match(layout, /paddingLeft/);
  assert.match(layout, /--canvas-display-size/);
  assert.match(layout, /new ResizeObserver\(/);
  assert.match(layout, /stageObserver\.observe\(stage\)/);

  const styleFor = () => ({
    values: {},
    writes: [],
    setProperty(name, value) {
      this.values[name] = value;
      this.writes.push({ name, value });
    },
  });
  const stage = {
    clientWidth: 420,
    clientHeight: 300,
    style: styleFor(),
  };
  const canvas = { style: {} };
  const fluidCanvas = { style: {} };
  const fps = { style: {} };
  const elements = {
    "canvas-stage": stage,
    "sand-canvas": canvas,
    "fluid-canvas": fluidCanvas,
    fps,
  };
  const rafQueue = [];
  const observers = [];
  const computed = {
    paddingLeft: "16px",
    canvasMaxSize: "999px",
  };
  const sandbox = {
    document: {
      readyState: "complete",
      getElementById(id) {
        return elements[id] || null;
      },
      addEventListener() {},
    },
    window: {
      innerWidth: 1024,
      addEventListener() {},
    },
    getComputedStyle() {
      return {
        paddingLeft: computed.paddingLeft,
        getPropertyValue(name) {
          return name === "--canvas-max-size" ? computed.canvasMaxSize : "";
        },
      };
    },
    ResizeObserver: class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe() {}
    },
    requestAnimationFrame(callback) {
      rafQueue.push(callback);
      return rafQueue.length;
    },
    module: { exports: {} },
    exports: {},
    Math,
    Number,
    console,
  };

  vm.runInNewContext(
    layout.replace("export { resize };", "module.exports = { resize };") ,
    sandbox,
    { filename: "js/layout.js" }
  );

  assert.equal(stage.style.values["--canvas-display-size"], "268px");

  stage.clientWidth = 180;
  stage.clientHeight = 140;
  sandbox.module.exports.resize();
  assert.equal(stage.style.values["--canvas-display-size"], "120px");

  stage.clientWidth = 420;
  stage.clientHeight = 300;
  const writesBeforeObserver = stage.style.writes.length;
  observers[0].callback();
  observers[0].callback();
  assert.equal(rafQueue.length, 1);
  assert.equal(stage.style.writes.length, writesBeforeObserver);
  rafQueue.shift()();
  assert.equal(stage.style.writes.length, writesBeforeObserver + 1);
  assert.equal(stage.style.values["--canvas-display-size"], "268px");

  computed.paddingLeft = "15.6px";
  computed.canvasMaxSize = "600px";
  stage.clientWidth = 390;
  stage.clientHeight = 724;
  sandbox.module.exports.resize();
  assert.equal(stage.style.values["--canvas-display-size"], "358px");
  assert.equal(canvas.style.top, "calc(50% - var(--mobile-canvas-lift, 0px))");
  assert.equal(
    fluidCanvas.style.top,
    "calc(50% - var(--mobile-canvas-lift, 0px))"
  );

  computed.paddingLeft = "24px";
  stage.clientWidth = 685;
  stage.clientHeight = 1333;
  sandbox.module.exports.resize();
  assert.equal(stage.style.values["--canvas-display-size"], "600px");
});

test("mobile override resets legacy workspace geometry", () => {
  const css = read("js/styles.css");
  const mobileCss = css.slice(css.lastIndexOf("@media (max-width: 767px)"));

  assert.match(
    mobileCss,
    /--mobile-canvas-gutter:\s*clamp\(8px,\s*2\.5vw,\s*16px\)/
  );
  assert.match(mobileCss, /--canvas-max-size:\s*600px/);
  assert.match(
    mobileCss,
    /#canvas-stage\s*\{[\s\S]*?padding:\s*var\(--mobile-canvas-gutter\)/
  );
  assert.match(
    mobileCss,
    /\.topbar-actions\s*\{[\s\S]*?max-width:\s*none[\s\S]*?overflow:\s*visible/
  );
  assert.match(
    mobileCss,
    /\.material-rail\s*\{[\s\S]*?display:\s*grid[\s\S]*?grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.material-rail\s+\.panel-heading\s*\{[\s\S]*?grid-column:\s*auto/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.material-rail\s+\.panel-heading\s*\{[\s\S]*?grid-row:\s*auto/
  );
  assert.match(
    mobileCss,
    /\.brush-control\s*\{[\s\S]*?grid-column:\s*1[\s\S]*?grid-row:\s*3[\s\S]*?align-self:\s*stretch[\s\S]*?width:\s*100%/
  );
  assert.match(
    mobileCss,
    /\.material-rail,\s*\.material-inspector\s*\{[\s\S]*?border-inline:\s*0/
  );
  assert.match(
    mobileCss,
    /@media\s*\(max-width:\s*359px\)[\s\S]*?\.brand-lockup\s*>\s*div\s*\{[\s\S]*?display:\s*none/
  );
});

test("mobile canvas and material density use an explicit responsive contract", () => {
  const css = read("js/styles.css");
  const layout = read("js/layout.js");

  assert.match(css, /--mobile-canvas-gutter:\s*clamp\(8px,\s*2\.5vw,\s*16px\)/);
  assert.match(css, /--mobile-canvas-lift:\s*clamp\(16px,\s*4vh,\s*32px\)/);
  assert.match(
    css,
    /#canvas-stage::before\s*\{[\s\S]*?top:\s*calc\(50%\s*-\s*var\(--mobile-canvas-lift,\s*0px\)\)/
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*360px\)\s*and\s*\(max-width:\s*767px\)[\s\S]*?\.material-grid\s*\{[\s\S]*?repeat\(3,\s*minmax\(0,\s*1fr\)\)/
  );
  assert.match(css, /\.material-grid\s*\{[\s\S]*?gap:\s*6px/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*359px\)[\s\S]*?\.material-grid\s*\{[\s\S]*?repeat\(2,\s*minmax\(0,\s*1fr\)\)/
  );
  assert.match(css, /\.material-option\s*\{[\s\S]*?min-height:\s*48px[\s\S]*?padding:\s*6px/);
  assert.match(css, /\.material-swatch\s*\{[\s\S]*?width:\s*18px[\s\S]*?height:\s*18px/);
  assert.match(layout, /calc\(50% - var\(--mobile-canvas-lift, 0px\)\)/);
});

test("Figma font assets are tracked and included in the production copy list", () => {
  const webpack = read("webpack.config.js");
  const license = read("assets/OFL.txt");

  for (const file of [
    "assets/InterVariable.woff2",
    "assets/JetBrainsMono-Regular.woff2",
    "assets/FONTS.md",
    "assets/OFL.txt",
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} is missing`);
    const filename = file.split("/").pop();
    assert.match(webpack, new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(license, /The Inter Project Authors/);
  assert.match(license, /The JetBrains Mono Project Authors/);
  for (const section of [
    "SIL OPEN FONT LICENSE Version 1.1",
    "PREAMBLE",
    "DEFINITIONS",
    "PERMISSION & CONDITIONS",
    "TERMINATION",
    "DISCLAIMER",
  ]) {
    assert.match(license, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
