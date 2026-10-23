import axios from "axios";

const axiosInstance = axios.create({

  baseURL:  "http://192.168.0.5:8080/api"


});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("AXIOS TOKEN EXISTS:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("AUTH HEADER ADDED");
    }

    console.log("FINAL AUTH HEADER:", config.headers.Authorization);

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;