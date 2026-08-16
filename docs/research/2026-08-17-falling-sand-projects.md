# GitHub 落沙 / 像素物理项目调研

日期：2026-08-17

目标：为当前 Sandspiel 中文独立版选择可借鉴的落沙游戏实现、材料系统和物理玩法。

## 结论先行

不建议更换 Sandspiel 的技术基座。当前项目已经具备 Rust/WASM 元胞自动机、WebGL 像素渲染、画笔、暂停、单步所需的核心结构，继续在其上扩展的风险最低。

推荐的参考分工是：

- 以 [MaxBittker/sandspiel](https://github.com/MaxBittker/sandspiel) 作为实际代码基座。
- 以 [bananaoomarang/Dust](https://github.com/bananaoomarang/Dust) 参考 MIT 许可下的 WebGL 和材料位掩码实现。
- 以 [R74nCom/sandboxels](https://github.com/R74nCom/sandboxels) 参考材料配置、反应表和工具栏交互，但不复制它的代码、图片或文案。
- 以 [The-Powder-Toy/The-Powder-Toy](https://github.com/The-Powder-Toy/The-Powder-Toy) 参考压力、速度、热量和复杂反应的玩法设计。
- 以 [joshdon/ProjectSand](https://github.com/joshdon/ProjectSand) 和 [transistorfet/fallingrust](https://github.com/transistorfet/fallingrust) 参考逐像素模拟和 Rust/WASM 的性能结构。

GPL 或限制性许可证项目适合做设计研究，不应直接把代码混入当前 MIT 项目。

## 候选项目对比

下表中的星数是本次 GitHub API 查询的快照，会随时间变化。

| 项目 | 技术与核心特征 | 许可证 | 对当前项目的价值 |
| --- | --- | --- | --- |
| [Sandspiel](https://github.com/MaxBittker/sandspiel) | Rust/WASM + WebGL；元胞自动机、材料行为、风场和像素画布 | 根目录为 MIT；README 另有流体模拟代码致谢 | 直接使用，不需要换引擎 |
| [Sandboxels](https://github.com/R74nCom/sandboxels)（445★） | 浏览器 JavaScript；500+ 材料、热量、密度、电力和数千种反应 | [R74n Content License](https://github.com/R74nCom/sandboxels/blob/main/license.txt)，非标准开源，限制商用并保留撤下权 | 参考材料 schema、反应结构和交互 |
| [Dust](https://github.com/bananaoomarang/Dust)（29★） | JavaScript + WebGL；使用位掩码表示材料、液体、燃烧和生命状态 | [MIT](https://github.com/bananaoomarang/Dust/blob/master/LICENSE) | 最适合参考可复用的 WebGL/材料代码 |
| [Project Sand](https://github.com/joshdon/ProjectSand)（85★） | HTML5 Canvas；`Uint32Array`、底部到顶部交错扫描，约 25 万像素、60–120 次/秒 | [GPL-3.0](https://github.com/joshdon/ProjectSand/blob/master/LICENSE) | 参考热循环优化和元素动作组织，不直接复制 |
| [Sand Game JS](https://github.com/Hartrik/sand-game-js)（40★） | WebGL2；温度、热行为、场景、工具、确定性随机数和位打包元素头 | [All rights reserved](https://github.com/Hartrik/sand-game-js/blob/master/LICENSE.md) | 只参考产品设计和数据建模 |
| [Falling Rust](https://github.com/transistorfet/fallingrust)（19★） | Rust/WASM；材料属性包含密度、温度、可燃性和可溶解性；浏览器 Canvas | [GPL-3.0](https://github.com/transistorfet/fallingrust/blob/master/LICENSE) | 参考 Rust/WASM 材料属性接口 |
| [The Powder Toy](https://github.com/The-Powder-Toy/The-Powder-Toy)（约 5.2k★） | C++/SDL；压力、速度、热量、气体、电子元件和复杂反应 | [GPL-3.0](https://github.com/The-Powder-Toy/The-Powder-Toy/blob/master/LICENSE) | 参考高级物理玩法，不适合作为 Web 基础 |
| [hakolao/sandbox](https://github.com/hakolao/sandbox)（125★） | Rust、Vulkan Compute Shader、Egui、Rapier；偏桌面 GPU 沙盒 | [Apache-2.0](https://github.com/hakolao/sandbox/blob/master/LICENSE) | 参考 GPU 并行思路，不适合直接移植到浏览器 |

## Sandspiel 当前代码的扩展入口

原项目 README 的构建流程是先使用 `wasm-pack` 编译 Rust，再使用 npm 启动 Webpack 开发服务器：[README.md](https://github.com/MaxBittker/sandspiel/blob/master/README.md)。核心结构如下：

- [`crate/src/lib.rs`](../../crate/src/lib.rs)：`Universe` 保存扁平的 `Vec<Cell>`，负责 `tick`、`paint`、撤销栈和生成轮次；生成标记用于避免一个像素在同一帧被重复更新。
- [`crate/src/species.rs`](../../crate/src/species.rs)：`Species` 枚举和每种材料的 `update_*` 行为。沙、水、油、火、岩浆、植物等已有独立规则。
- [`js/render.js`](../../js/render.js)：读取 WASM 内存中的像素数据，再交给 WebGL 渲染，不需要为每个像素创建 JavaScript 对象。

这意味着新增材料不必重写模拟器，首要工作是增加稳定的材料元数据和对应行为。

## 推荐的首发材料范围

建议首发向玩家展示以下 8 种材料，把“清除”保留为独立橡皮擦工具：

1. 墙
2. 沙
3. 水
4. 石头
5. 木头
6. 火
7. 油
8. 岩浆

项目内部可以继续保留现有 `Species` 编号和未展示材料，避免破坏已有存档、渲染调色板和物理规则。

## 建议的实现路线

### 1. 保留现有逐材料行为

先不要把 `species.rs` 一次性改造成通用物理引擎。现有的邻域读取、生成轮次、随机方向和交换逻辑已经验证过，继续沿用更容易保持像素手感不变。

### 2. 增加材料元数据层

为每种材料补充一份独立属性：

- 中文名称、分类和颜色
- 固体 / 粉末 / 液体 / 气体状态
- 密度、流动性和上升/下沉方向
- 温度、可燃性、腐蚀性和状态转换
- 是否在首发工具栏中显示

简单的两两反应可以放入数据表；植物生长、火焰扩散、火箭等复杂行为仍保留在 Rust 函数中。

### 3. 维持性能边界

继续使用扁平数组、生成标记和 WASM 内存视图。不要在每个像素上创建对象、字典或闭包；新增材料应通过固定整数 ID 和表查找完成。

### 4. 把高级玩法拆成后续阶段

建议顺序是：

1. 8 种材料、画笔、暂停/继续、单步和重置。
2. 材料反应表、温度和简单状态转换。
3. 压力、风速、电力或更复杂的流体效果。
4. 再根据实际性能决定是否引入 Compute Shader 或更大网格。

## 许可证与复用边界

### 可以优先研究的实现

- Sandspiel：MIT，适合作为当前项目的直接基础。
- Dust：MIT，适合参考 WebGL 和位掩码材料状态。
- hakolao/sandbox：Apache-2.0，适合研究许可允许的 GPU/计算结构，但它是桌面 Vulkan 项目。

### 只建议研究思路的实现

- Project Sand、Falling Rust、Powder Toy：GPL-3.0。直接复制或改写代码会带来 GPL 的再发布义务。
- Sandboxels：自定义内容许可证，限制商业用途并要求署名，还允许作者要求撤下内容。
- Sand Game JS：作者明确声明在法律意义上不是开源软件。

本文件不是法律意见；若要分发改写代码，应在发布前逐项核对源文件、依赖和素材的许可证。

## 开工前的实际阻碍

- **Rust/WASM 构建**：需要 Rust 工具链和 `wasm-pack`。部署平台若没有预装它，建议在 CI 中预编译 WASM，再让前端只打包生成物。
- **WebGL 兼容性**：桌面浏览器通常没有问题，移动端需要验收 WebGL、触控笔刷和画布缩放。
- **构建依赖清理**：原始 Sandspiel 还包含 Firebase、Sentry 和社区相关依赖；独立中文版需要确保这些模块不会再被打包或产生外部请求。
- **许可证混用**：GPL 和限制性项目不能因为“都是落沙游戏”就直接合并代码。

独立核心不需要 API Key、数据库、登录或云端服务。

## 本地仓库状态备注

截至本次调研，本地 `codex/standalone-zh-ui` 分支已经有独立中文版的设计与实施计划，但源码中仍能看到原始 Firebase/社区模块；说明文档计划尚未完全落实。模拟核心可以继续作为开发基座，社区与云端清理应作为单独的工程任务完成。

## 主要一手来源

- [Sandspiel README](https://github.com/MaxBittker/sandspiel/blob/master/README.md)、[LICENSE](https://github.com/MaxBittker/sandspiel/blob/master/LICENSE)、[crate/Cargo.toml](https://github.com/MaxBittker/sandspiel/blob/master/crate/Cargo.toml)
- [Sandboxels README](https://github.com/R74nCom/sandboxels/blob/main/README.md)、[license.txt](https://github.com/R74nCom/sandboxels/blob/main/license.txt)
- [Dust README](https://github.com/bananaoomarang/Dust/blob/master/README.md)、[package.json](https://github.com/bananaoomarang/Dust/blob/master/package.json)、[client/Dust.js](https://github.com/bananaoomarang/Dust/blob/master/client/Dust.js)
- [Project Sand README](https://github.com/joshdon/ProjectSand/blob/master/README.md)、[scripts/elements.js](https://github.com/joshdon/ProjectSand/blob/master/scripts/elements.js)、[scripts/game.js](https://github.com/joshdon/ProjectSand/blob/master/scripts/game.js)
- [Sand Game JS readme](https://github.com/Hartrik/sand-game-js/blob/master/readme.md)、[LICENSE.md](https://github.com/Hartrik/sand-game-js/blob/master/LICENSE.md)、[src/core/ElementHead.js](https://github.com/Hartrik/sand-game-js/blob/master/src/core/ElementHead.js)
- [Falling Rust README](https://github.com/transistorfet/fallingrust/blob/master/README.md)、[Cargo.toml](https://github.com/transistorfet/fallingrust/blob/master/Cargo.toml)、[src/cells.rs](https://github.com/transistorfet/fallingrust/blob/master/src/cells.rs)
- [The Powder Toy README](https://github.com/The-Powder-Toy/The-Powder-Toy/blob/master/README.md)、[src/simulation/Simulation.cpp](https://github.com/The-Powder-Toy/The-Powder-Toy/blob/master/src/simulation/Simulation.cpp)
- [hakolao/sandbox README](https://github.com/hakolao/sandbox/blob/master/README.md)、[sandbox/Cargo.toml](https://github.com/hakolao/sandbox/blob/master/sandbox/Cargo.toml)
