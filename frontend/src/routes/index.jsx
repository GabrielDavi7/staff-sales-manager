import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"; // Importamos o Outlet
import LoginPage from "../pages/login/Login";
import { PrivateRoute } from "./PrivateRoute";
import NewAttendance from "../pages/dashboard/NewAttendance";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Rota Raiz: Redireciona para o dashboard
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // Grupo Protegido
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <div className="min-h-screen bg-light">
          <div className="p-4 md:p-8">
            <h1 className="text-xl font-bold mb-4 text-primary">
              Joias Manager
            </h1>
            <hr className="mb-6 border-secondary" />

            {/* O Outlet é como um "buraco" onde o React Router 
                vai injetar os filhos (Home ou NewAttendance) 
            */}
            <Outlet />
          </div>
        </div>
      </PrivateRoute>
    ),
    children: [
      {
        index: true, // Aparece quando a URL for exatamente /dashboard
        element: (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">Bem-vindo ao Dashboard!</h2>
            <p className="text-gray-600">
              Selecione uma opção no menu para começar.
            </p>
          </div>
        ),
      },
      {
        path: "registrarVenda", // Aparece quando a URL for /dashboard/registrarVenda
        element: <NewAttendance />,
      },
    ],
  },
]);
