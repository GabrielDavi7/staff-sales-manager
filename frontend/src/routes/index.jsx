import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/Login";
import { PrivateRoute } from "./PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        {/* Quando você criar o componente do Dashboard, ele entra aqui */}
        <div className="p-8">
          <h1 className="text-2xl font-bold">Bem-vindo ao Dashboard!</h1>
          <p>Se você está vendo isso, o login funcionou.</p>
        </div>
      </PrivateRoute>
    ),
  },
]);