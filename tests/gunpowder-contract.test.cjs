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
  const lib = read("crate/src/lib.rs");
  const index = read("js/index.js");

  assert.match(species, /Gunpowder\s*=\s*20/);
  assert.match(species, /20\s*=>\s*Some\(Species::Gunpowder\)/);
  assert.match(species, /Species::Gunpowder\s*=>\s*update_gunpowder/);
  assert.match(species, /fn update_gunpowder/);
  assert.match(species, /GUNPOWDER_FUSE_TICKS\s*:\s*u8\s*=\s*250/);
  assert.match(species, /GUNPOWDER_FUSE_STEP_MS\s*:\s*f32\s*=\s*20\.0/);
  assert.match(lib, /pub fn advance_gunpowder_fuses/);
  assert.match(lib, /pub fn tick_with_elapsed/);
  assert.match(index, /universe\.tick_with_elapsed\(elapsedMs\)/);
  assert.match(index, /performance\.now\(\)/);
  assert.match(index, /elapsedRenderMs\(now, lastRenderTime\)/);
  assert.doesNotMatch(index, /Math\.min\(Math\.max\(now - lastRenderTime, 0\), 100\)/);
  assert.match(species, /pressure\s*>\s*120/);
  assert.match(species, /pressure\s*:\s*200/);
  assert.match(species, /rb\s*>\s*1/);
  assert.match(species, /rb\s*==\s*1/);
  assert.match(species, /rb\s*:\s*GUNPOWDER_FUSE_TICKS/);
  assert.match(species, /Species::Water/);
  assert.match(species, /Species::Fire/);
  assert.match(species, /Species::Lava/);
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
  assert.match(
    lib,
    /cell\.species\s*==\s*Species::Rocket[\s\S]*cell\.species\s*==\s*Species::Gunpowder/
  );
});

test("gunpowder quenches through a deterministic eight-way water helper", () => {
  const species = read("crate/src/species.rs");

  assert.match(species, /let sample = api\.get\(sx, sy\);/);
  const helper = species.match(/fn has_adjacent_water[\s\S]*?\r?\n}\r?\n/);
  assert.ok(helper, "deterministic water helper is missing");
  assert.match(helper[0], /fn has_adjacent_water/);
  assert.match(species, /has_adjacent_water\(&mut api\)/);
  assert.doesNotMatch(helper[0], /rand_(?:vec|vec_8|int)/);
});

test("shader adds a dedicated pixel branch driven by fuse state", () => {
  const shader = read("js/glsl/sand.glsl");

  assert.match(shader, /type\s*==\s*20/);
  assert.match(shader, /data\.b\s*\*\s*255\.0\s*\/\s*250\.0/);
  assert.match(shader, /gunpowder/i);
});

test("front-end registries and guides expose gunpowder as firepowder", () => {
  const labels = JSON.parse(read("js/element-labels.json"));
  const info = JSON.parse(read("js/material-info.json"));
  const materials = read("js/components/materials.js");
  const infoPage = read("js/components/info.js");
  const ui = read("js/components/ui.js");

  assert.equal(labels.Dust, "粉尘");
  assert.equal(labels.Gunpowder, "火药");
  assert.match(info.Dust.description, /轻盈易飘散的助燃颗粒/);
  assert.doesNotMatch(info.Dust.description, /爆炸|爆燃/);
  assert.ok(info.Gunpowder);
  assert.match(info.Gunpowder.description, /短引信/);
  assert.ok(info.Gunpowder.reactions.some((reaction) => reaction.with.includes("Water")));
  const waterReaction = info.Gunpowder.reactions.find((reaction) => reaction.with.includes("Water"));
  assert.match(waterReaction.when, /相邻水格/);
  assert.match(info.Gunpowder.description, /约 5 秒的短引信/);
  assert.match(waterReaction.result, /rb=250\.\.2/);
  assert.match(info.Gunpowder.description, /最后一 tick/);
  assert.match(info.Gunpowder.description, /压力超过 120/);
  for (const material of ["Fire", "Lava", "Dust", "Stone", "Ice"]) {
    assert.ok(
      info.Gunpowder.reactions.some((reaction) => reaction.with.includes(material)),
      `missing Gunpowder reaction for ${material}`
    );
  }
  assert.match(materials, /items:\s*\[[^\]]*"Gunpowder"/s);
  assert.match(materials, /Gunpowder:\s*\{/);
  const dustBlock = materials.match(/Dust:\s*\{[\s\S]*?\r?\n  \},\r?\n  Oil:/);
  const gunpowderBlock = materials.match(/Gunpowder:\s*\{[\s\S]*?\r?\n  \},\r?\n  Cloner:/);
  assert.ok(dustBlock, "Dust material block is missing");
  assert.ok(gunpowderBlock, "Gunpowder material block is missing");
  assert.match(dustBlock[0], /轻盈易飘散的助燃颗粒/);
  assert.doesNotMatch(dustBlock[0], /爆炸|爆燃/);
  assert.match(gunpowderBlock[0], /约 5 秒的短引信/);
  assert.match(gunpowderBlock[0], /最后一 tick/);
  assert.match(gunpowderBlock[0], /压力超过 120/);
  assert.match(infoPage, /<h4>火药<\/h4>/);
  assert.match(infoPage, /<h4>粉尘<\/h4>/);
  assert.match(infoPage, /普通引信可被相邻水格熄灭/);
  assert.match(infoPage, /最后一 tick 仍爆炸/);
  assert.match(infoPage, /压力超过 120 时直接引爆/);
  assert.match(ui, /21\s*种/);
});
