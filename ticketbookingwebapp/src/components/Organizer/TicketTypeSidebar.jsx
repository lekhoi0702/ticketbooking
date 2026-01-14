import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    LinearProgress,
    Stack,
    Divider,
    Paper
} from '@mui/material';
import {
    Chair as ChairIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const TicketTypeSidebar = ({
    ticketTypes,
    activeTicketType,
    setActiveTicketType,
    allOccupiedSeats,
    venueTemplate,
    venueName
}) => {
    return (
        <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardHeader
                    title="HẠNG VÉ SỰ KIỆN"
                    titleTypographyProps={{
                        variant: 'caption',
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: 'text.secondary'
                    }}
                    sx={{ bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider', py: 1.5 }}
                />
                <List disablePadding>
                    {ticketTypes.map((tt, index) => {
                        const isActive = activeTicketType?.ticket_type_id === tt.ticket_type_id;
                        const assignedCount = allOccupiedSeats.filter(s => String(s.ticket_type_id) === String(tt.ticket_type_id)).length;
                        const isFull = assignedCount >= tt.quantity;
                        const progress = Math.min(100, (assignedCount / tt.quantity) * 100);

                        return (
                            <React.Fragment key={tt.ticket_type_id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        selected={isActive}
                                        onClick={() => setActiveTicketType(tt)}
                                        sx={{
                                            py: 2.5,
                                            px: 3,
                                            borderLeft: isActive ? 4 : 0,
                                            borderColor: 'primary.main',
                                            transition: 'all 0.2s',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.lighter',
                                                '&:hover': { bgcolor: 'primary.lighter' }
                                            }
                                        }}
                                    >
                                        <Stack spacing={1} sx={{ width: '100%' }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: isActive ? 'primary.main' : 'text.primary'
                                                        }}
                                                    >
                                                        {tt.type_name}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: assignedCount > 0 ? 'success.main' : 'text.disabled'
                                                            }}
                                                        >
                                                            {assignedCount}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled">/</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {tt.quantity} ghế
                                                        </Typography>
                                                        {isFull && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                                                    </Stack>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: isActive ? 'primary.main' : 'action.hover',
                                                        color: isActive ? 'white' : 'text.disabled'
                                                    }}
                                                >
                                                    <ChairIcon sx={{ fontSize: 16 }} />
                                                </Box>
                                            </Stack>

                                            {isActive && (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0,0,0,0.05)',
                                                        '& .MuiLinearProgress-bar': { borderRadius: 2 }
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    </ListItemButton>
                                </ListItem>
                                {index < ticketTypes.length - 1 && <Divider />}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Card>

            {/* Instruction Card */}
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'info.lighter',
                    borderColor: 'info.light'
                }}
            >
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <InfoIcon color="info" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark' }}>
                            Hướng dẫn
                        </Typography>
                    </Stack>

                    {venueTemplate ? (
                        <>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Sơ đồ được nạp từ thiết kế của <strong>{venueName}</strong>.
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 1 } }}>
                                <Typography component="li" variant="caption" color="text.secondary">
                                    Click và <strong>Rê chuột</strong> để gán/hủy gán nhiều ghế cùng lúc.
                                </Typography>
                                <Typography component="li" variant="caption" color="text.secondary">
                                    <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>Xanh</Box>: Đang gán cho hạng này.
                                </Typography>
                                <Typography component="li" variant="caption" color="text.secondary">
                                    <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>Đỏ</Box>: Đã gán cho hạng vé khác.
                                </Typography>
                                {activeTicketType && (
                                    <Typography component="li" variant="caption" sx={{ color: 'primary.dark', fontWeight: 600 }}>
                                        Hãy chọn đúng <strong>{activeTicketType.quantity}</strong> ghế cho <strong>{activeTicketType.type_name}</strong>.
                                    </Typography>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            Thiết lập lưới ghế bằng cách nhập số hàng và số ghế mỗi hàng.
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
};

export default TicketTypeSidebar;
