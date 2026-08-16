const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

test("menu and benchmark controls use their complete Chinese copy", () => {
  const menu = read("js/components/menu.js");
  const benchmark = read("js/components/benchmarkRunner.js");

  assert.match(menu, /<button aria-label="关闭" title="关闭">×<\/button>/);
  assert.match(benchmark, /this\.state = \{ lines: \["测试中："\], show: true \};/);
  assert.match(benchmark, />\s*\{" "\}\s*重新测试\s*<\/button>/);
  assert.match(benchmark, /onClick=\{\(\) => this\.setState\(\{ show: false \}\)\}>关闭<\/button>/);
});
