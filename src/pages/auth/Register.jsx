// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Mail, Upload } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', address: '', fileName: 'No file selected'
  });
  const [otp, setOtp] = useState('');

  // GUARANTEE A FRESH PAGE: Wipe the memory clean the moment they load this page
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
      options: { data: { full_name: formData.fullName, address: formData.address, avatar_url: formData.fileName } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // SUCCESS! Wait 600ms for memory to sync, then push to dashboard safely.
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#0a192f', margin: '0 0 10px 0', fontSize: '24px' }}>NEXORA BANK</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Open your secure account today.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleProceedToOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>Full Name</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>Home Address</label>
              <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g., 123 Main St" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>Create Login Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>Profile Picture (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ padding: '8px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500' }}>
                  <Upload size={14} /> Select File
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setFormData({...formData, fileName: e.target.files[0]?.name || 'No file selected'})} />
                </label>
                <span style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{formData.fileName}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#0a192f', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '15px' }}>
              Continue to Verification
            </button>
            <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '50%' }}>
                <Mail size={40} color="#2563eb" />
              </div>
            </div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Verify Your Email</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>. <br/><br/>
              <em>(Simulation Mode: You can enter any 6-digit number to proceed).</em>
            </p>

            <input 
              type="text" required maxLength="6" placeholder="000000" 
              value={otp} onChange={e => setOtp(e.target.value)} 
              style={{ width: '100%', padding: '15px', border: '2px solid #0a192f', borderRadius: '8px', boxSizing: 'border-box', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', outline: 'none' }} 
            />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Creating Account...
                </>
              ) : 'Verify & Open Account'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px', fontSize: '14px' }}>
              Change Email Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};