const readStageGutter = (stage) => {
  const raw = getComputedStyle(stage).paddingLeft;
  const gutter = Number.parseFloat(raw);
  return Number.isFinite(gutter) ? gutter : 20;
};

const readCanvasMaxSize = (stage) => {
  const raw = getComputedStyle(stage).getPropertyValue("--canvas-max-size");
  const maxSize = Number.parseFloat(raw);
  return Number.isFinite(maxSize) && maxSize > 0
    ? maxSize
    : Number.POSITIVE_INFINITY;
};

const resize = () => {
  const canvas = document.getElementById("sand-canvas");
  const canvas2 = document.getElementById("fluid-canvas");
  const stage = document.getElementById("canvas-stage");

  if (!canvas || !canvas2 || !stage) return;

  const stageWidth = stage.clientWidth || window.innerWidth;
  const stageHeight = stage.clientHeight || window.innerHeight;
  const gutter = readStageGutter(stage);
  const maxSize = readCanvasMaxSize(stage);
  const isMobile =
    window.innerWidth < 768 ||
    (typeof window.matchMedia !== "function" && stageWidth < 768);
  const availableWidth = stageWidth - gutter * 2;
  const availableHeight = stageHeight - gutter * 2;
  const size = Math.max(
    120,
    Math.floor(Math.min(availableWidth, availableHeight, maxSize))
  );
  stage.style.setProperty("--canvas-display-size", `${size}px`);

  [canvas, canvas2].forEach((target) => {
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.left = "50%";
    target.style.top = "50%";
    if (isMobile) {
      target.style.top = "calc(50% - var(--mobile-canvas-lift, 0px))";
    }
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
let resizeFrame = null;

const scheduleResize = () => {
  if (resizeFrame !== null) return;

  const requestFrame =
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 0);

  resizeFrame = requestFrame(() => {
    resizeFrame = null;
    resize();
  });
};

const setup = () => {
  resize();

  const stage = document.getElementById("canvas-stage");
  if (stage && typeof ResizeObserver !== "undefined") {
    stageObserver = new ResizeObserver(scheduleResize);
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
