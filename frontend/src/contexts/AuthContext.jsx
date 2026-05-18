// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/api/users/login/", {
        username,
        password,
      });
      const { token, user } = response.data;

      // Armazenar token e dados do usuário
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error("Erro no login:", error);
      let errorMessage = "Falha na autenticação.";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) errorMessage = data.detail;
        else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
        else if (data.username) errorMessage = data.username[0];
        else if (data.password) errorMessage = data.password[0];
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout/");
    } catch (error) {
      console.error("Erro ao invalidar o token no backend:", error);
    } finally {
      // O bloco finally garante que, mesmo se a API der erro (ex: sem internet), 
      // o usuário será deslogado localmente no frontend.
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
