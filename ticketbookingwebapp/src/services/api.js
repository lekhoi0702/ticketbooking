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
    ...organizerApi,  // Organizer-specific methods (may require auth)
    ...seatApi,
    ...orderApi,
    ...paymentApi,
    ...adminApi,
    ...eventApi,      // Public event methods - placed last to override organizer methods with same name
};
