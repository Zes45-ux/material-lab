const readStageGutter = (stage) => {
  const raw = getComputedStyle(stage).getPropertyValue("--stage-gutter");
  const gutter = Number.parseFloat(raw);
  return Number.isFinite(gutter) ? gutter : 20;
};

const resize = () => {
  const canvas = document.getElementById("sand-canvas");
  const canvas2 = document.getElementById("fluid-canvas");
  const stage = document.getElementById("canvas-stage");

  if (!canvas || !canvas2 || !stage) return;

  const stageWidth = stage.clientWidth || window.innerWidth;
  const stageHeight = stage.clientHeight || window.innerHeight;
  const gutter = readStageGutter(stage);
  const isMobile = window.innerWidth < 768;
  const size = Math.max(
    120,
    Math.floor(
      Math.min(stageWidth - gutter * 2, stageHeight - gutter * 2)
    )
  );

  stage.style.setProperty("--canvas-display-size", `${size}px`);

  [canvas, canvas2].forEach((target) => {
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.left = "50%";
    target.style.top = "50%";
    target.style.right = "auto";
    target.style.bottom = "auto";
    target.style.margin = "0";
    target.style.transform = "translate(-50%, -50%)";
  });

  const fps = document.getElementById("fps");
  if (fps) {
    fps.style.right = isMobile ? "8px" : "calc(var(--inspector-width) + 14px)";
    fps.style.bottom = isMobile ? "8px" : "14px";
  }
};

let stageObserver;

const setup = () => {
  resize();

  const stage = document.getElementById("canvas-stage");
  if (stage && typeof ResizeObserver !== "undefined") {
    stageObserver = new ResizeObserver(() => resize());
    stageObserver.observe(stage);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}

window.addEventListener("deviceorientation", resize, true);
window.addEventListener("resize", resize);

export { resize };
