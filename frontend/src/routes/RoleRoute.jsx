import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAppPath } from "../hooks/useAppPath";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const { buildPath } = useAppPath();

  if (user === undefined) return null;

  if (!user || !user.cargo) {
    return <Navigate to={buildPath("/login")} replace />;
  }

  const userRole = user.cargo.toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    if (userRole === "ADMIN" || userRole === "ADMIN_CLIENTE") {
      return <Navigate to={buildPath("/adminpainel")} replace />;
    }
    if (userRole === "DISPOSITIVO") {
      return <Navigate to={buildPath("/registrarVenda")} replace />;
    }
    return <Navigate to={buildPath("/acesso-negado")} replace />;
  }

  return children;
};

export default RoleRoute;
