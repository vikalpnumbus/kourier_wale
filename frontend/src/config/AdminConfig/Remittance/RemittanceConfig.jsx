const apiUrl = import.meta.env.VITE_API_URL_ADMIN;

const RemittanceConfig = {
    remittanceListApi: apiUrl + "/remittance/admin",
    remittanceCreateApi: apiUrl + "/remittance",
};
export default RemittanceConfig;
