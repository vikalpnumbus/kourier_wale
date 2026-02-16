const apiUrl = import.meta.env.VITE_API_URL;
const ordersConfig = {
  ordersApi: apiUrl + "/orders",
  ordersBulkImportApi: apiUrl + "/orders/bulk-import",
  ordersBulkExportApi: apiUrl + "/orders/bulk-export",
};
export default ordersConfig;