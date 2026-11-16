// src/pages/auth/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    signOut();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false); 
    } else {
      setTimeout(() => { navigate('/dashboard'); }, 600);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <Shield color="#10b981" size={48} />
          </div>
          <h1 style={{ color: '#020617', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '1px', fontWeight: '800' }}>NORTHFUNDS</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>Secure Private Access</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Encrypted Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Security Passphrase / PIN</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#020617', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
            {loading ? (
               <>
                 <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(2,6,23,0.3)', borderTopColor: '#020617', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                 Decrypting...
               </>
            ) : 'Access Vault'}
          </button>

          <p style={{ textAlign: 'center', margin: '20px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Require an account? <Link to="/register" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>Apply Here</Link>
          </p>
        </form>
        
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    </div>
  );
};