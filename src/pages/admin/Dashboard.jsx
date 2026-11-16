// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Activity, Edit, Lock, Unlock, Key, Save, X, Building, ArrowDownToLine, ShieldAlert, FileSearch, AlertTriangle, ArrowLeft } from 'lucide-react';

export const AdminDashboard = () => {
  const { profile } = useAuth(); 
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ profiles: 0, accounts: 0, totalMoney: 0 });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null); 
  
  const [ledgerOpenFor, setLedgerOpenFor] = useState(null);
  const [ledgerForm, setLedgerForm] = useState({ type: 'credit', amount: '', description: '', sender_name: 'System', receiver_name: 'User' });
  
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', pin: '', address: '' });
  const [creatingUser, setCreatingUser] = useState(false);

  const [editingProfileFor, setEditingProfileFor] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', address: '', dob: '', phone: '', occupation: '' });

  const [managingRecordsFor, setManagingRecordsFor] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard'); 
    } else if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [profilesResponse, accountsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('accounts').select('*')
      ]);
      
      if (profilesResponse.error) throw profilesResponse.error;
      if (accountsResponse.error) throw accountsResponse.error;

      const profilesData = profilesResponse.data || [];
      const accountsData = accountsResponse.data || [];
      
      const profilesWithAccounts = profilesData.map(p => {
        const acc = accountsData.find(a => a.user_id === p.id);
        return { ...p, account: acc };
      });

      const totalMoney = accountsData.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
      setProfiles(profilesWithAccounts);
      setStats({ profiles: profilesData.length, accounts: accountsData.length, totalMoney });
    } catch (err) {
      setDbError(`Admin DB Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditingProfile = (profileToEdit) => {
    setEditForm({ full_name: profileToEdit.full_name || '', address: profileToEdit.address || '', dob: profileToEdit.dob || '', phone: profileToEdit.phone || '', occupation: profileToEdit.occupation || '' });
    setEditingProfileFor(profileToEdit.id); setLedgerOpenFor(null); setManagingRecordsFor(null);
  };

  const saveProfileEdit = async (profileId) => {
    await supabase.from('profiles').update(editForm).eq('id', profileId);
    setEditingProfileFor(null); fetchData();
  };

  const toggleAccountStatus = async (accountId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'restricted' : 'active';
    if (!window.confirm(`Change status to ${newStatus.toUpperCase()}?`)) return;
    await supabase.from('accounts').update({ status: newStatus }).eq('id', accountId); fetchData();
  };

  const toggleFeatureLock = async (accountId, fieldName, currentLockStatus) => {
    if (!window.confirm(`Are you sure you want to ${!currentLockStatus ? "LOCK" : "UNLOCK"} this feature?`)) return;
    await supabase.from('accounts').update({ [fieldName]: !currentLockStatus }).eq('id', accountId); fetchData();
  };

  const handleLedgerSubmit = async (e, account) => {
    e.preventDefault();
    const amount = parseFloat(ledgerForm.amount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount.');
    
    const isCredit = ledgerForm.type === 'credit';
    const balanceBefore = Number(account.balance);
    const newBalance = isCredit ? balanceBefore + amount : balanceBefore - amount;
    const txRef = 'NEX' + Math.floor(100000000 + Math.random() * 900000000).toString();

    await Promise.all([
      supabase.from('accounts').update({ balance: newBalance }).eq('id', account.id),
      supabase.from('transactions').insert([{
        account_id: account.id, type: ledgerForm.type, amount: amount, 
        description: ledgerForm.description || `Admin Ledger ${isCredit ? 'Credit' : 'Debit'}`,
        transaction_ref: txRef, sender_name: ledgerForm.sender_name, receiver_name: ledgerForm.receiver_name,
        balance_before: balanceBefore, balance_after: newBalance
      }])
    ]);
    
    setLedgerOpenFor(null); 
    setLedgerForm({ type: 'credit', amount: '', description: '', sender_name: 'System', receiver_name: 'User' }); 
    fetchData();
  };

  const openRecordManager = async (accountId) => {
    setManagingRecordsFor(accountId); setLedgerOpenFor(null); setEditingProfileFor(null);
    const { data } = await supabase.from('transactions').select('*').eq('account_id', accountId).order('created_at', { ascending: false });
    setUserTransactions(data || []);
  };

  const updateTransactionRecord = async (txId, field, value) => {
    const { error } = await supabase.from('transactions').update({ [field]: value }).eq('id', txId);
    if (error) alert(error.message);
    else setUserTransactions(userTransactions.map(tx => tx.id === txId ? { ...tx, [field]: value } : tx));
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {dbError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', padding: '20px', borderRadius: '8px', color: '#991b1b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AlertTriangle size={30} color="#ef4444" />
          <div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Database Access Blocked</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{dbError}</p>
          </div>
        </div>
      )}

      {/* HEADER WITH RETURN BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <h2 style={{ color: '#000080', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldAlert color="#ef4444" /> God Mode</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> Return
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ backgroundColor: '#000080', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign color="#ffd700" />
            <h3 style={{ margin: 0, color: '#ffd700', fontSize: '24px' }}>${stats.totalMoney.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '14px' }}>Total Economy In Circulation</p>
        </div>
      </div>

      <h3 style={{ marginTop: '40px', color: '#333' }}>Customer Management & Ledger</h3>
      
      {/* RESPONSIVE DATA TABLE / CARDS */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name & Info</th>
              <th>Bank Account</th>
              <th>Balance</th>
              <th>Actions & Security</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Loading Data...</td></tr> : profiles.map(p => (
              <tr key={p.id} className={ledgerOpenFor === p.id || editingProfileFor === p.id || managingRecordsFor === p.account?.id ? 'active-row' : ''}>
                
                {/* 1. NAME & EMAIL */}
                <td className="mobile-col">
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#0f172a' }}>
                    {p.full_name}
                    <button onClick={() => startEditingProfile(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0 }} title="Edit Form"><Edit size={16} /></button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{p.email}</div>
                </td>

                {/* 2. ACCOUNT NUMBER */}
                <td className="mobile-col mobile-flex-row">
                  {p.account ? (
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#334155', fontFamily: 'monospace' }}>{p.account.account_number}</span><br/>
                      <span style={{ backgroundColor: p.account.status === 'active' ? '#dcfce7' : '#fee2e2', color: p.account.status === 'active' ? '#16a34a' : '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>{p.account.status.toUpperCase()}</span>
                    </div>
                  ) : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sync Error</span>}
                  
                  {/* On Mobile, the balance moves up to share this line */}
                  <div className="mobile-balance-display">
                     {p.account ? `$${Number(p.account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                  </div>
                </td>

                {/* 3. BALANCE (Desktop only, hidden on mobile) */}
                <td className="desktop-balance-col" style={{ fontWeight: 'bold', color: '#000080', fontSize: '18px' }}>
                  {p.account ? `$${Number(p.account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
                
                {/* 4. ACTIONS & SECURITY */}
                <td className="mobile-col action-col">
                  {/* ACTION BUTTONS */}
                  <div className="action-group">
                    <button onClick={() => alert(`Change password in Supabase.`)} className="btn-dark"><Key size={16}/> Pwd</button>
                    {p.account && (
                      <>
                        <button onClick={() => { setLedgerOpenFor(ledgerOpenFor === p.id ? null : p.id); setEditingProfileFor(null); setManagingRecordsFor(null); }} className={`btn-green ${ledgerOpenFor === p.id ? 'active' : ''}`}><Activity size={16} /> Ledger</button>
                        <button onClick={() => managingRecordsFor === p.account.id ? setManagingRecordsFor(null) : openRecordManager(p.account.id)} className={`btn-purple ${managingRecordsFor === p.account.id ? 'active' : ''}`}><FileSearch size={16} /> Records</button>
                      </>
                    )}
                  </div>
                  
                  {/* SECURITY CONTROLS */}
                  {p.account && (
                    <div className="security-group">
                      <button onClick={() => toggleAccountStatus(p.account.id, p.account.status)} className={p.account.status === 'active' ? 'btn-red' : 'btn-orange'}>
                        {p.account.status === 'active' ? <Lock size={16}/> : <Unlock size={16}/>} {p.account.status === 'active' ? 'Freeze' : 'Unfreeze'}
                      </button>
                      <button onClick={() => toggleFeatureLock(p.account.id, 'external_transfer_locked', p.account.external_transfer_locked)} className={p.account.external_transfer_locked ? 'btn-orange' : 'btn-blue'}>
                        {p.account.external_transfer_locked ? <ShieldAlert size={16}/> : <Building size={16}/>} {p.account.external_transfer_locked ? 'Unl. Ext' : 'Lock Ext'}
                      </button>
                      <button onClick={() => toggleFeatureLock(p.account.id, 'withdrawal_locked', p.account.withdrawal_locked)} className={p.account.withdrawal_locked ? 'btn-orange' : 'btn-indigo'}>
                        {p.account.withdrawal_locked ? <ShieldAlert size={16}/> : <ArrowDownToLine size={16}/>} {p.account.withdrawal_locked ? 'Unl. W/D' : 'Lock W/D'}
                      </button>
                    </div>
                  )}

                  {/* INLINE FORMS (Ledger, Edit, Records) */}
                  {/* Edit Form */}
                  {editingProfileFor === p.id && (
                    <div className="inline-form-box border-blue">
                      <div className="box-header"><h4 style={{ color: '#3b82f6' }}>Edit Profile</h4><button onClick={() => setEditingProfileFor(null)}><X size={18}/></button></div>
                      <div className="form-grid">
                        <input type="text" placeholder="Full Name" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                        <input type="text" placeholder="Occupation" value={editForm.occupation} onChange={e => setEditForm({...editForm, occupation: e.target.value})} />
                        <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                        <input type="tel" placeholder="Phone Number" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                        <input type="text" placeholder="Address" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ gridColumn: '1 / -1' }} />
                      </div>
                      <button onClick={() => saveProfileEdit(p.id)} className="btn-blue full-width mt-10"><Save size={16}/> Save Changes</button>
                    </div>
                  )}

                  {/* Ledger Form */}
                  {ledgerOpenFor === p.id && p.account && (
                    <div className="inline-form-box border-navy">
                      <div className="box-header"><h4 style={{ color: '#000080' }}>Post Transaction</h4><button onClick={() => setLedgerOpenFor(null)}><X size={18}/></button></div>
                      <form onSubmit={(e) => handleLedgerSubmit(e, p.account)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="form-grid">
                          <select value={ledgerForm.type} onChange={(e) => setLedgerForm({...ledgerForm, type: e.target.value})} style={{ backgroundColor: ledgerForm.type === 'credit' ? '#dcfce7' : '#fee2e2', fontWeight: 'bold' }}>
                            <option value="credit">Credit (+)</option><option value="debit">Debit (-)</option>
                          </select>
                          <input type="number" required min="0.01" step="0.01" placeholder="Amount" value={ledgerForm.amount} onChange={(e) => setLedgerForm({...ledgerForm, amount: e.target.value})} />
                        </div>
                        <input type="text" required placeholder="Narration (e.g. Wire Transfer)" value={ledgerForm.description} onChange={(e) => setLedgerForm({...ledgerForm, description: e.target.value})} className="full-width" />
                        <div className="form-grid">
                          <input type="text" placeholder="Sender Name" value={ledgerForm.sender_name} onChange={(e) => setLedgerForm({...ledgerForm, sender_name: e.target.value})} />
                          <input type="text" placeholder="Receiver Name" value={ledgerForm.receiver_name} onChange={(e) => setLedgerForm({...ledgerForm, receiver_name: e.target.value})} />
                        </div>
                        <button type="submit" className="btn-navy full-width mt-10">Post to Ledger</button>
                      </form>
                    </div>
                  )}

                  {/* Records Table */}
                  {managingRecordsFor === p.account?.id && (
                    <div className="inline-form-box border-purple">
                      <div className="box-header"><h4 style={{ color: '#8b5cf6' }}>Manage Records</h4><button onClick={() => setManagingRecordsFor(null)}><X size={18}/></button></div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '500px' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                              <th>Timestamp</th><th>Description</th><th>Sender</th><th>Receiver</th><th>Ref</th><th>Before</th><th>After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userTransactions.map(tx => (
                              <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td><input type="text" defaultValue={tx.created_at} onBlur={(e) => updateTransactionRecord(tx.id, 'created_at', e.target.value)} className="mini-input"/></td>
                                <td><input type="text" defaultValue={tx.description} onBlur={(e) => updateTransactionRecord(tx.id, 'description', e.target.value)} className="mini-input"/></td>
                                <td><input type="text" defaultValue={tx.sender_name} onBlur={(e) => updateTransactionRecord(tx.id, 'sender_name', e.target.value)} className="mini-input"/></td>
                                <td><input type="text" defaultValue={tx.receiver_name} onBlur={(e) => updateTransactionRecord(tx.id, 'receiver_name', e.target.value)} className="mini-input"/></td>
                                <td><input type="text" defaultValue={tx.transaction_ref} onBlur={(e) => updateTransactionRecord(tx.id, 'transaction_ref', e.target.value)} className="mini-input"/></td>
                                <td><input type="number" step="0.01" defaultValue={tx.balance_before} onBlur={(e) => updateTransactionRecord(tx.id, 'balance_before', e.target.value)} className="mini-input"/></td>
                                <td><input type="number" step="0.01" defaultValue={tx.balance_after} onBlur={(e) => updateTransactionRecord(tx.id, 'balance_after', e.target.value)} className="mini-input"/></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MAGICAL CSS INJECTION: Transforms Desktop Table to Mobile Cards */}
      <style>
        {`
          /* Base Desktop Styles */
          .admin-table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
          .admin-table th { padding: 16px; background-color: #000080; color: white; font-weight: 600; }
          .admin-table td { padding: 20px 16px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
          .active-row { background-color: #f8fafc; }
          
          .mobile-balance-display { display: none; }
          
          /* Button Layouts */
          .action-group { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; }
          .security-group { display: flex; gap: 8px; flex-wrap: wrap; background-color: #f8fafc; padding: 12px; border-radius: 10px; border: 1px dashed #cbd5e1; }
          
          /* Button Styles */
          .action-group button, .security-group button { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; display: flex; alignItems: center; gap: 6px; fontSize: 13px; font-weight: 600; color: white; transition: opacity 0.2s; }
          .action-group button:hover, .security-group button:hover { opacity: 0.8; }
          .action-group button.active, .security-group button.active { background-color: #475569 !important; }
          
          .btn-dark { background-color: #334155; }
          .btn-green { background-color: #10b981; }
          .btn-purple { background-color: #8b5cf6; }
          .btn-red { background-color: #ef4444; }
          .btn-orange { background-color: #f59e0b; }
          .btn-blue { background-color: #3b82f6; }
          .btn-indigo { background-color: #6366f1; }
          .btn-navy { background-color: #000080; color: white; border: none; border-radius: 6px; padding: 10px; cursor: pointer; font-weight: bold; }
          
          /* Inline Forms */
          .inline-form-box { margin-top: 15px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .border-blue { border: 2px solid #3b82f6; }
          .border-navy { border: 2px solid #000080; }
          .border-purple { border: 2px solid #8b5cf6; }
          .box-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .box-header h4 { margin: 0; }
          .box-header button { background: none; border: none; cursor: pointer; color: #64748b; }
          
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .form-grid input, .form-grid select, .full-width { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: 100%; box-sizing: border-box; }
          .mt-10 { margin-top: 15px; display: flex; justify-content: center; align-items: center; gap: 8px; }
          
          .mini-input { width: 100%; padding: 4px 6px; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box; }

          /* =========================================
             MOBILE RESPONSIVE BREAKPOINT (CARD UI)
             ========================================= */
          @media (max-width: 850px) {
            .admin-table-container { background: transparent; box-shadow: none; border-radius: 0; }
            .admin-table, .admin-table tbody, .admin-table tr, .admin-table td { display: block; width: 100%; box-sizing: border-box; }
            .admin-table thead { display: none; } /* Hide the top table header row */
            
            /* Transform rows into floating cards */
            .admin-table tr {
              margin-bottom: 25px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              background: #fff;
              box-shadow: 0 8px 20px rgba(0,0,0,0.06);
              overflow: hidden;
            }
            .admin-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
            .admin-table td:last-child { border-bottom: none; background-color: #fafaf9; }
            
            /* Hide the dedicated desktop balance column */
            .desktop-balance-col { display: none !important; }
            
            /* Show the mobile balance inline with the account number */
            .mobile-flex-row { display: flex; justify-content: space-between; align-items: flex-start; }
            .mobile-balance-display { display: block; font-size: 22px; font-weight: 800; color: #000080; }
            
            /* Convert buttons into a strict, perfectly aligned 2-column grid */
            .action-group, .security-group {
              display: grid !important;
              grid-template-columns: 1fr 1fr;
              gap: 12px !important;
            }
            .action-group button, .security-group button {
              width: 100% !important;
              justify-content: center;
              padding: 12px !important;
              font-size: 14px;
            }
            /* Make the first button span full width if it's odd */
            .action-group button:first-child:nth-last-child(odd) {
              grid-column: span 2;
            }
            
            /* Fix inline form grids for very small screens */
            .form-grid { grid-template-columns: 1fr; }
          }
        `}
      </style>
    </div>
  );
};