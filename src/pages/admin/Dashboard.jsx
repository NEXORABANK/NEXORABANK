// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, PlusCircle, DollarSign, CheckCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fundingUser, setFundingUser] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profError } = await supabase.from('profiles').select('*').neq('role', 'admin');
      // Fetch all accounts
      const { data: accounts, error: accError } = await supabase.from('accounts').select('*');

      if (profError) throw profError;
      if (accError) throw accError;

      // Merge data
      const mergedUsers = profiles.map(profile => {
        const userAccount = accounts.find(acc => acc.user_id === profile.id);
        return { ...profile, account: userAccount || null };
      });

      setUsers(mergedUsers);
    } catch (err) {
      console.error("Admin Fetch Error:", err.message);
      alert("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateAccount = async (userId) => {
    if (!window.confirm("Provision a new checking account for this user?")) return;
    
    // Generate a random 10-digit account number (starting with 4)
    const newAccNumber = '4' + Math.floor(Math.random() * 900000000 + 100000000).toString();

    const { error } = await supabase.from('accounts').insert([{
      user_id: userId,
      account_number: newAccNumber,
      balance: 0.00,
      currency: 'GBP',
      status: 'active'
    }]);

    if (error) {
      alert(`Error creating account: ${error.message}`);
    } else {
      alert("Account provisioned successfully!");
      fetchUsers();
    }
  };

  const handleFundAccount = async (e) => {
    e.preventDefault();
    if (!fundingUser || !fundAmount) return;

    const newBalance = Number(fundingUser.account.balance) + Number(fundAmount);

    const { error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', fundingUser.account.id);

    if (error) {
      alert(`Funding failed: ${error.message}`);
    } else {
      alert(`Successfully added £${fundAmount} to ${fundingUser.full_name}'s account.`);
      setFundingUser(null);
      setFundAmount('');
      fetchUsers();
    }
  };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}>
      
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px' }}>
          <ShieldAlert size={28} color="#ef4444" />
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '22px' }}>God Mode: Executive Control</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Manage user provisioning and organizational ledger.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="#0ea5e9" />
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Client Registry</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading registry...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  <th style={{ padding: '15px 25px', fontWeight: '600' }}>Client</th>
                  <th style={{ padding: '15px 25px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '15px 25px', fontWeight: '600' }}>Account Info</th>
                  <th style={{ padding: '15px 25px', fontWeight: '600' }}>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '20px 25px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{user.full_name}</div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>{user.email}</div>
                    </td>
                    
                    <td style={{ padding: '20px 25px' }}>
                      {user.account ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#d1fae5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          <CheckCircle size={14} /> ACTIVE
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          PENDING
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '20px 25px' }}>
                      {user.account ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 'bold' }}>{user.account.account_number}</div>
                          <div style={{ color: '#059669', fontWeight: '700' }}>£ {Number(user.account.balance).toLocaleString('en-GB', {minimumFractionDigits:2})}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Requires Provisioning</span>
                      )}
                    </td>

                    <td style={{ padding: '20px 25px' }}>
                      {!user.account ? (
                        <button onClick={() => handleCreateAccount(user.id)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PlusCircle size={16} /> Create Account
                        </button>
                      ) : (
                        <button onClick={() => setFundingUser(user)} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <DollarSign size={16} /> Inject Funds
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No clients registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FUNDING MODAL */}
      {fundingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Fund Account</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>Injecting funds into <strong>{fundingUser.full_name}</strong>'s account ({fundingUser.account.account_number}).</p>
            
            <form onSubmit={handleFundAccount}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Amount (GBP)</label>
                <input type="number" required min="1" step="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => {setFundingUser(null); setFundAmount('');}} style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};