const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("repository uses one reproducible npm workflow", () => {
  assert.equal(fs.existsSync(path.join(root, "package-lock.json")), true);
  assert.equal(fs.existsSync(path.join(root, "pnpm-lock.yaml")), false);
  assert.equal(fs.existsSync(path.join(root, "yarn.lock")), false);
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.packageManager, "npm@11.19.0");
  assert.equal(pkg.engines.node, "^20.17.0 || >=22.9.0");
  assert.equal(pkg.scripts.test, "node --test tests/*.test.cjs");
  assert.equal(pkg.dependencies["@babel/runtime"], "^7.28.6");
  const lock = read("package-lock.json");
  assert.match(lock, /https:\/\/registry\.npmjs\.org\//);
  assert.doesNotMatch(lock, /registry\.npmmirror\.com/);
});

test("project metadata uses the Material Lab identity", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  const description = "A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.";

  assert.equal(pkg.name, "material-lab");
  assert.equal(pkg.description, description);
  assert.equal(pkg.repository.url, "git+https://github.com/Zes45-ux/material-lab.git");
  assert.equal(lock.name, "material-lab");
  assert.equal(lock.packages[""].name, "material-lab");
});

test("webpack provides regl with CommonJS shader source strings", () => {
  const webpackConfig = read("webpack.config.js");
  assert.match(
    webpackConfig,
    /loader: "raw-loader",\s*options: \{ esModule: false \}/
  );
});

test("Vercel uses the checked-in wasm package without invoking Cargo", () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = "1";
  const configPath = path.join(root, "webpack.config.js");
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath)({}, { mode: "production" });
  if (previous === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previous;

  assert.equal(fs.existsSync(path.join(root, "crate/pkg/package.json")), true);
  assert.equal(fs.existsSync(path.join(root, "crate/pkg/sandtable_bg.wasm")), true);
  assert.equal(
    config.plugins.some((plugin) => plugin.constructor?.name === "WasmPackPlugin"),
    false,
    "Vercel must not invoke wasm-pack/Cargo"
  );
});

test("default builds use checked-in wasm unless local compilation is explicitly enabled", () => {
  const previous = process.env.SANDSPIEL_BUILD_WASM;
  delete process.env.SANDSPIEL_BUILD_WASM;
  const configPath = path.join(root, "webpack.config.js");
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath)({}, { mode: "production" });
  if (previous === undefined) delete process.env.SANDSPIEL_BUILD_WASM;
  else process.env.SANDSPIEL_BUILD_WASM = previous;

  assert.equal(
    config.plugins.some((plugin) => plugin.constructor?.name === "WasmPackPlugin"),
    false,
    "default builds must use the checked-in wasm package"
  );
});

test("Vercel serves the webpack dist output", () => {
  const vercel = JSON.parse(read("vercel.json"));
  assert.equal(vercel.buildCommand, "npm run build");
  assert.equal(vercel.outputDirectory, "dist");
});

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

test("all material controls have approved Chinese labels", () => {
  const labelPath = path.join(root, "js/element-labels.json");
  assert.equal(fs.existsSync(labelPath), true, "Chinese label map is missing");
  assert.deepEqual(JSON.parse(fs.readFileSync(labelPath, "utf8")), {
    Empty: "清除", Wall: "墙", Sand: "沙", Water: "水", Stone: "石头",
    Ice: "冰", Gas: "气体", Cloner: "复制器", Mite: "螨虫", Wood: "木头",
    Plant: "植物", Fungus: "真菌", Seed: "种子", Fire: "火", Lava: "岩浆",
    Acid: "酸液", Dust: "粉尘", Oil: "油", Rocket: "火箭", Gunpowder: "火药",
  });
});

