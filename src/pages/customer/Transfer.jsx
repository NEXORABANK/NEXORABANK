// src/pages/Transfer.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Send, Search, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const Transfer = () => {
  const { profile } = useAuth();
  const [account, setAccount] = useState(null);
  const [transferType, setTransferType] = useState('internal'); // 'internal' or 'external'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Form State
  const [accNumber, setAccNumber] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      if (!profile) return;
      const { data } = await supabase.from('accounts').select('*').eq('user_id', profile.id).single();
      setAccount(data);
    };
    fetchAccount();
  }, [profile]);

  // Auto-Lookup Function
  const handleAccountInput = async (val) => {
    setAccNumber(val);
    setReceiverName('');
    if (val.length >= 10) {
      const { data } = await supabase.from('public_account_lookup').select('full_name').eq('account_number', val).single();
      if (data) setReceiverName(data.full_name);
      else setReceiverName('Account not found');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account) return;
    if (Number(amount) > Number(account.balance)) {
      setMessage({ type: 'error', text: 'Insufficient funds.' });
      return;
    }
    if (transferType === 'internal' && receiverName === 'Account not found') {
      setMessage({ type: 'error', text: 'Invalid receiving account.' });
      return;
    }

    setLoading(true);
    const ref = 'TRF-' + Math.floor(Math.random() * 900000000);
    const numAmount = Number(amount);

    try {
      // 1. Deduct sender
      await supabase.from('accounts').update({ balance: Number(account.balance) - numAmount }).eq('id', account.id);
      
      // 2. Add to internal receiver (if internal)
      if (transferType === 'internal') {
        const { data: recAcc } = await supabase.from('accounts').select('id, balance').eq('account_number', accNumber).single();
        if (recAcc) {
          await supabase.from('accounts').update({ balance: Number(recAcc.balance) + numAmount }).eq('id', recAcc.id);
        }
      }

      // 3. Log transaction
      await supabase.from('transactions').insert([{
        sender_account_id: account.id,
        receiver_account_number: accNumber,
        receiver_name: transferType === 'internal' ? receiverName : 'External Bank',
        bank_name: transferType === 'internal' ? 'Northfunds' : 'External',
        amount: numAmount,
        type: transferType,
        reference: ref,
        description: desc
      }]);

      setMessage({ type: 'success', text: `Successfully transferred £${numAmount} to ${receiverName || accNumber}` });
      setAccNumber(''); setAmount(''); setDesc(''); setReceiverName('');
      
      // Refresh local balance
      const { data: freshAcc } = await supabase.from('accounts').select('balance').eq('id', account.id).single();
      setAccount(freshAcc);

    } catch (err) {
      setMessage({ type: 'error', text: 'Transfer failed. Please try again.' });
    }
    setLoading(false);
  };

  if (!account) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading vault...</div>;
  if (account.status === 'locked') return (
    <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca' }}>
      <Lock size={48} color="#ef4444" style={{ marginBottom: '15px' }} />
      <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>Account Suspended</h2>
      <p style={{ color: '#7f1d1d' }}>Transfers are locked. Contact support.</p>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '22px', fontWeight: '800' }}>Send Funds</h2>
      
      {/* Transfer Tabs */}
      <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '4px', marginBottom: '25px' }}>
        <button onClick={() => setTransferType('internal')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', backgroundColor: transferType === 'internal' ? '#ffffff' : 'transparent', color: transferType === 'internal' ? '#059669' : '#475569', boxShadow: transferType === 'internal' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
          Northfunds Transfer (Free)
        </button>
        <button onClick={() => setTransferType('external')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', backgroundColor: transferType === 'external' ? '#ffffff' : 'transparent', color: transferType === 'external' ? '#0ea5e9' : '#475569', boxShadow: transferType === 'external' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
          Other Banks
        </button>
      </div>

      {message && (
        <div style={{ padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: message.type === 'error' ? '#fef2f2' : '#d1fae5', color: message.type === 'error' ? '#ef4444' : '#059669' }}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{message.text}</span>
        </div>
      )}

      {/* External Transfer Lockout UI */}
      {transferType === 'external' && !account.allow_external_transfers ? (
        <div className="slide-up" style={{ backgroundColor: '#f8fafc', padding: '40px 20px', textAlign: 'center', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ backgroundColor: '#e0f2fe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Lock size={28} color="#0ea5e9" />
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>External Transfers Disabled</h3>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>For your security, cross-border and external banking transfers require administrative approval. Please contact your account manager for clearance.</p>
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="slide-up" style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Receiver Account Number</label>
            <div style={{ position: 'relative' }}>
              <input type="number" required value={accNumber} onChange={(e) => handleAccountInput(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 40px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} placeholder="10-digit number" />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
            {transferType === 'internal' && receiverName && (
              <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700', color: receiverName === 'Account not found' ? '#ef4444' : '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {receiverName !== 'Account not found' && <CheckCircle size={14} />} {receiverName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Amount (£)</label>
            <input type="number" required min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', fontSize: '18px', fontWeight: 'bold' }} placeholder="0.00" />
            <div style={{ textAlign: 'right', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
              Available Balance: £{Number(account.balance).toLocaleString('en-GB', {minimumFractionDigits:2})}
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Description</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} placeholder="e.g. Invoice Payment" />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {loading ? 'Processing...' : <><Send size={18} /> Send Securely</>}
          </button>
        </form>
      )}

      {/* Animations CSS */}
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in; }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};