import React, { useEffect, useState } from 'react';
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

const { Option } = Select;

const CategoryEvents = () => {
    const { id } = useParams();
    const [events, setEvents] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    // Filter states
    const [venues, setVenues] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: null,
        toDate: null,
        venueId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [eventsRes, categoryRes, venuesRes] = await Promise.all([
                api.getEvents({ category_id: id, limit: 100 }),
                api.getCategory(id),
                api.getVenues(),
            ]);

            if (eventsRes.success) {
                setEvents(eventsRes.data);
            }
            if (categoryRes.success) {
                setCategoryName(categoryRes.data.category_name);
            }
            if (venuesRes.success) {
                setVenues(venuesRes.data);
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
                ...filterParams,
            };

            if (filters.fromDate) {
                params.date_from = filters.fromDate.toISOString();
            }
            if (filters.toDate) {
                params.date_to = filters.toDate.toISOString();
            }

            if (filters.venueId) {
                params.venue_id = filters.venueId;
            }

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
            fromDate: null,
            toDate: null,
            venueId: undefined,
            minPrice: undefined,
            maxPrice: undefined,
        };
        setFilters(resetFilters);

        try {
            setLoading(true);
            const params = {
                category_id: id,
                limit: 100,
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

    const hasActiveFilters = Boolean(
        filters.fromDate ||
        filters.toDate ||
        filters.venueId ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined
    );

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
                            label: categoryName || 'Đang tải...',
                            path: id ? `/category/${id}` : '/events',
                        },
                    ]}
                />

                <AntCard className="category-filters-card mb-4">
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
                                <div className="category-filters-subtitle">Lọc theo ngày, địa điểm và giá.</div>
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
                                className="category-reset-btn"
                                style={{ '--wave-color': 'transparent' }}
                                onClick={handleResetFilters}
                                disabled={loading || !hasActiveFilters}
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </div>

                    <AntRow gutter={[16, 16]} className="category-filters-grid">
                        <AntCol xs={24} sm={12} md={8} lg={7}>
                            <div className="filter-field filter-field-date">
                                <div className="filter-head">
                                    <div className="filter-label">Ngày diễn ra</div>
                                    <div className="date-guide-row">
                                        <span className="date-guide-item">Từ ngày</span>
                                        <span className="date-guide-item">Đến ngày</span>
                                    </div>
                                </div>
                                <div className="date-filter-row">
                                    <div className="date-filter-item">
                                        <DatePicker
                                            size="large"
                                            style={{ width: '100%' }}
                                            value={filters.fromDate}
                                            onChange={(date) => setFilters({ ...filters, fromDate: date })}
                                            format="DD/MM/YYYY"
                                            placeholder=""
                                        />
                                    </div>
                                    <div className="date-filter-item">
                                        <DatePicker
                                            size="large"
                                            style={{ width: '100%' }}
                                            value={filters.toDate}
                                            onChange={(date) => setFilters({ ...filters, toDate: date })}
                                            format="DD/MM/YYYY"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={7}>
                            <div className="filter-field filter-field-standard">
                                <div className="filter-head">
                                    <div className="filter-label">Vị trí</div>
                                    <div className="filter-head-spacer" aria-hidden="true" />
                                </div>
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
                                    {venues.map((venue) => (
                                        <Option key={venue.venue_id} value={venue.venue_id}>
                                            {venue.venue_name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </AntCol>

                        <AntCol xs={24} sm={12} md={8} lg={5}>
                            <div className="filter-field filter-field-standard">
                                <div className="filter-head">
                                    <div className="filter-label">Giá từ (VNĐ)</div>
                                    <div className="filter-head-spacer" aria-hidden="true" />
                                </div>
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
                            <div className="filter-field filter-field-standard">
                                <div className="filter-head">
                                    <div className="filter-label">Giá đến (VNĐ)</div>
                                    <div className="filter-head-spacer" aria-hidden="true" />
                                </div>
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
                    </AntRow>
                </AntCard>

                {loading && events.length > 0 ? (
                    <div className="category-events-loading-wrapper">
                        <div className="category-events-loading-overlay">
                            <LoadingSpinner tip="Đang tải..." />
                        </div>
                        <Row className="g-4 events-row-loading">
                            {events.map((event) => (
                                <Col key={event.event_id} xs={12} sm={6} md={4} lg={3}>
                                    <EventCard event={transformEvent(event)} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : events.length > 0 ? (
                    <Row className="g-4">
                        {events.map((event) => (
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
