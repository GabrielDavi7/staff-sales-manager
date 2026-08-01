import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import LoginPage from "../pages/login/Login";
import LandingPage from "../pages/landing/LandingPage";
import PrivateRoute from "./PrivateRoute";

import NewAttendance from "../pages/dashboard/NewAttendance";
import Team from "../pages/dashboard/Team";
import Grafics from "../pages/dashboard/Grafics";
import AdminPainel from "../pages/admin/AdminPainel";
import Perfil from "../pages/dashboard/perfil"; // Import do Perfil adicionado e corrigido

import { useAuth } from "../contexts/AuthContext";

const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Carregando...</p>
      </div>
    );
  }

  const cargo = user?.cargo?.trim()?.toUpperCase();

  if (!allowedRoles.includes(cargo)) {
    console.log(
      `[RoleGuard] Acesso bloqueado. Cargo '${cargo}' não permitido.`,
    );

    switch (cargo) {
      case "DISPOSITIVO":
        return <Navigate to="/registrarvenda" replace />;
      case "ADMIN":
        return <Navigate to="/adminpainel" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const InitialRedirect = () => {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const cargo = user?.cargo?.trim()?.toUpperCase();

  switch (cargo) {
    case "DISPOSITIVO":
      return <Navigate to="/registrarvenda" replace />;
    case "ADMIN":
      return <Navigate to="/adminpainel" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export const router = createBrowserRouter([
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <InitialRedirect />
      </PrivateRoute>
    ),
  },
  {
    path: "/registrarvenda",
    element: (
      <PrivateRoute>
        <NewAttendance />
      </PrivateRoute>
    ),
  },

  {
    path: "/adminpainel",
    element: (
      <PrivateRoute>
        <RoleGuard allowedRoles={["ADMIN"]}>
          <div className="min-h-screen bg-[#004D61] text-white flex flex-col">
            <div className="p-4 md:p-8 flex-1">
              <Outlet />
            </div>
          </div>
        </RoleGuard>
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminPainel />,
      },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR", "VENDEDOR"]}>
          <div className="min-h-screen bg-light">
            <div className="p-4 md:p-8">
              <h1 className="text-xl font-bold mb-4 text-primary">
                Joias Manager
              </h1>
              <hr className="mb-6 border-secondary" />

              <Outlet />
            </div>
          </div>
        </RoleGuard>
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">Painel de Controle</h2>
            <p className="text-gray-600">Bem-vindo de volta!</p>
          </div>
        ),
      },
      {
        path: "venda",
        element: <NewAttendance />,
      },
      {
        path: "funcionarios",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR", "VENDEDOR"]}>
            <Team />
          </RoleGuard>
        ),
      },
      {
        path: "graficos",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR"]}>
            <Grafics />
          </RoleGuard>
        ),
      },
      {
        path: "meuperfil",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR", "VENDEDOR"]}>
            <Perfil />
          </RoleGuard>
        ),
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
