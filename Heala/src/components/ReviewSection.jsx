import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

const ReviewSection = ({ doctorId, doctorName }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [doctorId]);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(name)')
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false });

        if (data) {
            setReviews(data);
            if (data.length > 2) generateAiSummary(data);
        }
    };

    const generateAiSummary = async (reviewList) => {
        setLoadingSummary(true);
        try {
            const reviewsText = reviewList.map(r => `[Rating: ${r.rating}/5] ${r.comment}`).join('\n');
            const completion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "You are a medical analyst. Provide a professional, concise (2 sentences max) summary of patient sentiment for this doctor based on the following reviews." 
                    },
                    { role: "user", content: reviewsText }
                ],
                model: "llama-3.3-70b-versatile",
            });
            setAiSummary(completion.choices[0]?.message?.content);
        } catch (error) {
            console.error('AI Summary Error:', error);
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert('Please login to leave a review.');

            const { error } = await supabase
                .from('reviews')
                .insert({
                    doctor_id: doctorId,
                    patient_id: user.id,
                    rating,
                    comment
                });

            if (error) throw error;
            setComment('');
            fetchReviews();
        } catch (error) {
            alert(error.message.includes('unique') ? 'You have already reviewed this specialist.' : 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '4rem' }}>
            {/* AI Summary Header */}
            {reviews.length >= 3 && (
                <div style={{ 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))', 
                    padding: '2.5rem', 
                    borderRadius: '32px', 
                    border: '1px solid var(--glass-border)',
                    marginBottom: '3rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--color-primary)', borderRadius: '50%' }} />
                        AI Analysis Powered by Healia
                    </div>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        ✨ Patient Sentiment Summary
                    </h4>
                    {loadingSummary ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[1,2,3].map(i => <div key={i} style={{ height: '12px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', animation: 'shimmer 2s infinite' }} />)}
                        </div>
                    ) : (
                        <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--color-text-primary)', fontWeight: '600', opacity: 0.9 }} className="markdown-content">
                            <ReactMarkdown>{aiSummary || "Processing patient feedback to provide clinical insights..."}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                {/* Review List */}
                <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem' }}>Experience with Dr. {doctorName.split(' ')[0]}</h3>
                    {reviews.map(r => (
                        <div key={r.id} style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                                {r.profiles?.name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h5 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{r.profiles?.name}</h5>
                                    <div style={{ color: '#fbbf24' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                                </div>
                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontWeight: '600' }}>{r.comment}</p>
                                <footer style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.8rem' }}>
                                    {new Date(r.created_at).toLocaleDateString()}
                                </footer>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: '700' }}>No reviews yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>

                {/* Submit Form */}
                <div style={{ alignSelf: 'start', background: 'var(--glass-bg)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)', position: 'sticky', top: '100px' }}>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '2rem' }}>Leave a Review</h4>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '800' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                {[1,2,3,4,5].map(v => (
                                    <button 
                                        type="button" 
                                        key={v} 
                                        onClick={() => setRating(v)}
                                        style={{ 
                                            width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                            background: rating >= v ? '#fbbf24' : 'transparent',
                                            color: rating >= v ? 'black' : 'white',
                                            fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '800' }}>Your Feedback</label>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us about the consultation..."
                                style={{ width: '100%', minHeight: '120px', padding: '1.2rem', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600' }}
                                required
                            />
                        </div>
                        <button 
                            disabled={isSubmitting}
                            style={{ 
                                padding: '1.2rem', borderRadius: '18px', border: 'none', background: 'var(--gradient-primary)', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
                .markdown-content p { margin: 0; }
                .markdown-content strong { color: inherit; font-weight: 800; }
            `}</style>
        </div>
    );
};

export default ReviewSection;
