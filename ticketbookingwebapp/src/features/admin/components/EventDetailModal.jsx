import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import {
    Modal,
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
    Descriptions,
} from 'antd';
import {
    EnvironmentOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    GiftOutlined,
    PercentageOutlined,
    ShopOutlined,
    UserOutlined,
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';

const { Text, Title, Paragraph } = Typography;

const DISCOUNT_STATUS_CONFIG = {
    ACTIVE: { color: 'success', label: 'Đang hoạt động' },
    INACTIVE: { color: 'default', label: 'Tạm dừng' },
    EXPIRED: { color: 'error', label: 'Hết hạn' },
    USED_UP: { color: 'warning', label: 'Hết lượt' },
};

const getDiscountStatusConfig = (status) =>
    DISCOUNT_STATUS_CONFIG[status] || { color: 'default', label: status };

const EventDetailModal = ({
    open,
    onClose,
    event: selectedEvent,
    onApprove,
    onReject,
    actionLoading,
    getStatusConfig,
}) => {
    const [venueTemplate, setVenueTemplate] = useState(null);
    const [eventSeats, setEventSeats] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);
    const [eventDiscounts, setEventDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(false);
    const [currentShowtimeIndex, setCurrentShowtimeIndex] = useState(0);

    const showtimesList = useMemo(
        () => (Array.isArray(showtimes) ? showtimes : []),
        [showtimes]
    );

    const fetchSeatMap = useCallback(async () => {
        if (!selectedEvent?.venue_id || !selectedEvent?.event_id) return;
        try {
            setLoadingMap(true);
            const [venueRes, seatsRes] = await Promise.all([
                api.getVenueById(selectedEvent.venue_id),
                api.getAllEventSeats(selectedEvent.event_id),
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
    }, [selectedEvent?.venue_id, selectedEvent?.event_id]);

    const fetchDiscounts = useCallback(async () => {
        if (!selectedEvent?.event_id) return;
        try {
            setLoadingDiscounts(true);
            const res = await api.getEventDiscounts(selectedEvent.event_id);
            if (res?.success) setEventDiscounts(res.data ?? []);
        } catch (err) {
            console.error('Error fetching discounts:', err);
        } finally {
            setLoadingDiscounts(false);
        }
    }, [selectedEvent?.event_id]);

    const fetchShowtimes = useCallback(async () => {
        if (!selectedEvent?.event_id) {
            setShowtimes([]);
            return;
        }
        try {
            setLoadingShowtimes(true);
            const res = await api.getEventShowtimes(selectedEvent.event_id);
            if (!res?.success) {
                setShowtimes([]);
                return;
            }
            const raw = res.data;
            const list = Array.isArray(raw) ? raw : (raw != null ? [raw] : []);
            setShowtimes(list);
        } catch (err) {
            console.error('[EventDetailModal] Error fetching showtimes:', err);
            setShowtimes([]);
        } finally {
            setLoadingShowtimes(false);
        }
    }, [selectedEvent?.event_id]);

    useEffect(() => {
        if (selectedEvent && open) {
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
    }, [selectedEvent, open, fetchSeatMap, fetchDiscounts, fetchShowtimes]);

    const showApproveFooter =
        selectedEvent?.status === 'PENDING_APPROVAL' && (onApprove || onReject);

    const footer = showApproveFooter ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 24px' }}>
            <Button danger disabled={actionLoading} onClick={() => onReject?.(selectedEvent.event_id)}>
                Từ chối
            </Button>
            <Button type="primary" loading={actionLoading} onClick={() => onApprove?.(selectedEvent.event_id)}>
                Duyệt sự kiện
            </Button>
        </div>
    ) : null;

    if (!selectedEvent) return null;

    return (
        <Modal
            title={<Text strong style={{ fontSize: 16 }}>Chi Tiết Sự Kiện</Text>}
            open={open}
            onCancel={onClose}
            footer={footer}
            width={1400}
            style={{ top: 20 }}
            styles={{ body: { padding: 0 } }}
            destroyOnClose
        >
            <Spin spinning={actionLoading} tip="Đang xử lý...">
                <div>
                    <div
                        style={{
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${getImageUrl(selectedEvent.banner_image_url)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(10px) brightness(0.7)',
                            }}
                        />
                        <div
                            style={{
                                position: 'relative',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 32px',
                                gap: 24,
                            }}
                        >
                            <img
                                src={getImageUrl(selectedEvent.banner_image_url)}
                                alt={selectedEvent.event_name}
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                    border: '3px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}
                            />
                            <div style={{ color: 'white' }}>
                                <Title level={4} style={{ color: 'white', margin: 0 }}>
                                    {selectedEvent.event_name}
                                </Title>
                                <Paragraph 
                                    style={{ 
                                        color: 'rgba(255,255,255,0.9)', 
                                        marginTop: 12,
                                        marginBottom: 0,
                                        fontSize: 16,
                                        lineHeight: 1.6
                                    }}
                                >
                                    {selectedEvent.description || 'Không có mô tả cho sự kiện này.'}
                                </Paragraph>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 32 }}>
                        <Row gutter={32}>
                            <Col span={24}>
                                {/* Danh sách các ngày diễn — luôn dựa vào API */}
                                <Title level={5}>
                                    {showtimesList.length > 1 
                                        ? `Các ngày diễn (${showtimesList.length})` 
                                        : 'Thông tin chi tiết'}
                                </Title>
                                
                                {loadingShowtimes ? (
                                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                        <Spin size="small" tip="Đang tải danh sách ngày diễn..." />
                                    </div>
                                ) : showtimesList.length > 0 ? (
                                    <div style={{ marginBottom: 24 }}>
                                        {showtimesList.length > 1 && (
                                            <div
                                                style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 10,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 16,
                                                    marginLeft: -32,
                                                    marginRight: -32,
                                                    padding: '14px 24px',
                                                    background: 'linear-gradient(to right, #e6f7ff 0%, #f0f5ff 100%)',
                                                    borderRadius: 0,
                                                    borderTop: '1px solid #d9d9d9',
                                                    borderBottom: '2px solid #1890ff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                                                        marginBottom: 16,
                                                        borderRadius: 8,
                                                        border: '1px solid #e8e8e8',
                                                    }}
                                                    bodyStyle={{ padding: 20 }}
                                                >
                                                    <Row gutter={[24, 16]}>
                                                        {/* Cột trái: Thông tin cơ bản */}
                                                        <Col span={12}>
                                                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                                        Địa điểm
                                                                    </Text>
                                                                    <Space>
                                                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                                        <Text strong style={{ fontSize: 16 }}>
                                                                            {showtime.venue?.venue_name || 'N/A'}
                                                                        </Text>
                                                                    </Space>
                                                                    <div style={{ marginTop: 4, marginLeft: 20 }}>
                                                                        <Text type="secondary" style={{ fontSize: 16 }}>
                                                                            {showtime.venue?.address || 'N/A'}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                <Row gutter={16}>
                                                                    <Col span={12}>
                                                                        <div>
                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                                                Tổng số ghế
                                                                            </Text>
                                                                            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                                                {showtime.total_capacity || 0}
                                                                            </Text>
                                                                        </div>
                                                                    </Col>
                                                                    <Col span={12}>
                                                                        <div>
                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                                                Vé đã bán
                                                                            </Text>
                                                                            <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                                {showtime.sold_tickets || 0}
                                                                            </Text>
                                                                        </div>
                                                                    </Col>
                                                                </Row>

                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                                                        Thời gian diễn ra
                                                                    </Text>
                                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                        <Space>
                                                                            <CalendarOutlined style={{ color: '#52c41a' }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Bắt đầu:</Text> {fmt(showtime.start_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                        <Space>
                                                                            <CalendarOutlined style={{ color: '#fa8c16' }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Kết thúc:</Text> {fmt(showtime.end_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                    </Space>
                                                                </div>

                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                                                        Thời gian bán vé
                                                                    </Text>
                                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                        <Space>
                                                                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                                                            <Text style={{ fontSize: 16 }}>
                                                                                <Text strong>Mở bán:</Text> {fmt(showtime.sale_start_datetime)}
                                                                            </Text>
                                                                        </Space>
                                                                        <Space>
                                                                            <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
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
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                                                                    Loại vé ({showtime.ticket_types?.length || 0})
                                                                </Text>
                                                                {showtime.ticket_types && showtime.ticket_types.length > 0 ? (
                                                                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                                        {showtime.ticket_types.map((ticketType) => (
                                                                            <Card
                                                                                key={ticketType.ticket_type_id}
                                                                                size="small"
                                                                                style={{
                                                                                    background: ticketType.is_active ? '#f6ffed' : '#fffbe6',
                                                                                    border: `1px solid ${ticketType.is_active ? '#b7eb8f' : '#ffe58f'}`,
                                                                                }}
                                                                            >
                                                                                <Row gutter={16} align="middle">
                                                                                    <Col span={12}>
                                                                                        <Space direction="vertical" size={2}>
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
                                                                                    <Col span={6} style={{ textAlign: 'center' }}>
                                                                                        <div>
                                                                                            <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                                Giá
                                                                                            </Text>
                                                                                            <Text strong style={{ fontSize: 16, color: '#fa541c' }}>
                                                                                                {(ticketType.price || 0).toLocaleString('vi-VN')}đ
                                                                                            </Text>
                                                                                        </div>
                                                                                    </Col>
                                                                                    <Col span={6} style={{ textAlign: 'center' }}>
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
                                                                                <div style={{ marginTop: 8, fontSize: 16, color: '#8c8c8c' }}>
                                                                                    <Space split={<Divider type="vertical" />} size={4}>
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
                                                                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#8c8c8c' }}>
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
                                                    <Tag color={getStatusConfig(selectedEvent.status).color}>
                                                        {getStatusConfig(selectedEvent.status).label}
                                                    </Tag>
                                                )}
                                            </Space>
                                        }
                                        style={{
                                            marginBottom: 24,
                                            borderRadius: 8,
                                            border: '1px solid #e8e8e8',
                                        }}
                                        bodyStyle={{ padding: 20 }}
                                    >
                                        <Row gutter={[24, 16]}>
                                            <Col span={12}>
                                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                            Địa điểm
                                                        </Text>
                                                        <Space>
                                                            <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                            <Text strong style={{ fontSize: 16 }}>
                                                                {selectedEvent.venue?.venue_name || 'N/A'}
                                                            </Text>
                                                        </Space>
                                                        <div style={{ marginTop: 4, marginLeft: 20 }}>
                                                            <Text type="secondary" style={{ fontSize: 16 }}>
                                                                {selectedEvent.venue?.address || 'N/A'}
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                                    Tổng số ghế
                                                                </Text>
                                                                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                                    {selectedEvent.total_capacity || 0}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                                                    Vé đã bán
                                                                </Text>
                                                                <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                                    {selectedEvent.sold_tickets || 0}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                                            Thời gian diễn ra
                                                        </Text>
                                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                            <Space>
                                                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Bắt đầu:</Text>{' '}
                                                                    {selectedEvent.start_datetime
                                                                        ? new Date(selectedEvent.start_datetime).toLocaleString('vi-VN', {
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
                                                                <CalendarOutlined style={{ color: '#fa8c16' }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Kết thúc:</Text>{' '}
                                                                    {selectedEvent.end_datetime
                                                                        ? new Date(selectedEvent.end_datetime).toLocaleString('vi-VN', {
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
                                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                                            Thời gian bán vé
                                                        </Text>
                                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                            <Space>
                                                                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Mở bán:</Text>{' '}
                                                                    {selectedEvent.sale_start_datetime
                                                                        ? new Date(selectedEvent.sale_start_datetime).toLocaleString('vi-VN', {
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
                                                                <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
                                                                <Text style={{ fontSize: 16 }}>
                                                                    <Text strong>Kết thúc:</Text>{' '}
                                                                    {selectedEvent.sale_end_datetime
                                                                        ? new Date(selectedEvent.sale_end_datetime).toLocaleString('vi-VN', {
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
                                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                                                        Loại vé ({selectedEvent.ticket_types?.length || 0})
                                                    </Text>
                                                    {selectedEvent.ticket_types && selectedEvent.ticket_types.length > 0 ? (
                                                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                            {selectedEvent.ticket_types.map((ticketType) => (
                                                                <Card
                                                                    key={ticketType.ticket_type_id}
                                                                    size="small"
                                                                    style={{
                                                                        background: ticketType.is_active ? '#f6ffed' : '#fffbe6',
                                                                        border: `1px solid ${ticketType.is_active ? '#b7eb8f' : '#ffe58f'}`,
                                                                    }}
                                                                >
                                                                    <Row gutter={16} align="middle">
                                                                        <Col span={12}>
                                                                            <Space direction="vertical" size={2}>
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
                                                                        <Col span={6} style={{ textAlign: 'center' }}>
                                                                            <div>
                                                                                <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                                                                                    Giá
                                                                                </Text>
                                                                                <Text strong style={{ fontSize: 16, color: '#fa541c' }}>
                                                                                    {(ticketType.price || 0).toLocaleString('vi-VN')}đ
                                                                                </Text>
                                                                            </div>
                                                                        </Col>
                                                                        <Col span={6} style={{ textAlign: 'center' }}>
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
                                                                    <div style={{ marginTop: 8, fontSize: 16, color: '#8c8c8c' }}>
                                                                        <Space split={<Divider type="vertical" />} size={4}>
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
                                                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#8c8c8c' }}>
                                                            Chưa có loại vé
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}

                                <Divider />

                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Text strong>
                                        <AppstoreOutlined /> Sơ đồ chỗ ngồi
                                    </Text>
                                </Space>
                                {loadingMap ? (
                                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                        <Spin tip="Đang tải sơ đồ...">
                                            <div style={{ padding: 20 }} />
                                        </Spin>
                                    </div>
                                ) : venueTemplate ? (
                                    <Card
                                        size="small"
                                        style={{ background: '#262626', border: '1px solid #434343' }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: 24,
                                                marginBottom: 16,
                                                fontSize: 16,
                                            }}
                                        >
                                            <Space>
                                                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#f0f0f0' }} />
                                                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Trống</Text>
                                            </Space>
                                            <Space>
                                                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#2DC275' }} />
                                                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Đã gán</Text>
                                            </Space>
                                            <Space>
                                                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ff4d4f' }} />
                                                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Hỏng/khác</Text>
                                            </Space>
                                        </div>
                                        <SeatMapTemplateView
                                            venueTemplate={venueTemplate}
                                            selectedTemplateSeats={[]}
                                            allOccupiedSeats={eventSeats}
                                        />
                                    </Card>
                                ) : (
                                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#8c8c8c' }}>
                                        Không có thông tin sơ đồ chỗ ngồi
                                    </div>
                                )}

                                <Divider />

                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Text strong>
                                        <GiftOutlined /> Mã giảm giá ({eventDiscounts.length})
                                    </Text>
                                </Space>
                                {loadingDiscounts ? (
                                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                        <Spin size="small" />
                                    </div>
                                ) : eventDiscounts.length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={eventDiscounts}
                                        style={{ marginTop: 12 }}
                                        renderItem={(discount) => (
                                            <List.Item
                                                style={{
                                                    background: '#fafafa',
                                                    borderRadius: 8,
                                                    marginBottom: 8,
                                                    padding: '12px 16px',
                                                    border: '1px solid #f0f0f0',
                                                }}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <div
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 8,
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
                                                        <Space direction="vertical" size={2}>
                                                            <Text type="secondary" style={{ fontSize: 16 }}>
                                                                {discount.discount_name}
                                                            </Text>
                                                            <Space split={<Divider type="vertical" />} size={4}>
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
                                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#8c8c8c' }}>
                                        Sự kiện này chưa có mã giảm giá
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </Spin>
        </Modal>
    );
};

export default memo(EventDetailModal);
