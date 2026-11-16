// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Users, Plus, DollarSign, CheckCircle, Edit, Lock, Unlock, X, Trash2, Printer, FileText } from 'lucide-react';

// Create a special background Admin client to bypass normal auth restrictions
// This uses your Service Role Key so you can create users without being logged out
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', address: '', initial_deposit: '' });

  const [editModalUser, setEditModalUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', address: '' });

  const [fundModalUser, setFundModalUser] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState('add');

  const [receiptModalUser, setReceiptModalUser] = useState(null);
  const [receiptData, setReceiptData] = useState({
    type: 'Credit', amount: '', description: 'Wire Transfer', date: new Date().toISOString().split('T')[0], ref: 'NF-' + Math.floor(Math.random() * 90000000)
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profError } = await supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false });
      const { data: accounts, error: accError } = await supabase.from('accounts').select('*');

      if (profError) throw profError;
      if (accError) throw accError;

      const mergedUsers = profiles.map(profile => {
        const userAccount = accounts.find(acc => acc.user_id === profile.id);
        return { ...profile, account: userAccount || null };
      });
      setUsers(mergedUsers);
    } catch (err) {
      console.error("Admin Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- GOD MODE ACTIONS ---

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (createForm.password.length < 6) return alert("Password must be at least 6 characters.");
    setActionLoading(true);
    
    try {
      // 1. Create the real auth user in Supabase
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: createForm.email,
        password: createForm.password,
        email_confirm: true,
        user_metadata: { full_name: createForm.full_name, address: createForm.address }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Upsert profile (in case a DB trigger didn't catch it)
      await supabase.from('profiles').upsert({
        id: userId, email: createForm.email, full_name: createForm.full_name, address: createForm.address, role: 'customer'
      });

      // 3. Provision their active checking account and deposit initial funds
      const newAccNumber = '4' + Math.floor(Math.random() * 900000000 + 100000000).toString();
      const { error: accError } = await supabase.from('accounts').insert([{
        user_id: userId, account_number: newAccNumber, balance: Number(createForm.initial_deposit || 0), currency: 'GBP', status: 'active'
      }]);

      if (accError) throw accError;

      setIsCreateOpen(false);
      setCreateForm({ email: '', password: '', full_name: '', address: '', initial_deposit: '' });
      fetchUsers();
      alert(`Success! Account created. Client can now log in with ${createForm.email}.`);
      
    } catch (err) {
      alert(`Error creating user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: editForm.full_name, address: editForm.address }).eq('id', editModalUser.id);
    if (error) alert(error.message);
    setEditModalUser(null);
    fetchUsers();
    setActionLoading(false);
  };

  const handleProvisionAccount = async (userId) => {
    if (!window.confirm("Provision a checking account for this user?")) return;
    const newAccNumber = '4' + Math.floor(Math.random() * 900000000 + 100000000).toString();
    await supabase.from('accounts').insert([{ user_id: userId, account_number: newAccNumber, balance: 0.00, currency: 'GBP', status: 'active' }]);
    fetchUsers();
  };

  const handleModifyBalance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    let newBalance = Number(fundModalUser.account.balance);
    const amount = Number(fundAmount);
    
    if (fundType === 'add') newBalance += amount;
    else newBalance -= amount;

    await supabase.from('accounts').update({ balance: newBalance }).eq('id', fundModalUser.account.id);
    setFundModalUser(null); setFundAmount('');
    fetchUsers();
    setActionLoading(false);
  };

  const handleToggleLock = async (user) => {
    const newStatus = user.account.status === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`Change account status to ${newStatus.toUpperCase()}?`)) return;
    await supabase.from('accounts').update({ status: newStatus }).eq('id', user.account.id);
    fetchUsers();
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`WARNING: You are about to permanently wipe ${user.full_name} and their funds. Proceed?`)) return;
    setActionLoading(true);
    await supabase.from('accounts').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    
    // Wipe them from Auth system
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    fetchUsers();
    setActionLoading(false);
  };

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '15px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#475569' };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div className="no-print admin-header" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px' }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '22px', fontWeight: '800' }}>Executive Console (God Mode)</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Full read, write, and forge authority over client ledger.</p>
          </div>
        </div>
        <button onClick={() => setIsCreateOpen(true)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Client
        </button>
      </div>

      {/* REGISTRY TABLE */}
      <div className="no-print" style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="#0ea5e9" />
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Client Registry ({users.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Syncing with secure ledger...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  <th style={{ padding: '15px 25px', fontWeight: '700' }}>Client Profile</th>
                  <th style={{ padding: '15px 25px', fontWeight: '700' }}>Account Status</th>
                  <th style={{ padding: '15px 25px', fontWeight: '700' }}>Balance & Ledger</th>
                  <th style={{ padding: '15px 25px', fontWeight: '700', textAlign: 'right' }}>Master Controls</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isLocked = user.account?.status === 'locked';
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isLocked ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: '20px 25px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{user.full_name}</div>
                        <div style={{ color: '#64748b', fontSize: '13px' }}>{user.email}</div>
                      </td>
                      
                      <td style={{ padding: '20px 25px' }}>
                        {user.account ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: isLocked ? '#fee2e2' : '#d1fae5', color: isLocked ? '#ef4444' : '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            {isLocked ? <><Lock size={14}/> LOCKED</> : <><CheckCircle size={14}/> ACTIVE</>}
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>UNPROVISIONED</span>
                        )}
                      </td>

                      <td style={{ padding: '20px 25px' }}>
                        {user.account ? (
                          <div>
                            <div style={{ color: isLocked ? '#ef4444' : '#059669', fontWeight: '800', fontSize: '16px' }}>£ {Number(user.account.balance).toLocaleString('en-GB', {minimumFractionDigits:2})}</div>
                            <div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>ACC: {user.account.account_number}</div>
                          </div>
                        ) : (
                          <button onClick={() => handleProvisionAccount(user.id)} style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Generate Account</button>
                        )}
                      </td>

                      <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                        <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => { setEditModalUser(user); setEditForm({ full_name: user.full_name, address: user.address || '' }); }} title="Edit Profile" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit size={16} /></button>
                          
                          {user.account && (
                            <>
                              <button onClick={() => setFundModalUser(user)} title="Modify Balance" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><DollarSign size={16} /></button>
                              <button onClick={() => { setReceiptModalUser(user); setReceiptData({...receiptData, amount: '', ref: 'NF-' + Math.floor(Math.random() * 90000000)}) }} title="Print Receipt" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><FileText size={16} /></button>
                              <button onClick={() => handleToggleLock(user)} title="Lock/Unlock" style={{ backgroundColor: isLocked ? '#d1fae5' : '#fee2e2', color: isLocked ? '#059669' : '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>{isLocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
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
        )}
      </div>

      {/* --- MODALS (No Print) --- */}

      {/* 1. Modify Balance Modal */}
      {fundModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Modify Ledger Balance</h3>
              <button onClick={() => setFundModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            <form onSubmit={handleModifyBalance}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div onClick={() => setFundType('add')} style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: fundType === 'add' ? '#059669' : '#f1f5f9', color: fundType === 'add' ? 'white' : '#475569' }}>Inject (+)</div>
                <div onClick={() => setFundType('deduct')} style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: fundType === 'deduct' ? '#ef4444' : '#f1f5f9', color: fundType === 'deduct' ? 'white' : '#475569' }}>Deduct (-)</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Amount (£)</label>
                <input type="number" required min="0.01" step="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} style={inputStyle} autoFocus />
              </div>
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Apply Ledger Update</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Custom Receipt Forger / Printer Modal */}
      {receiptModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '500px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Generate Custom Receipt</h3>
              <button onClick={() => setReceiptModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Type</label>
                  <select value={receiptData.type} onChange={e => setReceiptData({...receiptData, type: e.target.value})} style={inputStyle}>
                    <option>Credit (Inflow)</option><option>Debit (Outflow)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Amount (£)</label>
                  <input type="number" value={receiptData.amount} onChange={e => setReceiptData({...receiptData, amount: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div><label style={labelStyle}>Description / Sender / Receiver</label><input type="text" value={receiptData.description} onChange={e => setReceiptData({...receiptData, description: e.target.value})} style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input type="date" value={receiptData.date} onChange={e => setReceiptData({...receiptData, date: e.target.value})} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ref Number</label><input type="text" value={receiptData.ref} onChange={e => setReceiptData({...receiptData, ref: e.target.value})} style={inputStyle} /></div>
              </div>
            </div>

            <button onClick={() => window.print()} style={{ width: '100%', padding: '15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} /> Print Official Receipt
            </button>
          </div>
        </div>
      )}

      {/* 3. Create User Modal */}
      {isCreateOpen && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Open New Client Account</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={labelStyle}>Full Name</label><input type="text" required value={createForm.full_name} onChange={e => setCreateForm({...createForm, full_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email Address</label><input type="email" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Client Password</label><input type="text" required placeholder="Minimum 6 characters" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Physical Address</label><input type="text" value={createForm.address} onChange={e => setCreateForm({...createForm, address: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Initial Ledger Deposit (£)</label><input type="number" step="0.01" value={createForm.initial_deposit} onChange={e => setCreateForm({...createForm, initial_deposit: e.target.value})} style={inputStyle} /></div>
              
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', marginTop: '10px', cursor: 'pointer' }}>
                {actionLoading ? 'Creating Auth User...' : 'Provision New Client'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit User Modal */}
      {editModalUser && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Modify Profile</h3>
              <button onClick={() => setEditModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </div>
            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={labelStyle}>Full Name</label><input type="text" required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Registered Address</label><input type="text" required value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={inputStyle} /></div>
              
              <button type="submit" disabled={actionLoading} style={{ width: '100%', padding: '15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', marginTop: '10px', cursor: 'pointer' }}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PRINTABLE RECEIPT TEMPLATE (Hidden unless printing) --- */}
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
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p>Northfunds Inc. • Secure Global Banking</p>
            </div>
          </div>
        </div>
      )}

      {/* CSS MAGIC for Printing & Mobile */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            #printable-receipt, #printable-receipt * { visibility: visible; display: block !important; }
            #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; }
          }
          @media (max-width: 600px) {
            .admin-header { flex-direction: column; align-items: flex-start !important; padding: 20px !important; }
            .admin-header button { width: 100%; justify-content: center; }
            table { min-width: 100% !important; display: block; }
            thead { display: none; }
            tbody, tr, td { display: block; width: 100%; box-sizing: border-box; }
            tr { border-bottom: 2px solid #e2e8f0 !important; padding-bottom: 15px; margin-bottom: 15px; }
            td { padding: 10px 15px !important; display: flex; justify-content: space-between; align-items: center; border: none !important; }
            td::before { content: attr(data-label); font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; }
            td:nth-child(1) { flex-direction: column; align-items: flex-start; }
            td:nth-child(4) .action-buttons { justify-content: flex-start !important; width: 100%; margin-top: 10px; }
            td:nth-child(4) button { flex: 1 1 30%; justify-content: center; }
          }
        `}
      </style>
    </div>
  );
};