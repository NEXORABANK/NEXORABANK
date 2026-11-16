// src/pages/customer/Transfer.jsx
import { useState, useEffect } from 'react';
import { Send, UserCheck, AlertCircle, Building, ArrowDownToLine, ShieldAlert, Headset, ArrowRightLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Transfer = () => {
  const { profile } = useAuth();
  const navigate = useNavigate(); // Hook to handle the back navigation
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Tab Management: 'internal', 'external', 'withdrawal'
  const [activeTab, setActiveTab] = useState('internal');
  
  // Form States
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Internal Resolution
  const [recipientData, setRecipientData] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      if (profile?.id) {
        const { data } = await supabase.from('accounts').select('*').eq('user_id', profile.id).single();
        setAccount(data);
      }
      setLoading(false);
    };
    fetchAccount();
  }, [profile]);

  // Live Internal Name Resolution
  useEffect(() => {
    const resolveAccount = async () => {
      if (activeTab === 'internal' && recipientNumber.length === 10) {
        setLookingUp(true);
        const { data, error } = await supabase.from('accounts').select('id, account_name, balance').eq('account_number', recipientNumber).single();
        setRecipientData(data && !error ? data : null);
        setLookingUp(false);
      } else {
        setRecipientData(null);
      }
    };
    resolveAccount();
  }, [recipientNumber, activeTab]);

  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);

    if (!account) return setMessage({ type: 'error', text: 'Transfer Failed: No active account.' });
    if (!recipientData) return setMessage({ type: 'error', text: 'Transfer Failed: Invalid recipient.' });
    if (recipientNumber === account.account_number) return setMessage({ type: 'error', text: 'Cannot transfer to yourself.' });
    
    const transferAmount = parseFloat(amount);
    if (transferAmount > account.balance) {
      setLoading(false); return setMessage({ type: 'error', text: `Insufficient funds.` });
    }

    // Generate a believable 12-digit transaction reference
    const txRef = 'NEX' + Math.floor(100000000 + Math.random() * 900000000).toString();

    const senderBalanceBefore = Number(account.balance);
    const newSenderBal = senderBalanceBefore - transferAmount;
    
    const receiverBalanceBefore = Number(recipientData.balance);
    const newReceiverBal = receiverBalanceBefore + transferAmount;

    await supabase.from('accounts').update({ balance: newSenderBal }).eq('id', account.id);
    await supabase.from('accounts').update({ balance: newReceiverBal }).eq('id', recipientData.id);

    // Log Sender Transaction (Debit)
    await supabase.from('transactions').insert([{ 
      account_id: account.id, type: 'transfer_out', amount: transferAmount, 
      description: description || `Transfer to ${recipientData.account_name}`,
      transaction_ref: txRef, sender_name: account.account_name, receiver_name: recipientData.account_name,
      balance_before: senderBalanceBefore, balance_after: newSenderBal
    }]);
    
    // Log Receiver Transaction (Credit)
    await supabase.from('transactions').insert([{ 
      account_id: recipientData.id, type: 'transfer_in', amount: transferAmount, 
      description: description || `Transfer from ${account.account_name}`,
      transaction_ref: txRef, sender_name: account.account_name, receiver_name: recipientData.account_name,
      balance_before: receiverBalanceBefore, balance_after: newReceiverBal
    }]);

    setMessage({ type: 'success', text: `Successfully transferred $${transferAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${recipientData.account_name}.` });
    setAmount(''); setRecipientNumber(''); setDescription(''); setRecipientData(null);
    setAccount({ ...account, balance: newSenderBal });
    setLoading(false);
  };

  const handleSimulatedExternalAction = (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    
    const transferAmount = parseFloat(amount);
    if (transferAmount > account.balance) {
      setLoading(false); return setMessage({ type: 'error', text: `Insufficient funds.` });
    }

    setTimeout(() => {
      setMessage({ type: 'error', text: 'Transaction Failed: External routing is currently unavailable. Please contact support.' });
      setLoading(false);
    }, 2000);
  };

  const renderLockedAlert = (featureName) => (
    <div style={{ backgroundColor: '#fdf2f2', border: '1px solid #f87171', borderRadius: '12px', padding: '30px', textAlign: 'center', marginTop: '20px' }}>
      <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 15px auto' }} />
      <h3 style={{ margin: '0 0 10px 0', color: '#7f1d1d', fontSize: '20px' }}>{featureName} Restricted</h3>
      <p style={{ margin: '0 0 20px 0', color: '#991b1b', fontSize: '15px', lineHeight: '1.5' }}>
        For your security, this feature is currently locked on your account. Please contact customer care to verify your identity and enable this service.
      </p>
      <button onClick={() => alert("Connecting to 24/7 Support. Please call 1-800-NEXORA-BANK")} style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
        <Headset size={18} /> Contact Customer Care
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Header with Close Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#0a192f', fontSize: '28px', margin: '0 0 5px 0' }}>Transfer & Withdraw</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Available Balance: <strong style={{ color: '#000080', fontSize: '18px' }}>${account ? Number(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</strong></p>
        </div>
        
        {/* Close Button back to Dashboard */}
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' }} 
          title="Back to Dashboard"
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <X size={22} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <button onClick={() => {setActiveTab('internal'); setMessage(null);}} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s', backgroundColor: activeTab === 'internal' ? '#0a192f' : 'transparent', color: activeTab === 'internal' ? 'white' : '#64748b' }}>
          <ArrowRightLeft size={16} /> Nexora Transfer
        </button>
        <button onClick={() => {setActiveTab('external'); setMessage(null);}} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s', backgroundColor: activeTab === 'external' ? '#0a192f' : 'transparent', color: activeTab === 'external' ? 'white' : '#64748b' }}>
          <Building size={16} /> Other Banks
        </button>
        <button onClick={() => {setActiveTab('withdrawal'); setMessage(null);}} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s', backgroundColor: activeTab === 'withdrawal' ? '#0a192f' : 'transparent', color: activeTab === 'withdrawal' ? 'white' : '#64748b' }}>
          <ArrowDownToLine size={16} /> Withdraw
        </button>
      </div>

      {message && (
        <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
          <strong>Notice:</strong> {message.text}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        
        {/* TAB 1: INTERNAL TRANSFER */}
        {activeTab === 'internal' && (
          <form onSubmit={handleInternalTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Nexora Account Number</label>
              <input type="text" required value={recipientNumber} onChange={(e) => setRecipientNumber(e.target.value.replace(/\D/g, ''))} placeholder="10-digit account number" maxLength="10" style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
              {lookingUp && <div style={{ marginTop: '5px', fontSize: '13px', color: '#64748b' }}>Looking up account...</div>}
              {!lookingUp && recipientNumber.length === 10 && recipientData && (
                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <UserCheck size={16} /> Verified: {recipientData.account_name}
                </div>
              )}
              {!lookingUp && recipientNumber.length === 10 && !recipientData && (
                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <AlertCircle size={16} /> Account not found
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Amount (USD)</label>
              <input type="number" required min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Rent" style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading || !recipientData} style={{ padding: '15px', backgroundColor: (loading || !recipientData) ? '#94a3b8' : '#0a192f', color: 'white', border: 'none', borderRadius: '8px', cursor: (loading || !recipientData) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold' }}>
              <Send size={20} /> {loading ? 'Processing...' : 'Send Transfer'}
            </button>
          </form>
        )}

        {/* TAB 2: EXTERNAL TRANSFER */}
        {activeTab === 'external' && account?.external_transfer_locked ? renderLockedAlert("External Transfers") : activeTab === 'external' && (
          <form onSubmit={handleSimulatedExternalAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Destination Bank Name</label>
              <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Chase, Bank of America" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Account Number</label>
              <input type="text" required placeholder="Recipient Account" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Routing Number</label>
              <input type="text" required placeholder="9-digit routing number" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Amount (USD)</label>
              <input type="number" required min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '15px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Processing...' : 'Send Wire/ACH Transfer'}
            </button>
          </form>
        )}

        {/* TAB 3: WITHDRAWAL */}
        {activeTab === 'withdrawal' && account?.withdrawal_locked ? renderLockedAlert("Withdrawals") : activeTab === 'withdrawal' && (
          <form onSubmit={handleSimulatedExternalAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Withdraw funds directly to your linked local bank account. Standard processing times (1-3 business days) apply.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Select Linked Local Bank</label>
              <select style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'white' }}>
                <option>Local Bank Ending in **3942</option>
                <option>Local Savings Ending in **1102</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Amount to Withdraw (USD)</label>
              <input type="number" required min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '15px', backgroundColor: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Processing...' : 'Initiate Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};