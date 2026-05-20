/**
 * Web Push Service for TaskOS
 * Handles sending push notifications to subscribed users
 * 
 * Uses lazy initialization to avoid build-time errors when VAPID keys
 * are not available during Next.js static generation.
 */

import webpush, { PushSubscription as WebPushSubscription, WebPushError } from 'web-push';
import prisma from './prisma';

// Flag to track if VAPID has been configured
let vapidConfigured = false;

/**
 * Initialize VAPID configuration lazily (only when needed)
 */
function initializeVapid(): boolean {
    if (vapidConfigured) {
        return true;
    }

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:admin@taskos.app';

    if (!publicKey || !privateKey) {
        console.warn('VAPID keys not configured - push notifications disabled');
        return false;
    }

    try {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        vapidConfigured = true;
        return true;
    } catch (error) {
        console.error('Failed to configure VAPID:', error);
        return false;
    }
}

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
}

export interface PushResult {
    success: boolean;
    sent: number;
    failed: number;
    errors?: string[];
}

/**
 * Check if push notifications are configured
 * This checks environment variables without initializing VAPID
 */
export function isPushConfigured(): boolean {
    return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/**
 * Send push notification to a specific subscription
 */
export async function sendPushNotification(
    subscriptionInfo: WebPushSubscription,
    payload: PushPayload
): Promise<boolean> {
    // Initialize VAPID lazily
    if (!initializeVapid()) {
        return false;
    }

    try {
        const notificationPayload = JSON.stringify({
            title: payload.title || 'TaskOS',
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            url: payload.url || '/',
            tag: payload.tag,
        });

        await webpush.sendNotification(subscriptionInfo, notificationPayload);
        return true;
    } catch (error) {
        console.error('Push notification failed:', error);

        // If subscription is expired (410 Gone), remove it from database
        if (error instanceof WebPushError && error.statusCode === 410) {
            try {
                await prisma.pushSubscription.delete({
                    where: { endpoint: subscriptionInfo.endpoint },
                });
                console.log('Removed expired push subscription:', subscriptionInfo.endpoint);
            } catch (deleteError) {
                // Subscription might already be deleted
                console.warn('Could not delete expired subscription:', deleteError);
            }
        }

        return false;
    }
}

/**
 * Send push notification to all subscriptions for a user
 */
export async function sendPushToUser(
    userEmail: string,
    payload: PushPayload
): Promise<PushResult> {
    // Check configuration first (without initializing)
    if (!isPushConfigured()) {
        return {
            success: false,
            sent: 0,
            failed: 0,
            errors: ['Push notifications not configured - VAPID keys missing'],
        };
    }

    try {
        // Get all subscriptions for user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userEmail },
        });

        if (subscriptions.length === 0) {
            return {
                success: true,
                sent: 0,
                failed: 0,
            };
        }

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        // Send to all subscriptions
        for (const sub of subscriptions) {
            const subscriptionInfo: WebPushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            const success = await sendPushNotification(subscriptionInfo, payload);
            if (success) {
                sent++;
            } else {
                failed++;
                errors.push(`Failed to send to subscription ${sub.id}`);
            }
        }

        return {
            success: sent > 0 || (sent === 0 && failed === 0),
            sent,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error('Error sending push notifications to user:', error);
        return {
            success: false,
            sent: 0,
            failed: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
    userEmails: string[],
    payload: PushPayload
): Promise<PushResult> {
    let totalSent = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    for (const email of userEmails) {
        const result = await sendPushToUser(email, payload);
        totalSent += result.sent;
        totalFailed += result.failed;
        if (result.errors) {
            allErrors.push(...result.errors);
        }
    }

    return {
        success: totalSent > 0 || (totalSent === 0 && totalFailed === 0),
        sent: totalSent,
        failed: totalFailed,
        errors: allErrors.length > 0 ? allErrors : undefined,
    };
}

/**
 * Generate VAPID keys for push notifications
 * Run this once during initial setup: node -e "require('web-push').generateVAPIDKeys()"
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
    const keys = webpush.generateVAPIDKeys();
    console.log('\n🔑 Generated VAPID Keys for Push Notifications\n');
    console.log('Add these to your .env file:');
    console.log('----------------------------------------');
    console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
    console.log('VAPID_SUBJECT=mailto:your-email@example.com');
    console.log('----------------------------------------\n');
    return keys;
}
