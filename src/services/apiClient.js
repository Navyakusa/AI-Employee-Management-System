import axios from "axios";

const apiClient = axios.create({
  baseURL: "",

  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT automatically for protected APIs
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;