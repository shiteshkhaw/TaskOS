import { NextResponse } from 'next/server';

/**
 * Standard API response helpers to maintain consistency with FastAPI responses
 */

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ detail: message }, { status });
}

export function notFoundResponse(message = 'Not found') {
    return NextResponse.json({ detail: message }, { status: 404 });
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json({ detail: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json({ detail: message }, { status: 403 });
}

export function serverErrorResponse(message = 'Internal server error') {
    return NextResponse.json({ detail: message }, { status: 500 });
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | { detail: string }>> {
    return handler().catch((error: Error) => {
        console.error('API Error:', error);
        return serverErrorResponse(error.message || 'Internal server error');
    });
}
