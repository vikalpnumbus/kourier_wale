const apiUrl = import.meta.env.VITE_API_URL;
const courierConfig = {
  CourierList: apiUrl + "/user-courier/?userId=",
};
export default courierConfig;