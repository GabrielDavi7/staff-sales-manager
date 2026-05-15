import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import { Home } from "./pages/dashboard/Home";
import Login from "./pages/login/Login";
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute"; // <-- Adicionado
import NewAttendance from "./pages/dashboard/NewAttendance";
import Grafics from "./pages/dashboard/Grafics";
import Team from "./pages/dashboard/Team";
import AdminPainel from "./pages/admin/AdminPainel"; // <-- Adicionado

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "registrarVenda",
        element: <NewAttendance />,
      },
      {
        path: "funcionarios",
        element: <Team />,
      },
      {
        path: "graficos",
        element: <Grafics />,
      },
      // 👇 Apenas a opção do painel admin modificada e protegida!
      {
        path: "adminpainel",
        element: (
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminPainel />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
