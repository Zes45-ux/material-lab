# Sandspiel 独立中文版代码审查与修复报告

## 审查信息

- 仓库：[`Zes45-ux/sandspiel-zh`](https://github.com/Zes45-ux/sandspiel-zh)
- 初始审查基线：`main` / `cb3ff116e39e1e26b43748fb7a4ca19f8a628765`
- 修复分支：`codex/standalone-zh-ui-impl`
- 修复 worktree：`sandspiel/.worktrees/standalone-zh-ui-impl`
- 审查范围：Rust/WASM 物理引擎、JavaScript/WebGL 前端、SVG 输入、静态构建、PWA 配置、依赖和自动化测试
- 审查性质：先进行只读审查，再按本报告实施修复并复核；本文记录当前实现状态

## 结论

本次审查列出的 P1、P2、P3 问题均已在当前修复分支处理，材料百科也已完成并保留。修复重点包括：

- 防止 debug WASM 首次 `tick()` 因 `u8` 代数比较而 panic，并补充真实物理行为测试。
- 移除不安全的 `transmute`，校验来自 raw cell 的材料编号。
- 升级构建依赖、锁定 npm/Rust 工具链，并提交 `Cargo.lock`。
- 为 benchmark、Fluid 和 WebGL renderer 补充销毁路径。
- 限制并清理 SVG 导入，默认将开发服务器限制在 localhost。
- 降低移动端 Fluid 压力迭代次数并避免每帧重新分配像素纹理。
- 修复嵌套交互元素，并增加桌面左侧/移动端抽屉式材料百科。

## 修复矩阵

| 编号 | 问题 | 状态 | 主要实现位置 |
| --- | --- | --- | --- |
| P1 | `u8` 代数比较在 debug WASM 首次推进时下溢 | 已修复 | [`crate/src/lib.rs`](../crate/src/lib.rs) |
| P1 | Rust/WASM 测试没有覆盖真实物理行为 | 已修复 | [`crate/src/lib.rs`](../crate/src/lib.rs)、[`crate/tests/web.rs`](../crate/tests/web.rs) |
| P1 | 开发依赖审计存在高危/严重漏洞链 | 已修复 | [`package.json`](../package.json)、[`package-lock.json`](../package-lock.json) |
| P2 | raw 字节通过 `transmute` 生成非法 `Species` | 已修复 | [`crate/src/species.rs`](../crate/src/species.rs) |
| P2 | benchmark、Fluid、renderer 重复运行时泄漏资源 | 已修复 | [`js/benchmark.js`](../js/benchmark.js)、[`js/fluid.js`](../js/fluid.js)、[`js/render.js`](../js/render.js) |
| P2 | SVG Blob URL 泄漏及外部资源/脚本风险 | 已修复 | [`js/convertSVG.js`](../js/convertSVG.js) |
| P2 | 开发服务器暴露到局域网并接受任意 Host | 已修复 | [`package.json`](../package.json)、[`webpack.config.js`](../webpack.config.js) |
| P2 | Rust 依赖和编译器版本不可复现 | 已修复 | [`crate/Cargo.lock`](../crate/Cargo.lock)、[`rust-toolchain.toml`](../rust-toolchain.toml) |
| P3 | Fluid 压力迭代和完整纹理上传带来性能开销 | 已修复 | [`js/fluid.js`](../js/fluid.js) |
| P3 | 工具栏和菜单存在嵌套交互元素 | 已修复 | [`js/components/ui.js`](../js/components/ui.js)、[`js/components/menu.js`](../js/components/menu.js) |
| P3 | 缺少材料介绍和材料反应关系面板 | 已修复 | [`js/material-info.json`](../js/material-info.json)、[`js/components/ui.js`](../js/components/ui.js)、[`js/styles.css`](../js/styles.css) |

## 具体修复

### P1：Rust debug WASM 稳定性和行为测试

原实现用 `cell.clock - generation` 判断一个 cell 是否已更新。`u8` 在 debug 编译下会对下溢 panic。当前实现使用 `generation.wrapping_add(1)` 与时钟做等值比较，明确保留原有环绕计数语义；相关代际递增也使用 wrapping 操作。

新增 native 行为测试覆盖：

- 空 `Universe` 首次 `tick()` 不 panic。
- 沙粒可以在一次 tick 后移动到下方空位。

WASM 测试模块还公开 `Species` 并覆盖基本 Universe/WASM 测试入口。这样 `cargo test`、debug 构建和浏览器 smoke test 不再只依赖 `1 + 1` 静态测试。

### P1：构建依赖

将构建链升级到可审计的版本：`glslify-loader` 2、`copy-webpack-plugin` 14、`webpack-dev-server` 6，并通过 npm override 将旧 WASM 插件间接依赖的 `watchpack` 固定到 `2.5.2`。`package-lock.json` 已重新生成，完整审计纳入复核流程。

### P2：raw cell 和资源生命周期

`Species::from_u8` 只接受已声明的离散枚举值，Cloner/Rocket 从 raw cell 恢复材料时遇到非法编号会回退到安全值；代码中不再使用 `transmute`。

benchmark 重测会先销毁旧的 Universe、Fluid 和 renderer。Fluid 的 `destroy()` 释放帧缓冲、纹理、shader/program、buffer、事件监听器和 dat.GUI；renderer 的 `destroy()` 释放 regl 资源，snapshot/palette 也使用 `finally` 清理。

### P2：SVG 和开发服务器边界

SVG 导入现在限制输入大小和元素数量，拒绝脚本、`foreignObject`、外部资源、事件属性、CSS `url()` 等内容，并在成功、失败和异常路径统一回收 Blob URL。

开发服务器默认绑定 `127.0.0.1`，`allowedHosts` 只允许 `localhost`、`127.0.0.1` 和 `[::1]`，避免源码映射和开发接口被同网段设备默认访问。

### P2：Rust 可复现性

仓库新增 `crate/Cargo.lock`，取消对该文件的忽略，并增加 `rust-toolchain.toml` 声明 Rust `1.97.1`、`rustfmt` 和 `clippy` 组件。这样本地构建、CI 和已提交的 `crate/pkg` WASM 产物有明确的版本基线。

### P3：Fluid 和交互语义

Fluid 压力迭代次数改为桌面 20、窄屏/iOS 12；cells/burns 更新改用 `texSubImage2D`，避免每帧重新分配纹理存储。说明页和菜单关闭操作均改为单一语义链接，不再在 anchor 中嵌套 button。

### P3：材料百科

[`js/material-info.json`](../js/material-info.json) 为 `element-labels.json` 的全部 19 个条目提供中文名、类别、简介和主要反应。每条反应保留方向、触发条件、结果和目标材料，展示层不改变 Rust 物理规则。

桌面端显示固定在左侧的百科面板；窄屏端变为可展开/收起的抽屉，避免遮挡画布。条目和反应对象都使用 button 语义：

- 点击百科条目会同步选中工具栏材料。
- 点击反应对象会跳转到对应材料条目并同步工具栏高亮。
- 面板支持键盘可聚焦控件和清晰的 focus-visible 状态。
- 自动化测试校验 19 个条目完整覆盖、目标材料均存在、反应关系方向不被强制反向生成。

## 验证记录

以下命令和浏览器检查用于复核当前修复分支；浏览器验证使用本地开发服务器 `http://127.0.0.1:4173/`。

| 检查项 | 当前结果 |
| --- | --- |
| `$env:RUSTUP_TOOLCHAIN='stable-x86_64-pc-windows-gnu'; npm test` | 27/27 通过，包含 webpack WASM 构建 |
| `$env:RUSTUP_TOOLCHAIN='stable-x86_64-pc-windows-gnu'; npm run build` | 通过，生产静态包生成成功 |
| `RUSTUP_TOOLCHAIN=stable-x86_64-pc-windows-gnu cargo test --manifest-path crate/Cargo.toml` | 3 个 native 测试通过 |
| `cargo fmt --manifest-path crate/Cargo.toml --all -- --check` | 通过 |
| `cargo clippy --all-targets -- -D warnings` | 通过 |
| `wasm-pack test --node crate` | 编译通过；测试模块声明浏览器运行，因此 Node runner 显示 0 个用例 |
| `npm audit --registry=https://registry.npmjs.org` | 0 vulnerabilities |
| `git diff --check` | 通过 |
| 浏览器桌面首页/百科/选择同步 | 通过，无运行时 error；旧页面仅留下开发服务器重启期间的 HMR 提示 |
| 浏览器 benchmark 页面 | 50 轮测试完成，无运行时 error |
| 浏览器移动端 390×844 | 抽屉展开/收起、选择同步、说明页导航通过；无横向溢出，无运行时 error |

## 后续维护建议

本报告范围内没有未关闭的 P1/P2/P3 问题。后续可继续关注：

1. 在 CI 中同时运行 native Rust、debug WASM 编译和浏览器 smoke test。
2. 让生产构建定期执行完整 npm audit，并在升级依赖后复核 GLSL、WASM 和静态路由。
3. 如果未来扩大 SVG 支持范围，应为允许的资源类型建立显式白名单和针对性测试。
4. 材料百科属于物理规则的面向用户摘要；新增/修改 Rust 反应时同步更新 `material-info.json` 和一致性测试。