test("material guide data covers every material and only references known targets", () => {
  const labels = JSON.parse(read("js/element-labels.json"));
  const infoPath = path.join(root, "js/material-info.json");
  assert.equal(fs.existsSync(infoPath), true, "material guide data is missing");

  const info = JSON.parse(read("js/material-info.json"));
  assert.deepEqual(Object.keys(info).sort(), Object.keys(labels).sort());

  for (const [name, entry] of Object.entries(info)) {
    assert.equal(entry.name, labels[name], `${name} has no translated name`);
    assert.equal(typeof entry.description, "string", `${name} has no description`);
    assert.ok(entry.description.trim().length > 0, `${name} has an empty description`);
    assert.ok(Array.isArray(entry.reactions), `${name} reactions must be an array`);
    for (const relation of entry.reactions) {
      assert.ok(Array.isArray(relation.with), `${name} reaction targets must be an array`);
      assert.ok(relation.with.length > 0, `${name} has an empty reaction target list`);
      for (const target of relation.with) {
        assert.equal(labels[target] !== undefined, true, `${name} references unknown target ${target}`);
      }
      assert.equal(typeof relation.when, "string", `${name} reaction has no condition`);
      assert.equal(typeof relation.result, "string", `${name} reaction has no result`);
    }
  }
});

test("material inspector shares selected material state with the rail", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /import \{ MATERIAL_GROUPS, getMaterialDetails \} from "\.\/materials";/);
  assert.match(ui, /const MaterialInspector =/);
  assert.match(ui, /selectedElement/);
  assert.match(ui, /selectedName/);
  assert.match(ui, /<MaterialInspector[\s\S]*name=\{selectedName\}/);
  assert.match(ui, /inspectorTab: "intro"/);
  assert.match(ui, /setState\(\{ selectedElement: id, inspectorTab: "intro" \}\)/);
  assert.match(ui, /details\.reactions/);
});

