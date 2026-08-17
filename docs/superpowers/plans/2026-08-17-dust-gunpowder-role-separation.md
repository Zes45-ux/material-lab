# 粉尘与火药角色分离实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持 Sandspiel 原版落沙机制和像素风格的前提下，让粉尘保持轻质助燃定位，让火药成为可布置、可拆除的短引信强压力爆破材料。

**Architecture:** 在 `update_gunpowder` 内增加无随机数的八方向水接触检查，并用 `Universe::tick_with_elapsed` 按实际经过时间推进 `Cell.rb` 引信；随机点燃/火花、颗粒移动和 `burns -> GPU -> winds` 压力通道保持原有手感。粉尘运行时代码、公共流体逻辑和旧 shader 分支保持原样；前端统一 Dust 的中文名为“粉尘”，同步两种材料的角色文案和契约测试。

**Tech Stack:** Rust/WASM simulation, `wasm-bindgen`, Node.js `node:test`, WebGL/GLSL, Webpack, JSON/React-style material metadata.

## Global Constraints

- 粉尘保持原版运行时行为，不修改 `update_dust`、压力阈值 120、压力输出 80/5、风力阈值 10 或火焰传播规则。
- 火药保持 `Species::Gunpowder = 20`、引信起点 `rb = 250`（每步 20ms，约 5 秒）、压力阈值 `> 120`、爆炸 `pressure = 200`、`density = 60`、`dy = 10` 和风力阈值 30。
- 普通引信 `rb = 250..2` 检查固定八方向水格；`rb = 1` 和压力 `> 120` 不接受水灭，压力判断优先。
- 水接触 helper 只能调用现有 `SandApi::get`，不得新增随机 API 调用；引信火花按实际 20ms 倒计时步触发，水检查本身不改变点燃和移动的随机采样。
- 不修改 `Fire`、`Lava`、`Water`、`Dust` 或其他旧材料的 update 函数、Cell/Wind 布局、PNG 存档、公共 fluid 管线；只在 tick 入口增加火药实际时间推进。
- 不增加温度、湿度、伤害值、爆炸半径、粒子系统、光晕、屏幕震动、贴图动画或高分辨率特效。
- 全站 Dust 统一显示为“粉尘”；火药文案必须说明普通引信可被相邻水格熄灭，但最后一 tick 和高压不可阻止。
- Rust 源码变更后，只有成功运行 `wasm-pack build --target bundler` 才能声称浏览器 WASM 已同步。

---

### Task 1: 建立八方向水灭与回归测试契约

**Files:**

- Modify: `crate/src/lib.rs:441-707`
- Modify: `tests/gunpowder-contract.test.cjs:22-100`

**Interfaces:**

- Consumes: 当前 `Universe` 测试辅助函数、`update_gunpowder(cell, SandApi)` 和既有压力/引信测试。
- Produces: 八方向行为测试、实际时间引信测试、流体移动前水灭测试、最后一 tick/高压优先测试、完整 `Universe::tick_with_elapsed()` 测试，以及要求 `has_adjacent_water` 无 RNG 的静态契约。

- [x] **Step 1: 添加失败的八方向行为测试。**

在 Rust 测试模块中增加固定偏移和定位 helper：

```rust
const WATER_NEIGHBORS: [(i32, i32); 8] = [
    (-1, -1), (0, -1), (1, -1),
    (-1,  0),          (1,  0),
    (-1,  1), (0,  1), (1,  1),
];

fn find_species(universe: &Universe, species: Species) -> usize {
    universe
        .cells
        .iter()
        .position(|cell| cell.species == species)
        .expect("expected species to remain in the test universe")
}
```

将 `gunpowder_water_quench_uses_only_the_sampled_neighbor` 替换为参数化循环 `gunpowder_water_quenches_from_any_adjacent_cell`。每个偏移创建独立 5x5 世界，八方向先填 Wall，指定偏移放 Water，中心放置 `rb = 4` 的 Gunpowder，直接调用 `update_gunpowder`，通过 `find_species` 找到移动后的火药并断言 `rb == 0`。

