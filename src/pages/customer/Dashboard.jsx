// src/pages/customer/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Upload, Headset, X, ShieldCheck, CreditCard, ArrowRightLeft, Building, ArrowDownToLine, AlertTriangle, ShieldAlert, User, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null); 
  
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', dob: '', phone: '', occupation: '', avatar_url: '', kyc_document: '' });
  const [updating, setUpdating] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = session?.user?.id || profile?.id;
        if (!userId) return;

        const [profileResponse, accountResponse] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('accounts').select('*').eq('user_id', userId).single()
        ]);

        if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
          console.error("Profile Fetch Error:", profileResponse.error);
        }
        if (accountResponse.error) {
          console.error("Account Fetch Error:", accountResponse.error);
          setDbError(`Database Connection Issue: ${accountResponse.error.message}`);
        }

        if (profileResponse.data) {
          setUserProfile(profileResponse.data);
          setEditForm({
            full_name: profileResponse.data.full_name || '', address: profileResponse.data.address || '', 
            dob: profileResponse.data.dob || '', phone: profileResponse.data.phone || '', 
            occupation: profileResponse.data.occupation || '', avatar_url: profileResponse.data.avatar_url || '',
            kyc_document: profileResponse.data.kyc_document || ''
          });
        }
        if (accountResponse.data) {
          setAccount(accountResponse.data);
        }
      } catch (err) {
        setDbError(`Critical Fetch Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase.from('profiles').update(editForm).eq('id', userProfile.id);
    if (error) {
      alert(`Error updating profile: ${error.message}`);
    } else {
      setUserProfile({ ...userProfile, ...editForm });
      alert("Profile and KYC Information updated successfully!");
      setIsEditing(false);
    }
    setUpdating(false);
  };

  const getAvatarUrl = () => {
    if (userProfile?.avatar_url && (userProfile.avatar_url.startsWith('http') || userProfile.avatar_url.startsWith('data:image'))) {
      return userProfile.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'User')}&background=000080&color=fff&rounded=true&bold=true&size=150`;
  };

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', paddingBottom: '40px' }}>
      
      {dbError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', padding: '20px', borderRadius: '12px', color: '#991b1b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AlertTriangle size={30} color="#ef4444" />
          <div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Database Error Detected</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{dbError}</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="admin-gateway" style={{ maxWidth: '800px', margin: '0 auto 30px auto', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', textAlign: 'center', fontSize: '18px' }}>Admin Access Gateway</h3>
          <div className="gateway-buttons" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/admin')} 
              style={{ flex: 1, padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', transition: 'background 0.2s', minWidth: '200px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <ShieldAlert size={20} /> Access God Mode
            </button>
            <button style={{ flex: 1, padding: '15px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '2px solid #cbd5e1', borderRadius: '12px', cursor: 'default', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', minWidth: '200px' }}>
              <User size={20} /> Viewing Personal Account
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#666', textAlign: 'center' }}>Connecting to secure database...</p>
      ) : account ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="main-bank-card" style={{ background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)', color: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 15px 35px -5px rgba(10, 25, 47, 0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
            
            <div className="card-top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '25px', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  {userProfile?.full_name ? `${userProfile.full_name} Account` : 'Main Account'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={24} color="#ffd700" />
                  <p style={{ margin: 0, fontSize: '22px', letterSpacing: '3px', fontFamily: 'monospace' }}>{account.account_number}</p>
                </div>
                <span style={{ backgroundColor: account.status === 'active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: account.status === 'active' ? '#2ecc71' : '#e74c3c', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: `1px solid ${account.status === 'active' ? '#2ecc71' : '#e74c3c'}`, display: 'inline-block', marginTop: '15px' }}>
                  {account.status.toUpperCase()}
                </span>
              </div>

              <div className="card-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'right' }}>
                <div className="profile-text">
                  <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '18px' }}>{userProfile?.full_name}</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{userProfile?.email}</p>
                </div>
                <img src={getAvatarUrl()} alt="Profile" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '15px' }}>Available Balance</p>
              <h2 className="balance-text" style={{ margin: 0, color: 'white', fontSize: '48px', fontWeight: '800' }}>
                <span style={{ fontSize: '24px', verticalAlign: 'super', color: '#94a3b8', marginRight: '6px' }}>{account.currency}</span>
                {Number(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '12px', color: '#b45309', border: '1px solid #fde68a', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ margin: 0 }}><strong>Pending Configuration:</strong> Your checking account has not been activated by the Admin yet. Please wait for sync.</p>
        </div>
      )}

      {/* QUICK NAVIGATION */}
      <h3 style={{ marginTop: '45px', marginBottom: '20px', color: '#0f172a', fontSize: '20px', textAlign: 'center' }}>Quick Navigation</h3>
      <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <ActionCard title="Nexora Transfer" subtitle="Send to internal accounts" icon={ArrowRightLeft} to="/transfer" color="#3b82f6" />
        <ActionCard title="Other Banks" subtitle="Wire and ACH transfers" icon={Building} to="/transfer" color="#8b5cf6" />
        <ActionCard title="Withdraw Funds" subtitle="To linked local accounts" icon={ArrowDownToLine} to="/transfer" color="#f59e0b" />
        <ActionCard title="Account Statement" subtitle="View transaction history" icon={FileText} to="/statement" color="#10b981" />
        <ActionCard title="Update KYC & Image" subtitle="Manage identity documents" icon={ShieldCheck} onClick={() => setIsEditing(true)} color="#ef4444" />
        <ActionCard title="Help & Support" subtitle="Contact 24/7 Customer Care" icon={Headset} onClick={() => alert("Connecting to 24/7 Support.\n\nEmail: support@at.online")} color="#0ea5e9" />
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Update Profile & KYC</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>Full Name</label><input type="text" required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} /></div>
              
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 150px' }}><label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>Date of Birth</label><input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} /></div>
                <div style={{ flex: '1 1 150px' }}><label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>Phone Number</label><input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} /></div>
              </div>

              <div><label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>Home Address</label><input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' }} /></div>
              
              <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>Profile Picture Upload</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Upload size={14} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> Select Image
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEditForm({...editForm, avatar_url: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }} />
                  </label>
                  <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                    {editForm.avatar_url?.startsWith('data:image') ? 'New image selected' : (editForm.avatar_url || 'No file selected')}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>KYC Document Upload (ID Card, Passport)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                    <ShieldCheck size={14} style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} /> Upload KYC File
                    <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => setEditForm({...editForm, kyc_document: e.target.files[0]?.name || editForm.kyc_document})} />
                  </label>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                    {editForm.kyc_document || 'Verification Required'}
                  </span>
                </div>
              </div>

              <button type="submit" disabled={updating} style={{ width: '100%', padding: '15px', backgroundColor: '#0a192f', color: 'white', border: 'none', borderRadius: '10px', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 12px rgba(10, 25, 47, 0.2)' }}>
                {updating ? 'Saving Changes...' : 'Save Profile & KYC'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE RESPONSIVE CSS INJECTION */}
      <style>
        {`
          @media (max-width: 600px) {
            /* Force the Action Cards into a vertical list on small screens */
            .action-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            /* Make the bank card padding tighter */
            .main-bank-card {
              padding: 20px !important;
              border-radius: 16px !important;
            }
            /* Adjust the balance text size */
            .balance-text {
              font-size: 36px !important;
            }
            /* Stack the profile picture above the account number on very small screens */
            .card-top-section {
              flex-direction: column-reverse !important;
              gap: 20px !important;
            }
            .card-profile-section {
              width: 100%;
              justify-content: flex-end;
            }
          }
        `}
      </style>
    </div>
  );
};

// UPGRADED ACTION CARD: Added the Chevron arrow to look like a native app menu
const ActionCard = ({ title, subtitle, icon: Icon, to, onClick, color }) => {
  const CardContent = (
    <div style={{ backgroundColor: 'white', padding: '18px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', cursor: 'pointer', height: '100%', boxSizing: 'border-box', transition: 'transform 0.2s, boxShadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: `${color}15`, color: color, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>{title}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={20} color="#cbd5e1" />
    </div>
  );
  
  return to ? <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{CardContent}</Link> : <div onClick={onClick} style={{ display: 'block' }}>{CardContent}</div>;
};