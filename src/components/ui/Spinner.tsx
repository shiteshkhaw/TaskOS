'use client';

import styles from './Spinner.module.css';

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'current';
    className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
    return (
        <div
            className={`${styles.spinner} ${styles[size]} ${styles[color]} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.25"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="12"
                />
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className={styles.overlay}>
            <div className={styles.overlayContent}>
                <Spinner size="lg" />
                <span className={styles.overlayMessage}>{message}</span>
            </div>
        </div>
    );
}
