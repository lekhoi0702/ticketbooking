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
 */
export const api = {
    ...authApi,
    ...eventApi,
    ...organizerApi,
    ...seatApi,
    ...orderApi,
    ...paymentApi,
    ...adminApi,
};
