'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api-client';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, updateUser, logout } = useAuth();
    const toast = useToast();

    const [username, setUsername] = useState(user?.username || '');
    const [isSaving, setIsSaving] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleUpdateProfile = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await api.put(`/api/auth/profile/${encodeURIComponent(user?.email || '')}`, {
                username,
            });

            if (res.success) {
                updateUser({ username });
                toast.success('Profile updated successfully');
            } else {
                toast.error(res.error || 'Failed to update profile');
            }
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);

        try {
            const res = await api.post('/api/auth/change-password', {
                email: user?.email,
                current_password: currentPassword,
                new_password: newPassword,
            });

            if (res.success) {
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.error || 'Failed to change password');
            }
        } catch {
            toast.error('Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Settings</h1>

            <div className={styles.settingsGrid}>
                {/* Profile Settings */}
                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className={styles.form}>
                            <Input
                                label="Email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                                hint="Email cannot be changed"
                            />
                            <Input
                                label="Username"
                                type="text"
                                placeholder="Your display name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Button type="submit" variant="primary" isLoading={isSaving}>
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Settings */}
                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className={styles.form}>
                            <Input
                                label="Current Password"
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                hint="Min 8 characters"
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                                Change Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account */}
                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.accountSection}>
                            <div className={styles.accountInfo}>
                                <h4>Plan</h4>
                                <p>{user?.is_pro ? 'Pro' : 'Free'}</p>
                            </div>
                            {!user?.is_pro && (
                                <Button variant="secondary">Upgrade to Pro</Button>
                            )}
                        </div>
                        <div className={styles.dangerZone}>
                            <h4>Danger Zone</h4>
                            <Button variant="danger" onClick={logout}>
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
