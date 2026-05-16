import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import LoginPage from "../pages/login/Login";
import { PrivateRoute } from "./PrivateRoute";

import NewAttendance from "../pages/dashboard/NewAttendance";
import Team from "../pages/team/Team";
import Grafics from "../pages/dashboard/Grafics";
import AdminPainel from "../pages/admin/AdminPainel";

import { useAuth } from "../contexts/AuthContext";

/* =========================================================
   ROLE GUARD
========================================================= */
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  // Enquanto carrega autenticação
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Carregando...</p>
      </div>
    );
  }

  const cargo = user?.cargo?.trim()?.toUpperCase();

  // Se não tiver permissão
  if (!allowedRoles.includes(cargo)) {
    console.log(
      `[RoleGuard] Acesso bloqueado. Cargo '${cargo}' não permitido.`,
    );

    // Redirect inteligente
    switch (cargo) {
      case "DISPOSITIVO":
        return <Navigate to="/registrarvenda" replace />;

      case "ADMIN":
        return <Navigate to="/adminpainel" replace />;

      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

/* =========================================================
   REDIRECT INICIAL
========================================================= */
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

/* =========================================================
   ROUTER
========================================================= */
export const router = createBrowserRouter([
  /* =========================================================
     LOGIN
  ========================================================= */
  {
    path: "/login",
    element: <LoginPage />,
  },

  /* =========================================================
     REDIRECT INICIAL
  ========================================================= */
  {
    path: "/",
    element: (
      <PrivateRoute>
        <InitialRedirect />
      </PrivateRoute>
    ),
  },

  /* =========================================================
     REGISTRAR VENDA
  ========================================================= */
  {
    path: "/registrarvenda",
    element: (
      <PrivateRoute>
        <NewAttendance />
      </PrivateRoute>
    ),
  },

  /* =========================================================
     FUNCIONÁRIOS
  ========================================================= */
  {
    path: "/funcionarios",
    element: (
      <PrivateRoute>
        <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR", "VENDEDOR"]}>
          <Team />
        </RoleGuard>
      </PrivateRoute>
    ),
  },

  /* =========================================================
     GRÁFICOS
  ========================================================= */
  {
    path: "/dashboard/graficos",
    element: (
      <PrivateRoute>
        <RoleGuard allowedRoles={["ADMIN", "SUPERVISOR"]}>
          <Grafics />
        </RoleGuard>
      </PrivateRoute>
    ),
  },

  /* =========================================================
     ADMIN
  ========================================================= */
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

  /* =========================================================
     DASHBOARD
  ========================================================= */
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
    ],
  },

  /* =========================================================
     FALLBACK
  ========================================================= */
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
