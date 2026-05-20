'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api-client';
import styles from './Header.module.css';

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const [streak, setStreak] = useState<number>(0);

    // Fetch productivity streak
    useEffect(() => {
        async function fetchStreak() {
            if (!user?.email) return;
            try {
                const res = await api.get<{ currentStreak: number }>(`/api/streak?email=${user.email}`);
                setStreak(res.data?.currentStreak || 0);
            } catch (error) {
                console.error('Failed to fetch header streak:', error);
            }
        }
        fetchStreak();
    }, [user?.email]);

    // Handle scroll for sticky blur effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleToggleAICoach = () => {
        window.dispatchEvent(new Event('toggle-ai-coach'));
    };

    const getInitial = () => {
        if (user?.username) return user.username[0].toUpperCase();
        if (user?.email) return user.email[0].toUpperCase();
        return 'U';
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    placeholder="Search tasks, habits, events..."
                    className={styles.searchInput}
                />
                <kbd className={styles.searchShortcut}>⌘K</kbd>
            </div>

            {/* Right side actions */}
            <div className={styles.rightSection}>
                {/* Streak Badge */}
                <div className={styles.streakIndicator} title="Productivity Streak">
                    <span className={styles.streakIcon}>🔥</span>
                    <span>{streak} Days</span>
                </div>

                {/* AI Assistant Button */}
                <button 
                    className={`${styles.iconButton} ${styles.aiButton}`} 
                    onClick={handleToggleAICoach}
                    title="Toggle AI Coach"
                    aria-label="Toggle AI Coach"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Notifications */}
                <button className={styles.iconButton} aria-label="Notifications" title="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.notificationBadge}></span>
                </button>

                {/* User Dropdown */}
                <div className={styles.userDropdown} ref={dropdownRef}>
                    <button
                        className={styles.userButton}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-expanded={isDropdownOpen}
                    >
                        <div className={styles.avatar}>
                            {getInitial()}
                        </div>
                        <span className={styles.userName}>
                            {user?.username || user?.email?.split('@')[0] || 'User'}
                        </span>
                        <svg
                            className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownHeader}>
                                <div className={styles.avatar}>{getInitial()}</div>
                                <div>
                                    <div className={styles.dropdownName}>
                                        {user?.username || 'User'}
                                    </div>
                                    <div className={styles.dropdownEmail}>{user?.email}</div>
                                </div>
                            </div>
                            <div className={styles.dropdownDivider} />
                            <a href="/settings" className={styles.dropdownItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                Settings
                            </a>
                            <button className={styles.dropdownItem} onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
