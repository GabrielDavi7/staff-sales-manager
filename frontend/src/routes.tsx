import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import { Home } from "./pages/dashboard/Home";
import Login from "./pages/Login/Login";
import PrivateRoute from "./routes/PrivateRoute";
import NewAttendance from "./pages/dashboard/NewAttendance";
import Grafics from "./pages/dashboard/Grafics";
import Team from "./pages/dashboard/Team";

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
        index: true, // Isso carrega a Home quando acessar "/"
        element: <Home />,
      },
      {
        path: "registrarVenda", // A URL será: /registrarVenda
        element: <NewAttendance />,
      },
      {
        path: "funcionarios",
        element: <Team />, // Substitua por <Funcionarios /> quando a página de funcionários estiver pronta,
      },
      {
        path: "graficos",
        element: <Grafics />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
