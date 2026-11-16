// src/pages/customer/Statement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Printer } from 'lucide-react';

export const Statement = () => {
  const { profile } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatement = async () => {
      if (profile?.id) {
        const { data: accountData } = await supabase.from('accounts').select('*').eq('user_id', profile.id).single();
        if (accountData) {
          setAccount(accountData);
          const { data: txData } = await supabase.from('transactions').select('*').eq('account_id', accountData.id).order('created_at', { ascending: false });
          setTransactions(txData || []);
        }
      }
      setLoading(false);
    };
    fetchStatement();
  }, [profile]);

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-statement, #printable-statement * { visibility: visible; }
            #printable-statement { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
            .watermark {
              position: fixed;
              top: 40%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              color: rgba(0, 0, 128, 0.05);
              z-index: -1;
              pointer-events: none;
              white-space: nowrap;
              font-weight: bold;
            }
          }
        `}
      </style>

      <div id="printable-statement" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'white', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="watermark" style={{ display: 'none' }}>NEXORA BANK</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid #000080', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#000080', fontSize: '28px', fontWeight: '900', letterSpacing: '1px' }}>NEXORA BANK</h1>
            <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>Official Account Statement</p>
            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '12px' }}>Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="no-print">
            <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <Printer size={18} /> Print Document
            </button>
          </div>
        </div>

        {account && (
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Account Holder</h4>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{account.account_name}</p>
              <p style={{ margin: '5px 0 0 0', color: '#555' }}>{profile?.address || 'Address not on file'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Account Summary</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Account Number: <strong>{account.account_number}</strong></p>
              {/* ENDING BALANCE REMOVED AS REQUESTED */}
            </div>
          </div>
        )}

        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000080', color: 'white' }}>
                <th style={{ padding: '12px' }}>Date & Time (Local)</th>
                <th style={{ padding: '12px' }}>Transaction Details</th>
                <th style={{ padding: '12px' }}>Reference ID</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center' }}>Loading records...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center' }}>No transactions found.</td></tr>
              ) : transactions.map(tx => {
                const isCredit = tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'transfer_in';
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isCredit ? 'rgba(46, 204, 113, 0.02)' : 'rgba(231, 76, 60, 0.02)' }}>
                    <td style={{ padding: '12px', color: '#555' }}>{new Date(tx.created_at).toLocaleString()}</td>
                    
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{tx.description || 'Account Transaction'}</div>
                      <div style={{ fontSize: '11px', color: '#777' }}>
                        Sender: {tx.sender_name || 'NEXORA SYSTEM'}<br/>
                        Receiver: {tx.receiver_name || account?.account_name}
                      </div>
                    </td>
                    
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>{tx.transaction_ref || 'SYS-LEGACY-TX'}</td>
                    
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: isCredit ? '#155724' : '#721c24' }}>
                      {isCredit ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#888' }}>
          <p>*** END OF STATEMENT ***</p>
          <p>If you have any questions regarding this statement, please contact Nexora Bank Customer Support.</p>
        </div>
      </div>
    </>
  );
};