'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Sidebar.module.css';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: '/tasks',
        label: 'Tasks',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 11L12 14L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12V19C21 20 20 21 19 21H5C4 21 3 20 3 19V5C3 4 4 3 5 3H16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: '/habits',
        label: 'Habits',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: '/planner',
        label: 'Planner',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/groups',
        label: 'Groups',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: '/analytics',
        label: 'Analytics',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: '/settings',
        label: 'Settings',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

interface SidebarProps {
    currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return currentPath === '/dashboard';
        }
        return currentPath.startsWith(href);
    };

    const getInitial = () => {
        if (user?.username) return user.username[0].toUpperCase();
        if (user?.email) return user.email[0].toUpperCase();
        return 'U';
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            {/* Collapse Toggle Button */}
            <button 
                className={styles.toggleButton} 
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label="Toggle Sidebar"
            >
                {isCollapsed ? '→' : '←'}
            </button>

            {/* Logo */}
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 11L12 14L22 4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className={styles.logoText}>TaskGuru</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile bottom section */}
            <div className={styles.userBottom}>
                <div className={styles.avatar}>{getInitial()}</div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user?.username || user?.email?.split('@')[0] || 'User'}</span>
                    <span className={styles.userEmail}>{user?.email || ''}</span>
                </div>
            </div>
        </aside>
    );
}
