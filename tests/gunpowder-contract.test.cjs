const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("gunpowder has a local standalone registry entry without consuming legacy id 10", () => {
  const registry = JSON.parse(read("verify/material-registry.json"));
  const entry = registry.materials.gunpowder;

  assert.equal(entry.species_id, 20);
  assert.equal(entry.capability, "species:gunpowder");
  assert.equal(entry.status, "local-standalone");
  assert.equal(Object.values(registry.materials).some((material) => material.species_id === 10), false);
});

test("Rust registers gunpowder as an additive species with fuse and explosion behavior", () => {
  const species = read("crate/src/species.rs");

  assert.match(species, /Gunpowder\s*=\s*20/);
  assert.match(species, /20\s*=>\s*Some\(Species::Gunpowder\)/);
  assert.match(species, /Species::Gunpowder\s*=>\s*update_gunpowder/);
  assert.match(species, /fn update_gunpowder/);
  assert.match(species, /pressure\s*>\s*120/);
  assert.match(species, /rb\s*>\s*1/);
  assert.match(species, /rb\s*==\s*1/);
  assert.match(species, /Species::Water/);
  assert.match(species, /Species::Fire/);
});

test("checked-in wasm bindings expose the new species to the browser", () => {
  const bindings = read("crate/pkg/sandtable_bg.js");
  const types = read("crate/pkg/sandtable.d.ts");

  assert.match(bindings, /Gunpowder:\s*20/);
  assert.match(types, /Gunpowder\s*=\s*20/);
});

test("gunpowder uses the same light-material wind tier without changing legacy tiers", () => {
  const lib = read("crate/src/lib.rs");

  assert.match(lib, /Species::Gunpowder\s*=>\s*30/);
  assert.match(lib, /Species::Sand\s*=>\s*30/);
  assert.match(lib, /Species::Mite\s*=>\s*30/);
  assert.match(lib, /Species::Rocket\s*=>\s*30/);
});

test("shader adds a dedicated pixel branch driven by fuse state", () => {
  const shader = read("js/glsl/sand.glsl");

  assert.match(shader, /type\s*==\s*20/);
  assert.match(shader, /data\.b/);
  assert.match(shader, /gunpowder/i);
});

test("front-end registries and guides expose gunpowder as firepowder", () => {
  const labels = JSON.parse(read("js/element-labels.json"));
  const info = JSON.parse(read("js/material-info.json"));
  const materials = read("js/components/materials.js");
  const infoPage = read("js/components/info.js");
  const ui = read("js/components/ui.js");

  assert.equal(labels.Gunpowder, "火药");
  assert.ok(info.Gunpowder);
  assert.ok(info.Gunpowder.reactions.some((reaction) => reaction.with.includes("Water")));
  assert.match(materials, /items:\s*\[[^\]]*"Gunpowder"/s);
  assert.match(materials, /Gunpowder:\s*\{/);
  assert.match(infoPage, /<h4>火药<\/h4>/);
  assert.match(ui, /20\s*种/);
});
