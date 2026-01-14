import { createTheme } from '@mui/material/styles';

// Organizer theme - Màu sắc riêng biệt, không giống trang khách hàng
const organizerTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2dc275', // TicketBooking Green
            light: '#5dd39e',
            dark: '#219d5c',
            contrastText: '#fff'
        },
        secondary: {
            main: '#10b981', // Emerald Green
            light: '#34d399',
            dark: '#059669',
            contrastText: '#fff'
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f'
        },
        warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00'
        },
        info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2'
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c'
        },
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)'
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff'
        },
        divider: 'rgba(0, 0, 0, 0.12)'
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.3
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.5
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.6
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.75
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.57
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.75rem',
            lineHeight: 1.5
        },
        button: {
            textTransform: 'none',
            fontWeight: 500
        }
    },
    shape: {
        borderRadius: 8
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(45, 194, 117, 0.05)',
        '0px 4px 8px rgba(45, 194, 117, 0.08)',
        '0px 8px 16px rgba(45, 194, 117, 0.1)',
        '0px 12px 24px rgba(45, 194, 117, 0.12)',
        '0px 16px 32px rgba(45, 194, 117, 0.14)',
        '0px 20px 40px rgba(45, 194, 117, 0.16)',
        '0px 24px 48px rgba(45, 194, 117, 0.18)',
        '0px 28px 56px rgba(45, 194, 117, 0.2)',
        '0px 32px 64px rgba(45, 194, 117, 0.22)',
        '0px 36px 72px rgba(45, 194, 117, 0.24)',
        '0px 40px 80px rgba(45, 194, 117, 0.26)',
        '0px 44px 88px rgba(45, 194, 117, 0.28)',
        '0px 48px 96px rgba(45, 194, 117, 0.3)',
        '0px 52px 104px rgba(45, 194, 117, 0.32)',
        '0px 56px 112px rgba(45, 194, 117, 0.34)',
        '0px 60px 120px rgba(45, 194, 117, 0.36)',
        '0px 64px 128px rgba(45, 194, 117, 0.38)',
        '0px 68px 136px rgba(45, 194, 117, 0.4)',
        '0px 72px 144px rgba(45, 194, 117, 0.42)',
        '0px 76px 152px rgba(45, 194, 117, 0.44)',
        '0px 80px 160px rgba(45, 194, 117, 0.46)',
        '0px 84px 168px rgba(45, 194, 117, 0.48)',
        '0px 88px 176px rgba(45, 194, 117, 0.5)',
        '0px 92px 184px rgba(45, 194, 117, 0.52)'
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 16px'
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(45, 194, 117, 0.2)'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                },
                rounded: {
                    borderRadius: 12
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)'
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)'
                }
            }
        }
    }
});

export default organizerTheme;
