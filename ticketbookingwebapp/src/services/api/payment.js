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

    async createPayPalOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
        });
        if (!response.ok) {
            let errorMessage = 'Failed to create PayPal payment order';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                if (response.status === 404) {
                    errorMessage = 'Không thể kết nối đến server thanh toán. Vui lòng kiểm tra backend server.';
                }
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    },

    async verifyPayPalReturn(queryParams) {
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${API_BASE_URL}/payments/paypal/return?${queryString}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Payment verification failed');
        }
        return await response.json();
    },

    async createVietQR(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/vietqr/create-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
        });
        if (!response.ok) {
            let errorMessage = 'Failed to create VietQR payment';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                if (response.status === 404) {
                    errorMessage = 'Không thể kết nối đến server thanh toán. Vui lòng kiểm tra backend server.';
                }
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    },

    async checkVietQRStatus(paymentCode) {
        const response = await fetch(`${API_BASE_URL}/payments/vietqr/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_code: paymentCode }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to check payment status');
        }
        return await response.json();
    },

    async verifyVietQRPayment(paymentCode) {
        const response = await fetch(`${API_BASE_URL}/payments/vietqr/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_code: paymentCode }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Payment verification failed');
        }
        return await response.json();
    },

    async getVietQRBanks() {
        try {
            const response = await fetch('https://api.vietqr.io/v2/banks', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch banks');
            }
            const data = await response.json();
            // Filter only banks that support transfer
            if (data.code === '00' && data.data) {
                return {
                    success: true,
                    banks: data.data.filter(bank => bank.transferSupported === 1 || bank.isTransfer === 1)
                };
            }
            return { success: false, banks: [] };
        } catch (error) {
            console.error('Error fetching VietQR banks:', error);
            return { success: false, banks: [], error: error.message };
        }
    },
};
