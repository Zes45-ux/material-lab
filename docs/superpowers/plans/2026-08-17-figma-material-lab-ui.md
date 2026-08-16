# Canvas-First Figma/FigJam Material Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 Sandspiel 三栏界面改造成画布优先的 Figma/FigJam 材料实验台，Inspector 默认折叠，同时保持像素模拟和全部核心操作不变。

**Architecture:** 继续使用现有 React 16 类组件、CSS、WASM/WebGL 双画布，不引入新依赖。`Index` 只新增 Inspector 开合状态和键盘关闭事件，`MaterialInspector` 仍是纯展示组件；CSS 使用稳定的 `--figma-*` token 和 `data-family` 属性完成视觉分层，隐藏 Inspector 不为画布预留宽度。

**Tech Stack:** React 16、JavaScript、CSS、Node.js `node:test`、Webpack 5、Rust/WASM、WebGL。

## Global Constraints

- 中央 300x300 模拟画布是唯一视觉核心。
- Inspector 默认收起，桌面端从右侧覆盖展开，移动端作为底部抽屉展开。
- 基础材料用淡蓝、生命材料用薄荷绿、能量材料用柔和珊瑚色、特殊材料用薰衣草色。
- 材料 swatch 继续读取 Sandspiel 原生 `pallette()`；不得重绘材料 palette。
- 有效笔刷档位必须保持 `[1, 3, 7, 19, 39]`。
- 不修改 Rust/WASM、Species 编号、tick、随机数、shader、流体反馈、画布尺寸、输入坐标或存档协议。
- 不添加远程字体、图片素材、组件库、动画库或其他运行时依赖。
- 保留仓库内 `Mondwest` 与 `NeueBit` 字体，并保留 `image-rendering: pixelated`。
- 开始执行前先运行 `git status --short`；当前工作树已有用户改动，只暂存每个任务明确列出的路径。

---

## File Map

- `tests/figma-material-lab-ui.test.cjs`：静态 UI 契约，约束 token、家族 hook、Inspector 状态接口、画布优先布局和像素渲染。
- `js/components/ui.js`：材料按钮、Inspector 展示、`Index` 状态、键盘事件及顶部/侧边控制结构。
- `js/components/materials.js`：材料家族的稳定 `key` 与说明数据；只验证和保留，不改 Species 映射。
- `js/styles.css`：Figma/FigJam token、桌面工作台、材料 pastel 分类、折叠 Inspector、移动端托盘和动效降级。

---

### Task 1: 扩充画布优先 UI 契约

**Files:**
- Modify: `tests/figma-material-lab-ui.test.cjs`
- Read only: `js/components/materials.js`
- Read only: `js/components/ui.js`
- Read only: `js/styles.css`

**Interfaces:**
- Consumes: `MATERIAL_GROUPS[*].key`、`Index.state`、`MaterialInspector` JSX 和真实 CSS 文本。
- Produces: 后续任务必须满足的静态契约；不导出运行时代码。

- [ ] **Step 1: 记录当前基线**

Run:

```powershell
git status --short
npm test
```

Expected: 记录现有未提交文件；现有测试可能因缺少 `--figma-*` token 而失败，但不得出现测试文件语法错误。

- [ ] **Step 2: 写入 Inspector 与画布优先的失败契约**

在现有测试中保留四个家族 key、`data-family`、canvas z-index 与 `image-rendering` 断言，并加入：

```js
test("Inspector is opt-in and keyboard dismissible", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /inspectorOpen:\s*false/);
  assert.match(ui, /aria-expanded=\{inspectorOpen\}/);
  assert.match(ui, /aria-controls=["']material-inspector["']/);
  assert.match(ui, /event\.key\s*===\s*["']Escape["']/);
  assert.match(ui, /onClose=\{\(\)\s*=>\s*this\.setState\(\{ inspectorOpen: false \}\)\}/);
});

test("closed Inspector does not reserve desktop canvas width", () => {
  const css = read("js/styles.css");

  assert.match(css, /#canvas-stage\s*\{[\s\S]*?right:\s*0\s*;/);
  assert.match(css, /\.material-inspector\s*\{[\s\S]*?transform:\s*translateX\(100%\)/);
  assert.match(css, /\.material-inspector\.is-open\s*\{[\s\S]*?transform:\s*translateX\(0\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.material-inspector\s*\{[\s\S]*?translateY\(100%\)/);
});
```

