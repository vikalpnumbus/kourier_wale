import { chromium } from "playwright";
import Handlebars from "handlebars";
import fs from "fs";
import crypto from "crypto";
import handlebarsHelpers, { registerHandlebarsHelpers } from "./handlebars.helpers.mjs";

export class PdfGenerator {
  constructor({ fileName, fileDir, templateHtml, data, paperSize, width = null, height = null }) {
    this.templateHtml = templateHtml;
    this.data = data ? (typeof data == "object" && Array.isArray(data) ? data : [data]) : [];
    this.fileName = fileName || crypto.randomBytes(16).toString("hex");
    this.fileDir = fileDir || "";
    this.paperSize = paperSize || "A4";
    this.width = width;
    this.height = height;
    Handlebars.registerHelper("ifEqual", function (a, b, options) {
      if (a === b) {
        return options.fn(this); // render block if true
      }
      return options.inverse(this); // render {{else}} block
    });
    Object.keys(handlebarsHelpers).forEach((name) => {
      Handlebars.registerHelper(name, handlebarsHelpers[name]);
    });
    registerHandlebarsHelpers();
  }

  async generate({ returnBuffer = false }) {
    // Compile the template

    const template = Handlebars.compile(this.templateHtml);

    // Generate final HTML
    const html = this.data.map((e) => template(e)).join(`<div style="page-break-after: always;"></div>`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    const pdfOptions = {
      printBackground: true,
      margin: {
        top: "0.2in",
        right: "0.2in",
        bottom: "0.2in",
        left: "0.2in",
      },
      format: this.paperSize,
    };

    if (this.width && this.height) {
      delete pdfOptions.format;
      pdfOptions.width = this.width;
      pdfOptions.height = this.height;
      pdfOptions.scale = 0.6;
    }

    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();

    if (returnBuffer) return { fileName: this.fileName, pdfBuffer };

    const filePath = `uploads/pdfGenerator/${this.fileDir ? this.fileDir + "/" : ""}${this.fileName}.pdf`;
    if (!fs.existsSync(`uploads/pdfGenerator/${this.fileDir}`)) {
      fs.mkdirSync(`uploads/pdfGenerator/${this.fileDir}`, {
        recursive: true,
      });
    }
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName: this.fileName, filePath };
  }
}
