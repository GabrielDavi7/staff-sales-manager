// frontend/src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // ou um spinner
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
