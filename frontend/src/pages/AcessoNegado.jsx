import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAppPath } from "../hooks/useAppPath";

const AcessoNegado = () => {
  const { buildPath } = useAppPath();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f8fafc",
      }}
    >
      <ShieldAlert size={80} color="#ef4444" />
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#1e293b" }}>
        403
      </h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#334155" }}>
        Acesso Negado
      </h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Você não tem permissão para acessar esta área.
      </p>
      <Link
        to={buildPath("/dashboard")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4D7BAB",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default AcessoNegado;
