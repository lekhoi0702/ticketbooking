import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Layout } from 'antd';

const { Content } = Layout;

const UserLayout = () => {
    return (
        <Layout className="app-layout" style={{ minHeight: '100vh', background: '#fff' }}>
            <Header />
            <Content className="app-content">
                <main className="flex-grow-1">
                    <Outlet />
                </main>
            </Content>
            <Footer />
        </Layout>
    );
};

export default UserLayout;
