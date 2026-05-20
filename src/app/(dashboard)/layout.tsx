'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AICoachPanel } from '@/components/ui';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="lg" />
                <p>Loading...</p>
            </div>
        );
    }

    // Don't render dashboard if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.layout}>
            <Sidebar currentPath={pathname} />
            <div className={styles.mainArea}>
                <Header />
                <main className={styles.content}>
                    {children}
                </main>
                <AICoachPanel />
            </div>
        </div>
    );
}
