import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    console.error("API Error:", message);

    return Promise.reject(error);
  }
);

export default api;
