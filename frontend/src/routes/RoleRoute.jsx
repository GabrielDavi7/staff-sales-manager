import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Se o user ainda não existir (carregando), não renderiza nada (evita erro)
  if (user === undefined) return null;

  // Se não tem user ou cargo, manda pro login
  if (!user || !user.cargo) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.cargo.toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};

export default RoleRoute;
