import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    // Busca o token primeiramente no sessionStorage. Se não existir, tenta o localStorage.
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Caso o token seja revogado ou expire, os dois storages devem ser limpos
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default api;
