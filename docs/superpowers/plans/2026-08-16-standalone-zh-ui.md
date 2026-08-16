# Sandspiel 全栈独立中文版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除全部社区、账号、云服务、广告和遥测代码，把 Sandspiel 变成打开即可游玩的独立中文像素沙盒，同时保持画布、材料规则和像素渲染不变。

**Architecture:** 浏览器只加载 React 控件、Rust/WASM Universe、WebGL 渲染和本地输入循环。社区与云端模块从仓库删除；中文材料名称通过 JSON 映射到原有英文 `Species` 键，不改变 WASM 枚举和值。

**Tech Stack:** Rust 1.97、wasm-bindgen、wasm-pack、JavaScript、React 16、Webpack 5、WebGL/regl、Node 20+ 内置测试运行器。

## Global Constraints

- 保持 300 x 300 模拟网格、WebGL shader、材料颜色和像素缩放规则不变。
- 不修改 `crate/src/species.rs` 的材料行为和 `Species` 编号。
- 保留画笔、五档笔刷、暂停/继续、重置、撤销、风工具、SVG 粘贴和说明页面。
- 删除 Upload、Browse、登录、云端作品、点赞、举报、管理后台、Firebase、Cloud Functions、数据库、Sentry、广告和推广。
- 剩余玩家可见 UI 使用简体中文；不引入组件库或整体重设计。
- 每个行为变更必须先看到对应测试失败。

---

### Task 1: 建立独立运行契约并删除社区全栈

**Files:**
- Create: `tests/standalone-ui.test.cjs`
- Modify: `package.json`, `js/app.js`, `js/index.js`, `js/components/ui.js`
- Delete: `js/api.js`, `js/components/admin.js`, `js/components/browse.js`, `js/components/Post.js`, `js/components/hypertext.js`, `js/components/signin.js`, `js/components/signinButton.js`, `js/components/promotab.js`
- Delete: `functions/migration.ts`, `functions/package-lock.json`, `functions/package.json`, `functions/src/admin.ts`, `functions/src/index.ts`, `functions/src/ranges.ts`, `functions/tsconfig.json`, `functions/tslint.json`
- Delete: `.firebaserc`, `firebase.json`, `firestore.indexes.json`, `firestore.rules`, `storage.rules`, `sandspiel.postgres`
- Test: `tests/standalone-ui.test.cjs`

**Interfaces:**
- Consumes: existing `Index`, `Info`, `BenchmarkRunner`, `Universe`, canvas and renderer.
- Produces: local-only router/UI and `npm test` contract command.

- [ ] **Step 1: Write the failing standalone contract**

Create `tests/standalone-ui.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("community, cloud, ads and telemetry are absent", () => {
  const removed = [
    "functions", ".firebaserc", "firebase.json", "firestore.indexes.json",
    "firestore.rules", "storage.rules", "sandspiel.postgres", "js/api.js",
    "js/components/admin.js", "js/components/browse.js", "js/components/Post.js",
    "js/components/hypertext.js", "js/components/signin.js",
    "js/components/signinButton.js", "js/components/promotab.js",
  ];
  for (const file of removed) {
    assert.equal(fs.existsSync(path.join(root, file)), false, `${file} still exists`);
  }

  const runtime = ["js/app.js", "js/index.js", "js/components/ui.js"].map(read).join("\n");
  for (const token of ["firebase", "Sentry", "Upload", "Browse", "SignIn",
    "currentSubmission", "submissionMenuOpen", 'path="/admin"', 'path="/login"']) {
    assert.equal(runtime.includes(token), false, `${token} remains in runtime source`);
  }

  const pkg = JSON.parse(read("package.json"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of ["firebase", "firebase-admin", "firebase-tools", "react-firebaseui",
    "@sentry/browser", "@sentry/react", "@sentry/tracing", "@sentry/wasm",
    "classnames", "timeago.js"]) {
    assert.equal(deps[name], undefined, `${name} is still declared`);
  }
});
```

- [ ] **Step 2: Verify RED**

Run `node --test tests/standalone-ui.test.cjs`.

Expected: assertion failure `functions still exists`, not a syntax or module error.

- [ ] **Step 3: Remove community runtime code**

Make `js/app.js` register only `/`, `/info/` and `/bench`:

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Info from "./components/info";
import { Index } from "./components/ui";
import Menu from "./components/menu";
import BenchmarkRunner from "./components/benchmarkRunner";

