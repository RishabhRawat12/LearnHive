import axios from "axios";

// Get the auth token from localStorage
const getToken = () => localStorage.getItem("token");

// Create the axios instance
const api = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend API URL
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Add the token to the Authorization header
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;