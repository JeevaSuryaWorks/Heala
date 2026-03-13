import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side demo
});

const Chatbot = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [knowledgeBase, setKnowledgeBase] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchInitialData = async () => {
        try {
            // 1. Fetch Knowledge Base
            const { data: kb } = await supabase.from('knowledge_base').select('*');
            setKnowledgeBase(kb || []);

            // 2. Fetch Logs
            const { data: logs } = await supabase
                .from('chatbot_logs')
                .select('*')
                .eq('profile_id', user.id)
                .order('created_at', { ascending: true });

            if (logs && logs.length > 0) {
                setMessages(logs.map(l => ({ role: l.role, content: l.message })));
            } else {
                setMessages([{ 
                    role: 'assistant', 
                    content: "Hello! I am **Healia**, your health assistant from **JS Corporations**. How can I help you today?" 
                }]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsgContent = input;
        const userMessage = { role: 'user', content: userMsgContent };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Save user message to Supabase
            await supabase.from('chatbot_logs').insert({
                profile_id: user.id,
                message: userMsgContent,
                role: 'user'
            });

            // Prepare KB context
            const kbContext = knowledgeBase.map(k => `${k.topic}: ${k.content}`).join('\n');

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are Healia, a medical AI assistant from JS Corporations. 
                        JS Corporations was founded by Gobika Rangasamy.
                        Use the following knowledge base if relevant:
                        ${kbContext}
                        You are helpful, professional, and empathetic. 
                        Always prioritize patient safety.
                        If asked "who is JS?", you must reply: "JS is Jeevasurya, the visionary Founder of JS CORPORATIONS and the lead developer of the Heala platform."
                        If asked medical questions, provide general information but explicitly state: "Please consult a professional doctor for specific medical advice."
                        Current user is: ${user?.name || 'Guest'}.`
                    },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    userMessage
                ],
                model: "llama-3.3-70b-versatile",
            });

            const assistantMsgContent = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
            const assistantMessage = { role: 'assistant', content: assistantMsgContent };
            
            // Save assistant message to Supabase
            await supabase.from('chatbot_logs').insert({
                profile_id: user.id,
                message: assistantMsgContent,
                role: 'assistant'
            });

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Groq/Supabase Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm having trouble connecting to my brain. Please check your internet or retry later." 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 80px)', 
            background: 'var(--color-bg-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '900px', 
                height: '80vh', 
                background: 'var(--glass-bg)', 
                backdropFilter: 'blur(30px)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: '40px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <header style={{ 
                    padding: '2rem 3rem', 
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'var(--color-primary)', 
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)'
                    }}>
                        ✨
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Healia AI</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>By JS Corporations • Founded by Gobika Rangasamy</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>Online</span>
                    </div>
                </header>

                {/* Messages */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '2rem 3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ 
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem'
                        }}>
                            <div style={{ 
                                padding: '1rem 1.5rem',
                                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                                color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                                fontWeight: '600',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                boxShadow: msg.role === 'user' ? '0 10px 20px -5px rgba(139, 92, 246, 0.3)' : 'none'
                                // Removed whiteSpace: 'pre-wrap' as ReactMarkdown handles this better
                            }} className="markdown-content">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            <span style={{ 
                                fontSize: '0.65rem', 
                                color: 'var(--color-text-secondary)', 
                                fontWeight: '800',
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                opacity: 0.8
                            }}>
                                {msg.role === 'user' ? 'You' : 'Healia'}
                            </span>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1,2,3].map(d => <div key={d} style={{ width: '6px', height: '6px', background: 'var(--color-primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: `${d * 0.2}s` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} style={{ 
                    padding: '2rem 3rem', 
                    background: 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        style={{ 
                            flex: 1, 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '18px', 
                            padding: '1.2rem 1.5rem',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={isTyping}
                        style={{ 
                            padding: '0 2rem', 
                            background: 'var(--color-primary)', 
                            color: 'white', 
                            borderRadius: '18px', 
                            border: 'none', 
                            fontWeight: '900',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: isTyping ? 0.5 : 1
                        }}
                    >
                        Send ⚡
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes bounce { 
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                .markdown-content p { margin: 0; }
                .markdown-content ul, .markdown-content ol { margin: 0.5rem 0; padding-left: 1.2rem; }
                .markdown-content li { margin-bottom: 0.3rem; }
                .markdown-content strong { color: inherit; font-weight: 800; }
            `}</style>
        </div>
    );
};

export default Chatbot;