并将 token 列表固定为：

```js
for (const token of [
  "figma-canvas",
  "figma-ink",
  "figma-surface",
  "figma-hairline",
  "figma-block-blue",
  "figma-block-mint",
  "figma-block-coral",
  "figma-block-lilac",
]) {
  assert.match(css, new RegExp(`--${token}\\s*:`), `missing --${token}`);
}
```

- [ ] **Step 3: 运行契约并确认 RED**

Run:

```powershell
node --test tests/figma-material-lab-ui.test.cjs
```

Expected: 因 `inspectorOpen`、开合选择器或新的 `--figma-*` token 缺失而 FAIL；已有材料家族 key 与像素渲染断言继续通过。

- [ ] **Step 4: 提交失败契约**

```powershell
git add -- tests/figma-material-lab-ui.test.cjs
git commit -m "test: define canvas-first material lab contract"
```

---

### Task 2: 实现按需 Inspector 交互

**Files:**
- Modify: `js/components/ui.js`
- Test: `tests/figma-material-lab-ui.test.cjs`

**Interfaces:**
- Consumes: `getMaterialDetails(name)`、`materialColorFor(name)`、现有 `inspectorTab` 状态。
- Produces: `Index.state.inspectorOpen: boolean`；`MaterialInspector({ name, tab, setTab, open, onClose })`；DOM id `material-inspector`；触发器 `.inspector-trigger`。

- [ ] **Step 1: 给展示组件增加显式开合接口**

把现有函数签名：

```jsx
const MaterialInspector = ({ name, tab, setTab }) => {
```

替换为：

```jsx
const MaterialInspector = ({ name, tab, setTab, open, onClose }) => {
```

把现有 `<aside className="material-inspector" aria-label="材料说明">` 替换为：

```jsx
<aside
  id="material-inspector"
  className={open ? "material-inspector is-open" : "material-inspector"}
  aria-label="材料说明"
  aria-hidden={!open}
>
```

紧接在该 `<aside>` 开始标签后、`.inspector-heading` 之前插入：

```jsx
<button
  type="button"
  className="inspector-close"
  onClick={onClose}
  aria-label="收起材料说明"
>
  ×
</button>
```

其余现有 heading、tabs、content、反应列表和 `aria-selected` 保持原样。

- [ ] **Step 2: 在 `Index` 中添加默认关闭状态与 Escape 处理**

在构造函数状态中加入：

```js
inspectorOpen: false,
```

并在构造函数中定义稳定处理器：

```js
this.handleInspectorKeyDown = (event) => {
  if (event.key === "Escape" && this.state.inspectorOpen) {
    this.setState({ inspectorOpen: false });
  }
};
```

在 `componentDidUpdate` 之前加入生命周期方法：

```js
componentDidMount() {
  window.addEventListener("keydown", this.handleInspectorKeyDown);
}

componentWillUnmount() {
  window.removeEventListener("keydown", this.handleInspectorKeyDown);
}
```

- [ ] **Step 3: 增加明确触发器并传递状态**

在画布 UI 中加入与 Inspector 同级的触发器：

```jsx
<button
  type="button"
  className="inspector-trigger"
  aria-expanded={inspectorOpen}
  aria-controls="material-inspector"
  onClick={() => this.setState({ inspectorOpen: !inspectorOpen })}
>
  <span aria-hidden="true">i</span>
  <span>{selectedName}</span>
</button>

<MaterialInspector
  name={selectedName}
  tab={inspectorTab}
  setTab={(tab) => this.setState({ inspectorTab: tab })}
  open={inspectorOpen}
  onClose={() => this.setState({ inspectorOpen: false })}
/>
```

