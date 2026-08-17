# Material Lab 移动端画布优先适配设计

## 背景与根因

移动端当前存在两个相互独立的遮挡问题：

1. 旧移动端 CSS 规则将 `.material-rail` 保持为 `min-height: 320px`，而新的画布布局只为底部托盘预留 232px。390×720 视口中，实测托盘顶部位于画布区域底部之前 88px，导致画布下沿被托盘覆盖。
2. `fluid.js` 创建的 dat.GUI 即使调用 `gui.close()`，仍会保留一个 `Open Controls` 折叠开关。它是调试控件，不属于 Material Lab 的 Figma 工作台，在移动端首屏覆盖顶部工具栏。

现有 React/WASM 模拟、画布 DOM、材料顺序与交互状态不需要改变。问题属于 CSS 层级、尺寸契约和调试控件呈现范围。

## 目标

- 画布区域与底部材料托盘在所有目标移动视口中严格相邻，不发生几何重叠。
- 画布使用顶部工具栏与底部托盘之间的最大可用空间，继续由 `layout.js` 居中并保持像素渲染。
- 材料托盘保留 Figma/FigJam 的低饱和家族色和横向浏览方式。
- 笔刷控制在移动端拥有独立固定区域，不覆盖材料卡片。
- 移动端首屏不显示 dat.GUI 的 `Open Controls` 调试开关。
- Inspector 仍默认收起，打开后作为可关闭的底部抽屉，不改变材料选择或模拟状态。
- 桌面布局、Rust/WASM、shader、Species 编号、输入坐标与存档协议保持不变。

## 方案

### 1. 单一移动托盘高度变量

在移动端定义 `--mobile-rail-height`，使用 `clamp()` 适配短屏和长屏，并在安全区存在时加入底部 inset。`#canvas-stage` 的 `bottom` 与 `.material-rail` 的 `height` 使用同一个计算结果：

```css
--mobile-rail-height: clamp(232px, 30dvh, 288px);
```

移动端规则显式设置 `.material-rail` 与 `#canvas-stage` 的 `min-height: 0`，覆盖旧版 grid 布局残留的 320px 最小高度。这样尺寸由同一变量决定，`layout.js` 读取到的 stage 高度与实际托盘位置一致。

### 2. 托盘内部两列布局

移动端 `.material-rail` 使用两列 grid：

- 左列：`material-rail-scroll`，包含风工具和按家族横向滚动的材料组；
- 右列：`brush-control`，固定宽度约 122px，保留五档触摸目标。

笔刷控制不再使用绝对定位覆盖左列内容。材料滚动区继续使用内部横向滚动，页面本身保持无水平溢出。现有 `.material-option`、`.brush-size` 的选中状态、`aria-pressed` 和材料原生 swatch 不变。

### 3. 调试控件范围

只在 `max-width: 767px` 下隐藏 dat.GUI 容器，避免改变桌面端调试入口；不修改 fluid simulation 的配置、初始化或更新逻辑。移动端顶部只保留 Material Lab 自身的暂停、重置与撤销操作。

### 4. Figma 设计对齐

沿用现有 `--figma-*` token、暖灰白画布、hairline、Pastel 家族块、`NeueBit` / `Mondwest` 字体和 40px 级触摸目标。此处只修复移动端空间分配，不引入营销页式大标题、远程字体、组件库或新运行时依赖。

## 组件与数据流

- `js/styles.css`：实现移动端高度契约、托盘 grid、调试条隐藏与安全区间距。
- `js/layout.js`：保持现有 stage 尺寸测量和画布居中逻辑；仅验证它能消费新的 stage 几何结果，不改变画布尺寸协议。
- `js/components/ui.js`：不改变材料、Inspector 或模拟状态接口。
- `tests/figma-material-lab-ui.test.cjs`：增加静态契约，防止旧 `min-height` 残留、缺少共享高度变量、笔刷回到覆盖定位或移动端调试条重新出现。

## 验证设计

自动验证：

- `node --test tests/figma-material-lab-ui.test.cjs`
- `npm test`
- `npm run build`
- `git diff --check`

浏览器验证：

1. 390×720：画布底部不低于托盘顶部，页面无水平溢出。
2. 390×844：画布、顶部操作和材料托盘同时可见，托盘内部可横向滚动。
3. 两个视口中 `Open Controls` 不可见，暂停/重置/撤销、材料选择、笔刷大小和 Inspector 触发器仍可操作。
4. 打开 Inspector 后确认底部抽屉覆盖显示、关闭后恢复画布空间，当前材料保持不变。
5. 桌面视口确认左侧材料栏、画布与右侧 Inspector 行为未被移动端规则改变。

## 验收标准

- 390×720 与 390×844 的 `#canvas-stage` 和 `.material-rail` 不重叠。
- `.material-rail-scroll` 的横向滚动不会造成 `document.body.scrollWidth > innerWidth`。
- `.brush-control` 不覆盖材料选项的可视区域。
- 移动端 dat.GUI 不显示 `Open Controls`。
- 所有核心操作和现有静态测试保持通过。
- 最终 diff 只涉及 UI 样式、UI 契约测试及本设计/实施文档，不包含 Rust、shader、WASM 产物或存档协议。

