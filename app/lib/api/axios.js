import axios from "axios";

const api = axios.create({
  baseURL: "https://dev.api.artiles.cloud",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔥 Token expired or invalid
      localStorage.removeItem("accessToken");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
