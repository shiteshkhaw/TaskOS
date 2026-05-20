'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
            } else {
                setSuccess(true);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9 11L12 14L22 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className={styles.logoText}>TaskGuru</span>
            </div>

            {/* Forgot Password Card */}
            <Card variant="glass" padding="lg" className={styles.card}>
                <CardHeader>
                    <CardTitle className={styles.title}>Forgot password?</CardTitle>
                    <CardDescription className={styles.description}>
                        {success
                            ? 'Check your email for a reset link'
                            : 'Enter your email and we\'ll send you a reset link'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                margin: '0 auto var(--space-4)',
                                background: 'rgb(34 197 94 / 0.1)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--success-500)'
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                We&apos;ve sent a password reset link to <strong>{email}</strong>
                            </p>
                            <Button variant="secondary" fullWidth onClick={() => setSuccess(false)}>
                                Send another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && (
                                <div className={styles.error}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                leftIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                }
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Back to login */}
            <p className={styles.signupLink}>
                Remember your password?{' '}
                <Link href="/login">Sign in</Link>
            </p>
        </div>
    );
}
