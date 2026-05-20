'use client';

import { useEffect, useRef, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    showCloseButton = true,
    children,
    className = '',
    ...props
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle click outside
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    // Focus trap
    useEffect(() => {
        if (isOpen && contentRef.current) {
            const focusableElements = contentRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            firstElement?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            ref={overlayRef}
            className={styles.overlay}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
        >
            <div
                ref={contentRef}
                className={`${styles.content} ${styles[size]} ${className}`}
                {...props}
            >
                {(title || showCloseButton) && (
                    <div className={styles.header}>
                        <div className={styles.headerText}>
                            {title && (
                                <h2 id="modal-title" className={styles.title}>
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-description" className={styles.description}>
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> { }

export function ModalFooter({ children, className = '', ...props }: ModalFooterProps) {
    return (
        <div className={`${styles.footer} ${className}`} {...props}>
            {children}
        </div>
    );
}
