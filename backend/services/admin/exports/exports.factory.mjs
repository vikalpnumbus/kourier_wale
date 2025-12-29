import AdminOrderExportsHandler from "./admin.ordersExports.service.mjs";
import AdminProductsExportsHandler from "./admin.productsExports.service.mjs";
import AdminRemittanceExportsHandler from "./admin.remittanceExports.service.mjs";
import AdminShippingExportsHandler from "./admin.shippingExports.service.mjs";
import AdminShippingChargesExportsHandler from "./admin.shippingChargesExports.service.mjs";

class Service {
  getExportsHandler(type) {
    const exportHandlers = {
      orders: AdminOrderExportsHandler,
      shipping: AdminShippingExportsHandler,
      products: AdminProductsExportsHandler,
      remittance: AdminRemittanceExportsHandler,
      shippingCharges: AdminShippingChargesExportsHandler,
    };

    if (!exportHandlers[type]) {
      throw new Error(`Handler: ${type}, not implemented yet.`);
    }
    return exportHandlers[type];
  }
}

const ExportsHandlerFactory = new Service();
export default ExportsHandlerFactory;
