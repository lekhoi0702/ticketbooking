import React from 'react';
import { ConfigProvider } from 'antd';
import { DarkThemeConfig } from '@theme/DarkThemeConfig';

const CustomerAuthLayout = ({ children }) => {
    React.useEffect(() => {
        document.body.classList.add('dark-theme');
        return () => document.body.classList.remove('dark-theme');
    }, []);

    return (
        <ConfigProvider theme={DarkThemeConfig}>
            {children}
        </ConfigProvider>
    );
};

export default CustomerAuthLayout;

