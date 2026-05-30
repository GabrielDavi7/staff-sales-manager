import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta recuperar primeiro do sessionStorage (sessão ativa) e, caso não encontre, busca no localStorage
    const storedUser =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    const token =
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("auth_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await api.post("/api/users/login/", {
        username,
        password,
      });
      const { token, user } = response.data;

      // Define qual storage será utilizado com base na escolha do usuário
      const storage = rememberMe ? localStorage : sessionStorage;

      // Limpa dados residuais de acessos anteriores em ambos para evitar conflitos
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");

      // Armazena token e dados do usuário no storage apropriado
      storage.setItem("auth_token", token);
      storage.setItem("user", JSON.stringify(user));

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
      // Garante a remoção em ambos os storages independentemente de onde o token estava salvo
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");
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
