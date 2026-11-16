// src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#0a192f', fontFamily: 'Arial' }}>
        <h2>Authenticating Secure Connection...</h2>
      </div>
    );
  }

  // If there is no active session, kick the user back to the login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};