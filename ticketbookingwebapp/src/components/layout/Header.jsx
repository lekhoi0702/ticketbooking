import React from 'react';
import { Container, Navbar, Nav, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaUser, FaGlobe } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/eventUtils';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const suggestionRef = React.useRef(null);

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
                            <Form onSubmit={handleSearch}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm sự kiện, tên ca sĩ..."
                                        className="search-input border-0 bg-light"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                                    />
                                    <Button type="submit" variant="primary" className="search-button px-4">
                                        <FaSearch />
                                    </Button>
                                </InputGroup>
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
                                <div className="d-flex align-items-center">
                                    <Link to="/my-orders" className="action-item me-3 text-decoration-none text-dark small fw-bold d-flex align-items-center">
                                        <FaUser className="me-2 text-primary" /> {user?.full_name || 'Tài khoản'}
                                    </Link>
                                    <Button variant="outline-danger" size="sm" onClick={handleLogout} className="rounded-pill px-3 py-1 small fw-bold">
                                        Đăng xuất
                                    </Button>
                                </div>
                            ) : (
                                <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">
                                    Đăng nhập
                                </Link>
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
        </header>
    );
};

export default Header;
