import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // ou .tsx dependendo do seu App
import "./index.css";
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)