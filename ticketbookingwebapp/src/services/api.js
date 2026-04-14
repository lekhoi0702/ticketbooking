import { authApi } from './api/auth';
import { eventApi } from './api/event';
import { organizerApi } from './api/organizer';
import { seatApi } from './api/seat';
import { orderApi } from './api/order';
import { paymentApi } from './api/payment';
import { adminApi } from './api/admin';

/**
 * Aggregated API service
 * This maintains backward compatibility by exporting a single 'api' object
 * containing all methods from individual modules.
 * 
 * NOTE: Order matters! If multiple modules export methods with the same name,
 * the later ones will override earlier ones.
 */
export const api = {
    ...authApi,
    ...seatApi,
    ...orderApi,
    ...paymentApi,
    ...adminApi,
    ...organizerApi,  // Keep organizer after admin to prevent admin unsupported methods from overriding organizer ones
    ...eventApi,      // Public event methods - placed last to override organizer methods with same name
};
