import { API_BASE_URL } from '@shared/constants';

export const orderApi = {
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
        return await response.json();
    },

    async getOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getOrderByCode(orderCode) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderCode}/status`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getUserOrders(userId) {
        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getUserTickets(userId) {
        const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async cancelOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel order');
        }
        return await response.json();
    },

    async checkDiscount(data) {
        const baseUrl = API_BASE_URL || 'http://127.0.0.1:5000/api';
        console.log('Checking discount at:', `${baseUrl}/orders/validate-discount`);
        const response = await fetch(`${baseUrl}/orders/validate-discount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        console.log("Validate Response:", res);
        if (!response.ok) throw new Error(res.message || 'Lỗi kiểm tra mã');
        return res;
    }
};