function AppRouter() {
  return <Router>
    <Route path="/" component={Index} />
    <Route exact path="/info/" component={() => <Menu><Info /></Menu>} />
    <Route exact path="/bench" component={BenchmarkRunner} />
  </Router>;
}
ReactDOM.render(<AppRouter />, document.getElementById("ui"));
```

In `js/index.js`, remove Sentry imports/configuration, `import "./api"` and the final `adsbygoogle` call. Preserve the complete Universe, render, fluid, canvas, keyboard, paste and animation-loop code.

In `js/components/ui.js`, remove cloud/community imports; reduce state to `paused`, `size`, `selectedElement`; delete upload/rate-limit/submit/cloud-load/vote/menu methods and render blocks. Keep WASM `memory` and `loadSVG` for local SVG paste. Keep pause, reset, undo, wind, brush sizes and all material buttons.

- [ ] **Step 4: Delete the full-stack files and prune dependencies**

Delete every path listed under this task. Add `"test": "node --test tests/*.test.cjs"` to scripts, remove every dependency asserted by the test, and add:

```json
"@babel/runtime": "^7.28.6"
```

- [ ] **Step 5: Verify GREEN and commit**

Run `npm test`; expect one passing test. Then commit:

```powershell
git add -A
git commit -m "refactor: remove community and cloud stack"
```

---

### Task 2: 汉化全部剩余 UI

**Files:**
- Create: `js/element-labels.json`
- Modify: `tests/standalone-ui.test.cjs`, `js/components/ui.js`, `js/components/info.js`, `js/components/menu.js`, `js/components/benchmarkRunner.js`
- Test: `tests/standalone-ui.test.cjs`

**Interfaces:**
- Consumes: unchanged English `Species` keys.
- Produces: `elementLabels[name]` 中文标签和中文可访问名称。

- [ ] **Step 1: Append failing localization tests**

```js
test("all material controls have approved Chinese labels", () => {
  const labelPath = path.join(root, "js/element-labels.json");
  assert.equal(fs.existsSync(labelPath), true, "Chinese label map is missing");
  assert.deepEqual(JSON.parse(fs.readFileSync(labelPath, "utf8")), {
    Empty: "清除", Wall: "墙", Sand: "沙", Water: "水", Stone: "石头",
    Ice: "冰", Gas: "气体", Cloner: "复制器", Mite: "螨虫", Wood: "木头",
    Plant: "植物", Fungus: "真菌", Seed: "种子", Fire: "火", Lava: "岩浆",
    Acid: "酸液", Dust: "尘埃", Oil: "油", Rocket: "火箭",
  });
});

test("remaining controls and pages use Chinese copy", () => {
  const ui = read("js/components/ui.js");
  const info = read("js/components/info.js");
  for (const text of ["重置", "说明", "风", "确定要重置沙盒吗？", "暂停", "继续", "撤销"]) {
    assert.equal(ui.includes(text), true, `missing UI text: ${text}`);
  }
  for (const text of ["像素炼金术（Sandspiel）", "材料说明", "由 Max Bittker 创作"]) {
    assert.equal(info.includes(text), true, `missing info text: ${text}`);
  }
});
```

- [ ] **Step 2: Verify RED**

Run `node --test --test-name-pattern="Chinese|中文" tests/standalone-ui.test.cjs`.

Expected: assertion failure `Chinese label map is missing`.

- [ ] **Step 3: Implement the exact label map and controls**

Create `js/element-labels.json` with the exact asserted object. Import it in UI using `import elementLabels from "../element-labels.json";`. Continue selecting `Species[name]`; render only `{elementLabels[name]}` as translated button text.

Translate `Reset`/`Info`/`Wind` to `重置`/`说明`/`风` and the confirmation to `确定要重置沙盒吗？`. Add these invisible labels without changing dimensions:

```jsx
aria-label={paused ? "继续" : "暂停"}
title={paused ? "继续" : "暂停"}
```

Use `笔刷大小 1` through `笔刷大小 5` for size buttons and `撤销` for the undo icon.

- [ ] **Step 4: Translate information and secondary controls**

Translate `info.js` completely while preserving author, license-relevant attribution and original reference links. It must include:

```jsx
<h1>像素炼金术（Sandspiel）</h1>
<p>由 <a href="https://maxbittker.com">Max Bittker</a> 创作</p>
<h2>材料说明</h2>
```

Translate all material headings/descriptions. In `menu.js`, use `<button aria-label="关闭" title="关闭">×</button>`. In benchmark UI, use `测试中：`、`重新测试`、`关闭`.

- [ ] **Step 5: Verify GREEN and commit**

Run `npm test`; expect all tests to pass. Commit:

```powershell
git add -- tests/standalone-ui.test.cjs js/element-labels.json js/components/ui.js js/components/info.js js/components/menu.js js/components/benchmarkRunner.js
git commit -m "feat: localize sandbox UI in Chinese"
```

---

### Task 3: 清理静态壳、广告样式和外部运行时请求

**Files:**
- Modify: `tests/standalone-ui.test.cjs`, `index.html`, `manifest.json`, `js/layout.js`, `js/styles.css`
- Test: `tests/standalone-ui.test.cjs`

**Interfaces:**
- Consumes: `#background`, `#ui`, `#fps`, `#sand-canvas`, `#fluid-canvas`.
- Produces: 中文静态页面，无远程脚本；画布布局计算不变。

- [ ] **Step 1: Append the failing shell test**

