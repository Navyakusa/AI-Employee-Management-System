import axios from "axios";

/**
 * Central Axios instance.
 * -----------------------------------------------------------------
 * - Attaches the JWT token (stored under "token" in localStorage,
 *   same key EmployeeTopbar.jsx already uses on logout) to every
 *   request automatically.
 * - On a 401 response (expired/invalid token), clears the stored
 *   auth info and bounces the user back to /login.
 *
 * If you already built one of these for the recruiter dashboard,
 * use that file instead of this one — don't have two separate
 * Axios instances in the same app, or the token/baseURL could
 * drift out of sync between modules.
 */

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
