import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Space,
    Tag,
    Divider,
    Progress,
    message,
    Spin,
    Alert,
    Descriptions,
    Avatar,
    Image,
    List
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    HomeOutlined,
    PlusOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';
import AddShowtimeModal from '@features/organizer/components/AddShowtimeModal';

const { Title, Text, Paragraph } = Typography;

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [venueTemplate, setVenueTemplate] = useState(null);
    const [eventSeats, setEventSeats] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);

    const [showAddShowtimeModal, setShowAddShowtimeModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, ttRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId)
            ]);

            if (eventRes.success) {
                setEvent(eventRes.data);
                fetchSeatMapData(eventRes.data.venue_id, eventId);
            } else {
                setError('Không tìm thấy thông tin sự kiện');
            }

            if (ttRes.success) {
                setTicketTypes(ttRes.data);
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Lỗi khi tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const fetchSeatMapData = async (venueId, evtId) => {
        try {
            setLoadingMap(true);
            const [venueRes, seatsRes] = await Promise.all([
                api.getVenueById(venueId),
                api.getAllEventSeats(evtId)
            ]);

            if (venueRes.success) {
                setVenueTemplate(venueRes.data.seat_map_template);
            }
            if (seatsRes.success) {
                setEventSeats(seatsRes.data);
            }
        } catch (err) {
            console.error('Error fetching seat map:', err);
        } finally {
            setLoadingMap(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_APPROVAL': { color: 'warning', label: 'CHỜ DUYỆT' },
            'APPROVED': { color: 'cyan', label: 'ĐÃ DUYỆT' },
            'REJECTED': { color: 'error', label: 'TỪ CHỐI' },
            'PUBLISHED': { color: 'success', label: 'CÔNG KHAI' },
            'DRAFT': { color: 'default', label: 'NHÁP' },
            'ONGOING': { color: 'processing', label: 'ĐANG DIỄN RA' },
            'COMPLETED': { color: 'default', label: 'ĐÃ KẾT THÚC' },
            'PENDING_DELETION': { color: 'error', label: 'CHỜ XÓA' }
        };
        return configs[status] || { color: 'default', label: status };
    };

    const handleCancelApproval = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('status', 'DRAFT');
            const response = await api.updateEvent(eventId, formData);
            if (response.success) {
                setEvent(prev => ({ ...prev, status: 'DRAFT' }));
                message.success('Đã hủy yêu cầu phê duyệt');
            }
        } catch (err) {
            message.error(err.message || 'Lỗi khi hủy duyệt');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner tip="Đang tải dữ liệu..." />;
    }

    if (error || !event) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    type="error"
                    title="Lỗi"
                    description={error || 'Đã xảy ra lỗi khi tải thông tin'}
                    showIcon
                />
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/organizer/events')}
                    style={{ marginTop: 16 }}
                >
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(event.status);

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={16}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/organizer/events')} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{event.event_name}</Title>
                        <Tag color={statusConfig.color} style={{ marginTop: 4 }}>{statusConfig.label}</Tag>
                    </div>
                </Space>

                <Space>
                    {event.status === 'PENDING_APPROVAL' && (
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={handleCancelApproval}
                        >
                            Hủy duyệt
                        </Button>
                    )}
                    {['APPROVED', 'PUBLISHED'].includes(event.status) && (
                        <Button
                            type="default"
                            icon={<PlusOutlined />}
                            onClick={() => setShowAddShowtimeModal(true)}
                        >
                            Thêm suất diễn
                        </Button>
                    )}
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/organizer/edit-event/${eventId}`)}
                        disabled={['PENDING_APPROVAL', 'ONGOING', 'COMPLETED', 'PENDING_DELETION'].includes(event.status)}
                    >
                        Sửa sự kiện
                    </Button>
                </Space>
            </div>

            <Row gutter={24}>
                {/* Left side */}
                <Col xs={24} lg={16}>
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        {/* Event Banner & Description */}
                        <Card styles={{ body: { padding: 0 } }} overflow="hidden">
                            <div style={{ height: 300, backgroundColor: '#f0f2f5', overflow: 'hidden' }}>
                                {event.banner_image_url && (
                                    <Image
                                        src={getImageUrl(event.banner_image_url)}
                                        width="100%"
                                        height={300}
                                        style={{ objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                            <div style={{ padding: 24 }}>
                                <Title level={5}>Mô tả sự kiện</Title>
                                <Paragraph type="secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                    {event.description || 'Chưa có mô tả chi tiết.'}
                                </Paragraph>
                            </div>
                        </Card>

                        {/* Ticket Groups */}
                        <Card title="DANH SÁCH LOẠI VÉ" headStyle={{ fontSize: 13, color: '#8c8c8c' }}>
                            <Row gutter={[16, 16]}>
                                {ticketTypes.map((tt, index) => {
                                    const soldInType = (eventSeats || []).filter(s => s.ticket_type_id === tt.ticket_type_id && s.status === 'BOOKED').length;
                                    const percentageInType = tt.quantity > 0 ? (soldInType / tt.quantity) * 100 : 0;

                                    return (
                                        <Col xs={24} md={12} key={index}>
                                            <Card size="small" style={{ background: '#fafafa', borderStyle: 'dashed' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                    <div>
                                                        <Text strong style={{ fontSize: 14 }}>{tt.type_name}</Text><br />
                                                        <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                                            {parseFloat(tt.price).toLocaleString()}đ
                                                        </Text>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {soldInType} / {tt.quantity} vé
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Progress
                                                    percent={Math.round(percentageInType)}
                                                    size="small"
                                                    strokeColor="#52c41a"
                                                    trailColor="#e8e8e8"
                                                />
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Card>

                        {/* Seat Map */}
                        <Card
                            title={
                                <Space>
                                    <AppstoreOutlined style={{ color: '#8c8c8c' }} />
                                    <span style={{ fontSize: 13, color: '#8c8c8c' }}>SƠ ĐỒ CHỖ NGỒI THỰC TẾ</span>
                                </Space>
                            }
                        >
                            {loadingMap ? (
                                <LoadingSpinner tip="Đang tải sơ đồ..." />
                            ) : venueTemplate ? (
                                <div style={{ background: '#333', borderRadius: 8, padding: 16 }}>
                                    <SeatMapTemplateView
                                        venueTemplate={venueTemplate}
                                        selectedTemplateSeats={[]}
                                        allOccupiedSeats={eventSeats}
                                        activeTicketType={null}
                                        handleSeatMouseDown={() => { }}
                                        handleSeatMouseEnter={() => { }}
                                    />
                                </div>
                            ) : (
                                <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
                                    <InfoCircleOutlined style={{ fontSize: 32, marginBottom: 16, opacity: 0.5 }} /><br />
                                    <Text type="secondary">Không có sơ đồ ghế cho địa điểm này</Text>
                                </div>
                            )}
                        </Card>
                    </Space>
                </Col>

                {/* Right side */}
                <Col xs={24} lg={8}>
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <Card title="Thông tin chi tiết">
                            <Descriptions column={1} layout="vertical">
                                <Descriptions.Item label={
                                    <Space><CalendarOutlined /> <Text strong>Ngày tổ chức</Text></Space>
                                }>
                                    <Text type="secondary">
                                        {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label={
                                    <Space><ClockCircleOutlined /> <Text strong>Thời gian</Text></Space>
                                }>
                                    <Text type="secondary">
                                        {event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                        {' - '}
                                        {event.end_datetime ? new Date(event.end_datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label={
                                    <Space><EnvironmentOutlined /> <Text strong>Địa điểm</Text></Space>
                                }>
                                    <Text type="secondary">{event.venue?.venue_name}</Text><br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>{event.venue?.address}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider style={{ margin: '16px 0' }} />

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Kênh bán vé</Text>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                                    Mở: {event.sale_start_datetime ? new Date(event.sale_start_datetime).toLocaleString('vi-VN') : 'N/A'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                                    Đóng: {event.sale_end_datetime ? new Date(event.sale_end_datetime).toLocaleString('vi-VN') : 'N/A'}
                                </Text>
                            </div>
                        </Card>

                        <Card style={{ backgroundColor: '#262626', borderColor: '#262626' }}>
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Space>
                                    <InfoCircleOutlined style={{ color: '#52c41a' }} />
                                    <Text strong style={{ color: 'white', fontSize: 12 }}>THÔNG TIN HỆ THỐNG</Text>
                                </Space>

                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>ID SỰ KIỆN</Text>
                                    <Text strong style={{ color: 'white', fontSize: 20, letterSpacing: 1, fontFamily: 'monospace' }}>
                                        #{event.event_id.toString().padStart(6, '0')}
                                    </Text>
                                </div>

                                <Link to="/organizer/events">
                                    <Button block type="text" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        <HomeOutlined /> Quay lại trang chủ
                                    </Button>
                                </Link>
                            </Space>
                        </Card>
                    </Space>
                </Col>
            </Row>

            <AddShowtimeModal
                visible={showAddShowtimeModal}
                onCancel={() => setShowAddShowtimeModal(false)}
                onSuccess={() => {
                    setShowAddShowtimeModal(false);
                    fetchData();
                }}
                eventId={eventId}
                eventData={event}
            />
        </div>
    );
};

export default EventDetails;
