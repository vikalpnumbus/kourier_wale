const apiUrl = import.meta.env.VITE_API_URL;
const RateDetailsConfig = {
  RateCalculator: apiUrl + "/pricing-card/calculate",
  Plan_chart: apiUrl + "/pricing-card"

};
export default RateDetailsConfig;