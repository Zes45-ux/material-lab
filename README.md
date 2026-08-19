# Material Lab

[![License: MIT](https://img.shields.io/badge/license-MIT-4c4c4c)](LICENSE)

English · [简体中文](README.zh-CN.md)

Material Lab is a standalone falling-sand sandbox for exploring pixel materials and physical reactions. It combines a Rust/WASM simulation core with WebGL and JavaScript so you can draw materials, pause the world, and watch gravity, fluids, heat, combustion, growth, and pressure interact.

The project runs without an account, cloud backend, community service, advertising, or telemetry. The production output is a static site that can be deployed to any static file host.

![Material Lab screenshot](Screenshot.png)

## ✨ Features

- Pixel-based simulation powered by Rust/WASM and WebGL
- Materials including sand, water, snow, ice, stone, gas, oil, acid, plants, fungi, seeds, fire, lava, dust, gunpowder, rockets, and utility tools
- Reactions such as gravity, fluid flow, combustion, melting, freezing, corrosion, plant growth, and explosive pressure
- Draw, erase, pause, undo, reset the scene, and use wind to change the simulation
- A material guide at `info/` and a performance page at `bench/`
- Static production files with no runtime backend

## ⚙️ Requirements

- A modern browser with WebAssembly support
- Node.js `^20.17.0 || >=22.9.0`
- npm `11.19.0` (pinned by the repository)
- [Rust and rustup](https://rustup.rs/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) only when rebuilding the WebAssembly package

## 🚀 Quick start

```bash
git clone https://github.com/Zes45-ux/material-lab.git
cd material-lab
npm install
npm test
npm run build
npm run start
```

`npm test` runs source contracts and a temporary production-build check. `npm run build` writes deployable files to `dist/`. `npm run start` starts a local development server at `127.0.0.1`; open the address printed by webpack-dev-server.

The repository includes a precompiled WebAssembly package in `crate/pkg/`, so the default build does not require a local Rust linker. After changing Rust code, rebuild the package before building the web app:

```bash
npm run build:wasm
npm run build
```

## 📦 Build and deploy

The committed `package-lock.json` is the canonical dependency lockfile; use npm rather than pnpm or Yarn. Webpack bundles the front end, WebGL shaders, local assets, and checked-in Rust/WASM output into `dist/`.

The generated HTML, JavaScript, WebAssembly package, and assets can be served by any static file server. The build supports both a domain root and a subpath, and generates entries for the `info/` and `bench/` routes without requiring backend rewrite rules.

The repository includes a `vercel.json` configuration for Vercel. Vercel build machines can use the checked-in `crate/pkg/` package; if Rust code changes, run `npm run build:wasm` locally and commit the updated package before deploying.

## 🗂️ Project structure

```text
.
├── index.html              # Application shell and metadata
├── crate/
│   ├── src/                # Rust simulation source
│   └── pkg/                # Checked-in WebAssembly package
├── js/
│   ├── components/         # UI, menus, materials, and benchmark controls
│   ├── glsl/               # WebGL simulation and display shaders
│   └── *.js                # Rendering, layout, state, and application logic
├── assets/                 # Fonts, icons, and local visual assets
├── tests/                  # Source contracts and packaging checks
├── scripts/                # Build maintenance scripts
├── docs/                   # Design notes and project research
├── webpack.config.js       # Static application build
└── vercel.json             # Vercel build and output configuration
```

## 📚 Attribution

Material Lab is derived from [Sandspiel](https://github.com/maxbittker/sandspiel), created by [Max Bittker](https://maxbittker.com). Sandspiel is a falling-sand game built with Rust/WASM, WebGL, and JavaScript, inspired in part by ha55ii's [Powder Game](https://dan-ball.jp/en/javagame/dust/). See [Making Sandspiel](https://maxbittker.com/making-sandspiel) for the original design and development background.

The fluid simulation is adapted from [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation).

## 📄 License

This project uses the [MIT License](LICENSE). Preserve the license and copyright notices when using, copying, or distributing the project.
