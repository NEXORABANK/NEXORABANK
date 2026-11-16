// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Mail, Upload, Shield } from 'lucide-react';

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

  useEffect(() => {
    signOut();
  }, []);

  const handleProceedToOtp = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Passphrase must be at least 6 characters.");
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
      setTimeout(() => { navigate('/dashboard'); }, 600);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px', fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <Shield color="#10b981" size={48} />
          </div>
          <h1 style={{ color: '#020617', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '1px', fontWeight: '800' }}>NORTHFUNDS</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>Establish your private digital vault.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleProceedToOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Legal Full Name</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Private Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Residential Address</label>
              <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Create Security Passphrase</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Identity Avatar (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ padding: '8px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '600' }}>
                  <Upload size={14} /> Select File
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setFormData({...formData, fileName: e.target.files[0]?.name || 'No file selected'})} />
                </label>
                <span style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{formData.fileName}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#020617', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '15px' }}>
              Proceed to Verification
            </button>
            <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Already a client? <Link to="/login" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '50%' }}>
                <Mail size={40} color="#10b981" />
              </div>
            </div>
            <h3 style={{ margin: 0, color: '#020617' }}>Verify Identity</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
              A 6-digit security clearance code has been routed to <strong>{formData.email}</strong>. <br/><br/>
              <em>(Simulation: Enter any 6-digit number).</em>
            </p>

            <input 
              type="text" required maxLength="6" placeholder="000000" 
              value={otp} onChange={e => setOtp(e.target.value)} 
              style={{ width: '100%', padding: '15px', border: '2px solid #020617', borderRadius: '8px', boxSizing: 'border-box', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', outline: 'none' }} 
            />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#020617', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(2,6,23,0.3)', borderTopColor: '#020617', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Provisioning...
                </>
              ) : 'Establish Vault'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px', fontSize: '14px', fontWeight: '500' }}>
              Modify Contact Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};