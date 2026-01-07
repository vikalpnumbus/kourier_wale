const apiUrl = import.meta.env.VITE_API_URL;
const SellerDashboardConfig = {
  dashStats: apiUrl + "/dashboard/stats",
  courierWiseStats: apiUrl + "/dashboard/stats/courier-wise",
  cityWiseStats: apiUrl + "/dashboard/stats/city-wise",
  paymentModeWiseStats: apiUrl + "/dashboard/stats/payment-mode-wise",
};
export default SellerDashboardConfig;
