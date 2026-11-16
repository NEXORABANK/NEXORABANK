// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, Smartphone, ArrowRight } from 'lucide-react';

export const Home = () => {
  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Home Navigation */}
      <header style={{ backgroundColor: '#0a192f', padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <h2 style={{ margin: 0, color: '#ffd700', fontSize: '24px', letterSpacing: '1px' }}>NEXORA BANK</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: 'white', padding: '10px 20px', fontWeight: 'bold' }}>Sign In</Link>
          <Link to="/register" style={{ textDecoration: 'none', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>Open Account</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', backgroundColor: '#0a192f', color: 'white' }}>
        <h1 style={{ fontSize: '56px', margin: '0 0 20px 0', maxWidth: '800px', lineHeight: '1.2', fontWeight: '900' }}>
          Secure, Global Banking for the Modern Era.
        </h1>
        <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '600px', margin: '0 0 40px 0', lineHeight: '1.6' }}>
          Experience borderless transfers, top-tier security, and 24/7 account management from anywhere in the world.
        </p>
        <Link to="/register" style={{ textDecoration: 'none', backgroundColor: '#ffd700', color: '#0a192f', padding: '15px 30px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)' }}>
          Get Started <ArrowRight size={20} />
        </Link>
      </main>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', backgroundColor: 'white' }}>
        <FeatureCard 
          icon={ShieldCheck} color="#10b981" 
          title="Bank-Grade Security" 
          desc="Your funds and personal data are protected by industry-leading encryption and strict access protocols." 
        />
        <FeatureCard 
          icon={Globe} color="#3b82f6" 
          title="Borderless Transfers" 
          desc="Move money seamlessly across local and international networks with our instant routing technology." 
        />
        <FeatureCard 
          icon={Smartphone} color="#8b5cf6" 
          title="Anywhere Access" 
          desc="Fully optimized for mobile and desktop, your digital branch is always open, 24/7." 
        />
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#64748b', padding: '40px 20px', textAlign: 'center', fontSize: '14px' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Nexora Bank. All rights reserved.</p>
        <p style={{ margin: '10px 0 0 0' }}>Support: support@at.online</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div style={{ backgroundColor: '#f8fafc', padding: '40px 30px', borderRadius: '16px', maxWidth: '300px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
    <div style={{ backgroundColor: `${color}15`, color: color, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
      <Icon size={30} />
    </div>
    <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '20px' }}>{title}</h3>
    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>{desc}</p>
  </div>
);