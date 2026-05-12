import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import { Home } from "./pages/dashboard/Home";
import Login from "./pages/Login/Login";
import PrivateRoute from "./routes/PrivateRoute";
import NewAttendance from "./pages/dashboard/NewAttendance";
import Grafics from "./pages/dashboard/Grafics";
import Team from "./pages/dashboard/Team";
import AcessoNegado from "./pages/AcessoNegado";

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
    ],
  },
  {
    path: "/acesso-negado",
    element: <AcessoNegado />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
