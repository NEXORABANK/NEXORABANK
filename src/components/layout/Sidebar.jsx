// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, CreditCard, Send, FileText, HelpCircle, Shield, Users, Upload } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  // Navigation for standard customers
  const customerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Accounts', path: '/accounts', icon: CreditCard },
    { name: 'Transfer Money', path: '/transfer', icon: Send },
    { name: 'Account Statement', path: '/statement', icon: FileText },
    { name: 'Document Center', path: '/documents', icon: Upload },
    { name: 'Help and Support', path: '/support', icon: HelpCircle },
  ];

  // Navigation specifically for Admins
  const adminLinks = [
    { name: 'Admin Console', path: '/admin', icon: Shield },
    { name: 'User Management', path: '/admin', icon: Users },
  ];

  // Decide which menu to show based on the database profile
  const navItems = profile?.role === 'admin' ? adminLinks : customerLinks;

  return (
    <div style={{ width: '250px', backgroundColor: '#000080', color: 'white', height: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#ffd700', marginBottom: '30px', fontSize: '20px' }}>NEXORA BANK</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              style={{ 
                color: isActive ? '#ffd700' : 'white', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};