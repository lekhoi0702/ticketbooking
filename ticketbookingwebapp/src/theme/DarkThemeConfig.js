import { theme } from 'antd';

export const DarkThemeConfig = {
    token: {
        colorPrimary: '#2dc275',
        colorSuccess: '#2dc275',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        // Use green for "info" to avoid default blue accents in customer UI
        colorInfo: '#2dc275',

        // Match SeatSelection palette
        colorBgLayout: 'rgb(39, 39, 42)',
        colorBgContainer: 'rgba(18, 18, 18, 0.55)',
        colorBgElevated: 'rgba(27, 27, 30, 0.98)',
        colorBorder: 'rgba(255, 255, 255, 0.10)',
        colorText: 'rgba(255, 255, 255, 0.92)',
        colorTextHeading: 'rgba(255, 255, 255, 0.95)',
        colorTextSecondary: 'rgba(255, 255, 255, 0.65)',

        borderRadius: 14,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Button: {
            borderRadius: 14,
            controlHeight: 44,
            fontWeight: 800,
        },
        Card: {
            borderRadiusLG: 18,
            colorBgContainer: 'rgba(18, 18, 18, 0.55)',
        },
        Input: {
            borderRadius: 14,
            controlHeight: 44,
            colorBgContainer: 'rgba(0, 0, 0, 0.18)',
            colorText: 'rgba(255, 255, 255, 0.92)',
            colorBorder: 'rgba(255, 255, 255, 0.14)',
        },
        Select: {
            borderRadius: 14,
            controlHeight: 44,
        },
        DatePicker: {
            borderRadius: 14,
            controlHeight: 44,
        },
        Modal: {
            borderRadiusLG: 18,
        },
        Table: {
            borderRadius: 12,
            colorBgContainer: 'rgba(18, 18, 18, 0.55)',
            colorHeaderBg: 'rgba(0, 0, 0, 0.18)',
            colorHeaderColor: 'rgba(255, 255, 255, 0.92)',
        },
        Tabs: {
            itemSelectedColor: '#2dc275',
            itemHoverColor: '#2dc275',
            inkBarColor: '#2dc275',
        },
        Menu: {
            itemSelectedBg: 'rgba(45, 194, 117, 0.1)',
            itemSelectedColor: '#2dc275',
        }
    }
};
