import React from 'react';
import { Card, CardContent, Stack, Box, Typography, Avatar } from '@mui/material';
import { TrendingUp as TrendingUpIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, trend, link }) => (
    <Card
        sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease'
            },
            transition: 'all 0.3s ease'
        }}
    >
        <CardContent>
            <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: `${color}15`,
                            color: color,
                            width: 56,
                            height: 56
                        }}
                    >
                        {icon}
                    </Avatar>
                </Stack>

                {trend && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            {trend}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            so với tháng trước
                        </Typography>
                    </Stack>
                )}

                {link && (
                    <Box
                        component={RouterLink}
                        to={link}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: color,
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            '&:hover': {
                                gap: 1,
                                transition: 'all 0.2s'
                            }
                        }}
                    >
                        Xem chi tiết
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                )}
            </Stack>
        </CardContent>

        {/* Decorative background */}
        <Box
            sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: `${color}08`,
                zIndex: 0
            }}
        />
    </Card>
);

export default StatCard;
