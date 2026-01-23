import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot/Chatbot';
import { Layout, ConfigProvider } from 'antd';
import { AntdThemeConfig } from '../../../theme/AntdThemeConfig';

const { Content } = Layout;

const UserLayout = () => {
    React.useEffect(() => {
        document.body.classList.add('dark-theme');
        return () => document.body.classList.remove('dark-theme');
    }, []);

    return (
        <Layout className="app-layout dark-theme" style={{ minHeight: '100vh', width: '100%', padding: 0, margin: 0, overflowX: 'hidden' }}>
            <ConfigProvider theme={AntdThemeConfig}>
                <Header />
            </ConfigProvider>
            <Content className="app-content" style={{ background: 'transparent', color: '#ffffff' }}>
                <main className="flex-grow-1">
                    <Outlet />
                </main>
            </Content>
            <ConfigProvider theme={AntdThemeConfig}>
                <Footer />
            </ConfigProvider>
            <Chatbot />
        </Layout>
    );
};

export default UserLayout;
