# Snow Material Design

**Status:** Approved

**Goal:** 在当前 Material Lab 独立版中新增 `Snow`（雪），让它具备沙式颗粒运动，并在局部随机采样命中火或岩浆时融化为水。

## Chosen approach

采用“沙式运动 + 局部融化”。Snow 使用独立的 `update_snow`，复制原版沙的移动分支，但不改写 `update_sand`。每次 Snow 更新先随机读取一个局部格；只有该格是 `Fire` 或 `Lava` 时，当前 Snow 才融化为 Water。这样能复用现有模拟手感，同时让 Snow 具有清晰、局部且可观察的独立行为。

纯视觉材料不采用，因为它无法提供独立玩法；完整冰雪循环也不采用，因为它需要温度、湿度或 Water/Ice 状态扩展，超出本次范围。

## Behavior contract

Snow 固定使用 `Species::Snow = 21`，旧材料 `0..20` 的编号和历史未声明值 `10` 保持不变。`Cell` 仍只有 `species`、`ra`、`rb` 和 `clock` 四个字段。

每个 Snow tick 的顺序固定为：

1. 调用一次 `api.rand_vec()`，读取该偏移处的局部格。
2. 如果采样格是 `Fire` 或 `Lava`，将当前格写成 `Water` 并立即返回。Water 保留 Snow 的 `ra`，字面量 `rb` 和 `clock` 为 `0`；`SandApi::set` 负责写入当前生成时钟。热源不由 Snow 修改。
3. 调用一次 `api.rand_dir_2()`，取得 `-1` 或 `1`。
4. 正下方为空时下落一格。
5. 否则随机斜下方为空时斜落一格。
6. 否则正下方为 `Water`、`Gas`、`Oil` 或 `Acid` 时交换两格。
7. 其他情况保持当前 Snow。

采样可能返回当前格，因此相邻热源不会保证在同一 tick 触发融化。Snow 的额外 `rand_vec()` 只影响 Snow 自身的随机轨迹，不得改变旧材料的 RNG 调用顺序。

## Integration architecture

- Rust：在 `crate/src/species.rs` 添加枚举值、`from_u8` 映射、更新分派和 `update_snow`；在 `crate/src/lib.rs` 添加 Snow 的风力档位和行为测试。
- Wind：Snow 使用与 Sand 相同的阈值 `30`，并加入原版两格向上吹起名单；其他材料阈值和坐标换算不变。
- WASM：从 `crate/` 运行 `wasm-pack build --target bundler`，通过当前项目的 `npm run build:wasm` 包装脚本生成并检查 `crate/pkg`。不手工编辑生成的 JavaScript、TypeScript 或 WASM 二进制。
- Shader：在 `js/glsl/sand.glsl` 只追加 `type == 21` 分支，使用偏蓝白、低饱和、保留 `data.g` 和公共噪声的像素风格；不改旧材料分支和公共收尾。
- 中文 UI：在 `js/element-labels.json`、`js/material-info.json`、`js/components/materials.js`、`js/components/info.js` 和 `js/components/ui.js` 中加入 Snow，插入基础材料组 Sand 后面，计数更新为 `21 种`。Acid 和 Rocket 的显式目标列表补入 Snow。
- 兼容性：不修改 `js/convertSVG.js` 的旧灰度映射。画笔、复制器、火箭和 PNG 存档通过统一的物种编号识别 Snow；旧 PNG 不包含 21 时继续按旧编号恢复。
- Registry/tests：`verify/material-registry.json` 登记 `snow`、ID `21` 和 `species:snow` 能力；新增跨层静态契约，扩展现有中文 UI 和 Gunpowder 回归断言。

## Testing and acceptance

实现遵循 TDD：先让静态接线契约和 Rust 行为测试因 Snow 缺失而失败，再以最小实现逐层转绿。行为测试覆盖编号映射、正下落、随机斜落、Water/Gas/Oil/Acid 置换、Fire/Lava 采样融化、未采样热源不融化、风力阈值和两格上抛。

最终验证包括：

- `cargo fmt --manifest-path crate/Cargo.toml -- --check`
- `cargo test --manifest-path crate/Cargo.toml`
- `npm test`
- `npm run build:wasm`
- `npm run build`
- 本地页面中检查工具栏、Snow 颗粒运动、局部融化、风力、复制器、火箭和 PNG 保存/恢复。

不得把未执行的 WASM 生成、生产构建或浏览器验收标记为通过；如果 `wasm-pack` 不可用，应保留源码测试结果并明确报告生成物未同步，不能手工伪造 `crate/pkg`。

## Out of scope

本次不增加温度、湿度、质量、浓度或新的 Cell 状态；不让 Water 或 Ice 主动生成 Snow；不重构 Sand/Snow 共享 helper；不调整旧材料的编号、行为、随机数调用、风力阈值、shader 分支或 SVG 灰度映射。
