'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Spinner, Badge, Modal, ModalFooter, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

interface Habit {
    id: string;
    title: string;
    description: string | null;
    frequency: string;
    is_active: boolean;
    completed_today: boolean;
    streak_count: number;
    total_completions: number;
}

export default function HabitsPage() {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newHabit, setNewHabit] = useState({ title: '', description: '', frequency: 'daily' });
    const [isCreating, setIsCreating] = useState(false);

    // Gamification state
    const [xp, setXp] = useState(350);
    const [level, setLevel] = useState(2);

    const fetchHabits = useCallback(async () => {
        if (!user?.email) return;

        try {
            const res = await api.get<Habit[]>(`/api/habits?email=${user.email}`);
            setHabits(res.data || []);
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleToggleComplete = async (habit: Habit) => {
        try {
            // Optimistic update
            const updated = habits.map(h => {
                if (h.id === habit.id) {
                    const done = !h.completed_today;
                    return {
                        ...h,
                        completed_today: done,
                        streak_count: done ? h.streak_count + 1 : Math.max(0, h.streak_count - 1),
                        total_completions: done ? h.total_completions + 1 : Math.max(0, h.total_completions - 1),
                    };
                }
                return h;
            });
            setHabits(updated);

            // Award XP on complete
            if (!habit.completed_today) {
                setXp(prev => prev + 50);
            }

            await api.patch(`/api/habits/${habit.id}/complete`);
            fetchHabits();
        } catch (error) {
            console.error('Failed to toggle habit:', error);
            fetchHabits();
        }
    };

    const handleCreateHabit = async () => {
        if (!newHabit.title.trim()) return;

        setIsCreating(true);
        try {
            await api.post('/api/habits', {
                ...newHabit,
                user_email: user?.email,
            });

            setIsCreateModalOpen(false);
            setNewHabit({ title: '', description: '', frequency: 'daily' });
            fetchHabits();
        } catch (error) {
            console.error('Failed to create habit:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        try {
            await api.delete(`/api/habits/${habitId}`);
            fetchHabits();
        } catch (error) {
            console.error('Failed to delete habit:', error);
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
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Habits</h1>
                    <p className={styles.pageSubtitle}>Stack habits, trigger dopamine, stay consistent</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    leftIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    }
                >
                    Create Habit
                </Button>
            </div>

            {/* Level & Badge Bar */}
            <div className={styles.gamificationBar}>
                <div className={styles.levelCard}>
                    <div className={styles.badgeGlow} />
                    <span className={styles.levelTitle}>Level {level} Explorer</span>
                    <div className={styles.xpProgressWrapper}>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${(xp % 1000) / 10}%` }} />
                        </div>
                        <span className={styles.xpLabel}>{xp} / 1000 XP</span>
                    </div>
                </div>

                {/* Badge collection */}
                <div className={styles.badgesWrapper}>
                    {[
                        { icon: "🧘", label: "Habit Pioneer", desc: "First habit created" },
                        { icon: "🔥", label: "Iron Will", desc: "Reach a 7-day streak" },
                        { icon: "⚡", label: "Momentum God", desc: "100 total habit points" },
                    ].map((b, i) => (
                        <div key={i} className={styles.badgeItem} title={b.desc}>
                            <span className={styles.badgeIcon}>{b.icon}</span>
                            <div className={styles.badgeTooltip}>
                                <div className={styles.tooltipName}>{b.label}</div>
                                <div className={styles.tooltipDesc}>{b.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Habits Grid */}
            {habits.length === 0 ? (
                <Card variant="outlined" padding="lg" className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                    <h3>No habits stacked yet</h3>
                    <p>Create your first daily routine habit to gain experience points</p>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        Stack First Habit
                    </Button>
                </Card>
            ) : (
                <div className={styles.habitsGrid}>
                    <AnimatePresence>
                        {habits.map((habit) => {
                            // Calculate simple circular completion (e.g. max 10 completions for standard rings)
                            const maxLimit = 10;
                            const completionPct = Math.min(100, (habit.total_completions / maxLimit) * 100);
                            const strokeDashoffset = 113 - (113 * completionPct) / 100;

                            return (
                                <motion.div
                                    key={habit.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className={`${styles.habitCard} ${habit.completed_today ? styles.completedCard : ''}`}
                                >
                                    <div className={styles.habitHeader}>
                                        <div className={styles.habitCircleProgress}>
                                            <svg width="44" height="44" className={styles.progressCircleSvg}>
                                                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(79, 70, 229, 0.08)" strokeWidth="3" />
                                                <circle 
                                                    cx="22" 
                                                    cy="22" 
                                                    r="18" 
                                                    fill="none" 
                                                    stroke="#4F46E5" 
                                                    strokeWidth="3" 
                                                    strokeDasharray="113" 
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 22 22)"
                                                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                                                />
                                            </svg>
                                            <span className={styles.circleVal}>{habit.streak_count}d</span>
                                        </div>

                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteHabit(habit.id)}
                                            aria-label="Delete habit"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <h3 className={styles.habitTitle}>{habit.title}</h3>
                                    {habit.description && (
                                        <p className={styles.habitDescription}>{habit.description}</p>
                                    )}

                                    <div className={styles.habitStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>COMPLETIONS</span>
                                            <span className={styles.statValue}>{habit.total_completions}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>FREQUENCY</span>
                                            <Badge variant="outline" size="sm">{habit.frequency}</Badge>
                                        </div>
                                    </div>

                                    <Button
                                        variant={habit.completed_today ? 'success' : 'primary'}
                                        onClick={() => handleToggleComplete(habit)}
                                        className={styles.completeBtn}
                                    >
                                        {habit.completed_today ? 'Completed Today ✓' : 'Mark Completed (+50 XP)'}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Habit Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Habit"
                size="md"
            >
                <div className={styles.modalForm}>
                    <Input
                        label="Habit Name"
                        placeholder="e.g., Morning meditation"
                        value={newHabit.title}
                        onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Description (optional)"
                        placeholder="Why is this habit important?"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    />
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Frequency</label>
                        <select
                            className={styles.select}
                            value={newHabit.frequency}
                            onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="weekends">Weekends</option>
                        </select>
                    </div>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateHabit} isLoading={isCreating}>
                        Create Habit
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
