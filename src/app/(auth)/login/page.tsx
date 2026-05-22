'use client';

import { useState, FormEvent, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

// SVG Icons
const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show ? (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const { login, loginWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleResponse = async (response: any) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await loginWithGoogle?.(response.credential);
            if (result?.success) {
                router.push('/dashboard');
            } else {
                setError(result?.error || 'Google login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred during Google Auth');
        } finally {
            setIsLoading(false);
        }
    };

    // Called by Next.js <Script onLoad> once the GSI SDK is ready
    const handleGsiLoad = useCallback(() => {
        const win = window as any;
        if (!win.google) return;
        win.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleResponse,
        });
        win.google.accounts.id.renderButton(
            document.getElementById('google-btn-container') as HTMLElement,
            { theme: 'outline', size: 'large', type: 'standard', shape: 'rectangular', text: 'continue_with' }
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                className={styles.page}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11L12 14L22 4" />
                                    <path d="M21 12V19C21 19.5304 20.7893 20.4142 20.4142 20.7893C20.0391 21 19.5304 21 19 21H5C4.46957 21 3.96086 21 3.58579 20.7893C3.21071 20.4142 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" />
                                </svg>
                            </div>
                        </div>
                        <h2 className={styles.title}>Welcome back</h2>
                        <p className={styles.subtitle}>Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className={`${styles.validationMessage} ${styles.errorText}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </motion.div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.forgotPassword}>
                                <label className={styles.label}>Password</label>
                                <Link href="/forgot-password" className={styles.forgotLink}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button"
                                    className={styles.inputIconRight}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <EyeIcon show={showPassword} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.checkboxGroup} style={{ marginTop: '4px' }}>
                            <input type="checkbox" id="remember" className={styles.checkbox} />
                            <label htmlFor="remember" className={styles.checkboxLabel}>Remember me</label>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.primaryButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.divider}>or continue with</div>

                    {/* Google Auth Container */}
                    {/* Next.js Script with strategy="lazyOnload" ensures the
                        browser emits a proper <link rel="preload" as="script">
                        (fixes the "missing as value" console warning) and
                        runs onLoad after the GSI SDK is fully parsed. */}
                    <Script
                        src="https://accounts.google.com/gsi/client"
                        strategy="lazyOnload"
                        onLoad={handleGsiLoad}
                    />
                    <div id="google-btn-container" style={{ display: 'flex', justifyContent: 'center' }}></div>

                    <div className={styles.footer}>
                        Don't have an account?{' '}
                        <Link href="/signup" className={styles.footerLink}>
                            Create one
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
