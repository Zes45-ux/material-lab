<meta charset="utf-8"/>

# 像素炼金术（Sandspiel）

一个完全本地运行的像素物理沙盒。用画笔放置沙、水、植物、火焰等材料，观察它们在 WebGL 画布中的反应；也可以暂停、撤销、重置或使用风吹动材料。

本项目不需要账号、云端后端或社区服务。构建产物可直接作为静态网站部署；游戏运行时不会连接 Firebase、遥测、广告或 Sandspiel 社区服务。

![像素炼金术截图](Screenshot.png)

## 环境要求

- 支持 WebAssembly 的现代浏览器
- Node.js `^20.17.0 || >=22.9.0` 与 npm（仓库固定使用 `npm@11.19.0`；当前 Node 24 可直接使用）
- [Rust 与 rustup](https://rustup.rs/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

建议先确认工具可用：

```powershell
node --version
npm --version
rustup --version
wasm-pack --version
```

## 本地运行

在仓库根目录按以下顺序执行。首次或 Rust 代码变化后，先生成 WebAssembly 包：

```powershell
npm install
npm test
npm run build
npm run start
```

`npm test` 运行源码契约与临时生产构建产物的自动化检查；`npm run build` 会生成可部署的 `dist/` 静态文件。最后执行的 `npm run start` 会持续启动本地开发服务器；如需在它运行期间再次测试或构建，请另开一个终端。

仓库已经提交了 `crate/pkg/` 中的预编译 WASM，因此普通构建默认直接使用这份产物，不要求本机安装 Rust 链接器。修改 Rust 代码后，再运行以下命令更新 WASM：

```powershell
$env:SANDSPIEL_BUILD_WASM = "1"
npm run build
Remove-Item Env:SANDSPIEL_BUILD_WASM
```

## 构建与部署说明

依赖通过根目录的 `package-lock.json` 固定，统一使用 npm；请不要改用 pnpm 或 Yarn。生产构建会由 webpack 重新编译 Rust/WASM 和前端资源，输出的 `dist/index.html`、JavaScript bundle、WASM 和本地资源可由任意静态文件服务器托管。

构建产物支持部署在域名根目录或任意子路径。普通静态服务器可直接访问或刷新 `info/` 和 `bench/`，因为构建会生成对应目录的 `index.html`；不要依赖后端 rewrite。

### Vercel

Vercel 构建机默认没有 Rust/Cargo。仓库已提交 `crate/pkg/` 中的预编译 WebAssembly 包；Vercel 会自动跳过 wasm-pack，只打包这个固定产物。Rust 代码变更后，请先在本地运行 `wasm-pack build --target bundler`，再提交更新后的 `crate/pkg/` 文件。

## 致谢与归属

Sandspiel 由 [Max Bittker](https://maxbittker.com) 创作，是一款以 Rust（经 WASM）、WebGL 和 JavaScript 构建的落沙游戏。它的主要灵感来自 ha55ii 的 [Powder Game](https://dan-ball.jp/en/javagame/dust/)。原项目的设计与制作背景见 [Making Sandspiel](https://maxbittker.com/making-sandspiel)，源代码见 [maxbittker/sandspiel](https://github.com/maxbittker/sandspiel)。

流体模拟代码改编自 [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)。

## 许可证

本项目采用 [MIT License](LICENSE)，版权归 Max Bittker（2018）。使用、复制或分发时请保留许可证和版权声明。
