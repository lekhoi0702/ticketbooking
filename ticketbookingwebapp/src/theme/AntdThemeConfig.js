import { theme } from 'antd';

export const AntdThemeConfig = {
    token: {
        colorPrimary: '#52c41a',
        colorSuccess: '#52c41a',
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
            itemSelectedColor: '#52c41a',
            itemHoverColor: '#52c41a',
            inkBarColor: '#52c41a',
        },
        Menu: {
            itemSelectedBg: 'rgba(82, 196, 26, 0.1)',
            itemSelectedColor: '#52c41a',
        }
    }
};
