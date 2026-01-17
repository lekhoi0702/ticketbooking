import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Layout } from 'antd';

const { Content } = Layout;

const UserLayout = () => {
    return (
        <Layout className="app-layout" style={{ minHeight: '100vh', width: '100%', padding: 0, margin: 0, overflowX: 'hidden', background: '#ffffff' }}>
            <Header />
            <Content className="app-content" style={{ background: '#000000', color: '#ffffff' }}>
                <main className="flex-grow-1">
                    <Outlet />
                </main>
            </Content>
            <Footer />
        </Layout>
    );
};

export default UserLayout;
