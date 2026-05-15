import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando...</div>;

  if (!token) return <Navigate to="/login" />;

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
