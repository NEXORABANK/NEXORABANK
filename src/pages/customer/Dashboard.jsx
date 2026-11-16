// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Shield, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;
      
      try {
        // 1. Fetch live account details for the logged-in user
        const { data: accData, error: accError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', profile.id)
          .single();
          
        if (accError && accError.code !== 'PGRST116') throw accError;
        setAccount(accData);

        // 2. Fetch transaction history if account exists
        if (accData) {
          // Fetch transactions where the user is either the sender OR the receiver
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .or(`sender_account_id.eq.${accData.id},receiver_account_number.eq.${accData.account_number}`)
            .order('created_at', { ascending: false })
            .limit(5); // Show last 5 on dashboard
            
          if (txData) setTransactions(txData);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Decrypting vault...</div>;
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0ea5e9' }} />
        ) : (
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', fontSize: '24px', fontWeight: 'bold' }}>
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        )}
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>
            Welcome, {profile?.full_name || 'Client'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={14} color="#059669" /> Secure Session Active
          </p>
        </div>
      </div>

      {/* Account Locked Warning */}
      {account?.status === 'locked' && (
        <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '25px', fontWeight: '600' }}>
          <AlertCircle size={20} />
          Your account is currently locked. Outbound transfers are disabled.
        </div>
      )}

      {/* Main Balance Card */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '30px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)' }}>
        
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '120px', height: '120px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</p>
          
          <h2 style={{ margin: '0 0 25px 0', fontSize: '42px', fontWeight: '800', letterSpacing: '-1px' }}>
            £ {account ? Number(account.balance).toLocaleString('en-GB', {minimumFractionDigits: 2}) : '0.00'}
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '12px' }}>Checking Account</p>
              <p style={{ margin: 0, fontSize: '16px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {account ? account.account_number.match(/.{1,4}/g).join(' ') : '---- ---- ----'}
              </p>
            </div>
            
            <Link to="/transfer" style={{ backgroundColor: '#059669', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
              <ArrowUpRight size={16} /> Send Money
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#0ea5e9" /> Recent Transactions
          </h3>
          <Link to="/statement" style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>View All</Link>
        </div>

        {!account ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
            Your account is currently being provisioned. Please check back shortly.
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
            <Wallet size={32} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            No transactions found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {transactions.map(tx => {
              // Determine if this user is the sender (outflow) or receiver (inflow)
              const isOutflow = tx.sender_account_id === account.id;
              
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: isOutflow ? '#fef2f2' : '#d1fae5', padding: '10px', borderRadius: '12px' }}>
                      {isOutflow ? <ArrowUpRight size={20} color="#ef4444" /> : <ArrowDownLeft size={20} color="#059669" />}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#1e293b', fontWeight: '700', fontSize: '15px' }}>
                        {isOutflow ? `To: ${tx.receiver_name}` : `From: ${tx.bank_name}`}
                      </p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                        {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {tx.type === 'internal' ? 'Internal' : 'External'} Transfer
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '16px', color: isOutflow ? '#1e293b' : '#059669' }}>
                      {isOutflow ? '-' : '+'}£{Number(tx.amount).toLocaleString('en-GB', {minimumFractionDigits: 2})}
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                      {tx.reference}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};