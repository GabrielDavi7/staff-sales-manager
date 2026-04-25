// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login/Login';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Home from './pages/dashboard/Home';
// import RegistrarAtendimento from './pages/dashboard/RegistrarAtendimento'; // no futuro
// import MeuDesempenho from './pages/dashboard/MeuDesempenho';
// import AdminPanel from './pages/dashboard/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Grupo protegido com layout de dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            {/* Futuras sub-rotas: */}
            {/* <Route path="registrar" element={<RegistrarAtendimento />} /> */}
            {/* <Route path="meu-desempenho" element={<MeuDesempenho />} /> */}
            {/* <Route path="admin" element={<AdminPanel />} /> */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;