// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Mail, Shield } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', address: ''
  });
  const [otp, setOtp] = useState('');

  useEffect(() => {
    signOut();
  }, []);

  const handleProceedToOtp = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setStep(2); 
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return setError("Please enter the 6-digit OTP.");
    
    setLoading(true); 
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.fullName, address: formData.address } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setTimeout(() => { navigate('/dashboard'); }, 600);
    }
  };

  const inputStyle = { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#1e293b' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#475569' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', width: '100%', maxWidth: '400px', border: '1px solid #f1f5f9' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '15px', borderRadius: '50%' }}>
              <Shield color="#0ea5e9" size={32} />
            </div>
          </div>
          <h1 style={{ color: '#1e293b', margin: '0 0 5px 0', fontSize: '22px', letterSpacing: '0.5px', fontWeight: '800' }}>Create Account</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>Join Northfunds today.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleProceedToOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Legal Name</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Residential Address</label>
              <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Secure Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', marginTop: '10px', fontSize: '15px' }}>
              Continue
            </button>
            <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Already a client? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '50%' }}>
                <Mail size={32} color="#059669" />
              </div>
            </div>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Check your email</h3>
            <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
              We've sent a 6-digit code to <strong>{formData.email}</strong>. <br/><br/>
              <em>(Test Mode: Enter any 6 digits).</em>
            </p>

            <input 
              type="text" required maxLength="6" placeholder="000000" 
              value={otp} onChange={e => setOtp(e.target.value)} 
              style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', outline: 'none', color: '#1e293b' }} 
            />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', marginTop: '10px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Verifying...' : 'Verify & Open Account'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginTop: '10px', fontSize: '14px', fontWeight: '500' }}>
              Change Email
            </button>
          </form>
        )}
      </div>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
};