import FactoryRepository from "../repositories/factory.repository.mjs";
import CustomMath, {
  capitialiseFirstLetter,
  formatDate_DD_MM_YYYY_HH_MM,
  formatDate_YYYY_MM_DD,
} from "../utils/basic.utils.mjs";
import { PdfGenerator } from "../utils/pdfGenerator.utils.mjs";
import CourierService from "./courier.service.mjs";
import ShippingService from "./shipping.service.mjs";
import UserService from "./user.service.mjs";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import WarehouseService from "./warehouse.service.mjs";
class Service {
  constructor() {
    this.error = null;
    this.userRepository = FactoryRepository.getRepository("user");
    this.warehouseRepository = FactoryRepository.getRepository("warehouse");
  }
  async create({ data }) {
      const { userId, ...newSettings } = data;
      const user = await UserService.read({ id: userId });
      if (!user) throw UserService.error;
      const labelSettings = {
        ...(user.label_settings || {}),
        ...newSettings,
      };
      await UserService.update(
        { id: userId },
        { label_settings: labelSettings }
      );
      return {
        status: 200,
        data: {
          message: "Label settings updated successfully",
          label_settings: labelSettings,
        },
      };
  }



  async generate({ data }) {
  try {
    const { userId, shipping_db_ids } = data;

    const [user, shippingRes] = await Promise.all([
      UserService.read({ id: userId }),
      ShippingService.read({ userId, id: shipping_db_ids }),
    ]);

    if (!user) throw UserService.error;

    const allShipments = shippingRes?.data?.result || [];

    // ✅ Split shipments
    const amazonShipments = allShipments.filter(
      (e) => Number(e.courier_id) === 7
    );

    const normalShipments = allShipments.filter(
      (e) => Number(e.courier_id) !== 7
    );

    let labelSettings = user.label_settings;
    if (!labelSettings) throw new Error("Label Settings Not Found.");

    // ================= NORMAL LABELS =================
    const shipping = await Promise.all(
      normalShipments.map(async (e) => {
        const [courierRes, warehouseRes] = await Promise.all([
          CourierService.read({ id: e.courier_id }),
          WarehouseService.read({
            id: [...new Set([e.warehouse_id, e.rto_warehouse_id])],
          }),
        ]);

        const courier = courierRes?.data?.result?.[0];

        const pickupWarehouse = warehouseRes?.data?.result?.find(
          (w) => w.id == e.warehouse_id
        );

        const rtoWarehouse = warehouseRes?.data?.result?.find(
          (w) => w.id == e.rto_warehouse_id
        );

        if (!pickupWarehouse) throw new Error("No pickup warehouse found.");
        if (!rtoWarehouse) throw new Error("No rto warehouse found.");

        const payload = {
          invoice_generated_date: formatDate_DD_MM_YYYY_HH_MM(Date.now()),
          sellercompname: user.companyName || "",
          shippingDetails_fname: e.shippingDetails?.fname || "",
          shippingDetails_lname: e.shippingDetails?.lname || "",
          shippingDetails_address: e.shippingDetails?.address || "",
          shippingDetails_city: e.shippingDetails?.city || "",
          shippingDetails_state: e.shippingDetails?.state || "",
          shippingDetails_country: "India",
          shippingDetails_pincode: e.shippingDetails?.pincode || "",
          shippingDetails_phone: e.shippingDetails?.phone || "",
          order_date: e.updatedAt
            ? formatDate_YYYY_MM_DD(e.updatedAt)
            : "",
          invoice_no: e.orderId || "",
          awb_number: e.awb_number || "",
          courier_name: courier?.name || "",
          total_price: e.orderAmount || "",
        };

        return payload;
      })
    );

    let normalPdfBuffer = null;

    if (shipping.length) {
      const templateHtml = fs.readFileSync(
        "templates/label.template.html",
        "utf-8"
      );

      const pdf = new PdfGenerator({
        fileName: "normal-labels",
        templateHtml,
        data: shipping,
        paperSize: "A4",
      });

      const pdfGenRes = await pdf.generate({ returnBuffer: true });
      normalPdfBuffer = pdfGenRes.pdfBuffer;
    }
    // ================= AMAZON LABELS =================
    const amazonImagePaths = amazonShipments
      .map((e) => e.label_url?.replace(/'/g, ""))
      .filter(Boolean)
      .map((p) => `.${p}`); // important

    async function createPdfFromImages(paths) {
      const pdfDoc = await PDFDocument.create();

      for (const imgPath of paths) {
        if (!fs.existsSync(imgPath)) continue;

        const imgBytes = fs.readFileSync(imgPath);

        let image;
        if (imgPath.endsWith(".png")) {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: 300,
          height: 450,
        });
      }

      return await pdfDoc.save();
    }

    let amazonPdfBuffer = null;

    if (amazonImagePaths.length) {
      amazonPdfBuffer = await createPdfFromImages(amazonImagePaths);
    }

    // ================= MERGE =================
    const finalPdf = await PDFDocument.create();

    if (normalPdfBuffer) {
      const normalPdf = await PDFDocument.load(normalPdfBuffer);
      const pages = await finalPdf.copyPages(
        normalPdf,
        normalPdf.getPageIndices()
      );
      pages.forEach((p) => finalPdf.addPage(p));
    }

    if (amazonPdfBuffer) {
      const amazonPdf = await PDFDocument.load(amazonPdfBuffer);
      const pages = await finalPdf.copyPages(
        amazonPdf,
        amazonPdf.getPageIndices()
      );
      pages.forEach((p) => finalPdf.addPage(p));
    }

    const finalBuffer = await finalPdf.save();

    return {
      pdfBuffer: finalBuffer,
      fileName: "all-labels",
      contentType: "application/pdf",
    };

  } catch (error) {
    this.error = error;
    return false;
  }
}
}

const LabelSettingsService = new Service();
export default LabelSettingsService;