同时把 `render()` 的解构更新为：

```js
let { size, paused, selectedElement, currentSubmission, inspectorTab, inspectorOpen } = this.state;
```

材料按钮点击仍只更新 `selectedElement` 与 `inspectorTab`，不得自动打开 Inspector。

- [ ] **Step 4: 运行静态契约**

Run:

```powershell
node --test tests/figma-material-lab-ui.test.cjs
```

Expected: Inspector 交互契约 PASS；CSS token 与布局契约仍因 Task 3 尚未完成而 FAIL。

- [ ] **Step 5: 提交交互改动**

```powershell
git add -- js/components/ui.js
git commit -m "feat: add collapsible material inspector"
```

---

### Task 3: 实现 Figma/FigJam 画布优先主题

**Files:**
- Modify: `js/styles.css`
- Verify only: `js/components/materials.js`
- Test: `tests/figma-material-lab-ui.test.cjs`

**Interfaces:**
- Consumes: `.topbar`、`.material-rail`、`.material-group[data-family]`、`.inspector-trigger`、`.material-inspector.is-open` 和现有 canvas ids。
- Produces: 稳定的 `--figma-*` token；桌面覆盖式 Inspector；移动端底部抽屉；不改变 Canvas DOM 或 WASM 接口。

- [ ] **Step 1: 用明确 token 收敛工作台色彩**

在材料实验台样式的 `:root` 中定义并让现有组件引用：

```css
:root {
  --topbar-height: 64px;
  --rail-width: 232px;
  --inspector-width: 312px;
  --figma-canvas: #f3f1ec;
  --figma-ink: #242522;
  --figma-surface: rgba(255, 254, 250, 0.94);
  --figma-hairline: rgba(36, 37, 34, 0.14);
  --figma-block-blue: #dcecff;
  --figma-block-mint: #dff3e6;
  --figma-block-coral: #f8ddd4;
  --figma-block-lilac: #e9e0f7;
  --figma-focus: #5b5bd6;
}
```

将工作区、surface、文字与边线映射到这些 token；不得改变 `.material-swatch` 的 `--material-background`。

- [ ] **Step 2: 让隐藏 Inspector 不再挤压画布**

实现桌面布局：

```css
#canvas-stage {
  top: var(--topbar-height);
  right: 0;
  bottom: 0;
  left: var(--rail-width);
  display: grid;
  place-items: center;
}

.material-inspector {
  position: absolute;
  top: var(--topbar-height);
  right: 0;
  bottom: 0;
  width: var(--inspector-width);
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 180ms ease, visibility 0s linear 180ms;
}

.material-inspector.is-open {
  transform: translateX(0);
  visibility: visible;
  transition-delay: 0s;
}
```

`.inspector-trigger` 固定在工作区右侧中部，使用小尺寸工具标签而不是大卡片；打开时不得阻挡 Inspector 的关闭按钮。

- [ ] **Step 3: 用 pastel 家族区分材料，而不覆盖原生 swatch**

加入：

```css
.material-group[data-family="base"] { --family-color: var(--figma-block-blue); }
.material-group[data-family="life"] { --family-color: var(--figma-block-mint); }
.material-group[data-family="energy"] { --family-color: var(--figma-block-coral); }
.material-group[data-family="special"] { --family-color: var(--figma-block-lilac); }

.material-group {
  padding: 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--family-color) 58%, transparent);
}
```

若目标浏览器兼容性不接受 `color-mix`，直接使用 `background: var(--family-color)`；不要为此增加 polyfill。

- [ ] **Step 4: 完成移动端托盘和底部抽屉**

在现有 `@media (max-width: 767px)` 中保留顶部单行操作和底部横向材料托盘，并把 Inspector 改为：

