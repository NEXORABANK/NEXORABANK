// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, CheckCircle, Edit, Lock, Unlock, X, FileText, Globe, Globe2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [editModalUser, setEditModalUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', phone: '' });
  const [txModalUser, setTxModalUser] = useState(null);
  const [userTx, setUserTx] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false });
      const { data: accounts } = await supabase.from('accounts').select('*');
      
      const mergedUsers = profiles.map(profile => {
        const userAccount = accounts.find(acc => acc.user_id === profile.id);
        return { ...profile, account: userAccount || null };
      });
      setUsers(mergedUsers);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Actions
  const handleEditUser = async (e) => {
    e.preventDefault();
    await supabase.from('profiles').update({ 
      full_name: editForm.full_name, address: editForm.address, phone: editForm.phone 
    }).eq('id', editModalUser.id);
    setEditModalUser(null);
    fetchUsers();
  };

  const handleToggleExternal = async (user) => {
    const isAllowed = user.account.allow_external_transfers;
    const action = isAllowed ? 'Disable' : 'Enable';
    if (!window.confirm(`${action} external bank transfers for this user?`)) return;
    
    await supabase.from('accounts').update({ allow_external_transfers: !isAllowed }).eq('id', user.account.id);
    fetchUsers();
  };

  const viewTransactions = async (user) => {
    setTxModalUser(user);
    const { data } = await supabase.from('transactions').select('*').eq('sender_account_id', user.account.id).order('created_at', { ascending: false });
    setUserTx(data || []);
  };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div className="admin-header" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px' }}><ShieldAlert size={28} color="#ef4444" /></div>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '22px', fontWeight: '800' }}>Executive Console</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Control ledgers, edit profiles, and toggle global transfer features.</p>
        </div>
      </div>

      {/* Registry */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="#0ea5e9" /><h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Client Registry</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '15px 25px' }}>Client Profile</th>
                <th style={{ padding: '15px 25px' }}>Settings & Status</th>
                <th style={{ padding: '15px 25px' }}>Ledger</th>
                <th style={{ padding: '15px 25px', textAlign: 'right' }}>Controls</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 25px' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{user.full_name}</div>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>{user.email}</div>
                  </td>
                  
                  <td style={{ padding: '20px 25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {user.account?.allow_external_transfers ? 
                      <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={14}/> External Transfers: ALLOWED</span> : 
                      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}><Lock size={14}/> External Transfers: BLOCKED</span>
                    }
                  </td>

                  <td style={{ padding: '20px 25px' }}>
                    <div style={{ color: '#059669', fontWeight: '800', fontSize: '16px' }}>£ {Number(user.account?.balance || 0).toLocaleString()}</div>
                  </td>

                  <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setEditModalUser(user); setEditForm({ full_name: user.full_name, address: user.address, phone: user.phone || '' }); }} style={{ backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Edit size={16} color="#475569" /></button>
                      {user.account && (
                        <>
                          <button onClick={() => viewTransactions(user)} title="View Transactions" style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><FileText size={16} color="#0ea5e9" /></button>
                          <button onClick={() => handleToggleExternal(user)} title="Toggle External Bank Auth" style={{ backgroundColor: '#fef2f2', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Globe2 size={16} color="#ef4444" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Modify Profile & KYC</h3>
              <button onClick={() => setEditModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="Full Name" />
              <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="Address" />
              <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="Phone Number (New KYC Field)" />
              <button type="submit" style={{ padding: '15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {txModalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>{txModalUser.full_name}'s Ledger</h3>
              <button onClick={() => setTxModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            {userTx.length === 0 ? <p>No transactions found.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {userTx.map(tx => (
                  <li key={tx.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>To: {tx.receiver_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.created_at.split('T')[0]} • Ref: {tx.reference}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#ef4444' }}>-£{tx.amount}</div>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => window.print()} style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f1f5f9', width: '100%', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Print Ledger</button>
          </div>
        </div>
      )}
      
      <style>{`@media (max-width: 600px) { table { display: block; overflow-x: auto; } }`}</style>
    </div>
  );
};