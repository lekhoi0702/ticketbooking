import React, { useState } from 'react';
import { Container, Navbar, Nav, Form, InputGroup, Button, NavDropdown } from 'react-bootstrap';
import { FaSearch, FaUser, FaGlobe, FaTicketAlt, FaHistory } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/eventUtils';
import AuthModal from '../auth/AuthModal';
import OrganizerAuthModal from '../auth/OrganizerAuthModal';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const suggestionRef = React.useRef(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showOrganizerModal, setShowOrganizerModal] = useState(false);

    // Debounced search for suggestions
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    setLoadingSuggestions(true);
                    const res = await api.searchEvents(searchQuery);
                    if (res.success) {
                        setSuggestions(res.data.slice(0, 5)); // Show top 5
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

    // Close suggestions on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (eventId) => {
        navigate(`/event/${eventId}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            {/* Top Bar */}
            <div className="top-bar border-bottom">
                <Container>
                    <div className="top-bar-content py-2">
                        <Link to="/" className="logo-link">
                            <div className="logo">
                                <h1 className="mb-0 fw-bold">TICKETBOOKING</h1>
                            </div>
                        </Link>

                        <div className="search-bar position-relative" ref={suggestionRef}>
                            <Form onSubmit={handleSearch} className="search-form">
                                <div className="search-input-wrapper">
                                    <FaSearch className="search-icon-left" />
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm sự kiện, tên ca sĩ..."
                                        className="search-input-premium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="search-clear-btn"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            </Form>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="search-suggestions-dropdown shadow-lg rounded-3">
                                    {loadingSuggestions ? (
                                        <div className="p-3 text-center text-muted small">Đang tìm...</div>
                                    ) : suggestions.length > 0 ? (
                                        <>
                                            {suggestions.map((event) => (
                                                <div
                                                    key={event.event_id}
                                                    className="suggestion-item d-flex align-items-center p-2"
                                                    onClick={() => handleSuggestionClick(event.event_id)}
                                                >
                                                    <div className="suggestion-image me-3">
                                                        <img
                                                            src={getImageUrl(event.banner_image_url)}
                                                            alt={event.event_name}
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <div className="suggestion-info overflow-hidden">
                                                        <div className="suggestion-name fw-bold text-truncate small">{event.event_name}</div>
                                                        <div className="suggestion-venue text-muted x-small text-truncate" style={{ fontSize: '11px' }}>
                                                            {event.venue?.venue_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className="p-2 text-center border-top bg-light suggestion-view-all small cursor-pointer"
                                                onClick={handleSearch}
                                            >
                                                Xem tất cả kết quả cho "{searchQuery}"
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3 text-center text-muted small">Không tìm thấy sự kiện nào</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="top-bar-actions d-flex align-items-center">
                            {isAuthenticated ? (
                                <div className="d-flex align-items-center gap-2">
                                    <NavDropdown
                                        title={
                                            <div className="user-profile-trigger d-flex align-items-center">
                                                <div className="user-avatar-circle me-md-2">
                                                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="user-info-text d-none d-md-block text-start">
                                                    <div className="user-display-name fw-bold text-white small">{user?.full_name}</div>
                                                    <div className="user-status x-small text-white opacity-75">Thành viên</div>
                                                </div>
                                            </div>
                                        }
                                        id="user-dropdown"
                                        align="end"
                                        className="user-dropdown-premium"
                                    >
                                        <div className="px-3 py-2 border-bottom mb-2 d-md-none">
                                            <div className="fw-bold">{user?.full_name}</div>
                                            <div className="text-muted small">{user?.email}</div>
                                        </div>
                                        <NavDropdown.Item as={Link} to="/my-tickets">
                                            <FaTicketAlt className="text-success" />
                                            <span>Vé của tôi</span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/my-orders">
                                            <FaHistory className="text-info" />
                                            <span>Lịch sử đặt vé</span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                            <i className="bi bi-box-arrow-right"></i>
                                            <span>Đăng xuất</span>
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </div>
                            ) : (

                                <div className="d-flex gap-2">

                                    <Button

                                        onClick={() => navigate('/organizer')}

                                        variant="outline-primary"

                                        className="btn-sm rounded-pill px-3 fw-bold"

                                    >

                                        Tạo sự kiện

                                    </Button>

                                    <Button
                                        onClick={() => setShowAuthModal(true)}
                                        className="btn btn-login-highlight btn-sm rounded-pill px-4 fw-bold shadow-sm"
                                    >
                                        Đăng nhập
                                    </Button>

                                </div>

                            )}
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Navigation */}
            <Navbar bg="dark" variant="dark" expand="lg" className="main-nav">
                <Container>
                    <Navbar.Toggle aria-controls="main-navbar-nav" />
                    <Navbar.Collapse id="main-navbar-nav">
                        <Nav className="w-100 justify-content-between">
                            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                            {categories.map(category => (
                                <Nav.Link
                                    key={category.category_id}
                                    as={Link}
                                    to={`/category/${category.category_id}`}
                                >
                                    {category.category_name}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Auth Modal */}
            <AuthModal
                show={showAuthModal}
                onHide={() => setShowAuthModal(false)}
            />

            {/* Organizer Auth Modal */}
            <OrganizerAuthModal
                show={showOrganizerModal}
                onHide={() => setShowOrganizerModal(false)}
            />
        </header>
    );
};

export default Header;








