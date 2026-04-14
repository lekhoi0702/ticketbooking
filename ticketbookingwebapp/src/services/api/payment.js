import { apiRequest, unsupported } from './_compat';

const createMockPaymentUrl = (orderCode) => `/order-success/${orderCode}`;

const fetchOrderById = async (orderId) => {
    const orderRes = await apiRequest(`/orders/${orderId}`);
    if (orderRes.success) return orderRes.data;
    return null;
};

const createPaymentRecord = async (orderId, method = 'Manual', status = 'Pending') =>
    apiRequest('/payments', {
        method: 'POST',
        body: {
            OrderID: orderId,
            Amount: 0,
            PaymentMethod: method,
            CreateID: 1,
            Status: status,
        },
    });

export const paymentApi = {
    async createPayment(paymentData = {}) {
        return apiRequest('/payments', {
            method: 'POST',
            body: {
                OrderID: paymentData.order_id || paymentData.OrderID,
                Amount: paymentData.amount || paymentData.Amount || 0,
                PaymentMethod: paymentData.payment_method || paymentData.PaymentMethod || 'Manual',
                CreateID: paymentData.create_id || paymentData.CreateID || 1,
                Status: paymentData.status || paymentData.Status || 'Completed',
            },
        });
    },

    async createVNPayPaymentUrl(orderId) {
        const order = await fetchOrderById(orderId);
        if (!order) return unsupported('Không tìm thấy đơn hàng để tạo thanh toán VNPay.');
        await createPaymentRecord(orderId, 'VNPAY', 'Pending');
        return {
            success: true,
            data: { payment_url: createMockPaymentUrl(order.order_code) },
            message: '',
        };
    },

    async verifyVNPayReturn(params = {}) {
        return apiRequest('/payments/vnpay/return', { query: params });
    },

    async confirmCashPayment(paymentId) {
        return { success: true, data: { payment_id: paymentId }, message: 'Đã xác nhận thanh toán' };
    },

    async getPayment(paymentId) {
        const list = await apiRequest('/payments');
        if (!list.success) return list;
        const found = (list.data || []).find((p) => String(p.payment_id) === String(paymentId));
        if (!found) return { success: false, data: null, message: 'Không tìm thấy thanh toán' };
        return { success: true, data: found, message: '' };
    },

    async getPaymentByOrder(orderId) {
        return apiRequest('/payments', { query: { OrderID: orderId } });
    },

    async createPayPalOrder(orderId) {
        const order = await fetchOrderById(orderId);
        if (!order) return unsupported('Không tìm thấy đơn hàng để tạo thanh toán PayPal.');
        await createPaymentRecord(orderId, 'PAYPAL', 'Pending');
        return {
            success: true,
            data: { payment_url: createMockPaymentUrl(order.order_code) },
            message: '',
        };
    },

    async verifyPayPalReturn(payload = {}) {
        return apiRequest('/payments/paypal/return', {
            method: 'POST',
            body: payload,
        });
    },

    async createVietQR(orderId) {
        const order = await fetchOrderById(orderId);
        if (!order) return unsupported('Không tìm thấy đơn hàng để tạo VietQR.');

        await createPaymentRecord(orderId, 'VIETQR', 'Pending');
        return {
            success: true,
            data: {
                payment_code: `VQR${orderId}`,
                order_code: order.order_code,
                qr_url: '/uploads/misc/quangcaoshopee.png',
                amount: order.total_amount || 0,
                payment_status: 'COMPLETED',
            },
            message: '',
        };
    },

    async checkVietQRStatus(paymentCode) {
        const parsedOrderId = Number(String(paymentCode || '').replace(/^VQR/i, ''));
        if (Number.isFinite(parsedOrderId) && parsedOrderId > 0) {
            await apiRequest(`/orders/${parsedOrderId}`, {
                method: 'PATCH',
                body: { Status: 'PAID' },
            });
        }
        return {
            success: true,
            data: { payment_code: paymentCode, payment_status: 'COMPLETED' },
            message: '',
        };
    },

    async verifyVietQRPayment(paymentCode) {
        const parsedOrderId = Number(String(paymentCode || '').replace(/^VQR/i, ''));
        if (Number.isFinite(parsedOrderId) && parsedOrderId > 0) {
            await apiRequest(`/orders/${parsedOrderId}`, {
                method: 'PATCH',
                body: { Status: 'PAID' },
            });
        }
        const orderCode = String(paymentCode || '').replace(/^VQR/i, 'TB');
        return {
            success: true,
            data: { order_code: orderCode || `TB${Date.now()}`, payment_status: 'COMPLETED' },
            message: '',
        };
    },

    async getVietQRBanks() {
        try {
            const response = await fetch('https://api.vietqr.io/v2/banks');
            if (!response.ok) return { success: false, banks: [], message: 'Không lấy được danh sách ngân hàng' };
            const data = await response.json();
            if (data.code === '00' && Array.isArray(data.data)) {
                return {
                    success: true,
                    banks: data.data.filter((bank) => bank.transferSupported === 1 || bank.isTransfer === 1),
                };
            }
            return { success: false, banks: [], message: 'Dữ liệu ngân hàng không hợp lệ' };
        } catch (error) {
            return { success: false, banks: [], message: error?.message || 'Không lấy được danh sách ngân hàng' };
        }
    },
};
