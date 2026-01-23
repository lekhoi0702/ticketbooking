import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';
import { DatePicker, Select, InputNumber, Button, Space, Card as AntCard } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@services/api';
import EventCard from '@features/user/components/Event/EventCard';
import AntBreadcrumb from '@features/user/components/AntBreadcrumb';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import './CategoryEvents.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CategoryEvents = () => {
    const { id } = useParams();
    const [events, setEvents] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    
    // Filter states
    const [venues, setVenues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        dateRange: null,
        venueId: undefined,
        categoryId: parseInt(id) || undefined,
        minPrice: undefined,
        maxPrice: undefined
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [eventsRes, categoryRes, venuesRes, categoriesRes] = await Promise.all([
                api.getEvents({ category_id: id, limit: 100 }),
                api.getCategory(id),
                api.getVenues(),
                api.getCategories()
            ]);

            if (eventsRes.success) {
                setEvents(eventsRes.data);
            }
            if (categoryRes.success) {
                setCategory(categoryRes.data);
                setCategoryName(categoryRes.data.category_name);
            }
            if (venuesRes.success) {
                setVenues(venuesRes.data);
            }
            if (categoriesRes.success) {
                setCategories(categoriesRes.data);
            }
        } catch (error) {
            console.error('Error loading category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryData = async (filterParams = {}) => {
        try {
            setLoading(true);
            const params = {
                category_id: id,
                limit: 100,
                ...filterParams
            };

            // Add date filters
            if (filters.dateRange && filters.dateRange.length === 2) {
                params.date_from = filters.dateRange[0].toISOString();
                params.date_to = filters.dateRange[1].toISOString();
            }

            // Add venue filter
            if (filters.venueId) {
                params.venue_id = filters.venueId;
            }

            // Add category filter (if changed from URL)
            if (filters.categoryId && filters.categoryId !== parseInt(id)) {
                params.category_id = filters.categoryId;
            }

            // Add price filters
            if (filters.minPrice !== undefined && filters.minPrice !== null) {
                params.min_price = filters.minPrice;
            }
            if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
                params.max_price = filters.maxPrice;
            }

            const eventsRes = await api.getEvents(params);
            if (eventsRes.success) {
                setEvents(eventsRes.data);
            }
        } catch (error) {
            console.error('Error loading filtered events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        loadCategoryData();
    };

    const handleResetFilters = async () => {
        const resetFilters = {
            dateRange: null,
            venueId: undefined,
            categoryId: parseInt(id) || undefined,
            minPrice: undefined,
            maxPrice: undefined
        };
        setFilters(resetFilters);
        
        // Load with reset filters
        try {
            setLoading(true);
            const params = {
                category_id: id,
                limit: 100
            };
            const eventsRes = await api.getEvents(params);
            if (eventsRes.success) {
                setEvents(eventsRes.data);
            }
        } catch (error) {
            console.error('Error resetting filters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Breadcrumb: use filtered category when user has applied category filter
    const breadcrumbCategoryId = filters.categoryId ?? (id ? parseInt(id) : undefined);
    const breadcrumbCategoryName = breadcrumbCategoryId != null
        ? (categories.find((c) => c.category_id === breadcrumbCategoryId)?.category_name ?? categoryName)
        : categoryName;

    // Show fullscreen loading only on initial load (when no events yet)
    if (loading && events.length === 0) {
        return <LoadingSpinner fullScreen tip={`Đang tải sự kiện ${categoryName || ''}...`} />;
    }

    return (
        <div className="category-events-wrapper">
            <Container className="py-4" style={{ minHeight: '70vh' }}>
                <AntBreadcrumb
                    items={[
                        { label: 'Trang chủ', path: '/', icon: <FaHome /> },
                        {
                            label: breadcrumbCategoryName || 'Đang tải...',
                            path: breadcrumbCategoryId != null ? `/category/${breadcrumbCategoryId}` : '/events'
                        }
                    ]}
                />

                {/* Filter Section */}
                <AntCard 
                    className="mb-4" 
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                    }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <FilterOutlined style={{ marginRight: 8, color: '#fff' }} />
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>Bộ lọc</span>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>Ngày diễn ra</div>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>Vị trí</div>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Chọn địa điểm"
                                value={filters.venueId}
                                onChange={(value) => setFilters({ ...filters, venueId: value })}
                                allowClear
                            >
                                {venues.map(venue => (
                                    <Option key={venue.venue_id} value={venue.venue_id}>
                                        {venue.venue_name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>Giá từ (VNĐ)</div>
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Tối thiểu"
                                value={filters.minPrice}
                                onChange={(value) => setFilters({ ...filters, minPrice: value })}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>Giá đến (VNĐ)</div>
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Tối đa"
                                value={filters.maxPrice}
                                onChange={(value) => setFilters({ ...filters, maxPrice: value })}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>Thể loại</div>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Chọn thể loại"
                                value={filters.categoryId}
                                onChange={(value) => setFilters({ ...filters, categoryId: value })}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col>
                            <Button 
                                type="primary" 
                                icon={<FilterOutlined />}
                                onClick={handleApplyFilters}
                                loading={loading}
                            >
                                Áp dụng
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                                disabled={loading}
                            >
                                Thiết lập lại
                            </Button>
                        </Col>
                    </Row>
                </AntCard>

                {/* Events List Section */}
                {loading && events.length > 0 ? (
                    <div className="category-events-loading-wrapper">
                        <div className="category-events-loading-overlay">
                            <LoadingSpinner tip="Đang tải..." />
                        </div>
                        <Row className="g-4 events-row-loading">
                            {events.map(event => (
                                <Col key={event.event_id} xs={12} sm={6} md={4} lg={3}>
                                    <EventCard event={transformEvent(event)} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : events.length > 0 ? (
                    <Row className="g-4">
                        {events.map(event => (
                            <Col key={event.event_id} xs={12} sm={6} md={4} lg={3}>
                                <EventCard event={transformEvent(event)} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.5, filter: 'brightness(0) invert(1)' }}>🎟️</div>
                        <h3 style={{ color: '#fff' }}>Không tìm thấy sự kiện nào</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Vui lòng thử lại với bộ lọc khác hoặc khám phá các danh mục khác</p>
                        <Link to="/" className="btn btn-primary mt-3 px-4 rounded-pill">Khám phá trang chủ</Link>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default CategoryEvents;
