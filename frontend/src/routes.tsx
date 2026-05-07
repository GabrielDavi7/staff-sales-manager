import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Login from "./pages/Login/Login";
import PrivateRoute from "./routes/PrivateRoute";

// Vamos importar apenas o que já vamos usar!
// import { Dashboard } from "./pages/Dashboard";
// import { AttendanceDetails } from "./pages/AttendanceDetails";
// import { EditAttendance } from "./pages/EditAttendance";
// import { Reports } from "./pages/Reports";

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
        element: <Home />, // Usando a Home que você já tem
      },
      // Deixe as outras comentadas até criarmos os arquivos
      /*
      {
        path: "novo-atendimento",
        Component: NewAttendance,
      },
      {
        path: "atendimento/:id",
        Component: AttendanceDetails,
      },
      {
        path: "editar-atendimento/:id",
        Component: EditAttendance,
      },
      {
        path: "relatorios",
        Component: Reports,
      },
      */
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
