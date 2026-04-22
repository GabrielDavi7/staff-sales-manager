// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login/Login';
// import Dashboard from './pages/Dashboard/Dashboard'; // a ser criado futuramente

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {/* <Dashboard /> */}
                <div style={{ padding: '2rem' }}>
                  <h1>Dashboard (Área Protegida)</h1>
                  <p>Bem-vindo! Esta é uma área restrita.</p>
                </div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;