- [x] **Step 2: 添加失败的无水和完整 tick 测试。**

增加两个独立测试：

```rust
#[test]
fn gunpowder_counts_down_without_adjacent_water() {
    let mut universe = Universe::new(5, 5);
    let index = universe.get_index(2, 2);
    fill_neighbors(&mut universe, 2, 2, Species::Wall);
    universe.cells[index] = Cell {
        species: Species::Gunpowder,
        ra: 100,
        rb: 4,
        clock: 0,
    };

    let cell = universe.cells[index];
    super::species::update_gunpowder(
        cell,
        SandApi { universe: &mut universe, x: 2, y: 2 },
    );

    let gunpowder_index = find_species(&universe, Species::Gunpowder);
    assert_eq!(universe.cells[gunpowder_index].rb, 3);
}

#[test]
fn gunpowder_water_quench_works_through_a_full_tick() {
    let mut universe = Universe::new(5, 5);
    let index = universe.get_index(2, 2);
    fill_neighbors(&mut universe, 2, 2, Species::Wall);
    let water_index = universe.get_index(1, 2);
    universe.cells[water_index] = Cell {
        species: Species::Water,
        ra: 0,
        rb: 0,
        clock: 0,
    };
    universe.cells[index] = Cell {
        species: Species::Gunpowder,
        ra: 100,
        rb: 4,
        clock: 0,
    };

    universe.tick();

    let gunpowder_index = find_species(&universe, Species::Gunpowder);
    assert_eq!(universe.cells[gunpowder_index].rb, 0);
}
```

完整 tick 场景必须用 Wall 封住水的其他移动方向，避免水在 `blow_wind -> update_cell` 路径中先离开接触位置；断言应定位火药而不是假设它仍在中心格。

- [x] **Step 3: 扩展失败的边界优先级测试。**

在 `gunpowder_explodes_on_final_fuse_tick` 中加入相邻 Water，并保留 `rb = 1`，断言火药变为 Fire 且 `burns.pressure == 200`。保留并明确 `gunpowder_pressure_explosion_wins_over_water_quench` 的相邻 Water 与 `winds.pressure = 121`，断言仍为 Fire 和压力 200。

- [x] **Step 4: 更新静态契约为新接口。**

将旧测试“水必须是同一个随机 sample”改为以下约束：

```js
assert.match(species, /fn has_adjacent_water/);
assert.match(species, /has_adjacent_water\(&mut api\)/);
assert.doesNotMatch(species, /fn has_adjacent_water[\s\S]*rand_(?:vec|vec_8|int)/);
```

保留对 `let sample = api.get(sx, sy)` 的断言用于点燃/火花随机路径，不再要求 `sample.species == Species::Water`，也不把水检查 helper 与 Dust 代码混在一起。

- [x] **Step 5: 运行 RED 测试。**

运行：

```powershell
cargo test --manifest-path crate/Cargo.toml gunpowder
node --test tests/gunpowder-contract.test.cjs
```

预期：新八方向、无水倒计时、完整 tick 测试或静态 helper 契约失败；失败原因必须是旧实现没有确定性八方向水灭，而不是测试编译错误。

- [x] **Step 6: Commit the test contract.**

```powershell
git add crate/src/lib.rs tests/gunpowder-contract.test.cjs
git commit -m "test: define deterministic gunpowder water quench"
```

### Task 2: 实现火药八方向确定性水灭

**Files:**

- Modify: `crate/src/species.rs:389-482`

**Interfaces:**

- Consumes: Task 1 中失败的 Rust 行为测试和静态 helper 契约。
- Produces: `has_adjacent_water(&mut SandApi) -> bool` 以及保持压力/最后 tick 优先级的 `update_gunpowder` 状态机。

- [x] **Step 1: 写入最小无 RNG helper。**

在 `explode_gunpowder` 与 `update_gunpowder` 附近加入：

```rust
const GUNPOWDER_WATER_NEIGHBORS: [(i32, i32); 8] = [
    (-1, -1), (0, -1), (1, -1),
    (-1,  0),          (1,  0),
    (-1,  1), (0,  1), (1,  1),
];

fn has_adjacent_water(api: &mut SandApi) -> bool {
    GUNPOWDER_WATER_NEIGHBORS
        .iter()
        .any(|(dx, dy)| api.get(*dx, *dy).species == Species::Water)
}
```

