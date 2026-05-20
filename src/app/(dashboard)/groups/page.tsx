'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Spinner, Badge, Modal, ModalFooter, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api-client';
import styles from './page.module.css';

/* ─────────────────────────── Types ─────────────────────────── */
interface Group {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    members: string[];
    createdAt: string;
    _count?: { groupMembers: number; tasks: number };
}

interface LeaderboardEntry {
    email: string;
    username: string;
    role: 'admin' | 'member';
    joinedAt: string;
    tasksCompleted: number;
    streak: number;
    totalPoints: number;
    level: number;
}

interface ActivityEntry {
    id: string;
    userEmail: string;
    actionType: string;
    message: string;
    occurredAt: string;
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function GroupsPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Workspace data
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);

    // Create group modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Invite member modal
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    /* ── Fetch groups list ── */
    const fetchGroups = useCallback(async () => {
        if (!user?.email) return;
        try {
            const res = await api.get<Group[]>('/api/groups');
            setGroups(res.data || []);
        } catch (err) {
            console.error('Fetch groups error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    /* ── Fetch workspace data when group selected ── */
    const fetchWorkspace = useCallback(async (groupId: string) => {
        setWorkspaceLoading(true);
        try {
            const [lbRes, actRes] = await Promise.all([
                api.get<LeaderboardEntry[]>(`/api/groups/${groupId}/leaderboard`),
                api.get<ActivityEntry[]>(`/api/groups/${groupId}/activity`),
            ]);
            setLeaderboard(lbRes.data || []);
            setActivity(actRes.data || []);
        } catch (err) {
            console.error('Workspace fetch error:', err);
        } finally {
            setWorkspaceLoading(false);
        }
    }, []);

    const openGroup = (group: Group) => {
        setActiveGroup(group);
        fetchWorkspace(group.id);
    };

    /* ── Create group ── */
    const handleCreateGroup = async () => {
        if (!newGroup.name.trim()) return;
        setIsCreating(true);
        try {
            await api.post('/api/groups', { name: newGroup.name, description: newGroup.description });
            setIsCreateOpen(false);
            setNewGroup({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            console.error('Create group error:', err);
        } finally {
            setIsCreating(false);
        }
    };

    /* ── Invite member ── */
    const handleInvite = async () => {
        if (!inviteEmail.trim() || !activeGroup) return;
        setIsInviting(true);
        setInviteError('');
        setInviteSuccess('');
        try {
            await api.post(`/api/groups/${activeGroup.id}/invite`, {
                email: inviteEmail.trim(),
                role: inviteRole,
            });
            setInviteSuccess(`✓ Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
            // Refresh leaderboard to show new member
            fetchWorkspace(activeGroup.id);
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Failed to send invite. Check the email and try again.';
            setInviteError(msg);
        } finally {
            setIsInviting(false);
        }
    };

    /* ── Helpers ── */
    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const isOwner = activeGroup && activeGroup.createdBy === user?.email;
    const myEntry = leaderboard.find(l => l.email === user?.email);
    const myRole = myEntry?.role ?? 'member';

    /* ─────────────────── Render ─────────────────── */
    if (isLoading) {
        return <div className={styles.loading}><Spinner size="lg" /></div>;
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>
                        {activeGroup ? activeGroup.name : 'Groups'}
                    </h1>
                    <p className={styles.pageSubtitle}>
                        {activeGroup
                            ? activeGroup.description || 'Collaborative workspace'
                            : 'Collaborate with teammates and track shared progress'}
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {activeGroup && (
                        <>
                            {(isOwner || myRole === 'admin') && (
                                <Button variant="secondary" onClick={() => { setInviteError(''); setInviteSuccess(''); setIsInviteOpen(true); }}>
                                    + Invite Member
                                </Button>
                            )}
                            <Button variant="ghost" onClick={() => { setActiveGroup(null); setLeaderboard([]); setActivity([]); }}>
                                ← Back
                            </Button>
                        </>
                    )}
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                        leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                    >
                        New Group
                    </Button>
                </div>
            </div>

            {/* ─── Main content ─── */}
            <AnimatePresence mode="wait">
                {!activeGroup ? (
                    /* Group Cards */
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.groupsGrid}>
                        {groups.length === 0 ? (
                            <Card variant="outlined" padding="lg" className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <h3>No groups yet</h3>
                                <p>Create a group to start collaborating and tracking shared productivity</p>
                                <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Create Group</Button>
                            </Card>
                        ) : (
                            groups.map(group => (
                                <Card key={group.id} variant="elevated" padding="lg" className={styles.groupCard} onClick={() => openGroup(group)}>
                                    <div className={styles.groupIconWrap}>
                                        <span className={styles.groupIconEmoji}>👥</span>
                                    </div>
                                    <h3 className={styles.groupTitle}>{group.name}</h3>
                                    {group.description && <p className={styles.groupDescription}>{group.description}</p>}
                                    <div className={styles.groupMeta}>
                                        <Badge variant="outline">{group._count?.groupMembers ?? group.members?.length ?? 1} Members</Badge>
                                        <Badge variant="outline">{group._count?.tasks ?? 0} Tasks</Badge>
                                        {group.createdBy === user?.email && <Badge variant="primary">Owner</Badge>}
                                    </div>
                                </Card>
                            ))
                        )}
                    </motion.div>
                ) : (
                    /* Workspace view */
                    <motion.div key="workspace" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.workspaceGrid}>

                        {/* LEFT: Leaderboard */}
                        <div className={styles.workspaceLeft}>
                            <Card variant="elevated" className={styles.workspaceCard}>
                                <h3 className={styles.cardSectionTitle}>🏆 Member Leaderboard</h3>
                                {workspaceLoading ? (
                                    <div className={styles.miniLoader}><Spinner size="sm" /></div>
                                ) : leaderboard.length === 0 ? (
                                    <p className={styles.emptyNote}>No members yet. Invite someone!</p>
                                ) : (
                                    <div className={styles.leaderboardList}>
                                        {leaderboard.map((m, idx) => (
                                            <div key={m.email} className={`${styles.leaderboardItem} ${m.email === user?.email ? styles.mineItem : ''}`}>
                                                <div className={styles.memberInfo}>
                                                    <span className={styles.memberRank}>#{idx + 1}</span>
                                                    <div className={styles.memberNameGroup}>
                                                        <span className={styles.memberName}>
                                                            {m.username}{m.email === user?.email ? ' (You)' : ''}
                                                        </span>
                                                        <span className={styles.memberEmail}>{m.email}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.memberStats}>
                                                    <Badge variant={m.role === 'admin' ? 'primary' : 'outline'} size="sm">
                                                        {m.role}
                                                    </Badge>
                                                    <span className={styles.taskCount}>{m.tasksCompleted} tasks</span>
                                                    <span className={styles.memberStreak}>🔥 {m.streak}d</span>
                                                    <span className={styles.memberXP}>Lv.{m.level}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Activity Feed */}
                            <Card variant="elevated" className={styles.workspaceCard}>
                                <h3 className={styles.cardSectionTitle}>📋 Activity Feed</h3>
                                {workspaceLoading ? (
                                    <div className={styles.miniLoader}><Spinner size="sm" /></div>
                                ) : activity.length === 0 ? (
                                    <p className={styles.emptyNote}>No activity yet. Start collaborating!</p>
                                ) : (
                                    <div className={styles.activityList}>
                                        {activity.map(a => (
                                            <div key={a.id} className={styles.activityItem}>
                                                <span className={styles.activityDot} />
                                                <div className={styles.activityContent}>
                                                    <p className={styles.activityMessage}>{a.message}</p>
                                                    <span className={styles.activityTime}>{timeAgo(a.occurredAt)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* RIGHT: My Stats + Quick info */}
                        <div className={styles.workspaceRight}>
                            <Card variant="elevated" className={styles.workspaceCard}>
                                <h3 className={styles.cardSectionTitle}>👤 Your Stats in This Group</h3>
                                {myEntry ? (
                                    <div className={styles.myStatsGrid}>
                                        <div className={styles.myStatItem}>
                                            <span className={styles.myStatValue}>{myEntry.tasksCompleted}</span>
                                            <span className={styles.myStatLabel}>Tasks Done</span>
                                        </div>
                                        <div className={styles.myStatItem}>
                                            <span className={styles.myStatValue}>🔥 {myEntry.streak}d</span>
                                            <span className={styles.myStatLabel}>Streak</span>
                                        </div>
                                        <div className={styles.myStatItem}>
                                            <span className={styles.myStatValue}>{myEntry.totalPoints.toLocaleString()}</span>
                                            <span className={styles.myStatLabel}>XP Points</span>
                                        </div>
                                        <div className={styles.myStatItem}>
                                            <span className={styles.myStatValue}>Lv.{myEntry.level}</span>
                                            <span className={styles.myStatLabel}>Level</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.emptyNote}>Loading your stats…</p>
                                )}
                            </Card>

                            <Card variant="elevated" className={styles.workspaceCard}>
                                <h3 className={styles.cardSectionTitle}>ℹ️ Group Info</h3>
                                <div className={styles.groupInfoList}>
                                    <div className={styles.groupInfoRow}>
                                        <span className={styles.groupInfoLabel}>Members</span>
                                        <span className={styles.groupInfoValue}>{leaderboard.length}</span>
                                    </div>
                                    <div className={styles.groupInfoRow}>
                                        <span className={styles.groupInfoLabel}>Your Role</span>
                                        <Badge variant={myRole === 'admin' ? 'primary' : 'outline'} size="sm">{myRole}</Badge>
                                    </div>
                                    <div className={styles.groupInfoRow}>
                                        <span className={styles.groupInfoLabel}>Created by</span>
                                        <span className={styles.groupInfoValue}>{activeGroup.createdBy.split('@')[0]}</span>
                                    </div>
                                    <div className={styles.groupInfoRow}>
                                        <span className={styles.groupInfoLabel}>Group ID</span>
                                        <span className={styles.groupInfoId}>{activeGroup.id.slice(0, 8)}…</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Create Group Modal ─── */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Group" size="md">
                <div className={styles.modalForm}>
                    <Input label="Group Name" placeholder="e.g., Design Team" value={newGroup.name}
                        onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} required />
                    <Input label="Description (optional)" placeholder="What does this group work on?"
                        value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })} />
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateGroup} isLoading={isCreating}>Create Group</Button>
                </ModalFooter>
            </Modal>

            {/* ─── Invite Member Modal ─── */}
            <Modal isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); setInviteError(''); setInviteSuccess(''); }}
                title="Invite Member" size="md">
                <div className={styles.modalForm}>
                    <Input label="Member Email" type="email" placeholder="colleague@example.com"
                        value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Role</label>
                        <div className={styles.roleToggle}>
                            {(['member', 'admin'] as const).map(role => (
                                <button key={role} className={`${styles.roleBtn} ${inviteRole === role ? styles.activeRole : ''}`}
                                    onClick={() => setInviteRole(role)}>
                                    {role === 'admin' ? '🛡️ Admin' : '👤 Member'}
                                </button>
                            ))}
                        </div>
                        <p className={styles.roleHint}>
                            {inviteRole === 'admin'
                                ? 'Admins can invite/remove members and manage group settings.'
                                : 'Members can view and contribute to group tasks and activity.'}
                        </p>
                    </div>
                    {inviteError && <p className={styles.errorMsg}>{inviteError}</p>}
                    {inviteSuccess && <p className={styles.successMsg}>{inviteSuccess}</p>}
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => { setIsInviteOpen(false); setInviteError(''); setInviteSuccess(''); }}>Close</Button>
                    <Button variant="primary" onClick={handleInvite} isLoading={isInviting} disabled={!inviteEmail.trim()}>
                        Send Invite
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
