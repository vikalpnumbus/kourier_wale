const apiUrl = import.meta.env.VITE_API_URL;
const productsConfig = {
  productsApi: apiUrl + "/products",
  productsBulkApi: apiUrl + "/products/bulk-import",
};
export default productsConfig;
