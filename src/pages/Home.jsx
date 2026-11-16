// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, ChevronRight } from 'lucide-react';

export const Home = () => {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 50px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1.5px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield color="#10b981" size={28} />
          NORTHFUNDS <span style={{ color: '#10b981', fontWeight: '400' }}>INC.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '10px 20px', fontWeight: '500', transition: 'color 0.2s' }}>Sign In</Link>
          <Link to="/register" style={{ backgroundColor: '#10b981', color: '#020617', textDecoration: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', transition: 'opacity 0.2s' }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Private Digital Wealth Management
        </div>
        
        <h1 style={{ fontSize: '64px', margin: '0 0 24px 0', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-1px' }}>
          Secure your wealth in absolute <span style={{ color: '#10b981' }}>privacy.</span>
        </h1>
        
        <p style={{ fontSize: '20px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
          Northfunds Inc. provides exclusive, encrypted digital savings infrastructure. We protect your assets and your identity with military-grade security and borderless accessibility.
        </p>

        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#10b981', color: '#020617', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '700', transition: 'transform 0.2s', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)' }}>
          Establish Your Account <ChevronRight size={20} />
        </Link>
      </header>

      {/* Feature Highlights */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '40px 50px 100px 50px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <Lock color="#10b981" size={40} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Impenetrable Security</h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Advanced cryptographic protocols safeguard your deposits, ensuring your funds remain insulated from external vulnerabilities.</p>
        </div>
        
        <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <EyeOff color="#10b981" size={40} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Absolute Discretion</h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Your financial footprint is yours alone. We operate on a strict privacy-first mandate to shield your identity and transaction history.</p>
        </div>
      </section>

    </div>
  );
};