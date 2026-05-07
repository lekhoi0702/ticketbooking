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
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    HomeOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
import { formatLocale } from '@shared/utils/dateUtils';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';

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
            'DRAFT': { color: 'default', label: 'NHÁP' },
            'PENDING_APPROVAL': { color: 'warning', label: 'CHỜ DUYỆT' },
            'PUBLISHED': { color: 'success', label: 'CÔNG KHAI' },
            'REJECTED': { color: 'error', label: 'TỪ CHỐI DUYỆT' },
            'CANCELLED': { color: 'default', label: 'HỦY' },
            'ONGOING': { color: 'processing', label: 'ĐANG DIỄN RA' },
            'COMPLETED': { color: 'default', label: 'ĐÃ KẾT THÚC' }
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
                    title="Lá»—i"
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
                </Space>
            </div>

            <Row gutter={24}>
                {/* Left side */}
                <Col xs={24} lg={16}>
                    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
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
                                    const selectedSeatsCount = Array.isArray(tt.selected_seats) ? tt.selected_seats.length : 0;
                                    const quantityFromApi = Number(tt.quantity ?? 0) || 0;
                                    const soldFromApi = Number(tt.sold_quantity ?? 0) || 0;
                                    const availableFromApi = Number(tt.available_quantity ?? 0) || 0;

                                    const totalInType = selectedSeatsCount > 0
                                        ? selectedSeatsCount
                                        : (quantityFromApi > 0 ? quantityFromApi : (availableFromApi + soldFromApi));
                                    const soldInType = soldFromApi > 0
                                        ? soldFromApi
                                        : (totalInType > 0 ? Math.max(totalInType - availableFromApi, 0) : 0);
                                    const remainingInType = availableFromApi > 0
                                        ? availableFromApi
                                        : Math.max(totalInType - soldInType, 0);
                                    const percentageInType = totalInType > 0 ? (soldInType / totalInType) * 100 : 0;

                                    return (
                                        <Col xs={24} md={12} key={index}>
                                            <Card size="small" style={{ background: '#fafafa', borderStyle: 'dashed' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                    <div>
                                                        <Text strong style={{ fontSize: 14 }}>{tt.type_name}</Text><br />
                                                        <Text strong style={{ fontSize: 16, color: '#2DC275' }}>
                                                            {(Number(tt.price ?? 0) || 0).toLocaleString()}
                                                        </Text>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Đã bán {soldInType} / Tổng {totalInType}
                                                        </Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Còn lại {remainingInType} vé
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Progress
                                                    percent={Math.round(percentageInType)}
                                                    size="small"
                                                    strokeColor="#2DC275"
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
                    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                        <Card title="Thông tin chi tiết">
                            <Descriptions column={1} layout="vertical">
                                <Descriptions.Item label={
                                    <Space><CalendarOutlined /> <Text strong>Ngày tổ chức</Text></Space>
                                }>
                                    <Text type="secondary">
                                        {event.start_datetime ? formatLocale(event.start_datetime, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label={
                                    <Space><ClockCircleOutlined /> <Text strong>Thời gian</Text></Space>
                                }>
                                    <Text type="secondary">
                                        {event.start_datetime ? formatLocale(event.start_datetime, { hour: '2-digit', minute: '2-digit' }) : '--'}
                                        {' - '}
                                        {event.end_datetime ? formatLocale(event.end_datetime, { hour: '2-digit', minute: '2-digit' }) : '--'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label={
                                    <Space><EnvironmentOutlined /> <Text strong>Địa điểm</Text></Space>
                                }>
                                    <Text type="secondary">{event.venue?.venue_name}</Text><br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>{event.venue?.address}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Chi tiết VietQR - layout giống trang khách */}
                        <Card
                            title={
                                <Space>
                                    <CreditCardOutlined style={{ color: '#8c8c8c' }} />
                                    <Text strong>VietQR</Text>
                                </Space>
                            }
                        >
                            {event.qr_image_url ? (
                                (() => {
                                    let bank = '';
                                    let acc = '';
                                    if (event.qr_image_url.includes('qr.sepay.vn')) {
                                        try {
                                            const url = new URL(event.qr_image_url);
                                            acc = url.searchParams.get('acc') || '';
                                            bank = url.searchParams.get('bank') || '';
                                        } catch (_) {}
                                    }
                                    const qrSrc = event.qr_image_url.startsWith('http') ? event.qr_image_url : getImageUrl(event.qr_image_url);
                                    return (
                                        <div style={{ textAlign: 'center', width: '100%' }}>
                                            <Text type="secondary" strong style={{ display: 'block', marginBottom: 8, fontSize: 13, letterSpacing: '0.5px' }}>
                                                Quét mã QR để thanh toán
                                            </Text>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: 20,
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #E0E0E0',
                                                borderRadius: 12,
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                marginBottom: 12
                                            }}>
                                                <img
                                                    src={qrSrc}
                                                    alt="VietQR Code"
                                                    style={{
                                                        width: 220,
                                                        height: 220,
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        maxWidth: '100%'
                                                    }}
                                                />
                                            </div>
                                            <div style={{
                                                textAlign: 'left',
                                                marginTop: 12,
                                                padding: 12,
                                                borderRadius: 12,
                                                backgroundColor: '#f5f5f5',
                                                border: '1px solid #e8e8e8',
                                                maxWidth: 320,
                                                margin: '0 auto'
                                            }}>
                                                {(bank || acc) ? (
                                                    <>
                                                        {bank ? (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 13 }}>
                                                                <Text type="secondary" strong>Ngân hàng:</Text>
                                                                <Text strong style={{ wordBreak: 'break-word', textAlign: 'right' }}>{bank}</Text>
                                                            </div>
                                                        ) : null}
                                                        {acc ? (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                                                                <Text type="secondary" strong>Số tài khoản:</Text>
                                                                <Text strong copyable style={{ fontFamily: 'monospace', wordBreak: 'break-word', textAlign: 'right' }}>{acc}</Text>
                                                            </div>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                        QR đã cấu hình (ảnh hoặc link tùy chỉnh).
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Tag icon={<MinusCircleOutlined />} color="default">Chưa cấu hình</Tag>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                        Cấu hình VietQR trong mục Chỉnh sửa sự kiện để khách thanh toán chuyển khoản qua QR.
                                    </Text>
                                </>
                            )}
                        </Card>

                        <Card style={{ backgroundColor: '#262626', borderColor: '#262626' }}>
                            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                                <Space>
                                    <InfoCircleOutlined style={{ color: '#2DC275' }} />
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
        </div>
    );
};

export default EventDetails;





