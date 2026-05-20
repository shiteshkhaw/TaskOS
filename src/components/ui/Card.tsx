'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            variant = 'default',
            padding = 'md',
            hoverable = false,
            className = '',
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${hoverable ? styles.hoverable : ''
                    } ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ children, className = '', ...props }, ref) => (
        <div ref={ref} className={`${styles.header} ${className}`} {...props}>
            {children}
        </div>
    )
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ children, className = '', ...props }, ref) => (
        <h3 ref={ref} className={`${styles.title} ${className}`} {...props}>
            {children}
        </h3>
    )
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ children, className = '', ...props }, ref) => (
        <p ref={ref} className={`${styles.description} ${className}`} {...props}>
            {children}
        </p>
    )
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ children, className = '', ...props }, ref) => (
        <div ref={ref} className={`${styles.content} ${className}`} {...props}>
            {children}
        </div>
    )
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ children, className = '', ...props }, ref) => (
        <div ref={ref} className={`${styles.footer} ${className}`} {...props}>
            {children}
        </div>
    )
);

CardFooter.displayName = 'CardFooter';
