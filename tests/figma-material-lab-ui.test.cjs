const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Figma/FigJam theme exposes the material-lab token set", () => {
  const css = read("js/styles.css");

  for (const token of [
    "figma-primary",
    "figma-on-primary",
    "figma-canvas",
    "figma-ink",
    "figma-surface-soft",
    "figma-hairline",
    "figma-hairline-soft",
    "figma-block-lime",
    "figma-block-lilac",
    "figma-block-cream",
    "figma-block-pink",
    "figma-block-mint",
    "figma-block-coral",
    "figma-block-navy",
  ]) {
    assert.match(css, new RegExp(`--${token}\\s*:`), `missing --${token}`);
  }

  for (const declaration of [
    "--figma-primary: #000000",
    "--figma-on-primary: #ffffff",
    "--figma-canvas: #ffffff",
    "--figma-surface-soft: #f7f7f5",
    "--figma-hairline: #e6e6e6",
    "--figma-block-lime: #dceeb1",
    "--figma-block-lilac: #c5b0f4",
    "--figma-block-cream: #f4ecd6",
    "--figma-block-pink: #efd4d4",
    "--figma-block-mint: #c8e6cd",
    "--figma-block-coral: #f3c9b6",
  ]) {
    assert.match(css, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const family of ["base", "life", "energy", "special"]) {
    assert.match(
      css,
      new RegExp(`\\.material-group\\[data-family=["']${family}["']\\]`),
      `missing ${family} family styling`
    );
  }
});

test("material metadata and DOM expose stable family hooks", () => {
  const materials = read("js/components/materials.js");
  const ui = read("js/components/ui.js");

  for (const key of ["base", "life", "energy", "special"]) {
    assert.match(materials, new RegExp(`key:\\s*["']${key}["']`));
  }
  assert.match(ui, /data-family=\{group\.key\}/);
});

