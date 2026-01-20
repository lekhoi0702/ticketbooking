import { theme } from 'antd';

export const AntdThemeConfig = {
    token: {
        colorPrimary: '#2DC275',
        colorSuccess: '#2DC275',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        borderRadius: 8,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    algorithm: theme.defaultAlgorithm,
    components: {
        Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 600,
        },
        Card: {
            borderRadiusLG: 16,
        },
        Input: {
            borderRadius: 8,
            controlHeight: 40,
        },
        Table: {
            borderRadius: 12,
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
