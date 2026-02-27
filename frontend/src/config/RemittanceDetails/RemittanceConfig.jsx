
const apiUrl = import.meta.env.VITE_API_URL;
const RemittanceConfig = {
  remittance_list: apiUrl + "/remittance/seller",
};
export default RemittanceConfig;
