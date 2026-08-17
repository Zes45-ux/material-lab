const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function rustFunction(source, name) {
  const start = source.indexOf(`pub fn ${name}`);
  assert.notEqual(start, -1, `${name} is missing`);
  const next = source.indexOf("\npub fn ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

test("Snow reserves additive species id 21", () => {
  const registry = JSON.parse(read("verify/material-registry.json"));
  assert.equal(registry.materials.snow.species_id, 21);
  assert.equal(registry.materials.snow.capability, "species:snow");
  assert.equal(registry.materials.snow.status, "local-standalone");
  assert.equal(
    Object.values(registry.materials).some((item) => item.species_id === 10),
    false
  );
});

test("Rust registers Snow and keeps its behavior local", () => {
  const source = read("crate/src/species.rs");
  const snow = rustFunction(source, "update_snow");
  assert.match(source, /Snow\s*=\s*21/);
  assert.match(source, /21\s*=>\s*Some\(Species::Snow\)/);
  assert.match(source, /Species::Snow\s*=>\s*update_snow/);
  assert.match(snow, /api\.rand_vec\(\)/);
  assert.match(snow, /api\.rand_dir_2\(\)/);
  for (const species of ["Water", "Gas", "Oil", "Acid", "Fire", "Lava"]) {
    assert.match(snow, new RegExp(`Species::${species}`));
  }
});

test("checked-in WASM and shader expose Snow 21", () => {
  assert.match(read("crate/pkg/sandtable_bg.js"), /Snow:\s*21/);
  assert.match(read("crate/pkg/sandtable.d.ts"), /Snow\s*=\s*21/);
  assert.match(read("js/glsl/sand.glsl"), /type\s*==\s*21/);
});

test("Chinese material surfaces expose Snow", () => {
  const labels = JSON.parse(read("js/element-labels.json"));
  const info = JSON.parse(read("js/material-info.json"));
  assert.equal(labels.Snow, "雪");
  assert.ok(info.Snow.reactions.some((item) => item.with.includes("Fire")));
  assert.ok(info.Snow.reactions.some((item) => item.with.includes("Lava")));
  assert.match(read("js/components/materials.js"), /"Sand",\s*"Snow"/);
  assert.match(read("js/components/info.js"), /<h4>雪<\/h4>/);
  assert.match(read("js/components/ui.js"), /21\s*种/);
});
