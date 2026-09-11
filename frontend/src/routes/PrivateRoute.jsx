// frontend/src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppPath } from '../hooks/useAppPath';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { buildPath } = useAppPath();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to={buildPath("/login")} replace />;
};

export default PrivateRoute;
