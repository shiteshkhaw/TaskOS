'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, Button, Spinner, StreakGuardianBanner, Badge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

interface Stats {
    totalTasks: number;
    completedTasks: number;
    todayTasks: number;
    activeHabits: number;
    currentStreak: number;
    totalPoints: number;
    level: number;
    perfectHabitDays: number;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    is_complete: boolean;
    priority: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [focusTimer, setFocusTimer] = useState<number>(1500); // 25 minutes
    const [isFocusActive, setIsFocusActive] = useState(false);
    const [heatmapDays, setHeatmapDays] = useState<{ day: number; count: number }[]>([]);

    // Load data
    const fetchData = useCallback(async () => {
        if (!user?.email) return;
        try {
            const tasksRes = await api.get<Task[]>(`/api/tasks?email=${user.email}`);
            const habitsRes = await api.get<Array<{ is_active: boolean }>>(`/api/habits?email=${user.email}`);
            const streakRes = await api.get<{ currentStreak: number; totalPoints: number; level: number; perfectHabitDays: number }>(`/api/streak?email=${user.email}`);

            const tList = tasksRes.data || [];
            const habits = habitsRes.data || [];
            const streak = streakRes.data || { currentStreak: 0, totalPoints: 100, level: 1, perfectHabitDays: 0 };

            setTasks(tList.slice(0, 3)); // Top 3 tasks for Today's Focus

            setStats({
                totalTasks: tList.length,
                completedTasks: tList.filter((t) => t.is_complete).length,
                todayTasks: tList.filter(t => !t.is_complete).length,
                activeHabits: habits.filter((h) => h.is_active).length,
                currentStreak: streak.currentStreak,
                totalPoints: streak.totalPoints,
                level: streak.level,
                perfectHabitDays: streak.perfectHabitDays || 0,
            });

            // Generate heatmap data
            const baseHeatmap = Array.from({ length: 28 }, (_, i) => ({
                day: i + 1,
                count: Math.floor(Math.random() * 5),
            }));
            setHeatmapDays(baseHeatmap);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Timer effect
    useEffect(() => {
        let interval: any = null;
        if (isFocusActive && focusTimer > 0) {
            interval = setInterval(() => {
                setFocusTimer((prev) => prev - 1);
            }, 1000);
        } else if (focusTimer === 0) {
            setIsFocusActive(false);
            setFocusTimer(1500);
            alert('Focus session complete! Take a break.');
        }
        return () => clearInterval(interval);
    }, [isFocusActive, focusTimer]);

    const toggleFocus = () => {
        setIsFocusActive(!isFocusActive);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleTaskToggle = async (task: Task) => {
        try {
            await api.patch(`/api/tasks/${task.id}`, {
                is_complete: !task.is_complete,
                done: !task.is_complete,
            });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <StreakGuardianBanner />

            {/* Greeting Header */}
            <div className={styles.welcomeSection}>
                <div>
                    <h1 className={styles.welcomeTitle}>
                        Good morning, {user?.username || user?.email?.split('@')[0] || 'Shitesh'} 👋
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        You’re <span className={styles.highlightText}>72% ahead</span> of yesterday’s momentum. Keep it up!
                    </p>
                </div>
            </div>

            {/* Main Dashboard Layout Grid */}
            <div className={styles.dashboardGrid}>
                {/* 1. Today's Focus Widget */}
                <Card variant="elevated" className={`${styles.card} ${styles.focusCard}`}>
                    <div className={styles.cardGlow} />
                    <h3 className={styles.cardTitle}>Today's Focus</h3>
                    <div className={styles.focusContent}>
                        <div className={styles.taskList}>
                            {tasks.length === 0 ? (
                                <p className={styles.emptyText}>No tasks for today. Build your momentum!</p>
                            ) : (
                                tasks.map((task) => (
                                    <div key={task.id} className={styles.taskItem}>
                                        <button
                                            className={`${styles.checkbox} ${task.is_complete ? styles.checked : ''}`}
                                            onClick={() => handleTaskToggle(task)}
                                        >
                                            {task.is_complete && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                        <span className={`${styles.taskText} ${task.is_complete ? styles.completed : ''}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Interactive Timer */}
                        <div className={styles.timerContainer}>
                            <div className={`${styles.progressRing} ${isFocusActive ? styles.timerPulse : ''}`}>
                                <div className={styles.timerValue}>{formatTime(focusTimer)}</div>
                                <div className={styles.timerLabel}>{isFocusActive ? 'FOCUSING' : 'READY'}</div>
                            </div>
                            <Button 
                                variant={isFocusActive ? 'secondary' : 'primary'}
                                onClick={toggleFocus}
                                className={styles.timerBtn}
                            >
                                {isFocusActive ? 'Pause Session' : 'Start Focus Session'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* 2. Momentum Tracker */}
                <Card variant="elevated" className={styles.card}>
                    <h3 className={styles.cardTitle}>Momentum Tracker</h3>
                    <div className={styles.momentumContent}>
                        <div className={styles.levelProgress}>
                            <div className={styles.levelBadge}>
                                <span className={styles.levelNum}>{stats?.level || 1}</span>
                                <span className={styles.levelLabel}>Level</span>
                            </div>
                            <div className={styles.progressBarWrapper}>
                                <div className={styles.progressInfo}>
                                    <span>XP System</span>
                                    <span>{stats?.totalPoints || 120} / {((stats?.level || 1) * 1000)} XP</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressFill} 
                                        style={{ width: `${Math.min(100, ((stats?.totalPoints || 120) % 1000) / 10)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom SVG Consistency Line Graph */}
                        <div className={styles.graphContainer}>
                            <span className={styles.graphTitle}>Weekly Consistency Trend</span>
                            <svg className={styles.graphSvg} viewBox="0 0 300 80">
                                <motion.path
                                    d="M 10,70 L 50,45 L 90,55 L 130,25 L 170,35 L 210,15 L 250,20 L 290,10"
                                    fill="none"
                                    stroke="#4F46E5"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5 }}
                                />
                                <circle cx="290" cy="10" r="4" fill="#4F46E5" />
                            </svg>
                            <div className={styles.graphDays}>
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. AI Insights Card */}
                <Card variant="glass" className={`${styles.card} ${styles.aiCard}`}>
                    <div className={styles.aiGlow} />
                    <div className={styles.aiHeader}>
                        <span className={styles.aiIcon}>🤖</span>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>AI Insights</h3>
                    </div>
                    <div className={styles.aiBody}>
                        <div className={styles.aiInsightItem}>
                            <span className={styles.insightBullet}>✦</span>
                            <p>"You complete deep work tasks faster between 10AM–1PM."</p>
                        </div>
                        <div className={styles.aiInsightItem}>
                            <span className={styles.insightBullet}>✦</span>
                            <p>"Your habit consistency increased 18% this week."</p>
                        </div>
                        <div className={styles.aiInsightItem}>
                            <span className={styles.insightBullet}>✦</span>
                            <p>"Suggested Action: Schedule your urgent task 'Deploy landing page' during your peak morning hours."</p>
                        </div>
                    </div>
                </Card>

                {/* 4. Productivity Heatmap */}
                <Card variant="elevated" className={`${styles.card} ${styles.heatmapCard}`}>
                    <h3 className={styles.cardTitle}>Productivity Heatmap</h3>
                    <p className={styles.heatmapSubtitle}>Consistency across habits & tasks</p>
                    <div className={styles.heatmapGrid}>
                        {heatmapDays.map((day) => (
                            <div
                                key={day.day}
                                className={styles.heatmapDay}
                                style={{
                                    backgroundColor:
                                        day.count === 0 ? '#F3F4F6' :
                                        day.count === 1 ? '#E0E7FF' :
                                        day.count === 2 ? '#C7D2FE' :
                                        day.count === 3 ? '#818CF8' : '#4F46E5'
                                }}
                                title={`Day ${day.day}: ${day.count} activities`}
                            />
                        ))}
                    </div>
                    <div className={styles.heatmapLegend}>
                        <span>Less</span>
                        <div className={styles.legendDot} style={{ backgroundColor: '#F3F4F6' }} />
                        <div className={styles.legendDot} style={{ backgroundColor: '#E0E7FF' }} />
                        <div className={styles.legendDot} style={{ backgroundColor: '#C7D2FE' }} />
                        <div className={styles.legendDot} style={{ backgroundColor: '#818CF8' }} />
                        <div className={styles.legendDot} style={{ backgroundColor: '#4F46E5' }} />
                        <span>More</span>
                    </div>
                </Card>

                {/* 5. Upcoming Planner Preview */}
                <Card variant="elevated" className={`${styles.card} ${styles.plannerCard}`}>
                    <h3 className={styles.cardTitle}>Upcoming Planner</h3>
                    <div className={styles.plannerList}>
                        <div className={styles.plannerItem}>
                            <div className={styles.plannerTime}>
                                <span className={styles.timeVal}>09:00</span>
                                <span className={styles.timeAmpm}>AM</span>
                            </div>
                            <div className={styles.plannerContent}>
                                <div className={styles.plannerLabel}>Deep Work Session</div>
                                <div className={styles.plannerDesc}>Block focus workspace</div>
                            </div>
                        </div>
                        <div className={styles.plannerItem}>
                            <div className={styles.plannerTime}>
                                <span className={styles.timeVal}>12:30</span>
                                <span className={styles.timeAmpm}>PM</span>
                            </div>
                            <div className={styles.plannerContent}>
                                <div className={styles.plannerLabel}>AI Prioritization Check</div>
                                <div className={styles.plannerDesc}>Automated calendar optimization</div>
                            </div>
                        </div>
                        <div className={styles.plannerItem}>
                            <div className={styles.plannerTime}>
                                <span className={styles.timeVal}>04:00</span>
                                <span className={styles.timeAmpm}>PM</span>
                            </div>
                            <div className={styles.plannerContent}>
                                <div className={styles.plannerLabel}>Daily Wrap-up</div>
                                <div className={styles.plannerDesc}>Review achievements and badges</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
