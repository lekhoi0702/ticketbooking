import React from 'react';
import {
    Card,
    CardContent,
    Stack,
    Box,
    Typography,
    Tooltip,
    IconButton,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

const RecentOrdersTable = ({ orders, onProcessCancellation, onRefresh }) => {

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Giao dịch gần đây
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Danh sách các đơn hàng mới nhất
                        </Typography>
                    </Box>
                    <Tooltip title="Làm mới">
                        <IconButton onClick={onRefresh} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Mã Đơn</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Khách Hàng</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Sự Kiện</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }} align="right">Tổng Tiền</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Thanh Toán</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Ngày</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }} align="center">Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.order_id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: "'Roboto Mono', monospace",
                                                    fontWeight: 700,
                                                    color: 'primary.main',
                                                    bgcolor: 'rgba(45, 194, 117, 0.1)',
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    display: 'inline-block',
                                                    letterSpacing: '0.5px',
                                                    border: '1px solid rgba(45, 194, 117, 0.2)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {order.order_code}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {order.customer_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.customer_email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 250,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {order.event_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                {formatCurrency(order.total_amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.payment_method || (order.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán')}
                                                size="small"
                                                color={order.payment_method === 'VNPAY' ? 'info' : (order.status === 'PAID' ? 'success' : 'default')}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {order.order_status === 'CANCELLATION_PENDING' || order.status === 'CANCELLATION_PENDING' ? (
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Duyệt Hủy">
                                                        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); onProcessCancellation(order.order_id, 'approve'); }}>
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Từ Chối">
                                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onProcessCancellation(order.order_id, 'reject'); }}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">---</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <TicketIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                Chưa có giao dịch nào
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Các đơn hàng mới sẽ hiển thị tại đây
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default RecentOrdersTable;
