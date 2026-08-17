# 火药材料接入实施计划

## 目标

在现有 Material Lab / Sandspiel 物理和像素渲染基础上新增 `Gunpowder`（中文名“火药”），使用本项目尚未占用的本地扩展编号 `20`。新增逻辑只追加新材料分支；已有材料的更新函数、tick 顺序、RNG 调用、Cell/Wind 数据结构、已有 shader 分支、旧材料编号和存档兼容行为保持不变。

## 设计与边界

- `rb = 0`：火药为惰性颗粒，沿用沙的沉降/置换路径。
- 惰性火药抽样到 Fire 或 Lava 时进入 `rb = 8` 的引信状态。
- `rb = 8..2`：每 tick 倒计时并产生短暂火花；引信阶段邻接 Water 时清除引信，保留为惰性火药。
- `rb = 1`：爆炸为 Fire，并写入高压 Wind；压力 `> 120` 时直接爆炸，压力判定优先于水的熄灭判定。
- 爆炸只通过新增函数写入本格 Fire 和流体压力，不修改原有 Dust 的压力逻辑。
- 火药的风阈值为 `30`，与 Sand/Mite/Rocket 同档；原有阈值不改。
- GLSL 只在 `type == 20` 增加分支：惰性状态为深灰褐色，引信状态出现红橙色高亮和倒计时变化；公共噪声、HSV、alpha 流程及旧分支不改。
- 本项目没有 `functions/`、画廊或服务端能力声明，因此不增加服务端能力元数据。

## 文件清单

### 新增

- `tests/gunpowder-contract.test.cjs`：无需 Rust 工具链即可执行的跨层静态契约测试。
- `verify/material-registry.json`：声明本地独立扩展编号 `20` 与 `Gunpowder` 能力，明确不占用编号 `10`。

### 修改

- `crate/src/species.rs`：加入 `Species::Gunpowder = 20`、安全 `from_u8` 映射、更新分支、引信/水/压力/爆炸逻辑及 Rust 单元测试。
- `crate/src/lib.rs`：只增加 `Gunpowder => 30` 风阈值及火药风移动回归测试所需的最小断言。
- `js/glsl/sand.glsl`：追加 `type == 20` 的像素表现分支。
- `js/components/materials.js`：将火药加入能量材料分组和材料检查器说明。
- `js/material-info.json`：加入火药的中文说明和可验证反应关系。
- `js/element-labels.json`：加入 `Gunpowder: 火药` 标签。
- `js/components/info.js`：在材料说明页加入火药条目。
- `js/components/ui.js`：显示 20 种材料；保留现有选择、画笔尺寸和布局逻辑。
- `tests/standalone-ui.test.cjs`：把火药加入现有中文标签和材料资料契约。

## 实施步骤

### 1. 先写跨层失败测试

创建 `tests/gunpowder-contract.test.cjs`，断言：

1. registry 中 `Gunpowder` 的编号为 20、状态为本地独立扩展，且没有把 10 登记为新材料。
2. `species.rs` 声明编号 20、`from_u8(20)` 返回火药、`Species::update` 有火药分支、火药函数包含压力/水/引信/爆炸行为。
3. `lib.rs` 含 `Gunpowder => 30`，且没有改动旧材料阈值所在分支。
4. shader 含 `type == 20`，并使用 `data.b` 表现引信状态。
5. 前端分组、中文标签、材料 JSON、说明页和材料数量都包含火药。

先运行：

```powershell
node --test tests/gunpowder-contract.test.cjs
```

在实现前应因缺少火药内容而失败。

### 2. 实现 Rust 材料逻辑

先在 `species.rs` 和 `lib.rs` 写 Rust 单元测试，覆盖 `from_u8(20)`、空世界 tick 不崩溃、火药可沉降以及火药映射不误占用 10。尝试运行：

```powershell
cargo test --manifest-path crate/Cargo.toml
```

如果终端没有 Rust 工具链，保留测试代码并记录环境阻塞；不得把未编译状态描述为 Rust 已通过。

随后按设计追加 `Gunpowder` 枚举、映射、update 分支、确定性八邻域水熄灭检查、压力优先爆炸、引信递减、火花和沙式移动。只新增代码，不重排或改写既有材料函数。

### 3. 实现前端材料登记和说明

更新材料分组、标签、JSON 反应资料和中文说明页；火药追加在能量材料现有列表末尾，避免改变旧材料的选择顺序。运行：

```powershell
node --test tests/gunpowder-contract.test.cjs tests/standalone-ui.test.cjs
```

### 4. 实现像素表现

在 `sand.glsl` 的 type 19 分支之后、公共颜色收尾之前追加 type 20 分支。保持已有分支和公共光照/噪声/alpha 代码不变。重新运行跨层契约测试，确保 `data.b` 驱动引信高亮而非改动 Cell 布局。

### 5. 生成并验证 WASM 包

如果可用，执行项目 README 规定的构建：

```powershell
wasm-pack build --target bundler
npm test
npm run build
```

确认 `crate/pkg/sandtable_bg.wasm` 与生成 JS 的时间戳/内容随 Rust 源码更新，且前端可识别 `Species.Gunpowder`。如果 Rust/wasm-pack 不可用，明确报告源码和静态测试结果，并把“需要本机重新生成 WASM”列为未完成的环境验证项，不手工伪造二进制。

### 6. 最终回归

执行：

```powershell
node --test tests/*.test.cjs
npm run build
git diff --check
git status --short
```

检查旧材料分支、shader type 0–19、编号 10、`Cell`/`Wind` 结构和现有测试没有被改写；最终报告列出通过项和任何仍受环境限制的 WASM 项。

## 完成判定

- 火药可从 UI 选择并显示中文名、说明和像素颜色。
- 火药可沉降、受火/岩浆点燃、显示引信、被水熄灭、受压力或倒计时爆炸，并与 Fire/Water/Dust/Stone/Ice/Acid 形成资料与运行时联动。
- 旧材料行为没有通过修改旧分支或公共渲染路径而改变。
- Node 回归测试和生产构建通过；Rust/WASM 只有在实际工具链构建通过后才标记为通过。
