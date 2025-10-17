const apiUrl = import.meta.env.VITE_API_URL;
const authConfig = {
  loginApi: apiUrl + "/users/login",
  getTokenApi: apiUrl + "/users/get-token",
  forgotPasswordApi: apiUrl + "/users/forgot-password",
  resetPasswordApi: apiUrl + "/users/reset-password",
  varifyOtpApi: apiUrl + "/users/verify-otp",
  varifyEmailApi: apiUrl + "/users/register/verify-email",
  varifyPhoneApi: apiUrl + "/users/register/verify-phone",
  registerStep1Api: apiUrl + "/users/register/step1",
  registerStep2Api: apiUrl + "/users/register/step2",
  resendOtpApi: apiUrl + "/users/resend-otp",
};
export default authConfig;
