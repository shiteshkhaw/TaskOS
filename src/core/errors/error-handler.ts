import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './custom-errors';
import { logger, requestContext } from '../logger/logger';
import crypto from 'crypto';

export function withErrorHandler(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async (req: NextRequest, ...args: any[]) => {
        const traceId = crypto.randomUUID();
        const store = new Map<string, any>();
        store.set('traceId', traceId);
        store.set('path', req.nextUrl.pathname);
        
        return requestContext.run(store, async () => {
            const startTime = performance.now();
            
            try {
                const response = await handler(req, ...args);
                
                const executionTimeMs = Math.round(performance.now() - startTime);
                logger.info('Request completed successfully', { 
                    executionTimeMs, 
                    status: response.status 
                });
                
                return response;
            } catch (error: any) {
                const executionTimeMs = Math.round(performance.now() - startTime);
                
                if (error instanceof AppError) {
                    logger.warn('Operational error occurred', { 
                        err: error.message, 
                        code: error.code, 
                        executionTimeMs 
                    });
                    
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: { 
                                message: error.message, 
                                code: error.code 
                            } 
                        },
                        { status: error.statusCode }
                    );
                }
                
                logger.error('Unexpected server error', { 
                    err: error.message || error, 
                    executionTimeMs 
                });
                
                return NextResponse.json(
                    { 
                        success: false, 
                        error: { 
                            message: 'Internal Server Error', 
                            code: 'INTERNAL_ERROR' 
                        } 
                    },
                    { status: 500 }
                );
            }
        });
    };
}
