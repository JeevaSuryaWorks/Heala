import React from 'react';

const Payments = () => {
    const transactions = [
        { id: 'TXN-001', date: '2026-03-10', doctor: 'Dr. Gobika', amount: 150, status: 'Completed' },
        { id: 'TXN-002', date: '2026-02-28', doctor: 'Dr. Sarah Smith', amount: 120, status: 'Completed' },
        { id: 'TXN-003', date: '2026-02-15', doctor: 'Dr. James Wilson', amount: 200, status: 'Refunded' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>
                        Financial History<span style={{ color: 'var(--color-primary)' }}>.</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', fontWeight: '600' }}>Manage your consultation invoices and payment records.</p>
                </header>

                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Transaction ID</th>
                                <th style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipient</th>
                                <th style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                <th style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</th>
                                <th style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(txn => (
                                <tr key={txn.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: '800', fontFamily: 'monospace' }}>{txn.id}</td>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: '700' }}>{txn.doctor}</td>
                                    <td style={{ padding: '1.5rem 2rem', color: 'var(--color-text-secondary)' }}>{txn.date}</td>
                                    <td style={{ padding: '1.5rem 2rem', fontWeight: '900', color: 'var(--color-primary)' }}>₹{txn.amount}</td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <span style={{ 
                                            padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900',
                                            background: txn.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: txn.status === 'Completed' ? '#10b981' : '#ef4444'
                                        }}>{txn.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '3rem', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))', borderRadius: '32px', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: '700' }}>Need help with a payment? <button style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' }}>Contact Financial Support</button></p>
                </div>
            </div>
        </div>
    );
};

export default Payments;
