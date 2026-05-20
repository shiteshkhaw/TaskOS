'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Spinner } from '@/components/ui';
import { motion } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

interface AnalyticsData {
    weekdays: string[];
    tasksCompleted: number[];
    habitConsistency: number[];
    streak: number;
    longestStreak: number;
    totalPoints: number;
    level: number;
    perfectHabitDays: number;
    totalTasksDone: number;
    totalTasksAll: number;
    completionRate: number;
    totalHabits: number;
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!user?.email) return;
        try {
            setIsLoading(true);
            const res = await api.get<AnalyticsData>('/api/analytics');
            setAnalytics(res.data ?? null);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError('Failed to load analytics. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className={styles.loading}>
                <p style={{ color: 'var(--text-secondary)' }}>{error ?? 'No data available.'}</p>
            </div>
        );
    }

    const maxTasks = Math.max(...analytics.tasksCompleted, 1);

    const stats = [
        {
            title: 'Current Streak',
            value: `${analytics.streak}d`,
            change: `Longest: ${analytics.longestStreak}d`,
            desc: `${analytics.perfectHabitDays} perfect habit days`,
        },
        {
            title: 'Task Completion Rate',
            value: `${analytics.completionRate}%`,
            change: `${analytics.totalTasksDone} of ${analytics.totalTasksAll} done`,
            desc: 'All time',
        },
        {
            title: 'Habit Consistency',
            value: `${analytics.totalHabits} habits`,
            change: `Avg ${analytics.habitConsistency.length > 0
                ? Math.round(analytics.habitConsistency.reduce((a, b) => a + b, 0) / analytics.habitConsistency.length)
                : 0}% this week`,
            desc: 'Based on completion history',
        },
        {
            title: 'XP Level',
            value: `Level ${analytics.level}`,
            change: `${analytics.totalPoints.toLocaleString()} XP earned`,
            desc: `Keep the streak alive!`,
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Analytics</h1>
                    <p className={styles.pageSubtitle}>Your real productivity data, beautifully visualized</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchAnalytics} title="Refresh">
                    ↻ Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className={styles.statCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                        whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)' }}
                    >
                        <div className={styles.statCardGlow} />
                        <span className={styles.statCardTitle}>{stat.title}</span>
                        <div className={styles.statCardValue}>{stat.value}</div>
                        <div className={styles.statCardMeta}>
                            <span className={styles.statChange}>{stat.change}</span>
                            <span className={styles.statDesc}>{stat.desc}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {/* Tasks Completed Bar Chart */}
                <Card variant="elevated" className={styles.chartCard}>
                    <CardHeader>
                        <CardTitle>Tasks Completed (This Week)</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.chartContent}>
                        <div className={styles.svgContainer}>
                            <svg className={styles.chartSvg} viewBox="0 0 500 220">
                                <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="70" x2="480" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1" />
                                {analytics.tasksCompleted.map((val, idx) => {
                                    const x = 70 + idx * 60;
                                    const height = maxTasks > 0 ? (val / maxTasks) * 130 : 0;
                                    const y = 170 - height;
                                    return (
                                        <g key={idx} className={styles.chartBarGroup}>
                                            <motion.rect
                                                x={x}
                                                y={170}
                                                width="32"
                                                height={0}
                                                rx="6"
                                                fill="url(#indigoGrad)"
                                                animate={{ y, height }}
                                                transition={{ duration: 1, delay: idx * 0.05, ease: 'easeOut' }}
                                            />
                                            <text x={x + 16} y="198" textAnchor="middle" className={styles.chartLabelText}>
                                                {analytics.weekdays[idx]}
                                            </text>
                                            {val > 0 && (
                                                <text x={x + 16} y={y - 6} textAnchor="middle" className={styles.chartValueText}>
                                                    {val}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                                <defs>
                                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" />
                                        <stop offset="100%" stopColor="#818CF8" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        {analytics.tasksCompleted.every(v => v === 0) && (
                            <p className={styles.emptyChartNote}>No tasks completed this week yet — let's change that! 🚀</p>
                        )}
                    </CardContent>
                </Card>

                {/* Habit Consistency Line Chart */}
                <Card variant="elevated" className={styles.chartCard}>
                    <CardHeader>
                        <CardTitle>Habit Consistency (%) This Week</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.chartContent}>
                        <div className={styles.svgContainer}>
                            <svg className={styles.chartSvg} viewBox="0 0 500 220">
                                <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="70" x2="480" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                                <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1" />

                                {/* Y-axis labels */}
                                {[100, 75, 50, 25].map((pct, i) => (
                                    <text key={i} x="35" y={20 + i * 50 + 4} textAnchor="end" className={styles.chartLabelText}>
                                        {pct}%
                                    </text>
                                ))}

                                <motion.path
                                    d={analytics.habitConsistency.map((val, idx) => {
                                        const x = 70 + idx * 60;
                                        const y = 170 - (val / 100) * 130;
                                        return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#6366F1"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                                />

                                {analytics.habitConsistency.map((val, idx) => {
                                    const x = 70 + idx * 60;
                                    const y = 170 - (val / 100) * 130;
                                    return (
                                        <g key={idx} className={styles.chartDotGroup}>
                                            <motion.circle
                                                cx={x} cy={y} r="5"
                                                fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2.5"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.8 + idx * 0.1, duration: 0.3 }}
                                            />
                                            <text x={x} y="198" textAnchor="middle" className={styles.chartLabelText}>
                                                {analytics.weekdays[idx]}
                                            </text>
                                            {val > 0 && (
                                                <text x={x} y={y - 10} textAnchor="middle" className={styles.chartValueText}>
                                                    {val}%
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        {analytics.totalHabits === 0 && (
                            <p className={styles.emptyChartNote}>No habits tracked yet — add some in the Habits section!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
