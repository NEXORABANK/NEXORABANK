// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Check if they are logged in AND their profile role is 'admin'
  if (!user || profile?.role !== 'admin') {
    // If not an admin, send them back to the customer dashboard or login
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};