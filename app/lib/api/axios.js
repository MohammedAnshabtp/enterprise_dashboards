import axios from "axios";

const api = axios.create({
  baseURL: "https://dev.api.artiles.cloud",
});

api.interceptors.request.use((config) => {
  // ✅ TOKEN
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ FIX FOR FILE UPLOAD
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
