const fs = require("node:fs");
const path = require("node:path");

const generatedIgnore = path.resolve(__dirname, "..", "crate", "pkg", ".gitignore");

try {
  fs.rmSync(generatedIgnore, { force: true });
} catch (error) {
  console.error(`Unable to remove ${generatedIgnore}: ${error.message}`);
  process.exitCode = 1;
}
