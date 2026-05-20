'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api-client';
import styles from './StreakGuardianBanner.module.css';

interface StreakRiskAlert {
    habitId: string;
    title: string;
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    message: string;
}

export function StreakGuardianBanner() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<StreakRiskAlert[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        async function checkRisks() {
            if (!user?.email) return;
            try {
                const res = await api.get<{ alerts: StreakRiskAlert[] }>(`/api/ai/streak-guardian?email=${user.email}`);
                if (res.data?.alerts && res.data.alerts.length > 0) {
                    setAlerts(res.data.alerts);
                }
            } catch (err) {
                console.error('Failed to load streak risks:', err);
            }
        }
        checkRisks();
    }, [user?.email]);

    if (!isVisible || alerts.length === 0) return null;

    const highestRisk = alerts[0];
    const isHighRisk = highestRisk.riskLevel === 'high';

    return (
        <div className={`${styles.banner} ${isHighRisk ? styles.highRisk : styles.mediumRisk}`}>
            <div className={styles.icon}>
                {isHighRisk ? '🚨' : '⚠️'}
            </div>
            <div className={styles.content}>
                <strong>Streak Guardian:</strong> {highestRisk.message}
                {alerts.length > 1 && <span className={styles.moreCount}> (+{alerts.length - 1} more at risk)</span>}
            </div>
            <button className={styles.closeBtn} onClick={() => setIsVisible(false)} aria-label="Dismiss">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}
