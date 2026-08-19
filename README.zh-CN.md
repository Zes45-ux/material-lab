# 材料实验室（Material Lab）

[![许可证：MIT](https://img.shields.io/badge/license-MIT-4c4c4c)](LICENSE)

[English](README.md) · 简体中文

材料实验室（Material Lab）是一个用于探索像素材料和物理反应的独立运行沙盒。项目将 Rust/WASM 模拟核心与 WebGL、JavaScript 结合，让你可以绘制材料、暂停世界，并观察重力、流体、热量、燃烧、生长和压力如何相互作用。

项目无需账号、云端后端、社区服务、广告或遥测。生产构建会生成可以部署到任意静态文件托管服务的静态站点。

![材料实验室截图](Screenshot.png)

## ✨ 功能特性

- 使用 Rust/WASM 和 WebGL 驱动的像素材料模拟
- 包含沙子、水、雪、冰、石头、气体、油、酸液、植物、真菌、种子、火、岩浆、粉尘、火药、火箭和工具类材料
- 支持重力沉降、流体流动、燃烧、融化、冻结、腐蚀、植物生长和爆炸压力等反应
- 可以绘制、擦除、暂停、撤销、重置场景，并使用风力改变模拟结果
- `info/` 材料说明页与 `bench/` 性能测试页
- 生成无需运行时后端的静态生产文件

## ⚙️ 环境要求

- 支持 WebAssembly 的现代浏览器
- Node.js `^20.17.0 || >=22.9.0`
- npm `11.19.0`（仓库已固定版本）
- 只有在重新构建 WebAssembly 包时才需要安装 [Rust 和 rustup](https://rustup.rs/) 以及 [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

## 🚀 快速开始

```bash
git clone https://github.com/Zes45-ux/material-lab.git
cd material-lab
npm install
npm test
npm run build
npm run start
```

`npm test` 会运行源码契约测试和临时生产构建检查。`npm run build` 会将可部署文件写入 `dist/`。`npm run start` 会在 `127.0.0.1` 启动本地开发服务器，请打开 webpack-dev-server 输出的地址。

仓库已包含 `crate/pkg/` 中预编译的 WebAssembly 包，因此默认构建不需要本地 Rust 链接器。修改 Rust 代码后，请先重新构建该包，再构建 Web 应用：

```bash
npm run build:wasm
npm run build
```

## 📦 构建与部署

提交到仓库的 `package-lock.json` 是唯一的依赖锁文件，请使用 npm，不要改用 pnpm 或 Yarn。Webpack 会将前端代码、WebGL 着色器、本地资源以及已提交的 Rust/WASM 输出打包到 `dist/`。

生成的 HTML、JavaScript、WebAssembly 包和资源可以由任意静态文件服务器提供。构建结果支持域名根路径和子路径，并会为 `info/` 与 `bench/` 生成入口文件，不需要后端重写规则。

仓库包含用于 Vercel 的 `vercel.json` 配置。Vercel 构建机可以直接使用已提交的 `crate/pkg/` 包；如果 Rust 代码发生变化，请在本地运行 `npm run build:wasm`，并在部署前提交更新后的包。

## 🗂️ 项目结构

```text
.
├── index.html              # 应用外壳与元数据
├── crate/
│   ├── src/                # Rust 模拟源码
│   └── pkg/                # 已提交的 WebAssembly 包
├── js/
│   ├── components/         # UI、菜单、材料和性能测试控件
│   ├── glsl/               # WebGL 模拟与显示着色器
│   └── *.js                # 渲染、布局、状态和应用逻辑
├── assets/                 # 字体、图标和本地视觉资源
├── tests/                  # 源码契约与打包检查
├── scripts/                # 构建维护脚本
├── docs/                   # 设计记录与项目研究
├── webpack.config.js       # 静态应用构建配置
└── vercel.json             # Vercel 构建与输出配置
```

## 📚 项目归属

Material Lab 源自 [Sandspiel](https://github.com/maxbittker/sandspiel)，由 [Max Bittker](https://maxbittker.com) 创建。Sandspiel 是一个使用 Rust/WASM、WebGL 和 JavaScript 构建的 falling-sand 游戏，部分灵感来自 ha55ii 的 [Powder Game](https://dan-ball.jp/en/javagame/dust/)。原始设计与开发背景请参阅 [Making Sandspiel](https://maxbittker.com/making-sandspiel)。

流体模拟部分改编自 [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)。

## 📄 许可证

本项目使用 [MIT License](LICENSE)。使用、复制或分发本项目时，请保留许可证和版权声明。
