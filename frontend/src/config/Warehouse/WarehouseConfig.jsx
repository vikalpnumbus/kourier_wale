const apiUrl = import.meta.env.VITE_API_URL;
const warehouseConfig = {
  warehouseApi: apiUrl + "/warehouse",
  warehouseBulkApi: apiUrl + "/warehouse/bulk-import",
  pincodeApi: apiUrl + "/pincode",
};
export default warehouseConfig;