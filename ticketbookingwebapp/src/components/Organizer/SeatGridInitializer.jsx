import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack
} from '@mui/material';
import { GridView as GridIcon } from '@mui/icons-material';

const SeatGridInitializer = ({ initData, setInitData, handleInitializeSeats }) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 4,
                borderStyle: 'dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover'
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                }}
            >
                <GridIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Khởi tạo lưới ghế tự do
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Dùng khi khu vực không có sơ đồ mẫu từ Admin
            </Typography>

            <Stack direction="row" spacing={2} sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                <TextField
                    fullWidth
                    label="Số hàng"
                    type="number"
                    value={initData.rows || ''}
                    onChange={e => setInitData({ ...initData, rows: e.target.value === '' ? '' : parseInt(e.target.value) })}
                />
                <TextField
                    fullWidth
                    label="Ghế mỗi hàng"
                    type="number"
                    value={initData.seats_per_row || ''}
                    onChange={e => setInitData({ ...initData, seats_per_row: e.target.value === '' ? '' : parseInt(e.target.value) })}
                />
            </Stack>

            <Button
                variant="contained"
                size="large"
                onClick={handleInitializeSeats}
                sx={{
                    px: 6,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)'
                    }
                }}
            >
                TẠO LƯỚI MẶC ĐỊNH
            </Button>
        </Paper>
    );
};

export default SeatGridInitializer;
