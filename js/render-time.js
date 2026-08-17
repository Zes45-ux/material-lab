function elapsedRenderMs(now, lastRenderTime) {
  return Math.max(now - lastRenderTime, 0);
}

module.exports = { elapsedRenderMs };
