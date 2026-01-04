const apiUrl = import.meta.env.VITE_API_URL_ADMIN;
const usersConfig = {
  userList: apiUrl + "/users/list",
  userApi: apiUrl + "/users",
};
export default usersConfig;