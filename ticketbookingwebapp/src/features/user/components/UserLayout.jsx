import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot/Chatbot';
import ChangePasswordModal from '@features/user/components/Account/ChangePasswordModal';
import { Layout } from 'antd';
import { useAuth } from '@context/AuthContext';

const { Content } = Layout;

const UserLayout = () => {
    const { user, updateUser } = useAuth();

    React.useEffect(() => {
        document.body.classList.add('dark-theme');
        return () => document.body.classList.remove('dark-theme');
    }, []);

    return (
        <Layout className="app-layout dark-theme" style={{ minHeight: '100vh', width: '100%', padding: 0, margin: 0, overflowX: 'hidden' }}>
            <Header />
            <Content className="app-content" style={{ background: 'transparent', color: '#ffffff' }}>
                <main className="flex-grow-1">
                    <Outlet />
                </main>
            </Content>
            <Footer />
            <Chatbot />
            {user?.must_change_password && (
                <ChangePasswordModal
                    show
                    forceChange
                    onSuccess={() => updateUser({ must_change_password: false })}
                />
            )}
        </Layout>
    );
};

export default UserLayout;