test("material rail and inspector use a responsive desktop and mobile layout", () => {
  const css = read("js/styles.css");

  assert.match(css, /\.material-rail\s*\{/);
  assert.match(css, /\.material-inspector\s*\{/);
  assert.match(css, /overflow-y:\s*auto/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /grid-template-columns/);
  assert.match(css, /--rail-width/);
});

test("material lab shell centers the canvas and exposes a two-level inspector", () => {
  const html = read("index.html");
  const ui = read("js/components/ui.js");
  const layout = read("js/layout.js");
  const css = read("js/styles.css");

  assert.match(html, /<main id="canvas-stage"[^>]*aria-label="沙粒实验画布"/);
  assert.match(ui, /const MaterialInspector =/);
  assert.match(ui, /className="material-rail"/);
  assert.match(ui, /className="material-inspector"/);
  assert.match(ui, /className="inspector-tab/);
  assert.match(ui, /<strong>Material Lab<\/strong>/);
  assert.match(ui, />\s*简介\s*<\/button>/);
  assert.match(ui, />\s*反应\s*<\/button>/);
  assert.match(ui, /MATERIAL_GROUPS/);
  assert.doesNotMatch(ui, /MaterialGuide|href="info\//);
  assert.match(layout, /stage\.clientWidth/);
  assert.match(css, /--rail-width/);
  assert.match(css, /grid-template-columns/);
  assert.match(css, /\.material-inspector/);
});

test("material buttons preserve Species selection and render grouped Chinese labels", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /import \{ MATERIAL_GROUPS, getMaterialDetails \} from "\.\/materials";/);
  assert.match(ui, /let elementID = Species\[name\];/);
  assert.match(ui, /aria-label=\{details\.label\}/);
  assert.match(ui, /MATERIAL_GROUPS\.map/);
  assert.match(ui, /ElementButton\(name, selectedElement/);
});

test("sandbox controls bind Chinese text and accessible names to their controls", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /window\.confirm\("确定要重置沙盒吗？"\)/);
  assert.match(ui, /onClick=\{\(\) => this\.reset\(\)\}/);
  assert.doesNotMatch(ui, /href="info\/"|>说明<\/a>/);
  assert.match(
    ui,
    /onClick=\{\(\) => this\.togglePause\(\)\}[\s\S]*?aria-label=\{paused \? "继续" : "暂停"\}[\s\S]*?title=\{paused \? "继续" : "暂停"\}/
  );
  assert.match(ui, /let sizeMap = \[1, 3, 7, 19, 39\];/);
  assert.match(
    ui,
    /sizeMap\.map\(\(v, i\) => \([\s\S]*?aria-label=[^\n]*笔刷大小[\s\S]*?title=[^\n]*笔刷大小/
  );
  assert.match(
    ui,
    /reset\(\);\s*universe\.pop_undo\(\);[\s\S]*?aria-label="撤销"[\s\S]*?title="撤销"/
  );
  assert.match(
    ui,
    /selectedElement === -1\s*\?\s*"wind-option selected"\s*:\s*"wind-option"[\s\S]*?onClick=\{\(\) => this\.selectElement\(-1\)\}/
  );
});

test("information page keeps fully translated material details and original reference links", () => {
  const info = read("js/components/info.js");

  assert.match(info, /<h1>Material Lab<\/h1>/);
  assert.match(
    info,
    /<p aria-label="由 Max Bittker 创作">\s*由 <a href="https:\/\/maxbittker\.com">Max Bittker<\/a> 创作/
  );
  assert.match(info, /<h2>材料说明<\/h2>/);

  for (const [heading, description] of [
    ["墙", "坚不可摧。"], ["沙", "会沉入水中。"], ["水", "可以灭火。"],
    ["石头", "会形成拱形，在压力下会变成沙。"], ["冰", "能冻结水，而且很滑！"],
    ["气体", "极易燃！"], ["复制器", "会复制它接触到的第一种材料。"],
    ["螨虫", "会吃木头和植物，却最喜欢粉尘！能在冰上滑行。"], ["木头", "结实，但可以被生物降解。"],
    ["植物", "在潮湿环境中茁壮生长。"], ["真菌", "会蔓延到所有地方。"], ["种子", "能在沙、植物和真菌上生长。"],
    ["火", "很热！"], ["岩浆", "易燃而且很重。"], ["酸液", "会腐蚀其他材料。"],
    ["粉尘", "轻盈易飘散的助燃颗粒，可被火焰点燃并帮助火焰向相邻位置传播；承受高压时立即转为火焰。"],
    ["火药", "会沉降；点燃后约 5 秒倒计时；普通引信可被相邻水格熄灭；最后一 tick 仍爆炸，压力超过 120 时直接引爆。"],
    ["油", "点燃后会产生烟雾。"],
    ["火箭", "会爆炸成它接触到的第一种材料的复制品。"], ["清除", "用于擦除。"],
  ]) {
    assert.match(
      info,
      new RegExp(`<h4>${escapeRegExp(heading)}<\\/h4>\\s*${escapeRegExp(description)}`)
    );
  }

  for (const href of [
    "https://maxbittker.com", "https://dan-ball.jp/en/javagame/dust/",
    "https://maxbittker.com/making-sandspiel", "https://github.com/maxbittker/sandspiel",
    "https://github.com/maxbittker/sandspiel/issues", "mailto:maxbittker@gmail.com",
    "https://twitter.com/maxbittker",
  ]) {
    assert.match(info, new RegExp(`href="${escapeRegExp(href)}"`));
  }
});

test("information page keeps its five Chinese introductory paragraphs", () => {
  const info = read("js/components/info.js");

  assert.match(
    info,
    /<p>\s*欢迎光临，感谢你的到来！希望你享受探索这个小游戏的过程，并从中获得片刻宁静。\{" "\}\s*<\/p>/
  );
  assert.match(
    info,
    /<p>\s*成长过程中，这类“落沙”游戏曾带给我数小时的乐趣和想象力。我要特别感谢 ha55ii 的\{" "\}\s*<a href="https:\/\/dan-ball\.jp\/en\/javagame\/dust\/">Powder Game<\/a>，它是 Sandspiel 的主要灵感来源。\s*<\/p>/
  );
  assert.match(
    info,
    /<p>\s*如果你想进一步了解这款游戏的灵感、架构和历史，我写过一篇博客文章（中间部分会涉及一些技术细节）：&nbsp;\s*<a href="https:\/\/maxbittker\.com\/making-sandspiel">Making Sandspiel<\/a>。\s*<\/p>/
  );
  assert.match(
    info,
    /<p>\s*如果愿意，你可以在 GitHub 查看\{" "\}\s*<a href="https:\/\/github\.com\/maxbittker\/sandspiel">源代码<\/a>，或\{" "\}\s*<a href="https:\/\/github\.com\/maxbittker\/sandspiel\/issues">报告问题<\/a>；也欢迎在 Twitter 联系我，我会尽力回复！\s*<\/p>/
  );
  assert.match(
    info,
    /<p>\s*最后想说：如果你喜欢这个本地沙盒，欢迎把它当作一段安静的探索时间。/
  );
});

test("menu and benchmark controls use their complete Chinese copy", () => {
  const menu = read("js/components/menu.js");
  const benchmark = read("js/components/benchmarkRunner.js");

  assert.match(menu, /<a href="\.\.\/" className="x"[^>]*aria-label="关闭"[^>]*>×<\/a>/);
  assert.match(benchmark, /this\.state = \{ lines: \["测试中："\], show: true \};/);
  assert.match(benchmark, />\s*\{" "\}\s*重新测试\s*<\/button>/);
  assert.match(benchmark, /onClick=\{\(\) => this\.setState\(\{ show: false \}\)\}>关闭<\/button>/);
});

test("Rust simulation guards generation arithmetic and documents the supported toolchain", () => {
  const lib = read("crate/src/lib.rs");
  const cargo = read("crate/Cargo.toml");
  const ignored = read(".gitignore");
  const toolchainPath = path.join(root, "rust-toolchain.toml");

  assert.doesNotMatch(lib, /cell\.clock\s*-\s*api\.universe\.generation/);
  assert.match(lib, /cell\.clock\s*==\s*api\.universe\.generation/);
  assert.match(cargo, /edition\s*=\s*"2021"/);
  assert.equal(fs.existsSync(path.join(root, "crate", "Cargo.lock")), true);
  assert.equal(fs.existsSync(toolchainPath), true);
  assert.match(read("rust-toolchain.toml"), /channel\s*=\s*"[^"]+"/);
  assert.doesNotMatch(ignored, /(?:^|\r?\n)\s*(?:crate\/)?Cargo\.lock\s*(?:\r?\n|$)/);
});

test("Rust enum storage never relies on transmute for untrusted bytes", () => {
  const species = read("crate/src/species.rs");

  assert.doesNotMatch(species, /transmute/);
  assert.match(species, /pub fn from_u8\(value: u8\) -> Option<Self>/);
  assert.match(species, /_\s*=>\s*None/);
});

test("benchmark, renderer, and fluid simulations expose cleanup hooks", () => {
  const benchmark = read("js/benchmark.js");
  const runner = read("js/components/benchmarkRunner.js");
  const render = read("js/render.js");
  const fluid = read("js/fluid.js");

  assert.match(benchmark, /destroyBenchmarkWorld|world\.destroy/);
  assert.match(runner, /runBenchmark/);
  assert.match(render, /destroy/);
  assert.match(fluid, /function destroy\(\)/);
  assert.match(fluid, /deleteTexture/);
  assert.match(fluid, /deleteFramebuffer/);
  assert.match(fluid, /deleteProgram/);
});

test("SVG import bounds and sanitizes input and always releases Blob URLs", () => {
  const svg = read("js/convertSVG.js");

  assert.match(svg, /MAX_SVG_INPUT_BYTES/);
  assert.match(svg, /MAX_SVG_NODE_COUNT/);
  assert.match(svg, /querySelectorAll\("\*"\)/);
  assert.match(svg, /script|foreignObject|iframe/);
  assert.equal(svg.includes("url\\s*\\("), true);
  assert.match(svg, /URL\.revokeObjectURL/);
});

test("development server binds locally and does not accept arbitrary Host headers", () => {
  const pkg = JSON.parse(read("package.json"));
  const config = read("webpack.config.js");

  assert.match(pkg.scripts.start, /--host\s+127\.0\.0\.1/);
  assert.doesNotMatch(pkg.scripts.start, /0\.0\.0\.0/);
  assert.match(config, /allowedHosts:\s*\[\s*"localhost",\s*"127\.0\.0\.1",\s*"\[::1\]"\s*\]/);
  assert.doesNotMatch(config, /allowedHosts:\s*"all"/);
});

test("fluid upload path avoids reallocating per-frame textures and scales pressure work", () => {
  const fluid = read("js/fluid.js");

  assert.ok((fluid.match(/texSubImage2D/g) || []).length >= 2);
  assert.match(fluid, /texSubImage2D\([\s\S]*?burnsData/);
  assert.match(fluid, /texSubImage2D\([\s\S]*?cellsData/);
  assert.match(fluid, /defaultPressureIterations/);
  assert.match(fluid, /PRESSURE_ITERATIONS:\s*defaultPressureIterations/);
});

test("toolbar and menu use one semantic interactive element per action", () => {
  const ui = read("js/components/ui.js");
  const menu = read("js/components/menu.js");

  assert.doesNotMatch(ui, /<a[^>]*>\s*<button/);
  assert.doesNotMatch(menu, /<a[^>]*>\s*<button/);
  assert.doesNotMatch(ui, /href="info\/"/);
  assert.match(menu, /<a href="\.\.\/" className="x"[^>]*>×<\/a>/);
});

test("dependency fixes remove the audited vulnerable development chains", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.devDependencies["glslify-loader"], "^2.0.0");
  assert.equal(pkg.devDependencies["copy-webpack-plugin"], "^14.0.0");
  assert.equal(pkg.devDependencies["webpack-dev-server"], "^6.0.0");
});

test("static shell is Chinese and has no remote runtime dependency", () => {
  const html = read("index.html");
  const manifest = JSON.parse(read("manifest.json"));
  const css = read("js/styles.css");
  const layout = read("js/layout.js");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>Material Lab<\/title>/);
  assert.match(html, /A standalone falling-sand sandbox for exploring pixel materials and physical reactions/);
  assert.doesNotMatch(html, /https:\/\//);
  assert.doesNotMatch(html, /\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i);
  assert.doesNotMatch(html, /adsbygoogle|googletagmanager|a\.sandspiel\.club|adslot_1/);
  assert.match(
    html,
    /<body(?:\s+data-view="[^"]+")?>\s*<div id="background">\s*<div id="ui"><\/div>\s*<div id="fps"><\/div>\s*<main id="canvas-stage"[^>]*>\s*<canvas id="sand-canvas"><\/canvas>\s*<canvas id="fluid-canvas"><\/canvas>\s*<\/main>\s*<\/div>\s*<\/body>/
  );
  assert.equal(manifest.name, "Material Lab");
  assert.equal(manifest.short_name, "Material Lab");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.start_url, "./");
  assert.deepEqual(
    manifest.icons.map(({ sizes, src, type }) => ({ sizes, src, type })),
    [
      ["72", "assets/icon-72x72.png"], ["96", "assets/icon-96x96.png"],
      ["128", "assets/icon-128x128.png"], ["144", "assets/icon-144x144.png"],
      ["152", "assets/icon-152x152.png"], ["192", "assets/icon-192x192.png"],
      ["384", "assets/icon-384x384.png"], ["512", "assets/icon-512x512.png"],
    ].map(([size, src]) => ({ sizes: `${size}x${size}`, src, type: "image/png" }))
  );
  for (const icon of manifest.icons) {
    assert.equal(fs.existsSync(path.join(root, icon.src)), true, `${icon.src} is missing`);
  }

  const canvasImageRule = css.match(/canvas\s*,\s*img\s*\{([^}]*)\}/);
  const sandCanvasRule = css.match(/#sand-canvas\s*\{([^}]*)\}/);
  assert.notEqual(canvasImageRule, null, "canvas image-rendering rule is missing");
  assert.notEqual(sandCanvasRule, null, "sand canvas rule is missing");
  assert.match(canvasImageRule[1], /image-rendering:\s*crisp-edges/);
  assert.match(canvasImageRule[1], /image-rendering:\s*pixelated/);
  assert.match(sandCanvasRule[1], /z-index:\s*2/);
  assert.doesNotMatch(css, /\.active button|button\.active|button:disabled|\binput\s*\{/);
  assert.doesNotMatch(layout, /adStyle|adSlot|pullTabContent/);
  assert.match(layout, /const stage = document\.getElementById\("canvas-stage"\)/);
  assert.match(layout, /stage\.clientWidth/);
  assert.match(layout, /target\.style\.left = "50%"/);
  assert.match(layout, /target\.style\.top = "50%"/);
  assert.match(layout, /window\.innerWidth < 768/);
});

test("runtime keeps only local Chinese FPS display and has no telemetry sink", () => {
  const runtimeFiles = fs.readdirSync(path.join(root, "js"), { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .map((file) => fs.readFileSync(path.join(root, "js", file), "utf8"))
    .join("\n");
  for (const token of ["dataLayer", "gtag", "sending fps", "google-analytics"]) {
    assert.equal(runtimeFiles.includes(token), false, `${token} remains in runtime source`);
  }
  const fps = read("js/fps.js");
  assert.match(fps, /this\.fps\.textContent = `帧率：\$\{Math\.round\(mean\)\}`;/);
});

test("benchmark results and standalone information copy are fully Chinese", () => {
  const benchmark = read("js/benchmark.js");
  const info = read("js/components/info.js");
  for (const token of ["Running", "trials", "reps", "ms cpu", "ms fluid", "avg:"]) {
    assert.equal(benchmark.includes(token), false, `${token} remains in benchmark output`);
  }
  assert.match(benchmark, /运行 \$\{n\} 轮测试，每轮 \$\{m\} 次/);
  assert.match(benchmark, /平均：/);
  assert.doesNotMatch(info, /在这里分享作品|分享作品/);
});

const webpackCli = path.join(root, "node_modules", "webpack", "bin", "webpack.js");

test("production build emits marked static entries for root and colliding base paths", { skip: !fs.existsSync(webpackCli) }, async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "sandspiel-static-test-"));
  const result = spawnSync(process.execPath, [webpackCli, "--mode=production"], {
    cwd: root,
    env: { ...process.env, SANDSPIEL_DIST_DIR: output },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const entry = (folder, file = "index.html") => fs.readFileSync(path.join(folder, file), "utf8");
  assert.match(entry(output), /<body data-view="home">/);
  assert.match(entry(output, "info/index.html"), /<body data-view="info">/);
  assert.match(entry(output, "bench/index.html"), /<body data-view="bench">/);
  assert.match(entry(output), /src="[^/][^"]+\.js"/);
  assert.equal(JSON.parse(entry(output, "manifest.json")).scope, "./");

  const serviceWorker = entry(output, "service-worker.js");
  for (const removed of ["ads.txt", "site.webmanifest", "price.png", "App_Store_Badge"]) {
    assert.equal(serviceWorker.includes(removed), false, `${removed} entered the precache`);
  }

  const serve = async (host, routes) => {
    const server = http.createServer((request, response) => {
      const urlPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const file = path.join(host, urlPath, urlPath.endsWith("/") ? "index.html" : "");
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        response.writeHead(200, { "content-type": "text/html" });
        response.end(fs.readFileSync(file));
        return;
      }
      response.writeHead(404).end();
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    try {
      for (const [route, view] of routes) {
        const response = await fetch(`http://127.0.0.1:${port}${route}`);
        assert.equal(response.status, 200, route);
        assert.match(await response.text(), new RegExp(`<body data-view="${view}">`), route);
      }
    } finally {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
  const normalHost = fs.mkdtempSync(path.join(os.tmpdir(), "sandspiel-static-host-"));
  const collisionHost = fs.mkdtempSync(path.join(os.tmpdir(), "sandspiel-static-collision-"));
  fs.cpSync(output, normalHost, { recursive: true });
  fs.cpSync(output, path.join(normalHost, "sandbox"), { recursive: true });
  fs.cpSync(output, path.join(collisionHost, "info"), { recursive: true });
  fs.cpSync(output, path.join(collisionHost, "bench"), { recursive: true });
  try {
    await serve(normalHost, [
      ["/", "home"], ["/info/", "info"], ["/bench/", "bench"],
      ["/sandbox/", "home"], ["/sandbox/info/", "info"], ["/sandbox/bench/", "bench"],
    ]);
    await serve(collisionHost, [
      ["/info/", "home"], ["/info/info/", "info"],
      ["/bench/", "home"], ["/bench/bench/", "bench"],
    ]);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
    fs.rmSync(normalHost, { recursive: true, force: true });
    fs.rmSync(collisionHost, { recursive: true, force: true });
  }
});

test("production packaging has an explicit local asset allowlist and no dead deploy dependencies", () => {
  const config = read("webpack.config.js");
  const pkg = JSON.parse(read("package.json"));
  assert.doesNotMatch(config, /from: "assets\/\*"/);
  for (const asset of ["ads.txt", "App_Store_Badge.svg.png", "price.png", "tab.png", "site.webmanifest", "html_code.html", "SSStudio ColorLined Big.svg"]) {
    assert.equal(fs.existsSync(path.join(root, "assets", asset)), false, `${asset} remains`);
  }
  for (const dependency of ["react-youtube", "http-server", "gh-pages"]) {
    assert.equal(pkg.dependencies?.[dependency], undefined, `${dependency} remains in dependencies`);
    assert.equal(pkg.devDependencies?.[dependency], undefined, `${dependency} remains in devDependencies`);
  }
  assert.equal(pkg.scripts.deploy, undefined);
});
