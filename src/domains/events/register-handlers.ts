/**
 * Centralized Event Handler Registration
 * Import this module in any API route that needs event-driven side effects.
 * This ensures all handlers are registered exactly once via module-level side effects.
 */

// These modules self-register their handlers on import
import '@/domains/gamification/gamification.handlers';
import '@/domains/behavior/behavior.handlers';
import '@/domains/cache/cache.handlers';
import '@/domains/ai/ai.handlers';

export const HANDLERS_REGISTERED = true;
