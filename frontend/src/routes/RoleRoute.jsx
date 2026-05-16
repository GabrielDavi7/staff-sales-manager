import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (user === undefined) return null;

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
