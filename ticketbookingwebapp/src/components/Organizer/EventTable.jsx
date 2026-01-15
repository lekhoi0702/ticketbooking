import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Typography,
    LinearProgress,
    Box,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    EventSeat as SeatIcon,
    Public as PublicIcon,
    Warning as WarningIcon,
    Visibility as ViewIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

const EventTable = ({ events, handlePublishEvent, handleCancelApproval, handleDeleteClick }) => {
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_APPROVAL': { color: 'warning' },
            'APPROVED': { color: 'info' },
            'REJECTED': { color: 'error' },
            'PUBLISHED': { color: 'success' },
            'DRAFT': { color: 'default' },
            'ONGOING': { color: 'secondary' },
            'COMPLETED': { color: 'default' },
            'PENDING_DELETION': { color: 'error' }
        };
        const config = configs[status] || { color: 'default' };
        return { ...config, label: status };
    };



    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Tên Sự Kiện</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Thời Gian / Địa Điểm</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Thao Tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events && events.length > 0 ? (
                            events.map((event) => {
                                const totalSold = event.total_tickets_sold || 0;
                                const totalQty = event.total_quantity || 1;
                                const soldPercent = Math.round((totalSold / totalQty) * 100);
                                const statusConfig = getStatusConfig(event.status);

                                return (
                                    <TableRow
                                        key={event.event_id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        {/* Event Name */}
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={
                                                        event.banner_image_url?.startsWith('http')
                                                            ? event.banner_image_url
                                                            : `http://127.0.0.1:5000${event.banner_image_url}`
                                                    }
                                                    variant="rounded"
                                                    sx={{ width: 56, height: 56 }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {event.event_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: #{event.event_id} | {event.category?.category_name}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        {/* Time & Location */}
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        maxWidth: 200,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {event.venue?.venue_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>



                                        {/* Status */}
                                        <TableCell>
                                            <Chip
                                                label={statusConfig.label}
                                                color={statusConfig.color}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                            />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                {event.status === 'APPROVED' && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<PublicIcon />}
                                                        onClick={() => handlePublishEvent(event.event_id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontSize: '0.75rem',
                                                            px: 2
                                                        }}
                                                    >
                                                        Đăng
                                                    </Button>
                                                )}
                                                {event.status === 'PENDING_APPROVAL' && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleCancelApproval(event.event_id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontSize: '0.75rem',
                                                            px: 2
                                                        }}
                                                    >
                                                        Hủy duyệt
                                                    </Button>
                                                )}
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => navigate(`/organizer/event/${event.event_id}`)}
                                                        sx={{
                                                            border: 1,
                                                            borderColor: 'secondary.main',
                                                            '&:hover': {
                                                                bgcolor: 'secondary.light'
                                                            }
                                                        }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={
                                                    event.status === 'REJECTED' ? "Không thể sửa sự kiện bị từ chối" :
                                                        event.status === 'PENDING_APPROVAL' ? "Không thể sửa sự kiện đang chờ duyệt" :
                                                            event.status === 'ONGOING' ? "Không thể sửa sự kiện đang diễn ra" :
                                                                event.status === 'COMPLETED' ? "Không thể sửa sự kiện đã kết thúc" :
                                                                    "Sửa"
                                                }>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => navigate(`/organizer/edit-event/${event.event_id}`)}
                                                            disabled={['REJECTED', 'PENDING_APPROVAL', 'ONGOING', 'COMPLETED'].includes(event.status)}
                                                            sx={{
                                                                border: 1,
                                                                borderColor: ['REJECTED', 'PENDING_APPROVAL', 'ONGOING', 'COMPLETED'].includes(event.status) ? 'action.disabledBackground' : 'primary.main',
                                                                '&:hover': {
                                                                    bgcolor: 'primary.light'
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                {['DRAFT', 'REJECTED'].includes(event.status) && (
                                                    <Tooltip title="Xóa sự kiện">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteClick(event)}
                                                            sx={{
                                                                border: 1,
                                                                borderColor: 'error.main',
                                                                '&:hover': {
                                                                    bgcolor: 'error.lighter'
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            Không có sự kiện nào
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hãy tạo sự kiện đầu tiên của bạn
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table >
            </TableContainer >
        </>
    );
};

export default EventTable;
