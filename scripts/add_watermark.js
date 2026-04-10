const fs = require("fs");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");

(async () => {
  const src = "public/samples/sample-kyoto-standard.pdf";
  const bytes = fs.readFileSync(src);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    // 斜めウォーターマーク
    page.drawText("SAMPLE - plan.todokede.jp", {
      x: width / 2 - 200,
      y: height / 2,
      size: 42,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: degrees(-45),
    });
    // 上部赤帯の注意書き
    page.drawRectangle({
      x: 0, y: height - 28, width, height: 28,
      color: rgb(0.91, 0.2, 0.16),
    });
    page.drawText("This is a SAMPLE. Not for actual submission.", {
      x: 20, y: height - 20, size: 11, font, color: rgb(1, 1, 1),
    });
  }

  fs.writeFileSync("public/samples/sample-kyoto-standard.pdf", await pdf.save());
  console.log("OK: watermarked");
})();