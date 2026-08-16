const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Figma/FigJam theme exposes the material-lab token set", () => {
  const css = read("js/styles.css");

  for (const token of [
    "figma-canvas",
    "figma-ink",
    "figma-surface",
    "figma-hairline",
    "figma-block-blue",
    "figma-block-mint",
    "figma-block-coral",
    "figma-block-lilac",
  ]) {
    assert.match(css, new RegExp(`--${token}\\s*:`), `missing --${token}`);
  }

  for (const family of ["base", "life", "energy", "special"]) {
    assert.match(
      css,
      new RegExp(`\\.material-group\\[data-family=["']${family}["']\\]`),
      `missing ${family} family styling`
    );
  }
});

test("material metadata and DOM expose stable family hooks", () => {
  const materials = read("js/components/materials.js");
  const ui = read("js/components/ui.js");

  for (const key of ["base", "life", "energy", "special"]) {
    assert.match(materials, new RegExp(`key:\\s*["']${key}["']`));
  }
  assert.match(ui, /data-family=\{group\.key\}/);
});

test("Figma shell keeps the pixel playfield contract intact", () => {
  const css = read("js/styles.css");

  assert.match(css, /image-rendering:\s*pixelated/);
  assert.match(css, /#sand-canvas\s*\{[\s\S]*?z-index:\s*2/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?place-items:\s*center/);
});

test("Inspector is opt-in and keyboard dismissible", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /inspectorOpen:\s*false/);
  assert.match(ui, /aria-expanded=\{inspectorOpen\}/);
  assert.match(ui, /aria-controls=["']material-inspector["']/);
  assert.match(ui, /event\.key\s*===\s*["']Escape["']/);
  assert.match(ui, /onClose=\{\(\)\s*=>\s*this\.setState\(\{ inspectorOpen: false \}\)\}/);
});

test("closed Inspector does not reserve desktop canvas width", () => {
  const css = read("js/styles.css");

  assert.match(css, /#canvas-stage\s*\{[\s\S]*?right:\s*0\s*;/);
  assert.match(css, /\.material-inspector\s*\{[\s\S]*?transform:\s*translateX\(100%\)/);
  assert.match(css, /\.material-inspector\.is-open\s*\{[\s\S]*?transform:\s*translateX\(0\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.material-inspector\s*\{[\s\S]*?translateY\(100%\)/);
});
