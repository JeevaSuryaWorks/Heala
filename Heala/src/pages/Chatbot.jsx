import React, { useState } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Heala AI. How can I assist you with your health today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botMsg = { role: 'assistant', content: "I'm a simulation of the Heala AI. In a production environment, I would process your query about '" + input + "' using our medical LLM to provide tailored advice." };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem 2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '800px', width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)' }}>
                
                <header style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>Heala AI Assistant</h2>
                    <p style={{ margin: '0.3rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Always online for your medical queries.</p>
                </header>

                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ 
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            padding: '1.2rem',
                            borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                            background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            border: msg.role === 'assistant' ? '1px solid var(--glass-border)' : 'none'
                        }}>
                            {msg.content}
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ alignSelf: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: '800' }}>
                            Heala AI is thinking...
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about symptoms, medicines, or healthy habits..."
                        style={{ flex: 1, padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '18px', color: 'var(--color-text-primary)', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '1rem 2rem', borderRadius: '18px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.3)' }}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
