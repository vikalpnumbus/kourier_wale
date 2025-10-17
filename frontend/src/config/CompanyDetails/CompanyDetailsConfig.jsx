const apiUrl = import.meta.env.VITE_API_URL;
const companyDetailsConfig = {
  companyDetails: apiUrl + "/company-details",
  labelSettingConfig: apiUrl + "/label-settings/create",
};
export default companyDetailsConfig;
