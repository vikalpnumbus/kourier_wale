import AdminOrderExportsHandler from "./admin.ordersExports.service.mjs";

class Service {
  getExportsHandler(type) {
    const exportHandlers = {
      orders: AdminOrderExportsHandler,
    };

    if (!exportHandlers[type]) {
      throw new Error(`Handler: ${type}, not implemented yet.`);
    }
    return exportHandlers[type];
  }
}

const ExportsHandlerFactory = new Service();
export default ExportsHandlerFactory;
