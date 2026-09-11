import { createBrowserRouter, Navigate, useParams, useLocation } from "react-router-dom";
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

export const RedirectToSlug = ({ children }) => {
  const { user } = useAuth();
  const { slug } = useParams();
  const location = useLocation();
  if (!user?.cliente_slug) return <Navigate to="/login" replace />;
  if (slug === user.cliente_slug) return children;
  const suffix = slug ? location.pathname.slice(slug.length + 1) : location.pathname;
  return <Navigate to={`/${user.cliente_slug}${suffix}${location.search}${location.hash}`} replace />;
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
      <RoleRoute allowedRoles={["VENDEDOR", "ADMIN_CLIENTE", "SUPERVISOR"]}>
        <Perfil />
      </RoleRoute>
    ),
  },
  {
    path: "adminpainel",
    element: (
      <RoleRoute allowedRoles={["ADMIN_CLIENTE"]}>
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
