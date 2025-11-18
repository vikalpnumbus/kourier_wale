
const apiUrl = import.meta.env.VITE_API_URL;
const PricingPlanConfig = {
  pricingPlanApi: apiUrl + "/pricing-plans",
  pricingPlanCourierApi: apiUrl + "/pricing-card-courier",
  pricingCardApi: apiUrl + "/pricing-card",
};
export default PricingPlanConfig;
