import { API_BASE_URL } from '@shared/constants';

export const paymentApi = {
    async createPayment(paymentData) {
        const response = await fetch(`${API_BASE_URL}/payments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create payment');
        }
        return await response.json();
    },

    async createVNPayPaymentUrl(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/vnpay/create-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
        });
        if (!response.ok) {
            // Try to parse error, but handle non-JSON responses (e.g., proxy failure)
            let errorMessage = 'Failed to create VNPay payment URL';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                // Response is not JSON - likely backend server is not running
                if (response.status === 404) {
                    errorMessage = 'Không thể kết nối đến server thanh toán. Vui lòng kiểm tra backend server.';
                }
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    },

    async verifyVNPayReturn(queryParams) {
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${API_BASE_URL}/payments/vnpay/return?${queryString}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Payment verification failed');
        }
        return await response.json();
    },

    async confirmCashPayment(paymentId) {
        const response = await fetch(`${API_BASE_URL}/payments/cash/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_id: paymentId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm cash payment');
        }
        return await response.json();
    },

    async getPayment(paymentId) {
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getPaymentByOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/order/${orderId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },
};
