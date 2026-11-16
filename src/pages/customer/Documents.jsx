// src/pages/customer/Documents.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Upload, File } from 'lucide-react';

export const Documents = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [profile]);

  const fetchDocuments = async () => {
    if (profile?.id) {
      const { data } = await supabase.from('documents').select('*').eq('user_id', profile.id).order('uploaded_at', { ascending: false });
      setDocuments(data || []);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    // Simulate upload delay and save record to database
    await supabase.from('documents').insert([{
      user_id: profile.id,
      filename: file.name,
      status: 'Pending Review'
    }]);

    alert(`${file.name} uploaded successfully!`);
    fetchDocuments();
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h2 style={{ color: '#000080' }}>Document Center</h2>
      <p style={{ color: '#555' }}>Upload your KYC documents for verification.</p>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
          <Upload size={40} color="#000080" style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: '0 0 10px 0' }}>Upload a New Document</h3>
          <p style={{ color: '#777', marginBottom: '20px' }}>JPG, PNG, or PDF format</p>
          
          <label style={{ padding: '12px 24px', backgroundColor: '#000080', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Uploading...' : 'Select File'}
            <input type="file" onChange={handleUpload} disabled={loading} style={{ display: 'none' }} accept=".jpg,.png,.pdf" />
          </label>
        </div>
      </div>

      <h3 style={{ color: '#333' }}>Your Uploaded Files</h3>
      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f1c40f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <File color="#555" />
                <strong>{doc.filename}</strong>
              </div>
              <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};