- [x] **Step 2: 在火药状态机中保持判断顺序。**

保留 `get_fluid().pressure > 120` 为第一条运行时分支；随后保留一次 `rand_vec` 采样用于 `Fire/Lava` 点燃。`advance_gunpowder_fuses` 按累计实际时间每 20ms 推进一步，在流体 update 前调用同一个水检查，并在偶数倒计时步生成单格火花；命中水时生成 `rb = 0` 的 Gunpowder，不消耗引信。

- [x] **Step 3: 保持最后一 tick 和移动路径。**

让 `rb == 1` 直接调用 `explode_gunpowder`，不调用水 helper；水灭后的 `new_cell` 继续经过现有 Empty、斜落、Water/Gas/Oil/Acid 置换分支。不得修改 `update_dust`、`update_water` 或 `explode_gunpowder` 参数；tick 的原有移动顺序保持不变，只在其入口增加实际时间引信预推进。

- [x] **Step 4: 运行 GREEN 测试并检查旧材料差异。**

运行：

```powershell
cargo test --manifest-path crate/Cargo.toml gunpowder
node --test tests/gunpowder-contract.test.cjs
git diff -- crate/src/species.rs
```

预期：所有火药行为/契约测试通过；diff 只包含 helper 和 `update_gunpowder` 分支，不包含 `update_dust`、`update_fire`、`update_lava` 或公共流体代码。

- [x] **Step 5: Commit the runtime change.**

```powershell
git add crate/src/species.rs
git commit -m "fix: make gunpowder water quench deterministic"
```

### Task 3: 同步命名、材料资料和信息页

**Files:**

- Modify: `js/element-labels.json:18`
- Modify: `js/components/materials.js:145-220`
- Modify: `js/material-info.json:110-380`
- Modify: `js/components/info.js:50-75`
- Modify: `tests/standalone-ui.test.cjs:113-252`
- Modify: `tests/gunpowder-contract.test.cjs:76-100`

**Interfaces:**

- Consumes: Task 2 的状态机：普通引信八方向水灭，最后一 tick/高压不可逆。
- Produces: Dust 全站中文名“粉尘”、不再称粉尘为独立爆炸物的资料，以及清楚写出火药例外规则的 UI 契约。

- [x] **Step 1: 先更新失败的文案契约。**

把 `tests/standalone-ui.test.cjs` 的标签期望改为 `Dust: "粉尘"`，将信息页期望改为“粉尘”的助燃描述，并把火药段落加入材料说明稳定期望。把 `tests/gunpowder-contract.test.cjs` 的标签断言改为 `labels.Dust === "粉尘"`，并增加对粉尘/火药主描述关键词和火药“最后一 tick/压力超过 120”例外的断言。

运行：

```powershell
node --test tests/standalone-ui.test.cjs tests/gunpowder-contract.test.cjs
```

预期：在生产文案尚未更新前失败，原因是旧的“尘埃”和“爆炸性”描述仍存在。

- [x] **Step 2: 统一 Dust 用户可见名称。**

把 `js/element-labels.json` 的 Dust 改为“粉尘”；把 `js/components/info.js`、`js/material-info.json` 中螨虫、火、岩浆、Dust 相关的用户可见“尘埃”改为“粉尘”。不得修改 JSON 中的材料 key `Dust`。

- [x] **Step 3: 重写材料检查器语义。**

将 Dust 改为轻质助燃文案：

```text
intro: 轻盈易飘散的助燃颗粒，接触火焰或承受高压时立即转为火焰。
note: 适合扩散火势；没有引信，也不产生火药式强冲击。
火: 粉尘帮助火焰向相邻位置传播
高压: 粉尘立即转为火焰并产生较弱压力
水: 粉尘被水置换并随流体移动
```

将 Gunpowder 改为延时爆破文案：

