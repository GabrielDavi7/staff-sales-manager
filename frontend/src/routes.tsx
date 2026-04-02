import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { NewAttendance } from "./pages/NewAttendance";
import { AttendanceDetails } from "./pages/AttendanceDetails";
import { EditAttendance } from "./pages/EditAttendance"; // <-- NOVO IMPORT
import { Reports } from "./pages/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "novo-atendimento",
        Component: NewAttendance,
      },
      {
        path: "atendimento/:id",
        Component: AttendanceDetails,
      },
      {
        path: "editar-atendimento/:id", // <-- NOVA ROTA
        Component: EditAttendance,
      },
      {
        path: "relatorios",
        Component: Reports,
      },
    ],
  },
]);
