# Material Lab

Material Lab is a standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.

Draw with sand, water, plants, fire, and other materials on a pixel canvas. Pause the simulation, undo a change, reset the scene, or use wind to see how materials interact.

The project runs locally without an account, cloud backend, community service, advertising, or telemetry. The production build is a static site that can be deployed to any static file host.

![Material Lab screenshot](Screenshot.png)

## Requirements

- A modern browser with WebAssembly support
- Node.js `^20.17.0 || >=22.9.0` and npm (`npm@11.19.0` is pinned by the repository)
- [Rust and rustup](https://rustup.rs/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

Check the toolchain before starting:

```powershell
node --version
npm --version
rustup --version
wasm-pack --version
```

## Run locally

From the repository root:

```powershell
npm install
npm test
npm run build
npm run start
```

The test command runs source contracts and a temporary production-build check. The build command writes deployable static files to `dist/`. The start command keeps a local development server running; use another terminal for additional commands while it is active.

The repository includes a precompiled WebAssembly package in `crate/pkg/`, so the default build does not require a local Rust linker. After changing Rust code, rebuild the package before building the web app:

```powershell
npm run build:wasm
npm run build
```

The `build:wasm` and `build` scripts remove the temporary `.gitignore` that wasm-pack writes into
`crate/pkg/`, keeping the precompiled package visible to version control.

## Build and deploy

The committed `package-lock.json` is the canonical dependency lockfile; use npm rather than pnpm or Yarn. Webpack compiles the front end and packages the checked-in Rust/WASM output into `dist/`. The generated `index.html`, JavaScript bundle, WebAssembly, and local assets can be served by any static file server.

The build works at a domain root or under a subpath. It generates `index.html` entries for the `info/` and `bench/` routes, so a static server does not need backend rewrite rules for those paths.

### Vercel

Vercel build machines do not need Rust for the default deployment because `crate/pkg/` contains the precompiled WebAssembly package. If Rust code changes, run `npm run build:wasm` locally and commit the updated `crate/pkg/` files before deploying.

## Architecture

- `crate/` contains the Rust simulation and WebAssembly package.
- `js/` contains the React controls, WebGL renderer, fluid simulation, material data, and shaders.
- `webpack.config.js` builds the static application and copies the local assets.
- `tests/` contains source contracts and production packaging checks.

## Attribution

Material Lab is derived from [Sandspiel](https://github.com/maxbittker/sandspiel), created by [Max Bittker](https://maxbittker.com). Sandspiel is a falling-sand game built with Rust/WASM, WebGL, and JavaScript, inspired in part by ha55ii's [Powder Game](https://dan-ball.jp/en/javagame/dust/). See [Making Sandspiel](https://maxbittker.com/making-sandspiel) for the original design and development background.

The fluid simulation is adapted from [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation).

## License

This project uses the [MIT License](LICENSE). Preserve the license and copyright notices when using, copying, or distributing the project.