test("Figma shell keeps the pixel playfield contract intact", () => {
  const css = read("js/styles.css");

  assert.match(css, /image-rendering:\s*pixelated/);
  assert.match(css, /#sand-canvas\s*\{[\s\S]*?z-index:\s*2/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?display:\s*grid/);
  assert.match(css, /#canvas-stage\s*\{[\s\S]*?place-items:\s*center/);
});

test("Inspector is opt-in and keyboard dismissible", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /inspectorOpen:\s*false/);
  assert.match(ui, /aria-expanded=\{inspectorOpen\}/);
  assert.match(ui, /aria-controls=["']material-inspector["']/);
  assert.match(ui, /event\.key\s*===\s*["']Escape["']/);
  assert.match(ui, /onClose=\{this\.closeMobileSheets\}/);
  assert.match(ui, /closeMobileSheets\(\)[\s\S]*inspectorOpen: false/);
});

test("closed Inspector does not reserve desktop canvas width", () => {
  const css = read("js/styles.css");

  assert.match(css, /#canvas-stage\s*\{[\s\S]*?right:\s*0\s*;/);
  assert.match(css, /\.material-inspector\s*\{[\s\S]*?transform:\s*translateX\(100%\)/);
  assert.match(css, /\.material-inspector\.is-open\s*\{[\s\S]*?transform:\s*translateX\(0\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.material-inspector\s*\{[\s\S]*?translateY\(100%\)/);
});

test("Figma UI uses the documented type, shape, and elevation language", () => {
  const css = read("js/styles.css");
  const themeCss = css.slice(
    css.lastIndexOf("/* Figma brand and responsive workspace overrides. */")
  );

  assert.match(css, /@font-face\s*\{[\s\S]*?font-family:\s*["']Inter Variable["']/);
  assert.match(css, /@font-face\s*\{[\s\S]*?font-family:\s*["']JetBrains Mono["']/);
  assert.match(css, /\.topbar-button[^}]*border-radius:\s*50px/);
  assert.match(css, /\.topbar-button\.icon-only[^}]*border-radius:\s*9999px/);
  assert.match(
    themeCss,
    /\.material-option\.selected\s*\{[^}]*?background:\s*var\(--material-background,\s*var\(--material-color\)\)/
  );
  assert.match(
    themeCss,
    /\.material-option\.selected\s*\{[^}]*?color:\s*var\(--material-foreground,\s*var\(--figma-on-primary\)\)/
  );
  assert.match(css, /#background::before\s*\{[\s\S]*?background-image:/);
  assert.doesNotMatch(css, /#background\s*\{[^}]*radial-gradient/);
  assert.doesNotMatch(css, /#sand-canvas[^}]*box-shadow:\s*0 18px 34px/);
});

test("brand mark keeps M and grows a Plant-colored flower motif", () => {
  const ui = read("js/components/ui.js");

  assert.match(ui, /const BrandMark = \(\{ plantColor \}\) =>/);
  assert.match(ui, /viewBox=["']0 0 40 40["']/);
  assert.match(ui, /className=["']brand-mark-letter-shadow["'][\s\S]*?d=["']M10 29 C/);
  assert.match(ui, /className=["']brand-mark-letter["'][\s\S]*?d=["']M10 29 C/);
  assert.doesNotMatch(ui, /<text[\s\S]*className=["']brand-mark-letter["']/);
  assert.match(ui, /className=["']brand-mark-stem["']/);
  assert.match(ui, /className=["']brand-mark-leaf["']/);
  assert.match(ui, /className=["']brand-mark-flower-petal["']/);
  assert.match(ui, /className=["']brand-mark-flower-center["']/);
  assert.match(ui, /const brandPlantColor = materialColorFor\(["']Plant["']\)/);
  assert.match(ui, /<BrandMark plantColor=\{brandPlantColor\} \/>/);
  assert.doesNotMatch(ui, /className=["']brand-mark-letter["'][\s\S]*?>S<\/text>/);
});

test("brand mark keeps floral accents sparse, organic, and asymmetric", () => {
  const ui = read("js/components/ui.js");
  const flowerGroups = ui.match(
    /<g className=["']brand-mark-flower["'] transform=/g
  );
  const leafDetails = ui.match(/className=["']brand-mark-leaf["']/g);

  assert.match(ui, /className=["']brand-mark-botanical-motif["']/);
  assert.match(ui, /className=["']brand-mark-botanical-stem["']/);
  assert.match(ui, /className=["']brand-mark-bud["']/);
  assert.match(ui, /className=["']brand-mark-flower-petal-lilac["']/);
  assert.ok(flowerGroups && flowerGroups.length >= 3 && flowerGroups.length <= 5);
  assert.ok(leafDetails && leafDetails.length >= 3 && leafDetails.length <= 6);
  assert.match(ui, /transform=["']translate\(10\.5 27\.5\) rotate\(-18\)["']/);
  assert.match(ui, /transform=["']translate\(20 28\.5\) rotate\(12\)["']/);
  assert.match(ui, /transform=["']translate\(28\.8 26\.5\) rotate\(26\)["']/);
});

test("brand mark uses a pale rounded tile without motion or black-circle styling", () => {
  const css = read("js/styles.css");
  const themeCss = css.slice(
    css.lastIndexOf("/* Figma brand and responsive workspace overrides. */")
  );

  for (const token of [
    "brand-mark-surface",
    "brand-mark-letter",
    "brand-mark-letter-shadow",
    "brand-mark-flower",
    "brand-mark-flower-center",
  ]) {
    assert.match(themeCss, new RegExp(`--${token}\\s*:`));
  }

  assert.match(
    themeCss,
    /\.brand-mark\s*\{[\s\S]*?width:\s*40px[\s\S]*?height:\s*40px[\s\S]*?border-radius:\s*10px[\s\S]*?background:\s*var\(--brand-mark-surface\)/
  );
  assert.match(themeCss, /\.brand-mark-stem\s*\{[\s\S]*?stroke:\s*var\(--brand-mark-plant\)/);
  assert.match(themeCss, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.brand-mark\s*\{[\s\S]*?width:\s*36px[\s\S]*?height:\s*36px/);
  assert.doesNotMatch(themeCss, /\.brand-mark\s*\{[^}]*border-radius:\s*9999px/);
  assert.doesNotMatch(themeCss, /@keyframes\s+brand-mark|\.brand-mark[^}]*animation:/);
});

test("WebGL canvas uses transparent compositing and explicit light fallback surfaces", () => {
  const fluid = read("js/fluid.js");
  const css = read("js/styles.css");
  const themeCss = css.slice(
    css.lastIndexOf("/* Figma brand and responsive workspace overrides. */")
  );

  assert.match(fluid, /alpha:\s*true/);
  assert.match(
    fluid,
    /gl\.clearColor\(0(?:\.0)?,\s*0(?:\.0)?,\s*0(?:\.0)?,\s*0(?:\.0)?\)/
  );
  assert.match(
    themeCss,
    /#canvas-stage,\s*#fluid-canvas\s*\{[\s\S]*?background:\s*var\(--figma-surface-soft\)/
  );
  assert.match(
    themeCss,
    /\.Info,\s*\.benchmark\s*\{[\s\S]*?background:\s*var\(--figma-surface-soft\)/
  );
});

test("Wind uses the light-green token in every selected-material surface", () => {
  const ui = read("js/components/ui.js");
  const css = read("js/styles.css");
  const themeCss = css.slice(
    css.lastIndexOf("/* Figma brand and responsive workspace overrides. */")
  );

  assert.match(
    ui,
    /if\s*\(name === ["']Wind["']\)\s*return\s*["']var\(--figma-block-lime\)["']/
  );
  assert.match(
    themeCss,
    /\.wind-option\s*\{[^}]*?background:\s*var\(--figma-block-lime\)[^}]*?color:\s*var\(--figma-ink\)/
  );
  assert.match(
    themeCss,
    /\.wind-option:hover,\s*\.wind-option:focus-visible\s*\{[^}]*?background:\s*var\(--figma-block-lime\)[^}]*?color:\s*var\(--figma-ink\)/
  );
  assert.match(
    themeCss,
    /\.wind-option\.selected\s*\{[^}]*?background:\s*var\(--figma-block-lime\)[^}]*?color:\s*var\(--figma-ink\)/
  );
  assert.match(
    themeCss,
    /\.wind-glyph,\s*\.wind-option\.selected \.wind-glyph\s*\{[^}]*?color:\s*var\(--figma-ink\)/
  );
});

test("Selected material cards reuse the material icon background and choose readable foregrounds", () => {
  const ui = read("js/components/ui.js");
  const css = read("js/styles.css");
  const themeCss = css.slice(
    css.lastIndexOf("/* Figma brand and responsive workspace overrides. */")
  );

  assert.match(ui, /const\s+materialForegroundFor\s*=\s*\(color,\s*background\)\s*=>\s*\{/);
  assert.match(ui, /const\s+materialForegroundFor[\s\S]*?255\s*\*\s*\(1\s*-\s*alpha\)/);
  assert.match(ui, /const\s+materialForegroundFor[\s\S]*?blackContrast[\s\S]*?whiteContrast/);
  assert.match(ui, /const\s+materialForegroundFor[\s\S]*?var\(--figma-ink\)[\s\S]*?var\(--figma-on-primary\)/);
  assert.match(
    ui,
    /["']--material-background["']:\s*background === ["']transparent["']\s*\?\s*color\s*:\s*background/
  );
  assert.match(
    ui,
    /["']--material-foreground["']:\s*materialForegroundFor\(color,\s*background\)/
  );
  assert.match(
    themeCss,
    /\.material-option\.selected\s*\{[^}]*?background:\s*var\(--material-background,\s*var\(--material-color\)\)/
  );
  assert.match(
    themeCss,
    /\.material-swatch\s*\{[^}]*?background:\s*var\(--material-background,\s*var\(--material-color\)/
  );
  assert.match(
    themeCss,
    /\.material-option\.selected\s*\{[^}]*?color:\s*var\(--material-foreground,\s*var\(--figma-on-primary\)\)/
  );
});

test("Light material gradients choose the dark selected foreground", () => {
  const ui = read("js/components/ui.js");

  assert.match(
    ui,
    /background\.startsWith\(["']linear-gradient\(["']\)\s*\)\s*return\s*["']var\(--figma-ink\)["']/
  );
  assert.match(
    ui,
    /if\s*\(elementID === 14\)[\s\S]*?background\s*=\s*["']linear-gradient\(/
  );
  assert.match(
    ui,
    /["']--material-foreground["']:\s*materialForegroundFor\(color,\s*background\)/
  );
});

test("Selected material codes use the lowercase currentcolor keyword", () => {
  const css = read("js/styles.css");

  assert.match(
    css,
    /\.material-option\.selected \.material-option-code\s*\{[^}]*?color:\s*currentcolor;/
  );
});

test("Figma canvas chrome keeps centered framing and a single grid layer", () => {
  const css = read("js/styles.css");

  assert.match(
    css,
    /#canvas-stage::before\s*\{[^}]*inset:\s*auto;[^}]*top:\s*50%;[^}]*left:\s*50%;/
  );
  assert.doesNotMatch(
    css,
    /#background\s*\{\s*position:\s*fixed;[^}]*linear-gradient/
  );
  assert.equal(
    (css.match(/--figma-canvas:\s*#ffffff/g) || []).length,
    1,
    "--figma-canvas should have one canonical white definition"
  );
});

test("mobile canvas reserves only the compact dock", () => {
  const css = read("js/styles.css");
  const mobileCss = css.slice(css.lastIndexOf("@media (max-width: 767px)"));

  assert.match(
    mobileCss,
    /--mobile-safe-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)/
  );
  assert.match(
    mobileCss,
    /--mobile-dock-height:\s*64px/
  );
  assert.match(
    mobileCss,
    /#canvas-stage\s*\{[\s\S]*?bottom:\s*calc\(var\(--mobile-dock-height\)\s*\+\s*var\(--mobile-safe-bottom\)\)[\s\S]*?min-height:\s*0/
  );
  assert.match(
    mobileCss,
    /\.mobile-dock\s*\{[\s\S]*?height:\s*calc\(var\(--mobile-dock-height\)\s*\+\s*var\(--mobile-safe-bottom\)\)/
  );
  assert.match(
    mobileCss,
    /\.material-rail(?:,\s*\.material-inspector)?\s*\{[\s\S]*?transform:\s*translateY\(100%\)/
  );
  assert.match(
    mobileCss,
    /\.material-rail\[data-mobile-open="true"\](?:,\s*\.material-inspector\[data-open="true"\])?\s*\{[\s\S]*?transform:\s*translateY\(0\)/
  );
  assert.match(mobileCss, /\.material-rail\s*\{[\s\S]*?display:\s*grid/);
  assert.match(
    mobileCss,
    /\.material-rail,\s*\.material-inspector\s*\{[\s\S]*?bottom:\s*calc\(var\(--mobile-dock-height\)\s*\+\s*var\(--mobile-safe-bottom\)\)/
  );
  assert.match(
    mobileCss,
    /\.material-rail,\s*\.material-inspector\s*\{[\s\S]*?max-height:\s*calc\(\s*100dvh\s*-\s*var\(--topbar-height\)\s*-\s*var\(--mobile-safe-top\)\s*-\s*var\(--mobile-dock-height\)\s*-\s*var\(--mobile-safe-bottom\)\s*\)/
  );
  assert.match(
    mobileCss,
    /\.mobile-dock-icon,\s*\.mobile-dock-swatch\s*\{[\s\S]*?background:\s*var\(--figma-primary\)/
  );
  assert.match(mobileCss, /\.mobile-dock-swatch\s*\{[\s\S]*?border:\s*2px solid currentcolor/);
  assert.match(mobileCss, /\.material-rail-scroll\s*\{[\s\S]*?display:\s*block/);
  assert.match(
    mobileCss,
    /\.brush-control\s*\{[\s\S]*?grid-column:\s*1[\s\S]*?grid-row:\s*3/
  );
  assert.match(
    mobileCss,
    /#fps\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(mobileCss, /\.dg(?:\.ac)?\s*\{[\s\S]*?display:\s*none\s*!important/);
});

test("home workspace polish reinforces hierarchy and responsive surfaces", () => {
  const css = read("js/styles.css");
  const polishCss = css.slice(css.lastIndexOf("/* Home page polish pass. */"));
  const polishStart = css.lastIndexOf("/* Home page polish pass. */");
  const mobilePolishCss = css.slice(
    css.lastIndexOf("@media (max-width: 767px)", polishStart)
  );

  assert.match(polishCss, /--header-control-gap:\s*clamp\(12px,/);
  assert.match(polishCss, /--canvas-shadow:\s*0 8px 24px/);
  assert.match(polishCss, /--sheet-shadow:\s*0 -12px 32px/);
  assert.match(polishCss, /\.topbar\s*\{[\s\S]*?display:\s*grid/);
  assert.match(
    polishCss,
    /\.topbar-actions\s*\{[\s\S]*?border:\s*1px solid var\(--figma-hairline\)/
  );
  assert.match(
    polishCss,
    /#canvas-stage::before\s*\{[\s\S]*?background:\s*var\(--figma-canvas\)/
  );
  assert.match(
    polishCss,
    /\.material-option:hover:not\(.selected\),[\s\S]*?background:\s*var\(--figma-surface-soft\)/
  );
  assert.match(
    polishCss,
    /\.material-option\.selected\s*\{[\s\S]*?box-shadow:\s*inset 0 0 0 2px var\(--figma-primary\)/
  );
  assert.match(
    mobilePolishCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.topbar\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/
  );
  assert.match(
    mobilePolishCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.material-rail,[\s\S]*?box-shadow:\s*var\(--sheet-shadow\)/
  );
});
