import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/errors/error-handler';
import { authenticateRequest } from '@/core/middleware/auth.middleware';
import { checkRateLimit } from '@/core/middleware/rate-limit';
import { logger, requestContext } from '@/core/logger/logger';
import { SampleTaskService } from '@/domains/sample/sample.service';

// Ensure handlers are registered in the runtime
import '@/domains/sample/sample.handlers';

export const POST = withErrorHandler(async (req: NextRequest) => {
    // 1. Rate Limiting Middleware
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await checkRateLimit(ip, 10, 60000); // Max 10 requests per minute

    // 2. Authentication Middleware
    const { email } = await authenticateRequest(req);
    
    // Inject user context into logger dynamically
    const store = requestContext.getStore();
    store?.set('userId', email);

    // 3. Request parsing
    const { taskId } = await req.json();

    logger.info('Received API Request to complete task', { taskId });

    // 4. Core Business Logic via Service
    const result = await SampleTaskService.completeTask(taskId, email);

    // 5. Return DTO / Final Response
    return NextResponse.json({
        success: true,
        data: {
            id: result.id,
            isComplete: result.isComplete,
            completedAt: result.completedAt,
        }
    });
});
