import axios from "axios";
import { BASE_URL } from "./urls";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow all origins for CORS
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add more headers here if needed, such as Authorization tokens
    config.headers["Access-Control-Allow-Headers"] =
      "Origin, X-Requested-With, Content-Type, Accept";
    config.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";


    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally, for example, redirect to login
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token logic
      console.warn("Unauthorized access - redirecting to login");
      // window.location.href = '/login'; // Example redirect
    }

    // Log and rethrow the error
    console.error("API response error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
