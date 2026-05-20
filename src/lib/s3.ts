/**
 * AWS S3 Service for TaskOS
 * Handles avatar uploads and file management
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'taskos-avatars';
const REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize S3 client
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

/**
 * Upload avatar to S3
 */
export async function uploadAvatar(
    email: string,
    fileBuffer: Buffer,
    contentType: string,
    fileName: string
): Promise<UploadResult> {
    try {
        // Validate file type
        if (!ALLOWED_TYPES.includes(contentType)) {
            return {
                success: false,
                error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
            };
        }

        // Validate file size
        if (fileBuffer.length > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        // Generate unique key
        const ext = fileName.split('.').pop() || 'jpg';
        const key = `avatars/${email.replace('@', '_at_')}/${uuidv4()}.${ext}`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        // Construct public URL
        const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

        return {
            success: true,
            url,
            key,
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Delete avatar from S3
 */
export async function deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
        if (!avatarUrl || !avatarUrl.includes(BUCKET_NAME)) {
            return false;
        }

        // Extract key from URL
        const urlParts = avatarUrl.split(`${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`);
        if (urlParts.length < 2) {
            return false;
        }
        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('S3 delete error:', error);
        return false;
    }
}

/**
 * Check if S3 is configured
 */
export function isS3Configured(): boolean {
    return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
    );
}