```text
intro: 会沉降的可燃颗粒，点燃后进入约 5 秒的短引信并产生强压力爆炸。
note: 适合布置延时爆破；普通引信可被相邻水格熄灭。
火 / 岩浆: 点燃引信并开始倒计时
水: 八方向相邻水格可熄灭 rb=250..2 的普通引信
尘埃 / 石头 / 冰: 爆炸压力产生联动
酸: 被酸腐蚀
```

用户可见的“尘埃 / 石头 / 冰”写成“粉尘 / 石头 / 冰”，内部 reaction key 仍为 `Dust`。

- [x] **Step 4: 同步信息页和契约。**

信息页同时写出“普通引信可被相邻水格熄灭”“最后一 tick 仍爆炸”“压力超过 120 时直接引爆”三条语义。保留所有原始链接和其他材料文案。运行：

```powershell
node --test tests/standalone-ui.test.cjs tests/gunpowder-contract.test.cjs
```

预期：材料标签、JSON key/target、检查器顺序、信息页说明全部通过。

- [x] **Step 5: Commit the copy change.**

```powershell
git add js/element-labels.json js/components/materials.js js/material-info.json js/components/info.js tests/standalone-ui.test.cjs tests/gunpowder-contract.test.cjs
git commit -m "docs: clarify dust and gunpowder roles"
```

### Task 4: 生成 WASM、构建并完成回归验收

**Files:**

- Generate: `crate/pkg/sandtable_bg.wasm`, `crate/pkg/sandtable_bg.js`, `crate/pkg/sandtable.d.ts`, `crate/pkg/sandtable_bg.wasm.d.ts`
- Generate: `dist/` through the existing npm build
- Do not modify: `js/glsl/sand.glsl` unless a dedicated type 20 fuse correction is required; never alter type 0..19 branches.

**Interfaces:**

- Consumes: Task 2 Rust behavior and Task 3 front-end copy.
- Produces: Rust/WASM/browser artifacts synchronized with source and reproducible verification output.

- [x] **Step 1: Check the WASM toolchain.**

运行：

```powershell
wasm-pack --version
```

若命令可用，继续生成；若不可用，保留已通过的源码和 Node 验收，并在交付中明确浏览器 WASM 未由本次源码重新生成，不手工编辑二进制。

- [x] **Step 2: Generate checked-in WASM.**

在工具可用时运行：

```powershell
wasm-pack build --target bundler
```

确认 `crate/pkg/` 仍暴露 `Gunpowder = 20`，且生成绑定没有手工 diff。

- [x] **Step 3: Run the complete automated suite.**

运行：

```powershell
cargo test --manifest-path crate/Cargo.toml
node --test tests/*.test.cjs
npm run build
git diff --check
```

预期：Rust、Node、生产构建和格式检查全部通过；变更不包含旧材料公共逻辑或无关雪材料方案。

- [x] **Step 4: Perform fixed browser scenarios.**

已用 agent-browser 验证根页/信息页加载、关键材料按钮、无错误覆盖层及新文案；八方向水灭、最后一 tick 和高压优先级由 Rust 完整 tick 测试验证。

逐项验证：粉尘与火药同时受风时粉尘先飘散、火药更稳定；同时接触火时粉尘快速助燃、火药显示引信后爆炸；水放在上/下/左/右/四个对角格均能熄灭普通引信；`rb=1` 和压力 121 以上仍爆炸；火药强压力可触发后续粉尘/火药；不含火药的旧场景无回归。

- [x] **Step 5: Commit generated artifacts when valid.**

仅在 `wasm-pack` 成功、完整自动化套件通过且浏览器场景可验收时运行：

```powershell
git add crate/pkg dist
git commit -m "build: sync dust and gunpowder behavior"
```

## 交付判定

- 粉尘运行时代码没有被修改，火药八方向水灭和优先级测试通过。
- 页面和资料统一使用“粉尘”，不再把粉尘和火药描述成同一种爆炸物。
- 原版落沙运动、随机手感、压力通道和像素效果保持可辨认的一致性。
- 所有可用自动化验证通过；若 WASM 工具不可用，交付明确标注未重新生成浏览器包。
