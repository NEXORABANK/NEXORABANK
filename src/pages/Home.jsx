// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, ChevronRight, Smartphone } from 'lucide-react';

export const Home = () => {
  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Navigation */}
      <nav className="mobile-nav" style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="brand-logo" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield color="#0ea5e9" size={26} className="brand-icon" /> 
          NORTHFUNDS
        </div>
        <div className="nav-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/login" className="login-btn" style={{ color: '#0ea5e9', textDecoration: 'none', padding: '10px 15px', fontWeight: '600', fontSize: '15px' }}>Sign In</Link>
          <Link to="/register" className="register-btn" style={{ backgroundColor: '#059669', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)' }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" style={{ padding: '80px 20px 60px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '25px', letterSpacing: '0.5px' }}>
          <Smartphone size={16} /> UK Standard Mobile Banking
        </div>
        
        <h1 className="hero-title" style={{ fontSize: '48px', margin: '0 0 20px 0', lineHeight: '1.2', fontWeight: '800', color: '#0f172a' }}>
          Manage your wealth with <span style={{ color: '#059669' }}>absolute clarity.</span>
        </h1>
        
        <p className="hero-subtitle" style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Northfunds provides a secure, intuitive digital savings infrastructure. Protect your assets with military-grade encryption and seamless global accessibility.
        </p>

        <Link to="/register" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#059669', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '24px', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)', transition: 'transform 0.2s' }}>
          Get Started Now <ChevronRight size={20} />
        </Link>
      </header>

      {/* Feature Highlights */}
      <section className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', padding: '20px 5% 80px 5%', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#e0f2fe', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Lock color="#0ea5e9" size={24} />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: '700' }}>Bank-Grade Security</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', margin: 0, fontSize: '15px' }}>Advanced cryptographic protocols safeguard your deposits, insulating your funds from external vulnerabilities.</p>
        </div>
        
        <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#d1fae5', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <EyeOff color="#059669" size={24} />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b', fontWeight: '700' }}>Absolute Discretion</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', margin: 0, fontSize: '15px' }}>We operate on a strict privacy-first mandate. Your financial footprint and transaction history remain entirely confidential.</p>
        </div>
      </section>

      {/* MOBILE RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 600px) {
            .mobile-nav { padding: 15px 15px !important; }
            .brand-logo { fontSize: 16px !important; }
            .brand-icon { width: 20px; height: 20px; }
            .nav-actions { gap: 8px !important; }
            .login-btn { padding: 8px 10px !important; font-size: 13px !important; }
            .register-btn { padding: 8px 14px !important; font-size: 13px !important; }
            
            .hero-section { padding: 50px 15px 40px 15px !important; }
            .hero-title { font-size: 36px !important; }
            .hero-subtitle { font-size: 16px !important; }
            .cta-btn { padding: 14px 24px !important; font-size: 15px !important; width: 100%; justify-content: center; box-sizing: border-box; }
            
            .features-grid { padding: 20px 15px 60px 15px !important; }
          }
        `}
      </style>
    </div>
  );
};