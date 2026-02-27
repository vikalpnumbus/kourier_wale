import PDFDocument from "pdfkit";

export function convertPngToPdf(pngBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [288, 432] }); // 4x6 inches
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.image(pngBuffer, 0, 0, {
        width: 288,
        height: 432,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}