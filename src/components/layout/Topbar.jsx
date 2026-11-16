// src/components/layout/Topbar.jsx
import { useAuth } from '../../context/AuthContext';
import { Bell, User } from 'lucide-react';

export const Topbar = () => {
  const { profile, signOut } = useAuth();

  return (
    <div style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxSizing: 'border-box' }}>
      <div>
        <span style={{ backgroundColor: '#ffd700', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
          FICTIONAL BANKING SIMULATION
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Bell size={20} style={{ cursor: 'pointer', color: '#333' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
          <User size={20} />
          <span>{profile?.full_name || 'Customer'}</span>
        </div>
        <button 
          onClick={signOut}
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};