import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.0.7:8080/api"
});

// Add JWT automatically for protected APIs

apiClient.interceptors.request.use(
  (config) => {
    const isResetPassword =
      config.url?.includes("/auth/reset-password");

    if (isResetPassword) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default apiClient;