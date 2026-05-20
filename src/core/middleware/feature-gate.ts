import { UnauthorizedError } from '../errors/custom-errors';

export async function checkFeatureGate(userEmail: string, feature: string) {
    const isProFeature = feature === 'ai_prioritization'; 
    
    if (isProFeature) {
        // Mock check until Stripe/Razorpay synced
        const isUserPro = true; 
        if (!isUserPro) {
            throw new UnauthorizedError('Premium subscription required');
        }
    }
}
