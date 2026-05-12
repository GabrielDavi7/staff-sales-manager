import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import LoginPage from "../pages/login/Login";
import { PrivateRoute } from "./PrivateRoute";
import NewAttendance from "../pages/dashboard/NewAttendance";

const getUserCargo = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // O .toUpperCase() garante que "dispositivo" ou "Dispositivo" virem "DISPOSITIVO"
  return user.cargo ? user.cargo.toUpperCase() : null;
};

const RoleGuard = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo?.toUpperCase(); // Força para maiúsculo para evitar erro de digitação

  if (!allowedRoles.includes(cargo)) {
    // Se não tiver permissão, manda pro lugar certo baseado no cargo
    return (
      <Navigate
        to={cargo === "DISPOSITIVO" ? "/registrarvenda" : "/dashboard"}
        replace
      />
    );
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/funcionarios",
    element: (
      <PrivateRoute>
        {/* APENAS o DISPOSITIVO é expulso para o registro de vendas */}
        {getUserCargo() === "DISPOSITIVO" ? (
          <Navigate to="/registrarvenda" replace />
        ) : (
          /* Vendedores, Supervisores e Admins podem ver (ou você pode filtrar o Vendedor aqui depois) */
          <Team />
        )}
      </PrivateRoute>
    ),
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Navigate
          to={
            getUserCargo() === "DISPOSITIVO" ? "/registrarvenda" : "/dashboard"
          }
          replace
        />
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
    path: "/dashboard",
    element: (
      <PrivateRoute>
        {/* Trava: Se for DISPOSITIVO, ele não entra no Dashboard de jeito nenhum */}
        {getUserCargo() === "DISPOSITIVO" ? (
          <Navigate to="/registrarvenda" replace />
        ) : (
          /* VENDEDOR, ADMIN e SUPERVISOR entram aqui normalmente */
          <div className="min-h-screen bg-light">
            <div className="p-4 md:p-8">
              <h1 className="text-xl font-bold mb-4 text-primary">
                Joias Manager
              </h1>
              <hr className="mb-6 border-secondary" />
              <Outlet />
            </div>
          </div>
        )}
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
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
