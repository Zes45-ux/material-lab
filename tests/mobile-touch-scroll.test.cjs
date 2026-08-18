"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const mobileCss = () => {
  const css = read("js/styles.css");
  return css.slice(css.lastIndexOf("@media (max-width: 767px)"));
};

test("background does not cancel native material-sheet touch scrolling", () => {
  const index = read("js/index.js");
  const paint = read("js/paint.js");
  const fluid = read("js/fluid.js");

  assert.doesNotMatch(
    index,
    /getElementById\(["']background["']\)\.addEventListener\(\s*["']touchmove["']/
  );
  assert.match(
    paint,
    /canvas\.addEventListener\(\s*["']touchstart["'][\s\S]*?passive:\s*false/
  );
  assert.match(
    paint,
    /canvas\.addEventListener\(\s*["']touchend["'][\s\S]*?passive:\s*false/
  );
  assert.match(
    paint,
    /canvas\.addEventListener\(\s*["']touchmove["'][\s\S]*?passive:\s*false/
  );
  assert.match(
    fluid,
    /sandCanvas\.addEventListener\(\s*["']touchstart["'][\s\S]*?passive:\s*false/
  );
  assert.match(
    fluid,
    /sandCanvas\.addEventListener\(\s*["']touchmove["'][\s\S]*?passive:\s*false/
  );
});

test("material list opts into native vertical touch scrolling", () => {
  const css = mobileCss();

  assert.match(
    css,
    /\.material-rail-scroll\s*\{[\s\S]*?touch-action:\s*pan-y[\s\S]*?-webkit-overflow-scrolling:\s*touch[\s\S]*?overscroll-behavior-y:\s*contain/
  );
  assert.match(
    css,
    /\.material-rail-scroll\s*\{[\s\S]*?overflow-x:\s*hidden[\s\S]*?overflow-y:\s*auto/
  );
});

test("mobile sheet keeps the scroll list and brush controls in separate hit regions", () => {
  const css = mobileCss();

  assert.match(
    css,
    /\.material-rail\s*\{[\s\S]*?grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/
  );
  assert.match(
    css,
    /\.material-rail-scroll\s*\{[\s\S]*?grid-column:\s*1[\s\S]*?grid-row:\s*2/
  );
  assert.match(
    css,
    /\.brush-control\s*\{[\s\S]*?position:\s*static[\s\S]*?grid-column:\s*1[\s\S]*?grid-row:\s*3[\s\S]*?align-self:\s*stretch[\s\S]*?width:\s*100%/
  );
  assert.doesNotMatch(
    css,
    /\.brush-control\s*\{[\s\S]*?position:\s*sticky/
  );
});

test("mobile controls meet the minimum touch target", () => {
  const css = read("js/styles.css");

  assert.match(css, /\.topbar-button\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(
    css,
    /\.topbar-button\.icon-only\s*\{[\s\S]*?width:\s*44px[\s\S]*?min-width:\s*44px/
  );
  assert.match(
    css,
    /\.mobile-sheet-close\s*\{[\s\S]*?width:\s*44px[\s\S]*?height:\s*44px/
  );
  assert.match(css, /\.brush-size\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(css, /\.mobile-dock-button\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(css, /\.wind-option\s*\{[\s\S]*?min-height:\s*56px/);
  assert.match(css, /\.material-option\s*\{[\s\S]*?min-height:\s*48px/);
  assert.match(
    css,
    /\.material-rail\s+\.wind-option,\s*\.material-rail\s+\.material-option,\s*\.material-rail\s+\.brush-size,\s*\.material-rail\s+\.mobile-sheet-close\s*\{[\s\S]*?touch-action:\s*manipulation[\s\S]*?-webkit-tap-highlight-color:\s*transparent/
  );
});
