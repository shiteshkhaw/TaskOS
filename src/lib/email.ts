/**
 * Resend Email Service for TaskOS
 * Handles all transactional emails
 */

import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'TaskOS <noreply@taskos.app>';
const APP_NAME = 'TaskOS';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';


export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username?: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const name = username || email.split('@')[0];

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #6366f1; margin-bottom: 24px;">Password Reset Request</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your ${APP_NAME} account.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" 
                           style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                  color: white;
                                  padding: 14px 32px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: 600;
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send group invitation email
 */
export async function sendGroupInviteEmail(
  email: string,
  groupName: string,
  inviterName: string,
  inviteLink: string
): Promise<EmailResult> {
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're invited to join "${groupName}" on ${APP_NAME}`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #6366f1; margin-bottom: 24px;">Group Invitation</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        <strong>${inviterName}</strong> has invited you to join the group 
                        <strong>"${groupName}"</strong> on ${APP_NAME}.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${inviteLink}" 
                           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                  color: white;
                                  padding: 14px 32px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: 600;
                                  display: inline-block;">
                            Join Group
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        Click the button above to accept the invitation and start collaborating!
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Group invite email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  username?: string
): Promise<EmailResult> {
  const name = username || email.split('@')[0];

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${APP_NAME}! 🚀`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #6366f1; margin-bottom: 24px;">Welcome to ${APP_NAME}!</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Thanks for joining ${APP_NAME}! We're excited to help you boost your productivity.
                    </p>
                    <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">Get Started:</h3>
                        <ul style="color: #4b5563; line-height: 2;">
                            <li>📋 Create your first task</li>
                            <li>🔄 Build daily habits</li>
                            <li>👥 Invite your team</li>
                            <li>🔥 Build your streak</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${APP_URL}/dashboard" 
                           style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                  color: white;
                                  padding: 14px 32px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: 600;
                                  display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Welcome email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send task reminder email
 */
export async function sendTaskReminderEmail(
  email: string,
  taskTitle: string,
  dueDate: string,
  taskId: string
): Promise<EmailResult> {
  const taskUrl = `${APP_URL}/tasks?id=${taskId}`;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⏰ Reminder: ${taskTitle}`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #f59e0b; margin-bottom: 24px;">⏰ Task Reminder</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Don't forget about your task:
                    </p>
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #92400e; margin: 0 0 8px 0;">${taskTitle}</h3>
                        <p style="color: #b45309; margin: 0; font-size: 14px;">Due: ${dueDate}</p>
                    </div>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${taskUrl}" 
                           style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                                  color: white;
                                  padding: 14px 32px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: 600;
                                  display: inline-block;">
                            View Task
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Task reminder email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
