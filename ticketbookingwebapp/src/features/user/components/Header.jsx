import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Input, Button, Space, Avatar, Badge, List, Typography } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    PlusOutlined,
    LogoutOutlined,
    TagOutlined
} from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
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

    const { user, logout, isAuthenticated, showLoginModal, setShowLoginModal, triggerLogin, redirectIntent, clearRedirectIntent } = useAuth();
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

    const handleMyTickets = () => {
        if (isAuthenticated) {
            navigate('/profile?tab=tickets');
        } else {
            triggerLogin({ path: '/profile?tab=tickets', action: 'navigate' });
        }
    };

    const handleLoginSuccess = () => {
        // Handle redirect intent after successful login
        if (redirectIntent) {
            if (redirectIntent.action === 'navigate' && redirectIntent.path) {
                navigate(redirectIntent.path);
            }
            clearRedirectIntent();
        }
    };

    // Removed dropdown menu - avatar now navigates directly to profile


    return (
        <AntHeader className="app-header">
            <div className="header-top-wrapper">
                <div className="header-container">
                    <div className="header-left">
                        <Link to="/" className="logo-section">
                            <Title level={3} className="logo-text">TICKETBOOKING</Title>
                        </Link>

                        <div className="header-search">
                            <Input.Group compact className="custom-search-input">
                                <Input
                                    placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onPressEnter={(e) => handleSearch(e.target.value)}
                                    prefix={<SearchOutlined style={{ color: '#909399', fontSize: '18px', marginRight: '8px' }} />}
                                    size="large"
                                    allowClear
                                    className="custom-search-input-field"
                                    style={{ width: 'calc(100% - 100px)' }}
                                />
                                <Button
                                    type="default"
                                    size="large"
                                    onClick={() => handleSearch(searchQuery)}
                                    className="custom-search-button"
                                    style={{
                                        width: '100px',
                                        background: '#ffffff',
                                        border: 'none',
                                        color: '#909399',
                                        fontWeight: 600,
                                        fontSize: '14px'
                                    }}
                                >
                                    Tìm kiếm
                                </Button>
                            </Input.Group>
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
                            {isAuthenticated ? (
                                <Space size="middle">
                                    <Button
                                        type="text"
                                        icon={<TagOutlined />}
                                        onClick={() => navigate('/profile?tab=tickets')}
                                        className="nav-btn"
                                    >
                                        Vé của tôi
                                    </Button>
                                    <Space
                                        className="user-profile-btn"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate('/profile')}
                                    >
                                        <Avatar
                                            size={40}
                                            style={{ backgroundColor: 'transparent', border: 'none', overflow: 'hidden' }}
                                        >
                                            <img
                                                src={user?.avatar || "/mascot.svg"}
                                                alt="Avatar"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    objectPosition: 'top',
                                                    transform: 'scale(2.0) translateY(12%)'
                                                }}
                                            />
                                        </Avatar>
                                        <span className="user-name">{user?.full_name}</span>
                                    </Space>
                                </Space>
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
                                        type="text"
                                        icon={<TagOutlined />}
                                        onClick={handleMyTickets}
                                        className="nav-btn"
                                    >
                                        Vé của tôi
                                    </Button>
                                    <Button
                                        type="text"
                                        className="login-btn-text"
                                        onClick={() => triggerLogin()}
                                    >
                                        Đăng nhập | Đăng ký
                                    </Button>
                                </Space>
                            )}
                        </Space>
                    </div>
                </div>
            </div>

            <div className="header-bottom-nav">
                <div className="header-container nav-container">
                    {categories.map((cat) => (
                        <Button
                            key={cat.category_id}
                            type="text"
                            className="nav-btn nav-category-btn"
                            onClick={() => navigate(`/category/${cat.category_id}`)}
                        >
                            {cat.category_name}
                        </Button>
                    ))}
                </div>
            </div>

            <AuthModal
                show={showLoginModal}
                onHide={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
            />
        </AntHeader>
    );
};

export default Header;
