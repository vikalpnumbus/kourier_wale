const apiUrl = import.meta.env.VITE_API_URL;
const RazorpayConfig = {
  RazorpayOrder: apiUrl + "/payments/razorpay/order",
  RazorpayVerify: apiUrl + "/payments/razorpay/verify",

};
export default RazorpayConfig;