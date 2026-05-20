'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api-client';
import { Button, Card, Spinner } from '@/components/ui';
import styles from './AICoachPanel.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const MarkdownText = ({ content }: { content: string }) => {
    // Basic markdown-like parser for bold and line breaks
    const lines = content.split('\n');
    return (
        <>
            {lines.map((line, i) => {
                // Process bold **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} style={{ marginBottom: i === lines.length - 1 ? 0 : '0.5rem' }}>
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </>
    );
};

export function AICoachPanel() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m your TaskOS Productivity Coach. How can I help you optimize your day?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-ai-coach', handleToggle);
        return () => window.removeEventListener('toggle-ai-coach', handleToggle);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading || !user?.email) return;

        const userMsg = prompt.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setPrompt('');
        setIsLoading(true);

        try {
            const res = await api.post<{ reply: string }>('/api/ai/coach', {
                email: user.email,
                prompt: userMsg
            });

            const data = res?.data;
            if (data && data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (err) {
            console.error('AI Coach Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit a snag. Let\'s try that again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
            {/* Floating Toggle Button */}
            <button 
                className={styles.toggleBtn} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Coach"
            >
                <div className={styles.botIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8V4m0 0L8 8m4-4l4 4m-4 8v4m0 0l-4-4m4 4l4-4M4 12h4m0 0l4-4m-4 4l4 4m8-4h4m0 0l-4-4m4 4l-4 4" />
                    </svg>
                </div>
                <span className={styles.toggleLabel}>AI Coach</span>
            </button>

            {/* Chat Panel */}
            <Card className={styles.panel} variant="elevated">
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.statusDot} />
                        <div>
                            <h3>Productivity Coach</h3>
                            <span className={styles.headerSubtitle}>Neural Feedback Active</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className={styles.chatWindow}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                            <div className={styles.bubble}>
                                <MarkdownText content={msg.content} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.message} ${styles.assistant}`}>
                            <div className={`${styles.bubble} ${styles.loadingBubble}`}>
                                <Spinner size="sm" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!prompt.trim() || isLoading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
            </Card>
        </div>
    );
}
