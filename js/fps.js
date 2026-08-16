const fps = new (class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = (1 / delta) * 1000;

    // Save only the latest 30 frame timings.
    this.frames.push(fps);
    if (this.frames.length > 30) {
      this.frames.shift();
    }

    // Find the mean of our 30 latest timings.
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
    }
    let mean = sum / this.frames.length;
    // Render the statistics.
    this.fps.textContent = `帧率：${Math.round(mean)}`;
  }
})();

export { fps };
