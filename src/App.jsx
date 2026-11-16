import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout & Security Guards
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Secure Pages
import { Dashboard } from './pages/customer/Dashboard';
import { Transfer } from './pages/customer/Transfer';
import { Statement } from './pages/customer/Statement';

// Admin Secure Pages
import { AdminDashboard } from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* SECURE ROUTES (Requires Login) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppShell><Dashboard /></AppShell>
            </ProtectedRoute>
          } />
          
          <Route path="/transfer" element={
            <ProtectedRoute>
              <AppShell><Transfer /></AppShell>
            </ProtectedRoute>
          } />
          
          <Route path="/statement" element={
            <ProtectedRoute>
              <AppShell><Statement /></AppShell>
            </ProtectedRoute>
          } />

          {/* ADMIN ROUTE (Requires Login) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;