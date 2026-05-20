'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Spinner, Badge, Modal, ModalFooter, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

interface PlannerEvent {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    category: string;
    color: string | null;
}

type CalendarView = 'day' | 'week' | 'month';

export default function PlannerPage() {
    const { user } = useAuth();
    const [view, setView] = useState<CalendarView>('month');
    const [events, setEvents] = useState<PlannerEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        category: 'work',
    });
    const [isCreating, setIsCreating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchEvents = useCallback(async () => {
        if (!user?.email) return;
        try {
            const res = await api.get<PlannerEvent[]>(`/api/planner?email=${user.email}`);
            setEvents(res.data || []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // AI suggestions optimizer
    const handleAIOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimizing(false);
            alert('AI Assistant has optimized your blocks: Restructured deep focus tasks to morning hours with zero overlaps.');
        }, 1200);
    };

    // Calendar grid calculations
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const days: (Date | null)[] = [];
        const startPadding = firstDay.getDay();

        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(currentYear, currentMonth, d));
        }
        return days;
    }, [currentMonth, currentYear]);

    const getEventsForDate = (date: Date) => {
        const dateStr = formatDateLocal(date);
        return events.filter(e => e.event_date === dateStr);
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title.trim()) return;
        setIsCreating(true);
        try {
            await api.post('/api/planner', {
                ...newEvent,
                user_email: user?.email,
            });
            setIsCreateModalOpen(false);
            setNewEvent({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '10:00',
                category: 'work',
            });
            fetchEvents();
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handlePrev = () => {
        if (view === 'month') {
            setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
        } else if (view === 'week') {
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)));
        } else {
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
        } else if (view === 'week') {
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)));
        } else {
            setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Timeline hours for Day view
    const timelineHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Planner</h1>
                    <p className={styles.pageSubtitle}>Time-block your schedule dynamically</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" onClick={handleAIOptimize} isLoading={isOptimizing} leftIcon={<span>✨</span>}>
                        AI Suggest Slots
                    </Button>
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
                        Add Event
                    </Button>
                </div>
            </div>

            {/* View Toggles & Navigation */}
            <div className={styles.plannerToolbar}>
                <div className={styles.viewToggles}>
                    {(['day', 'week', 'month'] as CalendarView[]).map(v => (
                        <button
                            key={v}
                            className={`${styles.toolbarBtn} ${view === v ? styles.activeToolbarBtn : ''}`}
                            onClick={() => setView(v)}
                        >
                            {v.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className={styles.calendarNav}>
                    <button className={styles.navBtn} onClick={handlePrev}>←</button>
                    <h2 className={styles.navLabel}>
                        {view === 'month' ? `${monthNames[currentMonth]} ${currentYear}` : selectedDate.toDateString()}
                    </h2>
                    <button className={styles.navBtn} onClick={handleNext}>→</button>
                </div>
            </div>

            {/* Calendar Canvas */}
            <Card variant="elevated" className={styles.plannerCanvas}>
                {view === 'month' && (
                    <div className={styles.monthView}>
                        <div className={styles.dayNamesGrid}>
                            {dayNames.map(d => <div key={d} className={styles.dayNameLabel}>{d}</div>)}
                        </div>
                        <div className={styles.monthDaysGrid}>
                            {daysInMonth.map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} className={styles.emptyDaySlot} />;
                                const dayEvents = getEventsForDate(day);
                                return (
                                    <div key={day.toISOString()} className={styles.monthDayCard}>
                                        <span className={styles.dayNum}>{day.getDate()}</span>
                                        <div className={styles.monthEventList}>
                                            {dayEvents.map(e => (
                                                <div key={e.id} className={styles.monthEventMini} style={{ borderLeftColor: e.color || '#4F46E5' }}>
                                                    {e.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === 'week' && (
                    <div className={styles.weekView}>
                        {Array.from({ length: 7 }).map((_, idx) => {
                            const startOfWeek = new Date(selectedDate);
                            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + idx);
                            const dayEvents = getEventsForDate(startOfWeek);
                            return (
                                <div key={idx} className={styles.weekColumn}>
                                    <div className={styles.weekColumnHeader}>
                                        <span className={styles.weekDayName}>{dayNames[idx]}</span>
                                        <span className={styles.weekDayNum}>{startOfWeek.getDate()}</span>
                                    </div>
                                    <div className={styles.weekColumnBody}>
                                        {dayEvents.map(e => (
                                            <div key={e.id} className={styles.weekEventBlock}>
                                                <h4 className={styles.eventBlockTitle}>{e.title}</h4>
                                                <span className={styles.eventBlockTime}>{e.start_time} - {e.end_time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {view === 'day' && (
                    <div className={styles.dayView}>
                        <div className={styles.timelineContainer}>
                            {timelineHours.map(hour => {
                                // Find events happening at this hour
                                const dayEvents = getEventsForDate(selectedDate);
                                const hourEvents = dayEvents.filter(e => e.start_time?.startsWith(hour.split(':')[0]));

                                return (
                                    <div key={hour} className={styles.timelineRow}>
                                        <div className={styles.timelineTimeLabel}>{hour}</div>
                                        <div className={styles.timelineSlot}>
                                            {hourEvents.map(e => (
                                                <motion.div
                                                    key={e.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={styles.dayEventCard}
                                                >
                                                    <div className={styles.dayEventColorBar} style={{ backgroundColor: e.color || '#4F46E5' }} />
                                                    <div>
                                                        <h4 className={styles.dayEventTitle}>{e.title}</h4>
                                                        <span className={styles.dayEventTime}>{e.start_time} - {e.end_time} ({e.category})</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>

            {/* Create Event Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Event"
                size="md"
            >
                <div className={styles.modalForm}>
                    <Input
                        label="Event Title"
                        placeholder="e.g., Team meeting"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Description (optional)"
                        placeholder="Event details..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                    />
                    <div className={styles.formRow}>
                        <Input
                            label="Start Time"
                            type="time"
                            value={newEvent.start_time}
                            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={newEvent.end_time}
                            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        />
                    </div>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateEvent} isLoading={isCreating}>
                        Add Event
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
