import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Add JWT automatically for protected APIs
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("API REQUEST:", config.url);
    console.log("TOKEN EXISTS:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("AUTH HEADER ADDED");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;