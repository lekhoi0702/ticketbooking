import { theme } from 'antd';

export const DarkThemeConfig = {
    token: {
        colorPrimary: '#2DC275',
        colorSuccess: '#2DC275',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        colorBgLayout: '#000000',
        colorBgContainer: '#121212',
        colorText: '#ffffff',
        colorTextHeading: '#ffffff',
        colorBorder: '#333333',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 600,
        },
        Card: {
            borderRadiusLG: 16,
            colorBgContainer: '#121212',
        },
        Input: {
            borderRadius: 8,
            controlHeight: 40,
            colorBgContainer: '#1a1a1a',
            colorText: '#ffffff',
            colorBorder: '#333333',
        },
        Table: {
            borderRadius: 12,
            colorBgContainer: '#121212',
            colorHeaderBg: '#1a1a1a',
            colorHeaderColor: '#ffffff',
        },
        Tabs: {
            itemSelectedColor: '#2DC275',
            itemHoverColor: '#2DC275',
            inkBarColor: '#2DC275',
        },
        Menu: {
            itemSelectedBg: 'rgba(45, 194, 117, 0.1)',
            itemSelectedColor: '#2DC275',
        }
    }
};
