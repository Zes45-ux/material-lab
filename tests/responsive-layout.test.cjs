const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

test("canvas layout reads CSS gutter and observes stage geometry", () => {
  const layout = read("js/layout.js");

  assert.match(layout, /getComputedStyle\(stage\)/);
  assert.match(layout, /--stage-gutter/);
  assert.match(layout, /Math\.floor\(/);
  assert.match(layout, /--canvas-display-size/);
  assert.match(layout, /new ResizeObserver\(/);
  assert.match(layout, /stageObserver\.observe\(stage\)/);
});

test("Figma font assets are tracked and included in the production copy list", () => {
  const webpack = read("webpack.config.js");

  for (const file of [
    "assets/InterVariable.woff2",
    "assets/JetBrainsMono-Regular.woff2",
    "assets/FONTS.md",
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} is missing`);
    const filename = file.split("/").pop();
    assert.match(webpack, new RegExp(filename.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")));
  }
});
