'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
    size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ children, variant = 'default', size = 'md', className = '', ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

// Priority Badge
export interface PriorityBadgeProps {
    priority: number;
    className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
    const labels: Record<number, string> = {
        1: 'Urgent',
        2: 'High',
        3: 'Medium',
        4: 'Low',
        5: 'Optional',
    };

    const variants: Record<number, BadgeProps['variant']> = {
        1: 'danger',
        2: 'warning',
        3: 'primary',
        4: 'default',
        5: 'outline',
    };

    return (
        <Badge variant={variants[priority] || 'default'} size="sm" className={className}>
            {labels[priority] || `P${priority}`}
        </Badge>
    );
}

// Status Badge
export interface StatusBadgeProps {
    status: 'complete' | 'pending' | 'overdue' | 'active';
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
        complete: { label: 'Complete', variant: 'success' },
        pending: { label: 'Pending', variant: 'warning' },
        overdue: { label: 'Overdue', variant: 'danger' },
        active: { label: 'Active', variant: 'primary' },
    };

    const { label, variant } = config[status] || { label: status, variant: 'default' };

    return (
        <Badge variant={variant} size="sm" className={className}>
            {label}
        </Badge>
    );
}