```css
@media (max-width: 767px) {
  #canvas-stage {
    right: 0;
    bottom: 232px;
    left: 0;
  }

  .material-rail {
    top: auto;
    right: 0;
    bottom: 0;
    width: auto;
    height: 232px;
  }

  .material-inspector {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    max-height: min(68dvh, 520px);
    transform: translateY(100%);
  }

  .material-inspector.is-open {
    transform: translateY(0);
  }
}
```

触摸按钮高度至少约 40px；Inspector 关闭时不得留下 180px 空白区域。

- [ ] **Step 5: 补齐焦点、按下和减少动态效果状态**

所有新增按钮使用：

```css
.inspector-trigger:focus-visible,
.inspector-close:focus-visible,
.material-option:focus-visible,
.topbar-button:focus-visible {
  outline: 2px solid var(--figma-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .material-inspector,
  .inspector-trigger,
  .inspector-close {
    transition: none;
  }
}
```

- [ ] **Step 6: 运行契约并确认 GREEN**

Run:

```powershell
npm test
```

Expected: `tests/figma-material-lab-ui.test.cjs` 全部 PASS。

- [ ] **Step 7: 提交主题改动**

```powershell
git add -- js/styles.css
git commit -m "feat: prioritize the Sandspiel canvas"
```

---

### Task 4: 生产构建与渲染验收

**Files:**
- Modify only if a verified defect requires it: `js/styles.css`
- Modify only if a verified defect requires it: `js/components/ui.js`
- Test: `tests/figma-material-lab-ui.test.cjs`

**Interfaces:**
- Consumes: Tasks 1-3 完成的 UI、CSS 与静态契约。
- Produces: 可构建、可操作、桌面与 390x844 移动端均通过的最终界面。

- [ ] **Step 1: 执行完整自动验证**

Run:

```powershell
npm test
npm run build
```

Expected: tests 全部 PASS；Webpack production build 退出码为 0，无模块解析错误。

- [ ] **Step 2: 启动本地开发服务器**

Run:

```powershell
npm run start
```

Expected: webpack-dev-server 提供本地 URL，页面加载时没有编译错误覆盖层。

- [ ] **Step 3: 验收桌面流程**

在约 1440x900 视口依次验证：

1. Inspector 默认收起，画布在左栏之外的完整工作区居中。
2. 选择沙、水、火和植物时，材料 swatch 和画布像素颜色保持原样。
3. 使用五档笔刷中的至少三档绘制，画布能接收指针输入。
4. 暂停、继续、撤销和重置均可操作。
5. 展开 Inspector、切换“简介/反应”、按 `Escape` 收起；当前材料和模拟状态不改变。
6. 四个材料家族分别呈淡蓝、薄荷绿、珊瑚色和薰衣草色，没有营销卡片或超大标题。

- [ ] **Step 4: 验收 390x844 移动端流程**

在 390x844 视口依次验证：

1. 顶部操作可访问，页面没有水平溢出。
2. 画布未被说明面板永久压缩或遮住。
3. 底部材料托盘可横向滚动并能选择材料。
4. 笔刷控制可触达，按钮触摸目标约 40px 或更大。
5. Inspector 作为底部抽屉展开与关闭，关闭后不保留空白占位。

- [ ] **Step 5: 仅修复验收中确认的问题并重新验证**

每次修复后运行：

```powershell
npm test
npm run build
```

Expected: 自动验证继续 PASS，并重新检查触发该修复的桌面或移动端场景。

- [ ] **Step 6: 检查范围与提交最终修正**

Run:

```powershell
git diff --check
git status --short
git diff -- js/styles.css js/components/ui.js js/components/materials.js tests/figma-material-lab-ui.test.cjs
```

确认 diff 不包含 `crate/`、`js/glsl/`、WASM 产物或存档协议改动。若 Task 4 产生修正：

```powershell
git add -- js/styles.css js/components/ui.js tests/figma-material-lab-ui.test.cjs
git commit -m "fix: refine material lab responsive states"
```

若没有修正，不创建空提交。
