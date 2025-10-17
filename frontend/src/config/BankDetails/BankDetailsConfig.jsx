const apiUrl = import.meta.env.VITE_API_URL;
const bankDetailsConfig = {
  bankDetails: apiUrl + "/bank-details",
  getIfscApi: apiUrl + "/bank-details/get-ifsc-details"
};
export default bankDetailsConfig;