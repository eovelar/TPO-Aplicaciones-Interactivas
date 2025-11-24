import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);

      config.headers["x-user-id"] = user.id;
      config.headers["x-user-role"] = user.role;
      config.headers["x-user-email"] = user.email;
      config.headers["x-user-name"] = user.name; // 🟣 NECESARIO PARA EL HISTORIAL
    }

    return config;
  },
  (error) => Promise.reject(error)
);
