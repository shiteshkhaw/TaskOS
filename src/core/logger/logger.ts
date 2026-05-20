import { AsyncLocalStorage } from 'async_hooks';

// Setup AsyncLocalStorage for contextual logging
export const requestContext = new AsyncLocalStorage<Map<string, any>>();

class StructuredLogger {
    private format(level: string, message: string, obj?: any) {
        const store = requestContext.getStore();
        const traceId = store?.get('traceId') || 'no-trace-id';
        const userId = store?.get('userId') || 'anonymous';
        
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            traceId,
            userId,
            message,
            ...obj
        });
    }

    info(message: string, obj?: any) {
        console.log(this.format('INFO', message, obj));
    }

    warn(message: string, obj?: any) {
        console.warn(this.format('WARN', message, obj));
    }

    error(message: string, obj?: any) {
        console.error(this.format('ERROR', message, obj));
    }
    
    debug(message: string, obj?: any) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.format('DEBUG', message, obj));
        }
    }
}

export const logger = new StructuredLogger();
