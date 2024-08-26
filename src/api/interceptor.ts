import axios from "axios";
import { BASE_URL } from "./urls";
import { logDev } from "@/utils/functionUtils";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", 
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Access-Control-Allow-Headers"] =
      "Origin, X-Requested-With, Content-Type, Accept";
    config.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";


    return config;
  },
  (error) => {
    logDev("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
    }

    // Log and rethrow the error
    logDev("API response error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
