import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/errors/error-handler';
import { authenticateRequest } from '@/core/middleware/auth.middleware';
import { checkRateLimit } from '@/core/middleware/rate-limit';
import { logger, requestContext } from '@/core/logger/logger';
import { CompleteTaskUseCase } from '@/domains/orchestration/complete-task.usecase';

// Register cross-domain handlers
import '@/domains/gamification/gamification.handlers';

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    // 1. Rate Limiting Middleware (Strictly limits mutations)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await checkRateLimit(ip, 20, 60000);

    // 2. Authentication Middleware
    const { email } = await authenticateRequest(req);
    
    // 3. Inject Context for Observability
    const store = requestContext.getStore();
    store?.set('userId', email);

    // 4. RBAC & Feature Gating Usage (Example logic)
    // Assume user has roles fetched from JWT
    const mockUserRoles = ['USER']; 
    // checkRole(mockUserRoles, 'USER'); // Validates they are a user
    
    // checkFeatureGate(email, 'ai_prioritization'); // Example for premium

    const taskId = params.id;
    logger.info('Received API Request to complete task', { taskId });

    // 5. Orchestration / Use Case
    const result = await CompleteTaskUseCase.execute(taskId, email);

    // 6. Strict Standardized Response
    return NextResponse.json({
        success: true,
        data: result
    });
});
