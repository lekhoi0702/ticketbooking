import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search,
    Refresh,
    Visibility,
    CheckCircle,
    AccountBalanceWallet,
    Payments,
    History,
    CancelOutlined,
    CheckCircleOutline,
    Close
} from '@mui/icons-material';
import { api } from '../../services/api';

const AdminOrdersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminOrders();
            if (res.success) setOrders(res.data);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
            showToast("Error loading transaction logs", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    const handleConfirmCash = async (orderId) => {
        if (!window.confirm("Confirm cash payment for this order? The state will be updated to PAID.")) return;
        try {
            const res = await api.confirmCashPayment(orderId);
            if (res.success) {
                showToast("Payment confirmed successfully!");
                fetchOrders();
            }
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const handleProcessCancellation = async (orderId, action) => {
        const confirmMsg = action === 'approve'
            ? "Approve this cancellation request? Order will be marked as CANCELLED."
            : "Reject this cancellation request? Order will return to PAID status.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.processOrderCancellation(orderId, action);
            if (res.success) {
                showToast(action === 'approve' ? "Cancellation approved" : "Cancellation rejected");
                fetchOrders();
            }
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        const styles = {
            'PAID': 'success',
            'PENDING': 'warning',
            'CANCELLED': 'error',
            'CANCELLATION_PENDING': 'info'
        };
        return styles[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PAID': 'Paid',
            'PENDING': 'Pending Payment',
            'CANCELLED': 'Cancelled',
            'CANCELLATION_PENDING': 'Cancellation Pending'
        };
        return labels[status] || status;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading && orders.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Lịch Sử Giao Dịch
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Theo dõi dòng tiền và trạng thái thanh toán vé trên toàn hệ thống.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchOrders}
                    size="small"
                    sx={{ color: 'text.secondary', borderColor: 'divider' }}
                >
                    Làm mới
                </Button>
            </Stack>

            <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #EBEEF5' }}>
                        <TextField
                            sx={{ maxWidth: 350 }}
                            size="small"
                            placeholder="Mã đơn, khách hàng hoặc sự kiện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="disabled" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 1000 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ px: 3 }}>MÃ ĐƠN/NGÀY</TableCell>
                                    <TableCell>KHÁCH HÀNG</TableCell>
                                    <TableCell>SỰ KIỆN</TableCell>
                                    <TableCell align="center">PHƯƠNG THỨC</TableCell>
                                    <TableCell align="right">SỐ TIỀN</TableCell>
                                    <TableCell align="center">TRẠNG THÁI</TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>THAO TÁC</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.order_id} hover>
                                            <TableCell sx={{ px: 3 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                    {order.order_code}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <History sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(order.created_at).toLocaleString('vi-VN')}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{order.customer_phone || 'No phone'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontWeight: 500 }}>
                                                    {order.event_name || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    icon={order.payment_method === 'VNPAY' ? <AccountBalanceWallet sx={{ fontSize: '14px !important' }} /> : <Payments sx={{ fontSize: '14px !important' }} />}
                                                    label={order.payment_method}
                                                    size="small"
                                                    color={order.payment_method === 'VNPAY' ? "info" : "default"}
                                                    variant="outlined"
                                                    sx={{ borderRadius: 1, fontWeight: 600, minWidth: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={getStatusLabel(order.order_status)}
                                                    color={getStatusColor(order.order_status)}
                                                    size="small"
                                                    sx={{ borderRadius: 1.5, fontWeight: 600, px: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="View Receipt">
                                                        <IconButton size="small">
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {order.payment_method === 'CASH' && order.order_status === 'PENDING' && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleConfirmCash(order.order_id)}
                                                            sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                                        >
                                                            Confirm
                                                        </Button>
                                                    )}
                                                    {order.order_status === 'CANCELLATION_PENDING' && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="success"
                                                                startIcon={<CheckCircleOutline />}
                                                                onClick={() => handleProcessCancellation(order.order_id, 'approve')}
                                                                sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                color="error"
                                                                startIcon={<Close />}
                                                                onClick={() => handleProcessCancellation(order.order_id, 'reject')}
                                                                sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                            <Typography color="textSecondary">No transaction records found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Snackbar
                open={toast.show}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.variant} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminOrdersManagement;
