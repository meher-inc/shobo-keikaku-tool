const fs = require("fs");
const path = require("path");
const { build } = require("../lib/generate_kyoto_full");
const sampleData = require("../lib/sample_data_kyoto");

(async () => {
  try {
    const buf = await build(sampleData);
    const out = path.join(__dirname, "../public/samples/sample-kyoto-standard.docx");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    console.log("OK:", out);
  } catch (e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
})();