```js
test("static shell is Chinese and has no remote runtime dependency", () => {
  const html = read("index.html");
  const manifest = JSON.parse(read("manifest.json"));
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>像素炼金术<\/title>/);
  assert.match(html, /一款可以自由绘制沙、水、植物和火焰的像素物理沙盒/);
  assert.doesNotMatch(html, /https:\/\//);
  assert.doesNotMatch(html, /adsbygoogle|googletagmanager|a\.sandspiel\.club|adslot_1/);
  assert.equal(manifest.name, "像素炼金术");
  assert.equal(manifest.short_name, "像素炼金术");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.start_url, "/");
});
```

- [ ] **Step 2: Verify RED**

Run `node --test --test-name-pattern="static shell" tests/standalone-ui.test.cjs`.

Expected: assertion failure because `<html>` lacks `lang="zh-CN"`.

- [ ] **Step 3: Make HTML and manifest standalone**

Set title `像素炼金术` and description `一款可以自由绘制沙、水、植物和火焰的像素物理沙盒。`. Remove App Store metadata, Google Fonts, AdSense, Analytics, the ad container, `a.sandspiel.club` and its tracking pixel. Keep only:

```html
<body>
  <div id="background">
    <div id="ui"></div><div id="fps"></div>
    <canvas id="sand-canvas"></canvas><canvas id="fluid-canvas"></canvas>
  </div>
</body>
```

In `manifest.json`, translate `name`/`short_name`, use lowercase `scope`, set `scope` and `start_url` to `/`, and correct 192/384/512 icon paths from `images/` to existing `assets/` files.

- [ ] **Step 4: Remove dead layout/CSS branches without touching canvas rules**

Delete `adStyle`, `adSlot`, `pullTabContent` and their assignments from `layout.js`. Delete CSS used only by `.promo`, submissions, admin, Firebase UI and `#PullTabContent`/`#PullTab`; preserve canvas, toolbar, material, menu, Info, benchmark and FPS selectors.

- [ ] **Step 5: Verify GREEN and commit**

Run `npm test`; expect all tests to pass. Commit:

```powershell
git add -- tests/standalone-ui.test.cjs index.html manifest.json js/layout.js js/styles.css
git commit -m "refactor: make the game shell standalone"
```

---

### Task 4: 统一 npm 构建、更新文档并完成浏览器验收

**Files:**
- Modify: `package.json`, `README.md`, `tests/standalone-ui.test.cjs`
- Create: `package-lock.json`
- Delete: `pnpm-lock.yaml`, `yarn.lock`
- Test: automated contracts, production build, desktop/mobile browser

**Interfaces:**
- Consumes: Node/npm、Rust/rustup、wasm-pack.
- Produces: 单一 npm lockfile、中文运行文档和通过验收的 `dist/`。

- [ ] **Step 1: Append the failing npm workflow contract**

```js
test("repository uses one reproducible npm workflow", () => {
  assert.equal(fs.existsSync(path.join(root, "package-lock.json")), true);
  assert.equal(fs.existsSync(path.join(root, "pnpm-lock.yaml")), false);
  assert.equal(fs.existsSync(path.join(root, "yarn.lock")), false);
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.packageManager, /^npm@/);
  assert.equal(pkg.scripts.test, "node --test tests/*.test.cjs");
  assert.equal(pkg.dependencies["@babel/runtime"], "^7.28.6");
});
```

- [ ] **Step 2: Verify RED and generate one lockfile**

Run the test with `--test-name-pattern="npm workflow"`; expect failure because `package-lock.json` is absent. Set `"packageManager": "npm@12.0.1"`, then run:

```powershell
npm install --package-lock-only --ignore-scripts
```

Confirm `package-lock.json` exists before deleting `pnpm-lock.yaml` and `yarn.lock`. Do not use `--force` if npm reports an error; diagnose the remaining dependency first.

- [ ] **Step 3: Rewrite README as a Chinese standalone guide**

Document requirements and these exact commands:

```powershell
cd crate
wasm-pack build --target bundler
cd ..
npm install
npm run start
npm test
npm run build
```

State that no account, cloud backend or community service is required. Preserve original Sandspiel and WebGL fluid simulation attribution plus license information.

- [ ] **Step 4: Verify tests, install and production build**

Run `npm test`, `npm install --ignore-scripts`, and `npm run build`. Expect exit 0 and `dist/index.html`, one `.wasm` file and JS bundles.

- [ ] **Step 5: Browser-check desktop and mobile**

Serve with `py -3 -m http.server 8081 --bind 127.0.0.1 --directory dist`. At desktop size verify Chinese controls, draw sand and water, pause/continue, undo, reset confirmation and Info. At 390 x 844 verify toolbar wrapping, no horizontal overflow and pointer painting.

Inspect `performance.getEntriesByType("resource")`; every HTTP(S) origin must equal `http://127.0.0.1:8081`. There must be no Firebase, Sentry, ads, analytics, App Store, `a.sandspiel.club` or `orb.farm` request.

- [ ] **Step 6: Run final gate and commit**

Run `npm test`, `npm run build`, `git diff --check`, and `git status --short --branch`. Commit intentional files:

```powershell
git add -A
git commit -m "build: standardize standalone npm workflow"
```
