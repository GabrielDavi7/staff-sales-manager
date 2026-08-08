import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import { Home } from "./pages/dashboard/Home";
import Login from "./pages/login/Login";
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";
import NewAttendance from "./pages/dashboard/NewAttendance";
import Grafics from "./pages/dashboard/Grafics";
import Team from "./pages/dashboard/Team";
import AdminPainel from "./pages/admin/AdminPainel";
import Perfil from "./pages/dashboard/perfil";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/landing/LandingPage";

/**
 * Redireciona rotas sem slug para a versao com slug,
 * se o usuario tiver um cliente vinculado.
 * ADMIN (sem cliente) permanece nas rotas sem slug.
 */
const RedirectToSlug = ({ children }) => {
  const { user } = useAuth();

  if (!user) return children;

  const userSlug = user.cliente_slug;
  const path = window.location.pathname;
  const urlSegments = path.split("/").filter(Boolean);
  const urlSlug = urlSegments[0] || "";

  if (userSlug) {
    // Usuario tem cliente → sempre usar rota com slug correto
    if (urlSlug === userSlug) {
      // URL ja tem o slug correto → segue
      return children;
    }
    // Substitui ou adiciona o slug correto
    const pathSemSlug = urlSlug && urlSlug !== "login"
      ? "/" + urlSegments.slice(1).join("/") || "/"
      : path === "/" ? "" : path;
    const target = `/${userSlug}${pathSemSlug}`;
    return <Navigate to={target} replace />;
  }

  if (urlSlug && urlSlug !== "login") {
    // ADMIN (sem cliente) acessando rota com slug → remover slug
    const target = "/" + urlSegments.slice(1).join("/") || "/";
    return <Navigate to={target} replace />;
  }

  return children;
};

// Rotas filhas compartilhadas entre versoes com e sem slug
const dashboardChildren = [
  { index: true, element: <Home /> },
  { path: "dashboard", element: <Home /> },
  { path: "registrarVenda", element: <NewAttendance /> },
  { path: "funcionarios", element: <Team /> },
  { path: "graficos", element: <Grafics /> },
  {
    path: "meuperfil",
    element: (
      <RoleRoute allowedRoles={["VENDEDOR", "ADMIN", "ADMIN_CLIENTE", "SUPERVISOR"]}>
        <Perfil />
      </RoleRoute>
    ),
  },
  {
    path: "adminpainel",
    element: (
      <RoleRoute allowedRoles={["ADMIN", "ADMIN_CLIENTE"]}>
        <AdminPainel />
      </RoleRoute>
    ),
  },
];

export const router = createBrowserRouter([
  // === Login (sem layout) ===
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/:slug/login",
    element: <Login />,
  },
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <RedirectToSlug>
          <DashboardLayout />
        </RedirectToSlug>
      </PrivateRoute>
    ),
    children: dashboardChildren,
  },

  // === Rotas com slug ===
  {
    path: "/:slug",
    element: (
      <PrivateRoute>
        <RedirectToSlug>
          <DashboardLayout />
        </RedirectToSlug>
      </PrivateRoute>
    ),
    children: dashboardChildren,
  },

  // === Catch-all ===
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
