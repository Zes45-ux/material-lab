const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

test("webpack provides regl with CommonJS shader source strings", () => {
  const webpackConfig = read("webpack.config.js");
  assert.match(
    webpackConfig,
    /loader: "raw-loader",\s*options: \{ esModule: false \}/
  );
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
    Acid: "酸液", Dust: "尘埃", Oil: "油", Rocket: "火箭",
  });
});

test("material buttons preserve Species selection and render mapped Chinese labels", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /import elementLabels from "\.\.\/element-labels\.json";/);
  assert.match(ui, /let elementID = Species\[name\];/);
  assert.match(ui, /aria-label=\{elementLabels\[name\]\}/);
  assert.match(ui, />\s*\{elementLabels\[name\]\}\s*<\/button>/);
  assert.match(
    ui,
    /Object\.keys\(Species\)[\s\S]*?\.map\(\(n\) =>\s*ElementButton\(n, selectedElement, \(id\) =>\s*this\.setState\(\{ selectedElement: id \}\)\s*\)\s*\)/
  );
});

test("sandbox controls bind Chinese text and accessible names to their controls", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /window\.confirm\("确定要重置沙盒吗？"\)/);
  assert.match(ui, /<button onClick=\{\(\) => this\.reset\(\)\}>重置<\/button>/);
  assert.match(ui, /<Link to=\{\{ pathname: "\/info\/" \}\}>\s*<button>说明<\/button>/);
  assert.match(
    ui,
    /onClick=\{\(\) => this\.togglePause\(\)\}[\s\S]*?aria-label=\{paused \? "继续" : "暂停"\}[\s\S]*?title=\{paused \? "继续" : "暂停"\}/
  );
  assert.match(ui, /let sizeMap = \[1, 3, 7, 19, 39\];/);
  assert.match(
    ui,
    /sizeMap\.map\(\(v, i\) => \([\s\S]*?aria-label=\{`笔刷大小 \$\{i \+ 1\}`\}[\s\S]*?title=\{`笔刷大小 \$\{i \+ 1\}`\}/
  );
  assert.match(
    ui,
    /reset\(\);\s*universe\.pop_undo\(\);[\s\S]*?aria-label="撤销"[\s\S]*?title="撤销"/
  );
  assert.match(
    ui,
    /className=\{-1 == selectedElement \? "selected" : ""\}[\s\S]*?onClick=\{\(\) => \{[\s\S]*?selectedElement: -1[\s\S]*?\}\}[\s\S]*?>\s*风\s*<\/button>/
  );
});

test("information page keeps fully translated material details and original reference links", () => {
  const info = read("js/components/info.js");

  assert.match(info, /<h1>像素炼金术（Sandspiel）<\/h1>/);
  assert.match(
    info,
    /<p aria-label="由 Max Bittker 创作">\s*由 <a href="https:\/\/maxbittker\.com">Max Bittker<\/a> 创作/
  );
  assert.match(info, /<h2>材料说明<\/h2>/);

  for (const [heading, description] of [
    ["墙", "坚不可摧。"], ["沙", "会沉入水中。"], ["水", "可以灭火。"],
    ["石头", "会形成拱形，在压力下会变成沙。"], ["冰", "能冻结水，而且很滑！"],
    ["气体", "极易燃！"], ["复制器", "会复制它接触到的第一种材料。"],
    ["螨虫", "会吃木头和植物，却最喜欢尘埃！能在冰上滑行。"], ["木头", "结实，但可以被生物降解。"],
    ["植物", "在潮湿环境中茁壮生长。"], ["真菌", "会蔓延到所有地方。"], ["种子", "能在沙、植物和真菌上生长。"],
    ["火", "很热！"], ["岩浆", "易燃而且很重。"], ["酸液", "会腐蚀其他材料。"],
    ["尘埃", "漂亮，但有危险的爆炸性。"], ["油", "点燃后会产生烟雾。"],
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
    /<p>\s*最后想说：如果你喜欢这个游戏，或在这里分享作品，你的意见对我很重要。我会尽力让 Sandspiel 成为一个友善、包容的游玩空间，拒绝霸凌、种族主义、跨性别歧视、同性恋歧视及任何其他形式的偏见。如果哪里出了问题，或我能提供帮助，欢迎通过 <a href="mailto:maxbittker@gmail\.com">maxbittker@gmail\.com<\/a> 或 <a href="https:\/\/twitter\.com\/maxbittker">Twitter 上的 @maxbittker<\/a> 联系我。\s*<\/p>/
  );
});

test("menu and benchmark controls use their complete Chinese copy", () => {
  const menu = read("js/components/menu.js");
  const benchmark = read("js/components/benchmarkRunner.js");

  assert.match(menu, /<button aria-label="关闭" title="关闭">×<\/button>/);
  assert.match(benchmark, /this\.state = \{ lines: \["测试中："\], show: true \};/);
  assert.match(benchmark, />\s*\{" "\}\s*重新测试\s*<\/button>/);
  assert.match(benchmark, /onClick=\{\(\) => this\.setState\(\{ show: false \}\)\}>关闭<\/button>/);
});

test("static shell is Chinese and has no remote runtime dependency", () => {
  const html = read("index.html");
  const manifest = JSON.parse(read("manifest.json"));
  const css = read("js/styles.css");
  const layout = read("js/layout.js");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>像素炼金术<\/title>/);
  assert.match(html, /一款可以自由绘制沙、水、植物和火焰的像素物理沙盒/);
  assert.doesNotMatch(html, /https:\/\//);
  assert.doesNotMatch(html, /\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i);
  assert.doesNotMatch(html, /adsbygoogle|googletagmanager|a\.sandspiel\.club|adslot_1/);
  assert.match(
    html,
    /<body>\s*<div id="background">\s*<div id="ui"><\/div>\s*<div id="fps"><\/div>\s*<canvas id="sand-canvas"><\/canvas>\s*<canvas id="fluid-canvas"><\/canvas>\s*<\/div>\s*<\/body>/
  );
  assert.equal(manifest.name, "像素炼金术");
  assert.equal(manifest.short_name, "像素炼金术");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.start_url, "/");
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
  assert.match(layout, /let uiheight\s*=\s*50/);
  assert.match(layout, /let screen_height\s*=\s*window\.innerHeight\s*-\s*uiheight/);
  assert.match(layout, /if\s*\(screen_width\s*>\s*screen_height\)/);
  assert.match(layout, /if\s*\(screen_width\s*-\s*window\.innerHeight\s*<\s*400\)/);
  assert.match(layout, /canvasStyle\s*=\s*`height:\s*\$\{window\.innerHeight\}px;\s*margin:3px`/);
  assert.match(layout, /uiStyle\s*=\s*`width:\s*\$\{\s*screen_width\s*-\s*window\.innerHeight\s*-\s*12\s*\}px;\s*margin:\s*2px;`/);
  assert.match(layout, /canvasStyle\s*=\s*`\s*height:\s*\$\{window\.innerHeight\}px;\s*width:\s*\$\{window\.innerHeight\}px;\s*margin:0;\s*left:\s*auto;\s*right:\s*206px`/);
  assert.match(layout, /uiStyle\s*=\s*`width:\s*200px;\s*margin:\s*2px;`/);
  assert.match(layout, /canvasStyle\s*=\s*`width:\s*\$\{screen_width\}px;\s*bottom:3px;`/);
  assert.match(layout, /canvas\.style\s*=\s*canvasStyle/);
  assert.match(layout, /canvas2\.style\s*=\s*canvasStyle/);
});
