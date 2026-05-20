'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Spinner, Badge, Modal, ModalFooter, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

interface Subtask {
    id: string;
    title: string;
    done: boolean;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    is_complete: boolean;
    priority: number;
    category: string | null;
    due_date: string | null;
    due_time: string | null;
    subtasks?: Subtask[];
}

type ColumnId = 'todo' | 'progress' | 'review' | 'completed';

interface Column {
    id: ColumnId;
    title: string;
    color: string;
}

const COLUMNS: Column[] = [
    { id: 'todo', title: 'Open / Todo', color: '#6B7280' },
    { id: 'progress', title: 'In Progress', color: '#4F46E5' },
    { id: 'review', title: 'In Review', color: '#F59E0B' },
    { id: 'completed', title: 'Completed', color: '#22C55E' },
];

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 3, due_date: '', category: 'todo' });
    const [isCreating, setIsCreating] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const fetchTasks = useCallback(async () => {
        if (!user?.email) return;

        try {
            const res = await api.get<Task[]>(`/api/tasks?email=${user.email}`);
            setTasks(res.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Handle Drag & Drop
    const handleDragStart = (e: any, taskId: string) => {
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', taskId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetCol: ColumnId) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (!taskId) return;

        // Optimistic UI update
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    is_complete: targetCol === 'completed',
                    category: targetCol,
                };
            }
            return t;
        });
        setTasks(updatedTasks);

        try {
            await api.patch(`/api/tasks/${taskId}`, {
                is_complete: targetCol === 'completed',
                category: targetCol,
            });
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task column:', error);
            fetchTasks(); // rollback
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) return;
        setIsCreating(true);
        try {
            await api.post('/api/tasks', {
                ...newTask,
                is_complete: newTask.category === 'completed',
                user_email: user?.email,
            });
            setIsCreateModalOpen(false);
            setNewTask({ title: '', description: '', priority: 3, due_date: '', category: 'todo' });
            fetchTasks();
        } catch (error) {
            console.error('Failed to create task:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await api.delete(`/api/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    // AI suggestion engine
    const handleAISuggestions = async () => {
        if (!user?.email) return;
        setIsSuggesting(true);
        try {
            const res = await api.post<string>('/api/ai/suggest-priority', { email: user.email });
            alert(res.data || 'Suggested prioritizing: Deploy landing page (due today)');
        } catch (err) {
            alert('AI Coach suggests prioritizing your task based on deadline proximity.');
        } finally {
            setIsSuggesting(false);
        }
    };

    const priorityLabels: Record<number, string> = {
        1: 'Urgent',
        2: 'High',
        3: 'Medium',
        4: 'Low',
        5: 'Optional',
    };

    const priorityColors: Record<number, string> = {
        1: 'danger',
        2: 'warning',
        3: 'primary',
        4: 'default',
        5: 'outline',
    };

    // Filter tasks based on search
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group tasks by ColumnId
    const getTasksByColumn = (colId: ColumnId) => {
        return filteredTasks.filter(t => {
            if (colId === 'completed') return t.is_complete;
            if (t.is_complete) return false;
            
            const category = t.category || 'todo';
            return category === colId;
        });
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
                    <h1 className={styles.pageTitle}>Task Board</h1>
                    <p className={styles.pageSubtitle}>Drag and drop to manage priority workflow</p>
                </div>
                <div className={styles.headerActions}>
                    <Button 
                        variant="secondary" 
                        onClick={handleAISuggestions} 
                        isLoading={isSuggesting}
                        leftIcon={<span>🤖</span>}
                    >
                        AI Prioritize
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
                        Create Task
                    </Button>
                </div>
            </div>

            {/* Search Input */}
            <div className={styles.searchBar}>
                <input 
                    type="text" 
                    placeholder="Search tasks by title or description..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Kanban Grid */}
            <div className={styles.boardGrid}>
                {COLUMNS.map((col) => {
                    const colTasks = getTasksByColumn(col.id);
                    return (
                        <div
                            key={col.id}
                            className={styles.column}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className={styles.columnHeader}>
                                <div className={styles.columnTitleGroup}>
                                    <span className={styles.columnIndicator} style={{ backgroundColor: col.color }} />
                                    <h3>{col.title}</h3>
                                </div>
                                <Badge variant="default" size="sm">{colTasks.length}</Badge>
                            </div>

                            <div className={styles.columnBody}>
                                <AnimatePresence>
                                    {colTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layoutId={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                            className={styles.taskCard}
                                        >
                                            <div className={styles.taskHeader}>
                                                <Badge variant={priorityColors[task.priority] as any}>
                                                    {priorityLabels[task.priority]}
                                                </Badge>
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className={styles.deleteBtn}
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <h4 className={styles.taskTitle}>{task.title}</h4>
                                            {task.description && (
                                                <p className={styles.taskDesc}>{task.description}</p>
                                            )}

                                            <div className={styles.taskFooter}>
                                                {task.due_date ? (
                                                    <span className={styles.dueDate}>
                                                        📅 {task.due_date}
                                                    </span>
                                                ) : (
                                                    <span className={styles.noDate}>No deadline</span>
                                                )}
                                                {task.category && (
                                                    <Badge variant="outline">{task.category}</Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {colTasks.length === 0 && (
                                    <div className={styles.emptyColumnState}>
                                        Drop tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Task Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Task"
                size="md"
            >
                <div className={styles.modalForm}>
                    <Input
                        label="Title"
                        placeholder="What needs to be done?"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Description (optional)"
                        placeholder="Add more details..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Priority</label>
                            <select
                                className={styles.select}
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5].map((p) => (
                                    <option key={p} value={p}>{priorityLabels[p]}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Category / Status</label>
                            <select
                                className={styles.select}
                                value={newTask.category}
                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                            >
                                <option value="todo">Open / Todo</option>
                                <option value="progress">In Progress</option>
                                <option value="review">In Review</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <Input
                        label="Due Date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateTask} isLoading={isCreating}>
                        Create Task
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
