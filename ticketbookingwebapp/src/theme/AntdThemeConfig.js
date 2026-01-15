export const AntdThemeConfig = {
    token: {
        colorPrimary: '#52c41a', // Ant Design Green
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        borderRadius: 6,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    },
    components: {
        Layout: {
            headerBg: '#ffffff',
            bodyBg: '#f5f7fa',
            triggerBg: '#ffffff',
        },
        Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#f6ffed',
            itemSelectedColor: '#52c41a',
            itemHoverBg: '#f5f5f5',
        },
        Button: {
            borderRadius: 4,
            fontWeight: 500,
        },
        Card: {
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }
    }
};
