import { createTheme } from '@mui/material/styles';

// Mantis default theme colors
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#409EFF',
            light: '#ecf5ff',
            dark: '#337ecc',
            contrastText: '#fff'
        },
        secondary: {
            main: '#67C23A',
            light: '#f0f9eb',
            dark: '#529b2e',
            contrastText: '#fff'
        },
        error: {
            main: '#F56C6C',
            light: '#fef0f0',
            dark: '#c45656'
        },
        warning: {
            main: '#E6A23C',
            light: '#fdf6ec',
            dark: '#b88231'
        },
        info: {
            main: '#909399',
            light: '#f4f4f5',
            dark: '#73767a'
        },
        success: {
            main: '#67C23A',
            light: '#f0f9eb',
            dark: '#529b2e'
        },
        grey: {
            50: '#fafafa',
            100: '#f5f7fa',
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
            primary: '#303133',
            secondary: '#606266',
            disabled: '#C0C4CC'
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff'
        }
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: {
            fontSize: '2.125rem',
            fontWeight: 600,
            lineHeight: 1.2
        },
        h2: {
            fontSize: '1.875rem',
            fontWeight: 600,
            lineHeight: 1.3
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h5: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5
        },
        h6: {
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.6
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.75rem',
            lineHeight: 1.5
        }
    },
    shape: {
        borderRadius: 4
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 4,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                },
                containedPrimary: {
                    backgroundColor: '#409EFF',
                    '&:hover': {
                        backgroundColor: '#66b1ff'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #EBEEF5',
                    borderRadius: 4
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f5f7fa',
                    color: '#909399',
                    fontWeight: 600,
                    padding: '12px 16px'
                },
                root: {
                    borderBottom: '1px solid #ebeef5',
                    padding: '12px 16px'
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: '#ecf5ff',
                        color: '#409EFF',
                        '& .MuiListItemIcon-root': {
                            color: '#409EFF'
                        }
                    },
                    '&:hover': {
                        backgroundColor: '#f5f7fa'
                    }
                }
            }
        }
    }
});

export default theme;
