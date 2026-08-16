# Task 4 集成实现报告

## 提交

- `6d9bcafa9c9bb25da845efe7fb4db6f9c79129a0` — `build: standardize standalone npm workflow`

## 完成内容

- 新增 `package-lock.json`，声明 `packageManager: npm@12.0.1`，删除 `pnpm-lock.yaml` 与 `yarn.lock`。
- npm 解析最初因 `raw-loader@1.0.0` 的 `webpack@^4.3.0` peer dependency 与 webpack 5 冲突而失败；升级到 `raw-loader@^4.0.2`。该版本默认 ESM 导出会向 Regl 传入对象而不是 shader 字符串，因此在 webpack loader 中显式设置 `esModule: false`，并增加回归契约测试。
- README 已改为中文独立运行指南，包含指定的 Rust/WASM/npm 命令、无需账号/云端/社区服务说明、Sandspiel 与 WebGL Fluid Simulation 归属和 MIT 许可证信息。

## 命令与构建证据

| 命令 | 结果 |
| --- | --- |
| `node --test --test-name-pattern="npm workflow" tests/*.test.cjs` | RED：缺少 `package-lock.json`（预期） |
| `npm install --package-lock-only --ignore-scripts` | GREEN：生成 542,427-byte `package-lock.json` |
| `npm test` | GREEN：10/10 通过 |
| `npm install --ignore-scripts` | GREEN：从 `node_modules` 不存在的干净状态安装 1,035 个包 |
| `npm run build` | GREEN：webpack exit 0；`dist/index.html`、1 个 `.wasm` 与 5 个 JS 文件存在 |
| `git diff --check` | GREEN：exit 0 |

## 浏览器验收

独立构建用 `py -3 -m http.server 8091 --bind 127.0.0.1 --directory dist` 提供服务。桌面（1280×720）确认页面标题为“像素炼金术”、所有中文材料控件可见；选择沙/水后均得到 `selected` 状态，并通过画布拖拽实际绘制；暂停切换为“继续”后可切回“暂停”；风和撤销可点击；说明页显示“像素炼金术（Sandspiel）”与“材料说明”。

移动端（390×844）确认工具栏换为 4 行，`scrollWidth` 为 390（等于视口宽度），最右按钮约为 390px；选择“沙”并在画布拖拽后，屏幕截图显示新增沙粒轨迹。新开标签页的控制台错误/警告为空。

通过 CDP 读取 `performance.getEntriesByType("resource")`：6 个已加载资源均来自 `http://127.0.0.1:8091`，唯一页面链接是本地 `/info/`；没有 Firebase、Sentry、广告、分析、App Store、`a.sandspiel.club` 或 `orb.farm` 请求或社区入口。

## 风险与限制

- 简报指定的 8081 已被另一 Python HTTP 服务占用，且该服务返回的是另一份旧构建；为避免终止不属于本任务的进程，本次独立验收改用 8091。因此资源来源断言是相同的回环主机但端口为 8091。
- In-app Browser 的 `getJsDialog()` 没有暴露点击“重置”后的原生 confirm 对话框；静态自动化契约已验证精确的 `window.confirm("确定要重置沙盒吗？")` 源码，浏览器中重置按钮可点击。若需要对原生对话框本身做视觉确认，应在没有自动处理 JS dialog 的交互式浏览器中复测。
- `npm install` 报告现有传递依赖弃用警告；生产构建仅有 webpack 的两项体积建议（512px 图标和约 317 KiB JS bundle），没有编译错误。
