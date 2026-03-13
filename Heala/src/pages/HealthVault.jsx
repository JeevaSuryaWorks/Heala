import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';

const HealthVault = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('health_documents')
                .select('*')
                .eq('profile_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `vault/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('health-vault')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Save metadata to health_documents table
            const { error: metaError } = await supabase
                .from('health_documents')
                .insert({
                    profile_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    file_size: file.size
                });

            if (metaError) throw metaError;

            fetchDocuments();
            alert('Document uploaded successfully to your secure vault!');
        } catch (error) {
            console.error('Upload Error:', error.message);
            alert('Failed to upload document. Please ensure the "health-vault" storage bucket exists.');
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (id, filePath) => {
        if (!confirm('Are you sure you want to remove this document?')) return;

        try {
            // Delete from storage
            await supabase.storage.from('health-vault').remove([filePath]);
            
            // Delete from table
            const { error } = await supabase.from('health_documents').delete().eq('id', id);
            if (error) throw error;

            fetchDocuments();
        } catch (error) {
            console.error('Delete Error:', error.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem 2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '1rem', letterSpacing: '-1px' }}>Health Vault</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Secure, encrypted storage for your medical life.</p>
                    </div>
                    <label style={{ 
                        background: 'var(--color-primary)', 
                        color: 'white', 
                        padding: '1rem 2rem', 
                        borderRadius: '18px', 
                        fontWeight: '900', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
                        transition: 'all 0.3s ease'
                    }}>
                        {uploading ? 'Uploading...' : '⚡ Upload Document'}
                        <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {documents.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem', background: 'var(--glass-bg)', borderRadius: '40px', border: '2px dashed var(--glass-border)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📁</div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem' }}>Your Vault is Empty</h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontWeight: '700' }}>Keep your prescriptions, MRI scans, and lab results safe here.</p>
                            </div>
                        ) : (
                            documents.map(doc => (
                                <div key={doc.id} style={{ 
                                    background: 'var(--glass-bg)', 
                                    backdropFilter: 'blur(10px)', 
                                    padding: '2rem', 
                                    borderRadius: '32px', 
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.2rem',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', 
                                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
                                        }}>
                                            {doc.file_type?.includes('pdf') ? '📄' : '📷'}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.file_name}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                                                {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                                        <button 
                                            onClick={async () => {
                                                const { data, error } = await supabase.storage.from('health-vault').createSignedUrl(doc.file_path, 60);
                                                if (data) window.open(data.signedUrl, '_blank');
                                            }}
                                            style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            View
                                        </button>
                                        <button 
                                            onClick={() => deleteDocument(doc.id, doc.file_path)}
                                            style={{ padding: '0.8rem 1rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '14px', color: 'var(--color-error)', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default HealthVault;
