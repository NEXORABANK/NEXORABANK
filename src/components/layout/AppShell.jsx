// src/components/layout/AppShell.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Send, FileText, Upload, LogOut, ShieldAlert, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth(); 

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/transfer', name: 'Transfer & Withdraw', icon: Send },
    { path: '/statement', name: 'Account Statement', icon: FileText },
    { path: '/documents', name: 'Document Center', icon: Upload },
  ];

  const isAdmin = profile?.role === 'admin';

  if (isAdmin) {
    navItems.push({ path: '/admin', name: 'God Mode (Admin)', icon: ShieldAlert });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, fontFamily: '"Inter", sans-serif' }}>
      
      <header style={{ backgroundColor: '#ffffff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          
          <Link to="/" style={{ textDecoration: 'none', color: '#1e293b', fontSize: '18px', letterSpacing: '1px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="#0ea5e9" size={22} />
            NORTHFUNDS
          </Link>
        </div>
        
        <button onClick={handleLogout} style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
          <LogOut size={16} /> <span className="hide-mobile">Sign Out</span>
        </button>
      </header>

      {isMenuOpen && (
        <div style={{ position: 'absolute', top: '65px', left: 0, width: '100%', backgroundColor: '#ffffff', zIndex: 40, borderBottom: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '10px 0' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isGodMode = item.path === '/admin';
              
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 25px', textDecoration: 'none', color: isGodMode ? '#ef4444' : (isActive ? '#059669' : '#475569'), backgroundColor: isActive ? '#ecfdf5' : 'transparent', borderLeft: isActive ? '4px solid #059669' : '4px solid transparent', fontWeight: isActive ? '700' : '500', fontSize: '15px' }}>
                  <Icon size={20} /> {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '25px 15px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
};