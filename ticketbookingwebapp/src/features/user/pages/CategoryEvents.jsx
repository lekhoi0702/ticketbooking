import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';
import { DatePicker, Select, InputNumber, Button, Space, Card as AntCard, Row as AntRow, Col as AntCol } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
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

    const baseCategoryId = id ? parseInt(id) : undefined;
    const hasActiveFilters = Boolean(
        (filters.dateRange && filters.dateRange.length === 2) ||
        filters.venueId ||
        (filters.categoryId && baseCategoryId && filters.categoryId !== baseCategoryId) ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined
    );

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
                    className="category-filters-card mb-4"
                >
                    <div className="category-filters-header">
                        <div className="category-filters-title">
                            <span className="category-filters-icon" aria-hidden="true">
                                <FilterOutlined />
                            </span>
                            <div className="category-filters-title-text">
                                <div className="category-filters-title-row">
                                    <span className="category-filters-title-main">Bộ lọc</span>
                                    {hasActiveFilters ? <span className="category-filters-badge">Đang áp dụng</span> : null}
                                </div>
                                <div className="category-filters-subtitle">Lọc theo ngày, địa điểm, giá và thể loại.</div>
                            </div>
                        </div>

                        <Space className="category-filters-actions" size={10} wrap>
                            <Button
                                size="large"
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={handleApplyFilters}
                                loading={loading}
                            >
                                Áp dụng
                            </Button>
                            <Button
                                size="large"
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                                disabled={loading || !hasActiveFilters}
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </div>

                    <AntRow gutter={[16, 16]} className="category-filters-grid">
                        <AntCol xs={24} sm={12} md={8} lg={7}>
                            <div className="filter-field">
                                <div className="filter-label">Ngày diễn ra</div>
                            <RangePicker
                                size="large"
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={7}>
                            <div className="filter-field">
                                <div className="filter-label">Vị trí</div>
                            <Select
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="Chọn địa điểm"
                                value={filters.venueId}
                                onChange={(value) => setFilters({ ...filters, venueId: value })}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {venues.map(venue => (
                                    <Option key={venue.venue_id} value={venue.venue_id}>
                                        {venue.venue_name}
                                    </Option>
                                ))}
                            </Select>
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={5}>
                            <div className="filter-field">
                                <div className="filter-label">Giá từ (VNĐ)</div>
                            <InputNumber
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="Tối thiểu"
                                value={filters.minPrice}
                                onChange={(value) => setFilters({ ...filters, minPrice: value })}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={5}>
                            <div className="filter-field">
                                <div className="filter-label">Giá đến (VNĐ)</div>
                            <InputNumber
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="Tối đa"
                                value={filters.maxPrice}
                                onChange={(value) => setFilters({ ...filters, maxPrice: value })}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={6}>
                            <div className="filter-field">
                                <div className="filter-label">Thể loại</div>
                            <Select
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="Chọn thể loại"
                                value={filters.categoryId}
                                onChange={(value) => setFilters({ ...filters, categoryId: value })}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {categories.map(cat => (
                                    <Option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </Option>
                                ))}
                            </Select>
                            </div>
                        </AntCol>
                    </AntRow>
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
