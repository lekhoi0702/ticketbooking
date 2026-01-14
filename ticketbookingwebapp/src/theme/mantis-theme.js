import { createTheme } from '@mui/material/styles';

// Mantis default theme colors
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1890ff',
            light: '#e6f7ff',
            dark: '#096dd9',
            contrastText: '#fff'
        },
        secondary: {
            main: '#52c41a',
            light: '#f6ffed',
            dark: '#389e0d',
            contrastText: '#fff'
        },
        error: {
            main: '#ff4d4f',
            light: '#fff1f0',
            dark: '#cf1322'
        },
        warning: {
            main: '#faad14',
            light: '#fffbe6',
            dark: '#d48806'
        },
        info: {
            main: '#1890ff',
            light: '#e6f7ff',
            dark: '#096dd9'
        },
        success: {
            main: '#52c41a',
            light: '#f6ffed',
            dark: '#389e0d'
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
            primary: '#262626',
            secondary: '#8c8c8c',
            disabled: '#bfbfbf'
        },
        background: {
            default: '#f0f2f5',
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
        borderRadius: 8
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
        '0px 12px 24px rgba(0,0,0,0.12)',
        '0px 16px 32px rgba(0,0,0,0.14)',
        '0px 20px 40px rgba(0,0,0,0.16)',
        '0px 24px 48px rgba(0,0,0,0.18)',
        '0px 28px 56px rgba(0,0,0,0.2)',
        '0px 32px 64px rgba(0,0,0,0.22)',
        '0px 36px 72px rgba(0,0,0,0.24)',
        '0px 40px 80px rgba(0,0,0,0.26)',
        '0px 44px 88px rgba(0,0,0,0.28)',
        '0px 48px 96px rgba(0,0,0,0.3)',
        '0px 52px 104px rgba(0,0,0,0.32)',
        '0px 56px 112px rgba(0,0,0,0.34)',
        '0px 60px 120px rgba(0,0,0,0.36)',
        '0px 64px 128px rgba(0,0,0,0.38)',
        '0px 68px 136px rgba(0,0,0,0.4)',
        '0px 72px 144px rgba(0,0,0,0.42)',
        '0px 76px 152px rgba(0,0,0,0.44)',
        '0px 80px 160px rgba(0,0,0,0.46)',
        '0px 84px 168px rgba(0,0,0,0.48)',
        '0px 88px 176px rgba(0,0,0,0.5)',
        '0px 92px 184px rgba(0,0,0,0.52)'
    ]
});

export default theme;
