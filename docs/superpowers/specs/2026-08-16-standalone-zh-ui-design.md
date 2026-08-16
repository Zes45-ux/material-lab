# Sandspiel 全栈独立中文版设计

## 目标

把当前 Sandspiel 改造成不依赖社区、账号或云服务的独立中文像素沙盒。用户打开网站后即可使用本地沙盒；画布尺寸、WebGL/WASM 像素渲染、材料规则、笔刷手感、暂停、重置和撤销行为保持不变。

## 范围

### 保留

- Rust/WASM 元胞自动机和全部现有材料规则。
- 300 x 300 模拟网格、画布缩放和当前像素视觉。
- WebGL 沙粒渲染与流体/风场效果。
- 鼠标和触控画笔、五档笔刷尺寸。
- 暂停/继续、重置、撤销、风工具和说明页面。
- 生产构建、开发服务器和静态站点输出。

### 删除

- Upload、Browse、登录、投稿弹窗、点赞、举报和管理后台入口。
- `/browse`、`/login`、`/admin`、Firebase Auth 回调等社区路由。
- 通过 URL hash、Cloud Storage 和作品 ID 加载云端作品的逻辑。
- Firebase 客户端初始化、Firebase UI 和相关前端组件。
- `functions/` Cloud Functions 后端。
- Firestore、Storage、Firebase Hosting、数据库 schema 和迁移配置。
- Firebase、Sentry、社区浏览和登录所独占的 npm 依赖。
- 广告脚本、广告容器、App Store/外部项目推广入口和生产遥测，使运行时不再依赖第三方服务。

### 不做

- 不增减或重写材料规则。
- 不实现新的种子分享、导入导出或社区替代品。
- 不调整画布尺寸、材质颜色、粒子表现、流体算法或帧率策略。
- 不做整体视觉重设计，不引入新的组件库。
- 不处理本轮目标之外的后端安全审查问题；对应后端会被完整删除。

## UI 汉化

页面标题使用“像素炼金术”，说明页标题使用“像素炼金术（Sandspiel）”。剩余所有玩家可见文案改为简体中文：

- `Reset` → `重置`
- `Info` → `说明`
- `Wind` → `风`
- `Empty` → `清除`
- `Wall` → `墙`
- `Sand` → `沙`
- `Water` → `水`
- `Stone` → `石头`
- `Ice` → `冰`
- `Gas` → `气体`
- `Cloner` → `复制器`
- `Mite` → `螨虫`
- `Wood` → `木头`
- `Plant` → `植物`
- `Fungus` → `真菌`
- `Seed` → `种子`
- `Fire` → `火`
- `Lava` → `岩浆`
- `Acid` → `酸液`
- `Dust` → `尘埃`
- `Oil` → `油`
- `Rocket` → `火箭`

内部 `Species` 枚举和值保持英文和原编号，中文仅作为 DOM 展示标签。暂停/继续、五档笔刷和撤销图标增加中文 `aria-label` 与 `title`，不改变其尺寸和样式。

说明页面完整翻译为简体中文，但保留原作者和许可证信息。重置确认框改为中文。开发用 benchmark 页面若保留路由，其可见按钮也一并汉化。

## 架构与文件边界

### 本地沙盒入口

`js/app.js` 只注册主页、说明页和 benchmark 路由。`js/index.js` 不再初始化 Firebase、Sentry、广告或推广，只负责 WASM、画布、输入、渲染循环和本地快捷键。

### UI

`js/components/ui.js` 删除上传、提交、云端加载、点赞、作品标题和登录状态，只保留沙盒控制状态。材料中文标签集中在一个显式映射中，不修改 WASM 枚举。

`js/components/info.js`、`js/components/menu.js` 和 benchmark 控件负责剩余页面的中文文案。CSS 只删除已经没有 DOM 使用者的社区/登录/广告样式；画布、工具栏和材料按钮的规则不改。

### 删除的模块

社区独占组件包括 Browse、Post、Admin、SignIn、SignInButton、HyperText 和 Firebase API 模块。对应 import、路由和 npm 依赖同步删除，避免留下不可达死代码。

### 构建与依赖

项目统一使用 npm，与 README 的命令保持一致。删除失效的 pnpm/yarn 锁文件，生成并提交 `package-lock.json`；补充 Babel 实际需要的直接运行时依赖。README 改成中文版独立运行说明，明确 Rust、wasm-pack、Node 和本地 HTTP 启动步骤。

## 数据流

加载页面后，Webpack 初始化 WASM Universe，渲染循环在本地推进模拟；用户输入直接调用本地 `universe.paint`。应用不再读取 URL 作品 hash、不请求 Firebase/Cloud Functions、不上传图片或用户信息，也不发送 Sentry、广告或统计请求。

## 错误处理

- WASM/WebGL 初始化失败仍由浏览器控制台暴露，不新增遮挡画布的通用错误页。
- 重置继续保留确认步骤，避免误清空本地作品。
- 删除云端功能后，不保留无效按钮、空弹窗或“功能不可用”占位提示。

## 测试与验收

实施采用测试先行：

1. 添加 UI/独立运行契约测试，先证明当前代码仍包含社区路由、Firebase/上传入口和英文标签。
2. 删除社区代码并汉化，使契约测试通过。
3. 运行 Rust 构建和前端 production build。
4. 浏览器验证主页包含中文材料和控制项，不包含 Upload、Browse 或登录入口。
5. 实际绘制至少两种材料，确认像素画布和模拟继续变化。
6. 验证暂停、继续、重置确认、撤销和说明页。
7. 以桌面视口和移动端视口各检查一次，确保工具栏未遮挡画布且中文标签没有溢出。
8. 检查运行时网络请求，确认没有 Firebase、Sentry、广告或社区 API 请求。

## 完成标准

- 用户打开本地网站即可直接绘制和模拟，无登录、账号或云服务提示。
- 仓库中不再包含社区前端、Firebase 后端和数据库部署文件。
- 所有剩余玩家可见 UI 为简体中文。
- 画布尺寸、材料规则、像素配色和渲染效果与改动前一致。
- production build 成功，浏览器控制台没有阻断性错误。
