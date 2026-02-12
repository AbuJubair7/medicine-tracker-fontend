
import { Navigate } from 'react-router-dom';
import { type FC, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
