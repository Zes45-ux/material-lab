const test = require("node:test");
const assert = require("node:assert/strict");

const { elapsedRenderMs } = require("../js/render-time.js");

test("preserves render gaps longer than 100ms", () => {
  assert.equal(elapsedRenderMs(350, 100), 250);
});

test("clamps a backwards clock reading to zero", () => {
  assert.equal(elapsedRenderMs(90, 100), 0);
});
