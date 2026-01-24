import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Space,
    Divider,
    Row,
    Col,
    Card,
    List,
    Tag,
    Spin,
    Button,
    Modal,
} from 'antd';
import {
    EnvironmentOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    GiftOutlined,
    PercentageOutlined,
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const { Text, Title, Paragraph } = Typography;

const DISCOUNT_STATUS_CONFIG = {
    ACTIVE: { color: 'success', label: 'Đang hoạt động' },
    INACTIVE: { color: 'default', label: 'Tạm dừng' },
    EXPIRED: { color: 'error', label: 'Hết hạn' },
    USED_UP: { color: 'warning', label: 'Hết lượt' },
};

const getDiscountStatusConfig = (status) =>
    DISCOUNT_STATUS_CONFIG[status] || { color: 'default', label: status };

const STATUS_CONFIG = {
    DRAFT: { color: 'default', label: 'Nháp' },
    PENDING_APPROVAL: { color: 'warning', label: 'Chờ duyệt' },
    PUBLISHED: { color: 'success', label: 'Công khai' },
    REJECTED: { color: 'error', label: 'Từ chối duyệt' },
    CANCELLED: { color: 'default', label: 'Hủy' },
    ONGOING: { color: 'success', label: 'Đang diễn ra' },
    COMPLETED: { color: 'default', label: 'Đã kết thúc' },
};

const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || { color: 'default', label: status };

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [venueTemplate, setVenueTemplate] = useState(null);
    const [eventSeats, setEventSeats] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);
    const [eventDiscounts, setEventDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(false);
    const [currentShowtimeIndex, setCurrentShowtimeIndex] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const showtimesList = useMemo(
        () => (Array.isArray(showtimes) ? showtimes : []),
        [showtimes]
    );

    const fetchEvent = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await api.getEvent(id);
            if (res?.success) {
                setEvent(res.data);
            } else {
                navigate('/admin/events');
            }
        } catch (err) {
            console.error('Error fetching event:', err);
            navigate('/admin/events');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchSeatMap = useCallback(async () => {
        if (!event?.venue_id || !event?.event_id) return;
        try {
            setLoadingMap(true);
            const [venueRes, seatsRes] = await Promise.all([
                api.getVenueById(event.venue_id),
                api.getAllEventSeats(event.event_id),
            ]);
            if (venueRes?.success) setVenueTemplate(venueRes.data?.seat_map_template ?? null);
            if (seatsRes?.success) {
                const mapped = (seatsRes.data ?? []).map((s) => ({
                    row_name: s.row_name,
                    seat_number: s.seat_number,
                    area: s.area_name,
                    ticket_type_id: s.ticket_type_id,
                    status: s.status,
                }));
                setEventSeats(mapped);
            }
        } catch (err) {
            console.error('Error fetching seat map:', err);
        } finally {
            setLoadingMap(false);
        }
    }, [event?.venue_id, event?.event_id]);

    const fetchDiscounts = useCallback(async () => {
        if (!event?.event_id) return;
        try {
            setLoadingDiscounts(true);
            const res = await api.getEventDiscounts(event.event_id);
            if (res?.success) setEventDiscounts(res.data ?? []);
        } catch (err) {
            console.error('Error fetching discounts:', err);
        } finally {
            setLoadingDiscounts(false);
        }
    }, [event?.event_id]);

    const fetchShowtimes = useCallback(async () => {
        if (!event?.event_id) {
            setShowtimes([]);
            return;
        }
        try {
            setLoadingShowtimes(true);
            const res = await api.getEventShowtimes(event.event_id);
            if (!res?.success) {
                setShowtimes([]);
                return;
            }
            const raw = res.data;
            const list = Array.isArray(raw) ? raw : (raw != null ? [raw] : []);
            setShowtimes(list);
        } catch (err) {
            console.error('[EventDetail] Error fetching showtimes:', err);
            setShowtimes([]);
        } finally {
            setLoadingShowtimes(false);
        }
    }, [event?.event_id]);

    const handleUpdateStatus = useCallback(async (status) => {
        if (!event?.event_id) return;
        try {
            setActionLoading(true);
            const res = await api.adminUpdateEventStatus(event.event_id, { status });
            if (res?.success) {
                await fetchEvent();
            }
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setActionLoading(false);
        }
    }, [event?.event_id, fetchEvent]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    useEffect(() => {
        if (event) {
            setCurrentShowtimeIndex(0);
            fetchSeatMap();
            fetchDiscounts();
            fetchShowtimes();
        } else {
            setVenueTemplate(null);
            setEventSeats([]);
            setEventDiscounts([]);
            setShowtimes([]);
            setCurrentShowtimeIndex(0);
        }
    }, [event, fetchSeatMap, fetchDiscounts, fetchShowtimes]);

    if (loading) {
        return <AdminLoadingScreen tip="Đang tải thông tin sự kiện..." />;
    }

    if (!event) {
        return null;
    }

    const showApproveActions = event.status === 'PENDING_APPROVAL';
    const showCancelAction = event.status === 'PUBLISHED';

    const handleCancelEvent = useCallback(() => {
        Modal.confirm({
            title: 'Hủy sự kiện',
            content: 'Bạn có chắc muốn hủy sự kiện này? Hành động không thể hoàn tác.',
            okText: 'Hủy sự kiện',
            okType: 'danger',
            cancelText: 'Không',
            onOk: async () => {
                await handleUpdateStatus('CANCELLED');
            },
        });
    }, [handleUpdateStatus]);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Header với banner */}
            <div
                style={{
                    height: 280,
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${getImageUrl(event.banner_image_url)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px) brightness(0.5)',
                    }}
                />
                <div
                    style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 48px',
                        gap: 32,
                    }}
                >
                    <img
                        src={getImageUrl(event.banner_image_url)}
                        alt={event.event_name}
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: 12,
                            objectFit: 'cover',
                            border: '4px solid white',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        }}
                    />
                    <div style={{ flex: 1, color: 'white' }}>
                        <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 12 }}>
                            {event.event_name}
                        </Title>
                        <Paragraph
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                marginBottom: 16,
                                fontSize: 16,
                                lineHeight: 1.7,
                                maxWidth: '80%',
                            }}
                        >
                            {event.description || 'Không có mô tả cho sự kiện này.'}
                        </Paragraph>
                        <Space>
                            {getStatusConfig && (
                                <Tag color={getStatusConfig(event.status).color} style={{ fontSize: 16, padding: '4px 12px' }}>
                                    {getStatusConfig(event.status).label}
                                </Tag>
                            )}
                            {event.category?.category_name && (
                                <Tag style={{ fontSize: 16, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                                    {event.category.category_name}
                                </Tag>
                            )}
                        </Space>
                    </div>
                </div>
            </div>

            {/* Nút phê duyệt / từ chối — chỉ khi chờ phê duyệt */}
            {showApproveActions && (
                <div
                    style={{
                        padding: '16px 48px',
                        background: '#fffbe6',
                        borderBottom: '1px solid #ffe58f',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}
                >
                    <Button
                        danger
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus('REJECTED')}
                    >
                        Từ chối
                    </Button>
                    <Button
                        type="primary"
                        loading={actionLoading}
                        onClick={() => handleUpdateStatus('PUBLISHED')}
                    >
                        Duyệt sự kiện
                    </Button>
                </div>
            )}

            {/* Nút hủy sự kiện — chỉ khi công khai */}
            {showCancelAction && (
                <div
                    style={{
                        padding: '16px 48px',
                        background: '#fff2f0',
                        borderBottom: '1px solid #ffccc7',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}
                >
                    <Button
                        danger
                        icon={<StopOutlined />}
                        disabled={actionLoading}
                        loading={actionLoading}
                        onClick={handleCancelEvent}
                    >
                        Hủy sự kiện
                    </Button>
                </div>
            )}

            {/* Main content — cùng padding ngang 48px như banner để căn trái bằng phần trên */}
            <div style={{ padding: '40px 48px 40px 48px' }}>
                <Spin spinning={actionLoading} tip="Đang xử lý...">
                    <Row gutter={32}>
                        <Col span={24}>
                            {/* Danh sách các ngày diễn */}
                            <div style={{ marginBottom: 32 }}>
                                <Title level={4} style={{ marginBottom: 20, fontSize: 16 }}>
                                    {showtimesList.length > 1
                                        ? `Các ngày diễn (${showtimesList.length})`
                                        : 'Thông tin chi tiết'}
                                </Title>

                                {loadingShowtimes ? (
                                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                        <Spin size="small" tip="Đang tải danh sách ngày diễn..." />
                                    </div>
                                ) : showtimesList.length > 0 ? (
                                    <div>
                                        {showtimesList.length > 1 && (
                                            <div
                                                style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 10,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 20,
                                                    padding: '16px 24px',
                                                    background: 'linear-gradient(to right, #e6f7ff 0%, #f0f5ff 100%)',
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    boxShadow: '0 2px 12px rgba(24,144,255,0.15)',
                                                }}
                                            >
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<LeftOutlined />}
                                                    onClick={() => setCurrentShowtimeIndex((i) => Math.max(0, i - 1))}
                                                    disabled={currentShowtimeIndex === 0}
                                                    aria-label="Ngày diễn trước"
                                                >
                                                    Trước
                                                </Button>
                                                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                    Ngày diễn {currentShowtimeIndex + 1} / {showtimesList.length}
                                                </Text>
                                                <Button
                                                    type="primary"
                                                    icon={<RightOutlined />}
                                                    onClick={() => setCurrentShowtimeIndex((i) =>
                                                        Math.min(showtimesList.length - 1, i + 1)
                                                    )}
                                                    disabled={currentShowtimeIndex >= showtimesList.length - 1}
                                                    aria-label="Ngày diễn tiếp theo"
                                                >
                                                    Tiếp theo
                                                </Button>
                                            </div>
                                        )}
                                        {(() => {
                                            const index = showtimesList.length > 1
                                                ? Math.min(Math.max(0, currentShowtimeIndex), showtimesList.length - 1)
                                                : 0;
                                            const showtime = showtimesList[index];
                                            if (!showtime) return null;
                                            const fmt = (d) => d ? new Date(d).toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A';
                                            return (
                                                <Card
                                                    key={showtime.event_id || index}
                                                    title={
                                                        <Space>
                                                            <Text strong style={{ fontSize: 16 }}>
                                                                {showtimesList.length > 1 ? `Ngày diễn ${index + 1}` : 'Thông tin chi tiết'}
                                                            </Text>
                                                            {getStatusConfig && (
                                                                <Tag color={getStatusConfig(showtime.status).color}>
                                                                    {getStatusConfig(showtime.status).label}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                    }
                                                    style={{
                                                        marginBottom: 24,
                                                        borderRadius: 12,
                                                        border: 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    }}
                                                    bodyStyle={{ padding: 28 }}
                                                >
                                                    <Row gutter={[32, 20]}>
                                                        {/* Cột trái: Thông tin cơ bản */}
                                                        <Col span={12}>
                                                            <Space direction="vertical" size={20} style={{ width: '100%' }}>
                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                                        Địa điểm
                                                                    </Text>
                                                                    <Space>
                                                                        <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                                                        <Text strong style={{ fontSize: 16 }}>
                                                                            {showtime.venue?.venue_name || 'N/A'}
                                                                        </Text>
                                                                    </Space>
                                                                    <div style={{ marginTop: 6, marginLeft: 24 }}>
                                                                        <Text type="secondary" style={{ fontSize: 16 }}>
                                                                            {showtime.venue?.address || 'N/A'}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                <Row gutter={20}>
                                                                    <Col span={12}>
                                                                        <div>
                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                                                Tổng số ghế
                                                                            </Text>
                                                                            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                                                {showtime.total_capacity || 0}
                                                                            </Text>
                                                                        </div>
                                                                    </Col>
                                                                    <Col span={12}>
                                                                        <div>
                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                                                Vé đã bán
                                                                            </Text>
                                                                            <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                                {showtime.sold_tickets || 0}
                                                                            </Text>
                                                                        </div>
                                                                    </Col>
                                                                </Row>

                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
                                                                        Thời gian diễn ra
                                                                    </Text>
                                                                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                                                        <Space>
                                                                            <CalendarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Bắt đầu:</Text> {fmt(showtime.start_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                        <Space>
                                                                            <CalendarOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Kết thúc:</Text> {fmt(showtime.end_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                    </Space>
                                                                </div>

                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
                                                                        Thời gian bán vé
                                                                    </Text>
                                                                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                                                        <Space>
                                                                            <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Mở bán:</Text> {fmt(showtime.sale_start_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                        <Space>
                                                                            <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Kết thúc:</Text> {fmt(showtime.sale_end_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                    </Space>
                                                                </div>
                                                            </Space>
                                                        </Col>

                                                        {/* Cột phải: Loại vé */}
                                                        <Col span={12}>
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 14 }}>
                                                                    Loại vé ({showtime.ticket_types?.length || 0})
                                                                </Text>
                                                                {showtime.ticket_types && showtime.ticket_types.length > 0 ? (
                                                                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                                                        {showtime.ticket_types.map((ticketType) => (
                                                                            <Card
                                                                                key={ticketType.ticket_type_id}
                                                                                size="small"
                                                                                style={{
                                                                                    background: ticketType.is_active ? '#f6ffed' : '#fffbe6',
                                                                                    border: `1px solid ${ticketType.is_active ? '#b7eb8f' : '#ffe58f'}`,
                                                                                    borderRadius: 8,
                                                                                }}
                                                                                bodyStyle={{ padding: 16 }}
                                                                            >
                                                                                <Row gutter={16} align="middle">
                                                                                    <Col span={12}>
                                                                                        <Space direction="vertical" size={3}>
                                                                                            <Text strong style={{ fontSize: 16 }}>
                                                                                                {ticketType.type_name}
                                                                                            </Text>
                                                                                            {ticketType.description && (
                                                                                                <Text type="secondary" style={{ fontSize: 16 }}>
                                                                                                    {ticketType.description}
                                                                                                </Text>
                                                                                            )}
                                                                                        </Space>
                                                                                    </Col>
                                                                                    <Col span={6} style={{ textAlign: 'left' }}>
                                                                                        <div>
                                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                                Giá
                                                                                            </Text>
                                                                                            <Text strong style={{ fontSize: 16, color: '#fa541c' }}>
                                                                                                {(ticketType.price || 0).toLocaleString('vi-VN')}đ
                                                                                            </Text>
                                                                                        </div>
                                                                                    </Col>
                                                                                    <Col span={6} style={{ textAlign: 'left' }}>
                                                                                        <div>
                                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                                Còn lại
                                                                                            </Text>
                                                                                            <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                                                {ticketType.available_quantity || 0}
                                                                                            </Text>
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                                <div style={{ marginTop: 10, fontSize: 16, color: '#8c8c8c', textAlign: 'left' }}>
                                                                                    <Space split={<Divider type="vertical" />} size={6}>
                                                                                        <Text>
                                                                                            Tổng: {ticketType.quantity || 0}
                                                                                        </Text>
                                                                                        <Text>
                                                                                            Đã bán: {ticketType.sold_quantity || 0}
                                                                                        </Text>
                                                                                        <Text>
                                                                                            Tối đa/đơn: {ticketType.max_per_order || 0}
                                                                                        </Text>
                                                                                        {ticketType.is_active ? (
                                                                                            <Tag color="success" style={{ margin: 0 }}>Đang bán</Tag>
                                                                                        ) : (
                                                                                            <Tag color="default" style={{ margin: 0 }}>Tạm dừng</Tag>
                                                                                        )}
                                                                                    </Space>
                                                                                </div>
                                                                            </Card>
                                                                        ))}
                                                                    </Space>
                                                                ) : (
                                                                    <div style={{ padding: '30px 0', textAlign: 'left', color: '#8c8c8c' }}>
                                                                        Chưa có loại vé
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <Card
                                        title={
                                            <Space>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    Thông tin chi tiết
                                                </Text>
                                                {getStatusConfig && (
                                                    <Tag color={getStatusConfig(event.status).color}>
                                                        {getStatusConfig(event.status).label}
                                                    </Tag>
                                                )}
                                            </Space>
                                        }
                                        style={{
                                            marginBottom: 24,
                                            borderRadius: 12,
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        }}
                                        bodyStyle={{ padding: 28 }}
                                    >
                                        <Row gutter={[32, 20]}>
                                            <Col span={12}>
                                                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                            Địa điểm
                                                        </Text>
                                                        <Space>
                                                            <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                                            <Text strong style={{ fontSize: 16 }}>
                                                                {event.venue?.venue_name || 'N/A'}
                                                            </Text>
                                                        </Space>
                                                        <div style={{ marginTop: 6, marginLeft: 24 }}>
                                                            <Text type="secondary" style={{ fontSize: 16 }}>
                                                                {event.venue?.address || 'N/A'}
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    <Row gutter={20}>
                                                        <Col span={12}>
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                                    Tổng số ghế
                                                                </Text>
                                                                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                                    {event.total_capacity || 0}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>
                                                                    Vé đã bán
                                                                </Text>
                                                                <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                    {event.sold_tickets || 0}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
                                                            Thời gian diễn ra
                                                        </Text>
                                                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                                            <Space>
                                                                <CalendarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Bắt đầu:</Text>{' '}
                                                                    {event.start_datetime
                                                                        ? new Date(event.start_datetime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                        : 'N/A'}
                                                                </Text>
                                                            </Space>
                                                            <Space>
                                                                <CalendarOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Kết thúc:</Text>{' '}
                                                                    {event.end_datetime
                                                                        ? new Date(event.end_datetime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                        : 'N/A'}
                                                                </Text>
                                                            </Space>
                                                        </Space>
                                                    </div>

                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
                                                            Thời gian bán vé
                                                        </Text>
                                                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                                            <Space>
                                                                <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Mở bán:</Text>{' '}
                                                                    {event.sale_start_datetime
                                                                        ? new Date(event.sale_start_datetime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                        : 'N/A'}
                                                                </Text>
                                                            </Space>
                                                            <Space>
                                                                <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Kết thúc:</Text>{' '}
                                                                    {event.sale_end_datetime
                                                                        ? new Date(event.sale_end_datetime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                        : 'N/A'}
                                                                </Text>
                                                            </Space>
                                                        </Space>
                                                    </div>
                                                </Space>
                                            </Col>

                                            <Col span={12}>
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 14 }}>
                                                        Loại vé ({event.ticket_types?.length || 0})
                                                    </Text>
                                                    {event.ticket_types && event.ticket_types.length > 0 ? (
                                                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                                            {event.ticket_types.map((ticketType) => (
                                                                <Card
                                                                    key={ticketType.ticket_type_id}
                                                                    size="small"
                                                                    style={{
                                                                        background: ticketType.is_active ? '#f6ffed' : '#fffbe6',
                                                                        border: `1px solid ${ticketType.is_active ? '#b7eb8f' : '#ffe58f'}`,
                                                                        borderRadius: 8,
                                                                    }}
                                                                    bodyStyle={{ padding: 16 }}
                                                                >
                                                                    <Row gutter={16} align="middle">
                                                                        <Col span={12}>
                                                                            <Space direction="vertical" size={3}>
                                                                                <Text strong style={{ fontSize: 16 }}>
                                                                                    {ticketType.type_name}
                                                                                </Text>
                                                                                {ticketType.description && (
                                                                                    <Text type="secondary" style={{ fontSize: 16 }}>
                                                                                        {ticketType.description}
                                                                                    </Text>
                                                                                )}
                                                                            </Space>
                                                                        </Col>
                                                                        <Col span={6} style={{ textAlign: 'left' }}>
                                                                            <div>
                                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                    Giá
                                                                                </Text>
                                                                                <Text strong style={{ fontSize: 16, color: '#fa541c' }}>
                                                                                    {(ticketType.price || 0).toLocaleString('vi-VN')}đ
                                                                                </Text>
                                                                            </div>
                                                                        </Col>
                                                                        <Col span={6} style={{ textAlign: 'left' }}>
                                                                            <div>
                                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                    Còn lại
                                                                                </Text>
                                                                                <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                                    {ticketType.available_quantity || 0}
                                                                                </Text>
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                    <div style={{ marginTop: 10, fontSize: 16, color: '#8c8c8c', textAlign: 'left' }}>
                                                                        <Space split={<Divider type="vertical" />} size={6}>
                                                                            <Text>
                                                                                Tổng: {ticketType.quantity || 0}
                                                                            </Text>
                                                                            <Text>
                                                                                Đã bán: {ticketType.sold_quantity || 0}
                                                                            </Text>
                                                                            <Text>
                                                                                Tối đa/đơn: {ticketType.max_per_order || 0}
                                                                            </Text>
                                                                            {ticketType.is_active ? (
                                                                                <Tag color="success" style={{ margin: 0 }}>Đang bán</Tag>
                                                                            ) : (
                                                                                <Tag color="default" style={{ margin: 0 }}>Tạm dừng</Tag>
                                                                            )}
                                                                        </Space>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </Space>
                                                    ) : (
                                                        <div style={{ padding: '30px 0', textAlign: 'left', color: '#8c8c8c' }}>
                                                            Chưa có loại vé
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}

                                <Divider style={{ margin: '32px 0' }} />

                                {/* Sơ đồ chỗ ngồi */}
                                <div style={{ marginBottom: 32 }}>
                                    <Title level={4} style={{ margin: 0, marginBottom: 20, fontSize: 16 }}>
                                        <AppstoreOutlined style={{ marginRight: 8 }} />
                                        Sơ đồ chỗ ngồi
                                    </Title>
                                    {loadingMap ? (
                                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                            <Spin tip="Đang tải sơ đồ...">
                                                <div style={{ padding: 20 }} />
                                            </Spin>
                                        </div>
                                    ) : venueTemplate ? (
                                        <Card
                                            size="small"
                                            style={{
                                                background: '#262626',
                                                border: 'none',
                                                borderRadius: 12,
                                                marginTop: 16,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            }}
                                            bodyStyle={{ padding: 24 }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    gap: 32,
                                                    marginBottom: 20,
                                                    fontSize: 16,
                                                }}
                                            >
                                                <Space>
                                                    <span style={{ width: 10, height: 10, borderRadius: 5, background: '#f0f0f0' }} />
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Trống</Text>
                                                </Space>
                                                <Space>
                                                    <span style={{ width: 10, height: 10, borderRadius: 5, background: '#2DC275' }} />
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Đã gán</Text>
                                                </Space>
                                                <Space>
                                                    <span style={{ width: 10, height: 10, borderRadius: 5, background: '#ff4d4f' }} />
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Hỏng/khác</Text>
                                                </Space>
                                            </div>
                                            <SeatMapTemplateView
                                                venueTemplate={venueTemplate}
                                                selectedTemplateSeats={[]}
                                                allOccupiedSeats={eventSeats}
                                                scale={1.5}
                                            />
                                        </Card>
                                    ) : (
                                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c8c8c' }}>
                                            Không có thông tin sơ đồ chỗ ngồi
                                        </div>
                                    )}
                                </div>

                                <Divider style={{ margin: '32px 0' }} />

                                {/* Mã giảm giá */}
                                <div>
                                    <Title level={4} style={{ margin: 0, marginBottom: 20, fontSize: 16 }}>
                                        <GiftOutlined style={{ marginRight: 8 }} />
                                        Mã giảm giá ({eventDiscounts.length})
                                    </Title>
                                    {loadingDiscounts ? (
                                        <div style={{ padding: '30px 0', textAlign: 'center' }}>
                                            <Spin size="small" />
                                        </div>
                                    ) : eventDiscounts.length > 0 ? (
                                        <List
                                            size="small"
                                            dataSource={eventDiscounts}
                                            style={{ marginTop: 16 }}
                                            renderItem={(discount) => (
                                                <List.Item
                                                    style={{
                                                        background: '#fafafa',
                                                        borderRadius: 10,
                                                        marginBottom: 10,
                                                        padding: '16px 20px',
                                                        border: 'none',
                                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                    }}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <div
                                                                style={{
                                                                    width: 44,
                                                                    height: 44,
                                                                    borderRadius: 10,
                                                                    background:
                                                                        discount.discount_type === 'PERCENTAGE'
                                                                            ? '#e6f7ff'
                                                                            : '#fff7e6',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                {discount.discount_type === 'PERCENTAGE' ? (
                                                                    <PercentageOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                                                                ) : (
                                                                    <GiftOutlined style={{ fontSize: 16, color: '#fa8c16' }} />
                                                                )}
                                                            </div>
                                                        }
                                                        title={
                                                            <Space>
                                                                <Text code style={{ fontSize: 16, fontWeight: 600 }}>
                                                                    {discount.discount_code}
                                                                </Text>
                                                                <Tag color={getDiscountStatusConfig(discount.status).color}>
                                                                    {getDiscountStatusConfig(discount.status).label}
                                                                </Tag>
                                                            </Space>
                                                        }
                                                        description={
                                                            <Space direction="vertical" size={4}>
                                                                <Text type="secondary" style={{ fontSize: 16 }}>
                                                                    {discount.discount_name}
                                                                </Text>
                                                                <Space split={<Divider type="vertical" />} size={6}>
                                                                    <Text style={{ fontSize: 16, color: '#fa541c' }}>
                                                                        Giảm:{' '}
                                                                        {discount.discount_type === 'PERCENTAGE'
                                                                            ? `${discount.discount_value}%`
                                                                            : `${(discount.discount_value ?? 0).toLocaleString('vi-VN')}đ`}
                                                                    </Text>
                                                                    <Text type="secondary" style={{ fontSize: 16 }}>
                                                                        Đã dùng: {discount.used_count || 0}/
                                                                        {discount.usage_limit ?? '∞'}
                                                                    </Text>
                                                                    <Text type="secondary" style={{ fontSize: 16 }}>
                                                                        HSD:{' '}
                                                                        {discount.end_date
                                                                            ? new Date(discount.end_date).toLocaleDateString('vi-VN')
                                                                            : '—'}
                                                                    </Text>
                                                                </Space>
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <div style={{ padding: '30px 0', textAlign: 'center', color: '#8c8c8c' }}>
                                            Sự kiện này chưa có mã giảm giá
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default memo(EventDetail);
