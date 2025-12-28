import AdminUTRImportsHandler from "./admin.UtrImports.service.mjs";

class Service {
  getImportsHandler(type) {
    const importHandlers = {
      utr: AdminUTRImportsHandler,
    };

    if (!importHandlers[type]) {
      throw new Error(`Handler: ${type}, not implemented yet.`);
    }
    return importHandlers[type];
  }
}

const ImportsHandlerFactory = new Service();
export default ImportsHandlerFactory;
