import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // ou .tsx dependendo do seu App
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/global.css";
import { ThemeProvider } from "./contexts/ThemeContext"; // <-- IMPORTAÇÃO DO PROVIDER DE TEMA

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
