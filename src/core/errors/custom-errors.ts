export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_ERROR',
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

