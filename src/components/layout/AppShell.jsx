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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
      
      <header style={{ backgroundColor: '#020617', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
          
          <Link to="/" style={{ textDecoration: 'none', color: '#f8fafc', fontSize: '20px', letterSpacing: '1.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="#10b981" size={24} />
            NORTHFUNDS
          </Link>
        </div>
        
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'background 0.2s' }}>
          <LogOut size={16} /> <span className="hide-mobile">Sign Out</span>
        </button>
      </header>

      {isMenuOpen && (
        <div style={{ position: 'absolute', top: '70px', left: 0, width: '100%', backgroundColor: '#0f172a', zIndex: 40, borderTop: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '10px 0' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isGodMode = item.path === '/admin';
              
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', textDecoration: 'none', color: isGodMode ? '#ef4444' : (isActive ? '#10b981' : '#cbd5e1'), backgroundColor: isActive ? 'rgba(16, 185, 129, 0.05)' : 'transparent', borderLeft: isActive ? '4px solid #10b981' : '4px solid transparent', fontWeight: isActive ? 'bold' : '500' }}>
                  <Icon size={20} /> {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
};