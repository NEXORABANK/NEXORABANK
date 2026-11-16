// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Users, Plus, DollarSign, Edit, Lock, Unlock, X, Trash2, Printer, FileText, Globe } from 'lucide-react';

// Secure Admin Client for bypassing normal Auth rules
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', address: '', initial_deposit: '' });
  const [editModalUser, setEditModalUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', phone: '' });
  const [fundModalUser, setFundModalUser] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState('add');
  const [txModalUser, setTxModalUser] = useState(null);
  const [userTx, setUserTx] = useState([]);
  const [receiptModalUser, setReceiptModalUser] = useState(null);
  const [receiptData, setReceiptData] = useState({ type: 'Credit', amount: '', description: 'Wire Transfer', date: new Date().toISOString().split('T')[0], ref: 'NF-' + Math.floor(Math.random() * 90000000) });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false });
      const { data: accounts } = await supabase.from('accounts').select('*');
      const mergedUsers = profiles.map(profile => ({ ...profile, account: accounts.find(acc => acc.user_id === profile.id) || null }));
      setUsers(mergedUsers);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- GOD MODE ACTIONS ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (createForm.password.length < 6) return alert("Password must be 6+ characters.");
    setActionLoading(true);
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: createForm.email, password: createForm.password, email_confirm: true, user_metadata: { full_name: createForm.full_name, address: createForm.address }
      });
      if (authError) throw authError;
      
      const userId = authData.user.id;
      await supabase.from('profiles').upsert({ id: userId, email: createForm.email, full_name: createForm.full_name, address: createForm.address, role: 'customer' });
      
      const newAccNumber = '4' + Math.floor(Math.random() * 900000000 + 100000000).toString();
      await supabase.from('accounts').insert([{ user_id: userId, account_number: newAccNumber, balance: Number(createForm.initial_deposit || 0), currency: 'GBP', status: 'active', allow_external_transfers: false }]);
      
      setIsCreateOpen(false); setCreateForm({ email: '', password: '', full_name: '', address: '', initial_deposit: '' });
      fetchUsers(); alert("Client provisioned successfully.");
    } catch (err) { alert(err.message); } finally { setActionLoading(false); }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    await supabase.from('profiles').update({ full_name: editForm.full_name, address: editForm.address, phone: editForm.phone }).eq('id', editModalUser.id);
    setEditModalUser(null); fetchUsers(); setActionLoading(false);
  };

  const handleModifyBalance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    const amountNum = Number(fundAmount);
    const newBalance = fundType === 'add' 
      ? Number(fundModalUser.account.balance) + amountNum 
      : Number(fundModalUser.account.balance) - amountNum;

    // 1. Update balance
    const { error: accError } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', fundModalUser.account.id);
    if (accError) {
      alert("Database Error updating balance: " + accError.message);
      setActionLoading(false);
      return;
    }
    
    // 2. Insert transaction into Ledger
    const { error: txError } = await supabase.from('transactions').insert([{
      receiver_account_number: fundType === 'add' ? fundModalUser.account.account_number : 'SYSTEM',
      receiver_name: fundType === 'add' ? fundModalUser.full_name : 'System Deduction',
      bank_name: 'Northfunds System',
      amount: amountNum,
      type: 'internal',
      reference: (fundType === 'add' ? 'DEP-' : 'DED-') + Math.floor(Math.random() * 90000000),
      description: fundType === 'add' ? 'System Deposit' : 'System Deduction',
      sender_account_id: fundType === 'add' ? null : fundModalUser.account.id
    }]);

    if (txError) alert("Ledger Error (Check Supabase RLS!): " + txError.message);

    // 3. Trigger Email & Alert Result
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: fundModalUser.email,
          clientName: fundModalUser.full_name,
          amount: amountNum,
          newBalance: newBalance,
          type: fundType === 'add' ? 'Credit Deposit' : 'Debit Deduction'
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert("Balance Updated, but Email Failed: " + data.error);
      } else {
        alert("SUCCESS! Balance updated and Email Sent.");
      }
    } catch (emailError) {
      alert("Email API crashed: " + emailError.message);
    }

    setFundModalUser(null); setFundAmount(''); fetchUsers(); setActionLoading(false);
  };

  const handleToggleLock = async (user) => {
    const newStatus = user.account.status === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`Change account status to ${newStatus.toUpperCase()}?`)) return;
    await supabase.from('accounts').update({ status: newStatus }).eq('id', user.account.id);
    fetchUsers();
  };

  const handleToggleExternal = async (user) => {
    const isAllowed = user.account.allow_external_transfers;
    if (!window.confirm(`${isAllowed ? 'Disable' : 'Enable'} external bank transfers for this user?`)) return;
    await supabase.from('accounts').update({ allow_external_transfers: !isAllowed }).eq('id', user.account.id);
    fetchUsers();
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`WARNING: Erase ${user.full_name} and all funds?`)) return;
    setActionLoading(true);
    await supabase.from('accounts').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    fetchUsers(); setActionLoading(false);
  };

  const viewTransactions = async (user) => {
    setTxModalUser(user);
    const { data } = await supabase.from('transactions').select('*').or(`sender_account_id.eq.${user.account.id},receiver_account_number.eq.${user.account.account_number}`).order('created_at', { ascending: false });
    setUserTx(data || []);
  };

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#475569' };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div className="no-print admin-header" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px' }}><ShieldAlert size={28} color="#ef4444" /></div>
          <div><h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Executive Console</h2><p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Full read, write, and forge authority.</p></div>
        </div>
        <button onClick={() => setIsCreateOpen(true)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '24px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Create Client</button>
      </div>

      {/* REGISTRY TABLE */}
      <div className="no-print" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={20} color="#0ea5e9" /><h3 style={{ margin: 0, color: '#1e293b' }}>Registry</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
              <tr><th style={{ padding: '15px 25px' }}>Profile</th><th style={{ padding: '15px 25px' }}>Security & Limits</th><th style={{ padding: '15px 25px' }}>Ledger</th><th style={{ padding: '15px 25px', textAlign: 'right' }}>Master Controls</th></tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isLocked = user.account?.status === 'locked';
                const extAllowed = user.account?.allow_external_transfers;
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isLocked ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '20px 25px' }}><div style={{ fontWeight: '700', color: '#1e293b' }}>{user.full_name}</div><div style={{ color: '#64748b', fontSize: '13px' }}>{user.email}</div></td>
                    <td style={{ padding: '20px 25px' }}>
                      {user.account ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: isLocked ? '#ef4444' : '#059669', fontWeight: '700' }}>{isLocked ? 'LOCKED' : 'ACTIVE'}</span>
                          <span style={{ fontSize: '12px', color: extAllowed ? '#0ea5e9' : '#94a3b8', fontWeight: '700' }}>{extAllowed ? 'EXTERNAL: YES' : 'EXTERNAL: NO'}</span>
                        </div>
                      ) : <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700' }}>UNPROVISIONED</span>}
                    </td>
                    <td style={{ padding: '20px 25px' }}>
                      {user.account && <div><div style={{ color: isLocked ? '#ef4444' : '#059669', fontWeight: '800', fontSize: '16px' }}>£ {Number(user.account.balance).toLocaleString('en-GB', {minimumFractionDigits: 2})}</div><div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>{user.account.account_number}</div></div>}
                    </td>
                    <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => { setEditModalUser(user); setEditForm({ full_name: user.full_name, address: user.address, phone: user.phone || '' }); }} title="Edit Profile" style={{ backgroundColor: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit size={16} /></button>
                        {user.account && (
                          <>
                            <button onClick={() => setFundModalUser(user)} title="Inject/Deduct Funds" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><DollarSign size={16} /></button>
                            <button onClick={() => viewTransactions(user)} title="View Ledger History" style={{ backgroundColor: '#fdf4ff', color: '#c026d3', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><FileText size={16} /></button>
                            <button onClick={() => { setReceiptModalUser(user); setReceiptData({ type: 'Credit', amount: '', description: 'Wire Transfer', date: new Date().toISOString().split('T')[0], ref: 'NF-' + Math.floor(Math.random() * 90000000) }); }} title="Print Custom Receipt" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Printer size={16} /></button>
                            <button onClick={() => handleToggleLock(user)} title="Lock/Unlock" style={{ backgroundColor: isLocked ? '#d1fae5' : '#fee2e2', color: isLocked ? '#059669' : '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>{isLocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
                            <button onClick={() => handleToggleExternal(user)} title="Toggle External Bank Feature" style={{ backgroundColor: extAllowed ? '#e0f2fe' : '#f1f5f9', color: extAllowed ? '#0ea5e9' : '#94a3b8', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Globe size={16} /></button>
                          </>
                        )}
                        <button onClick={() => handleDeleteUser(user)} title="Erase User" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {isCreateOpen && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3 style={{ margin: 0 }}>Open New Account</h3><button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button></div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={labelStyle}>Full Name</label><input type="text" required value={createForm.full_name} onChange={e => setCreateForm({...createForm, full_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email Address</label><input type="email" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Password</label><input type="text" required placeholder="Minimum 6 chars" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Physical Address</label><input type="text" value={createForm.address} onChange={e => setCreateForm({...createForm, address: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Initial Deposit (£)</label><input type="number" step="0.01" value={createForm.initial_deposit} onChange={e => setCreateForm({...createForm, initial_deposit: e.target.value})} style={inputStyle} /></div>
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', marginTop: '10px', cursor: 'pointer' }}>{actionLoading ? 'Creating...' : 'Provision Client'}</button>
            </form>
          </div>
        </div>
      )}

      {editModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3 style={{ margin: 0 }}>Modify Profile</h3><button onClick={() => setEditModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button></div>
            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={labelStyle}>Full Name</label><input type="text" required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Address</label><input type="text" required value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone (KYC)</label><input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={inputStyle} /></div>
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {fundModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3 style={{ margin: 0 }}>Modify Ledger</h3><button onClick={() => setFundModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button></div>
            <form onSubmit={handleModifyBalance}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div onClick={() => setFundType('add')} style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: fundType === 'add' ? '#059669' : '#f1f5f9', color: fundType === 'add' ? 'white' : '#475569' }}>Inject (+)</div>
                <div onClick={() => setFundType('deduct')} style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: fundType === 'deduct' ? '#ef4444' : '#f1f5f9', color: fundType === 'deduct' ? 'white' : '#475569' }}>Deduct (-)</div>
              </div>
              <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Amount (£)</label><input type="number" required min="0.01" step="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} style={inputStyle} /></div>
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Apply Ledger Update</button>
            </form>
          </div>
        </div>
      )}

      {txModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3 style={{ margin: 0 }}>{txModalUser.full_name}'s Ledger</h3><button onClick={() => setTxModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button></div>
            {userTx.length === 0 ? <p>No transactions found.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {userTx.map(tx => {
                  const isOutflow = tx.sender_account_id === txModalUser.account.id;
                  return (
                    <li key={tx.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                      <div><div style={{ fontWeight: 'bold' }}>{isOutflow ? `To: ${tx.receiver_name}` : `From: ${tx.bank_name}`}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{tx.created_at.split('T')[0]} • Ref: {tx.reference}</div></div>
                      <div style={{ fontWeight: 'bold', color: isOutflow ? '#ef4444' : '#059669' }}>{isOutflow ? '-' : '+'}£{tx.amount}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {receiptModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '500px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3 style={{ margin: 0 }}>Generate Custom Receipt</h3><button onClick={() => setReceiptModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Type</label><select value={receiptData.type} onChange={e => setReceiptData({...receiptData, type: e.target.value})} style={inputStyle}><option>Credit (Inflow)</option><option>Debit (Outflow)</option></select></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Amount (£)</label><input type="number" value={receiptData.amount} onChange={e => setReceiptData({...receiptData, amount: e.target.value})} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Description</label><input type="text" value={receiptData.description} onChange={e => setReceiptData({...receiptData, description: e.target.value})} style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input type="date" value={receiptData.date} onChange={e => setReceiptData({...receiptData, date: e.target.value})} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ref Number</label><input type="text" value={receiptData.ref} onChange={e => setReceiptData({...receiptData, ref: e.target.value})} style={inputStyle} /></div>
              </div>
            </div>
            <button onClick={() => window.print()} style={{ width: '100%', padding: '15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Printer size={18} /> Print Receipt</button>
          </div>
        </div>
      )}

      {/* --- PRINTABLE RECEIPT TEMPLATE --- */}
      {receiptModalUser && (
        <div id="printable-receipt" style={{ display: 'none' }}>
          <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#0ea5e9' }}>NORTHFUNDS INC.</h1>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>Official Transaction Receipt</p>
            </div>
            <table style={{ width: '100%', fontSize: '16px', lineHeight: '2' }}>
              <tbody>
                <tr><td style={{ fontWeight: 'bold', width: '40%' }}>Date:</td><td>{receiptData.date}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Reference:</td><td>{receiptData.ref}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Client Name:</td><td>{receiptModalUser.full_name}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Account Number:</td><td>{receiptModalUser.account?.account_number}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Transaction Type:</td><td style={{ color: receiptData.type.includes('Credit') ? 'green' : 'red', fontWeight: 'bold' }}>{receiptData.type}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Description:</td><td>{receiptData.description}</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: '30px', backgroundColor: '#f0f0f0', padding: '20px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              Amount: £{Number(receiptData.amount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2})}
            </div>
            <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
              <p>This is a computer-generated receipt.</p><p>Northfunds Inc. • Secure Global Banking</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #printable-receipt, #printable-receipt * { visibility: visible; display: block !important; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @media (max-width: 600px) { table { display: block; overflow-x: auto; } }
      `}</style>
    </div>
  );
};