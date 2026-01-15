import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Input, Button, Dropdown, Space, Avatar, Badge, List, Typography } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    ShoppingOutlined,
    HistoryOutlined,
    LogoutOutlined,
    GlobalOutlined,
    PlusOutlined,
    CompassOutlined
} from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/eventUtils';
import AuthModal from './Auth/AuthModal';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const suggestionRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    setLoadingSuggestions(true);
                    const res = await api.searchEvents(searchQuery);
                    if (res.success) {
                        setSuggestions(res.data.slice(0, 5));
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                } finally {
                    setLoadingSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (value) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userMenuItems = [
        {
            key: 'tickets',
            icon: <ShoppingOutlined />,
            label: 'Vé của tôi',
            onClick: () => navigate('/my-tickets'),
        },
        {
            key: 'orders',
            icon: <HistoryOutlined />,
            label: 'Lịch sử đặt vé',
            onClick: () => navigate('/my-orders'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    const categoryMenuItems = categories.map(cat => ({
        key: cat.category_id,
        label: cat.category_name,
        onClick: () => navigate(`/category/${cat.category_id}`)
    }));

    return (
        <AntHeader className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <Link to="/" className="logo-section">
                        <CompassOutlined className="logo-icon" />
                        <Title level={3} className="logo-text">TICKETBOOKING</Title>
                    </Link>

                    <div className="header-search">
                        <Input
                            placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
                            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onPressEnter={(e) => handleSearch(e.target.value)}
                            className="search-input"
                            allowClear
                        />
                        {showSuggestions && (
                            <div className="search-suggestions" ref={suggestionRef}>
                                <List
                                    loading={loadingSuggestions}
                                    dataSource={suggestions}
                                    renderItem={(item) => (
                                        <List.Item
                                            className="suggestion-item"
                                            onClick={() => {
                                                navigate(`/event/${item.event_id}`);
                                                setSearchQuery('');
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar src={getImageUrl(item.banner_image_url)} shape="square" />}
                                                title={item.event_name}
                                                description={item.venue?.venue_name}
                                            />
                                        </List.Item>
                                    )}
                                    footer={
                                        suggestions.length > 0 && (
                                            <div
                                                className="view-all-results"
                                                onClick={() => handleSearch(searchQuery)}
                                            >
                                                Xem tất cả kết quả cho "{searchQuery}"
                                            </div>
                                        )
                                    }
                                />
                                {!loadingSuggestions && suggestions.length === 0 && searchQuery.length > 1 && (
                                    <div className="no-suggestions">Không tìm thấy sự kiện nào</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    <Space size="middle">
                        <Dropdown menu={{ items: categoryMenuItems }} trigger={['click']}><Button type="text" className="nav-btn">Khám phá <GlobalOutlined /></Button></Dropdown>

                        {isAuthenticated ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}><Space className="user-profile-btn">
                                <Avatar
                                    style={{ backgroundColor: '#52c41a' }}
                                    icon={<UserOutlined />}
                                    src={user?.avatar}
                                />
                                <span className="user-name">{user?.full_name}</span>
                            </Space></Dropdown>
                        ) : (
                            <Space>
                                <Button
                                    type="text"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/organizer')}
                                    className="organizer-btn"
                                >
                                    Tạo sự kiện
                                </Button>
                                <Button
                                    type="primary"
                                    className="login-btn"
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    Đăng nhập
                                </Button>
                            </Space>
                        )}
                    </Space>
                </div>
            </div>

            <AuthModal
                show={showAuthModal}
                onHide={() => setShowAuthModal(false)}
            />
        </AntHeader>
    );
};

export default Header;
