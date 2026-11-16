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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', width: '100%', maxWidth: '400px', border: '1px solid #f1f5f9' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '15px', borderRadius: '50%' }}>
              <Shield color="#0ea5e9" size={32} />
            </div>
          </div>
          <h1 style={{ color: '#1e293b', margin: '0 0 5px 0', fontSize: '22px', letterSpacing: '0.5px', fontWeight: '800' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>Enter your details to access your vault.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff', fontSize: '15px', color: '#1e293b', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Security PIN / Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff', fontSize: '15px', color: '#1e293b', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', marginTop: '10px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>
            {loading ? (
               <>
                 <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                 Authenticating...
               </>
            ) : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Don't have an account? <Link to="/register" style={{ color: '#0ea5e9', fontWeight: '700', textDecoration: 'none' }}>Apply Here</Link>
          </p>
        </form>
        
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    </div>
  );
};