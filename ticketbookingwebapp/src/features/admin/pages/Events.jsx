import React, { useState, useEffect } from 'react';
import AdminPortal from '@shared/components/AdminPortal';

import {

    Card,

    Table,

    Button,

    Tag,

    Avatar,

    Input,

    Modal,

    Select,

    Space,

    Typography,

    Tooltip,

    Alert,

    message,

    Spin,

    Divider,

    Row,

    Col,

    Badge,

    Image,

    List

} from 'antd';

import {

    SearchOutlined,

    ReloadOutlined,

    EyeOutlined,

    CheckCircleOutlined,

    CloseCircleOutlined,

    EnvironmentOutlined,

    CalendarOutlined,

    StarFilled,

    StarOutlined,

    WarningOutlined,

    FilterOutlined,

    DeleteOutlined,

    StopOutlined,

    PlayCircleOutlined,

    CloudUploadOutlined,

    AppstoreOutlined,

    GiftOutlined,

    PercentageOutlined

} from '@ant-design/icons';

import { api } from '@services/api';

import { getImageUrl } from '@shared/utils/eventUtils';

import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';

import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';



const { Text, Title, Paragraph } = Typography;



const AdminEventsManagement = () => {

    const [loading, setLoading] = useState(true);

    const [events, setEvents] = useState([]);

    const [selectedEvent, setSelectedEvent] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);



    // Filter States

    const [filterStatus, setFilterStatus] = useState('ALL');

    const [filterFeatured, setFilterFeatured] = useState('ALL');

    const [searchQuery, setSearchQuery] = useState('');



    // Seat Map States

    const [venueTemplate, setVenueTemplate] = useState(null);

    const [eventSeats, setEventSeats] = useState([]);

    const [loadingMap, setLoadingMap] = useState(false);

    // Discount States
    const [eventDiscounts, setEventDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);



    useEffect(() => {

        fetchEvents();

    }, []);



    useEffect(() => {

        if (selectedEvent && showModal) {

            fetchEventSeatMap();
            fetchEventDiscounts();

        } else {

            setVenueTemplate(null);

            setEventSeats([]);
            setEventDiscounts([]);

        }

    }, [selectedEvent, showModal]);



    const fetchEventSeatMap = async () => {

        try {

            setLoadingMap(true);

            const venueRes = await api.getVenueById(selectedEvent.venue_id);

            if (venueRes.success) {

                setVenueTemplate(venueRes.data.seat_map_template);

            }



            const seatsRes = await api.getAllEventSeats(selectedEvent.event_id);

            if (seatsRes.success) {

                const mappedSeats = seatsRes.data.map(s => ({

                    row_name: s.row_name,

                    seat_number: s.seat_number,

                    area: s.area_name,

                    ticket_type_id: s.ticket_type_id,

                    status: s.status

                }));

                setEventSeats(mappedSeats);

            }

        } catch (error) {

            console.error("Error fetching seat map info:", error);

            message.error("Không thể tải sơ đồ ghế");

        } finally {

            setLoadingMap(false);

        }

    };

    const fetchEventDiscounts = async () => {
        try {
            setLoadingDiscounts(true);
            const res = await api.getEventDiscounts(selectedEvent.event_id);
            if (res.success) {
                setEventDiscounts(res.data);
            }
        } catch (error) {
            console.error("Error fetching discounts:", error);
        } finally {
            setLoadingDiscounts(false);
        }
    };

    const getDiscountStatusConfig = (status) => {
        const configs = {
            'ACTIVE': { color: 'success', label: 'Đang hoạt động' },
            'INACTIVE': { color: 'default', label: 'Tạm dừng' },
            'EXPIRED': { color: 'error', label: 'Hết hạn' },
            'USED_UP': { color: 'warning', label: 'Hết lượt' }
        };
        return configs[status] || { color: 'default', label: status };
    };



    const fetchEvents = async () => {

        try {

            setLoading(true);

            const res = await api.getAllAdminEvents();

            if (res.success) setEvents(res.data);

        } catch (error) {

            console.error("Error fetching admin events:", error);

            message.error("Lỗi khi tải danh sách sự kiện");

        } finally {

            setLoading(false);

        }

    };



    const handleUpdateStatus = async (eventId, newStatus) => {

        try {

            setActionLoading(true);

            const data = { status: newStatus };

            const res = await api.adminUpdateEventStatus(eventId, data);

            if (res.success) {

                message.success(`Cập nhật trạng thái thành công`);

                setShowModal(false);

                fetchEvents();

            }

        } catch (error) {

            message.error(error.message);

        } finally {

            setActionLoading(false);

        }

    };



    const toggleFeatured = async (event) => {

        const allowedStatuses = ['APPROVED', 'PUBLISHED', 'ONGOING'];

        if (!event.is_featured && !allowedStatuses.includes(event.status)) {

            message.warning("Chỉ sự kiện đã duyệt hoặc công khai mới có thể đánh dấu nổi bật");

            return;

        }



        try {

            const data = { is_featured: !event.is_featured };

            const res = await api.adminUpdateEventStatus(event.event_id, data);

            if (res.success) {

                message.success(event.is_featured ? "Đã bỏ đánh dấu nổi bật" : "Đã đánh dấu sự kiện nổi bật");

                fetchEvents();

            }

        } catch (error) {

            message.error(error.message);

        }

    };



    const handleDeleteEvent = (eventId) => {

        Modal.confirm({

            title: 'Xác nhận xóa vĩnh viễn',

            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,

            content: 'Bạn có chắc chắn muốn XÓA VĨNH VIỄN sự kiện này không? Hành động này không thể hoàn tác.',

            okText: 'Xác nhận xóa',

            okType: 'danger',

            cancelText: 'Hủy',

            onOk: async () => {

                try {

                    setActionLoading(true);

                    const res = await api.adminDeleteEvent(eventId);

                    if (res.success) {

                        message.success("Đã xóa sự kiện thành công");

                        setShowModal(false);

                        fetchEvents();

                    }

                } catch (error) {

                    message.error(error.message);

                } finally {

                    setActionLoading(false);

                }

            }

        });

    };



    const getStatusConfig = (status) => {

        const configs = {

            'PUBLISHED': { color: 'success', label: 'Công khai', icon: <CloudUploadOutlined /> },

            'PENDING_APPROVAL': { color: 'warning', label: 'Chờ duyệt', icon: <SyncOutlined spin /> },

            'APPROVED': { color: 'cyan', label: 'Đã duyệt', icon: <CheckCircleOutlined /> },

            'REJECTED': { color: 'error', label: 'Bị từ chối', icon: <CloseCircleOutlined /> },

            'DRAFT': { color: 'default', label: 'Nháp', icon: <ClockCircleOutlined /> },

            'CANCELLED': { color: 'error', label: 'Đã hủy', icon: <StopOutlined /> },

            'COMPLETED': { color: 'default', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },

            'ONGOING': { color: 'processing', label: 'Đang diễn ra', icon: <PlayCircleOutlined /> },

            'DELETED': { color: 'magenta', label: 'Đã xóa', icon: <DeleteOutlined /> }

        };

        return configs[status] || { color: 'default', label: status, icon: null };

    };



    const filteredEvents = events.filter(event => {

        if (filterStatus !== 'ALL' && event.status !== filterStatus) return false;

        if (filterFeatured === 'FEATURED' && !event.is_featured) return false;

        if (filterFeatured === 'NOT_FEATURED' && event.is_featured) return false;

        if (searchQuery && !event.event_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;

    });



    const pendingCount = events.filter(e => e.status === 'PENDING_APPROVAL').length;



    const columns = [

        {

            title: 'ẢNH BÌA',

            key: 'banner',

            render: (_, record) => (

                <Image
                    width={80}
                    height={45}
                    src={getImageUrl(record.banner_image_url)}
                    style={{ borderRadius: 12, objectFit: 'cover' }}
                />

            ),

        },

        {

            title: 'THÔNG TIN SỰ KIỆN',

            key: 'info',

            render: (_, record) => (

                <Space direction="vertical" size={0}>

                    <Text strong style={{ fontSize: 14 }}>{record.event_name}</Text>

                    <Space size={8} style={{ fontSize: 12 }}>

                        <Text type="secondary"><EnvironmentOutlined /> {record.venue?.name || record.venue_name}</Text>

                        <Text type="secondary"><CalendarOutlined /> {new Date(record.start_datetime).toLocaleDateString('vi-VN')}</Text>

                    </Space>

                </Space>

            ),

        },

        {

            title: 'NHÀ TỔ CHỨC',

            key: 'organizer',

            render: (_, record) => (

                <Space>

                    <Avatar size="small" style={{ backgroundColor: '#2DC275' }}>{record.organizer_name?.charAt(0)}</Avatar>

                    <Text style={{ fontSize: 13 }}>{record.organizer_name}</Text>

                </Space>

            ),

        },

        {

            title: 'TRẠNG THÁI',

            key: 'status',

            align: 'center',

            render: (_, record) => {

                const config = getStatusConfig(record.status);

                return <Tag color={config.color} style={{ fontSize: '0.7rem' }}>{config.label.toUpperCase()}</Tag>;

            },

        },

        {

            title: 'NỔI BẬT',

            key: 'featured',

            align: 'center',

            render: (_, record) => (

                <Tooltip title={record.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}>

                    <Button

                        type="text"

                        icon={record.is_featured ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}

                        onClick={() => toggleFeatured(record)}

                        disabled={!record.is_featured && !['APPROVED', 'PUBLISHED', 'ONGOING'].includes(record.status)}

                    />

                </Tooltip>

            ),

        },

        // Actions column removed as requested - moved to toolbar
    ];



    // For icons that were missing

    const SyncOutlined = ({ spin }) => <ReloadOutlined spin={spin} />;

    const ClockCircleOutlined = () => <CalendarOutlined />;



    if (loading) {

        return <AdminLoadingScreen tip="Đang tải danh sách sự kiện..." />;

    }



    return (

        <div style={{ padding: '0 24px' }}>
            <Card
                style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                <Row gutter={16}>

                    <Col xs={24} md={8}>

                        <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c', fontWeight: 600 }}>TÌM KIẾM</div>

                        <Input

                            placeholder="Tên sự kiện, địa điểm..."

                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}

                            value={searchQuery}

                            onChange={e => setSearchQuery(e.target.value)}

                            allowClear

                            size="large"

                        />

                    </Col>

                    <Col xs={12} md={8}>

                        <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c', fontWeight: 600 }}>TRẠNG THÁI</div>

                        <Select

                            value={filterStatus}

                            style={{ width: '100%' }}

                            onChange={setFilterStatus}

                            size="large"

                        >

                            <Option value="ALL">Tất cả trạng thái</Option>

                            <Option value="DRAFT">Nháp</Option>

                            <Option value="PENDING_APPROVAL">Chờ phê duyệt</Option>

                            <Option value="APPROVED">Đã phê duyệt</Option>

                            <Option value="PUBLISHED">Công khai</Option>

                            <Option value="REJECTED">Đã từ chối</Option>

                            <Option value="ONGOING">Đang diễn ra</Option>

                            <Option value="COMPLETED">Đã kết thúc</Option>

                            <Option value="CANCELLED">Đã hủy</Option>

                            <Option value="DELETED">Đã xóa</Option>

                        </Select>

                    </Col>

                    <Col xs={12} md={8}>

                        <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c', fontWeight: 600 }}>NỔI BẬT</div>

                        <Select

                            value={filterFeatured}

                            style={{ width: '100%' }}

                            onChange={setFilterFeatured}

                            size="large"

                        >

                            <Option value="ALL">Tất cả</Option>

                            <Option value="FEATURED">Sự kiện nổi bật</Option>

                            <Option value="NORMAL">Sự kiện thường</Option>

                        </Select>
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {selectedRowKeys.length > 0 && (
                            <Space size="middle">
                                <Text strong>{selectedRowKeys.length} đã chọn:</Text>
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleUpdateStatus(selectedRowKeys[0], 'APPROVED')}
                                    disabled={selectedRowKeys.length > 1}
                                    style={{ backgroundColor: '#2DC275', borderColor: '#2DC275' }}
                                >
                                    Phê duyệt
                                </Button>
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleUpdateStatus(selectedRowKeys[0], 'REJECTED')}
                                    disabled={selectedRowKeys.length > 1}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => {
                                        const record = events.find(e => e.event_id === selectedRowKeys[0]);
                                        setSelectedEvent(record);
                                        setShowModal(true);
                                    }}
                                    disabled={selectedRowKeys.length > 1}
                                >
                                    Xem chi tiết
                                </Button>
                            </Space>
                        )}
                    </div>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => fetchEvents()}
                            disabled={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>
            </Card>

            {
                pendingCount > 0 && (

                    <Alert

                        message={

                            <Space>

                                <WarningOutlined />

                                <Text strong>Cần chú ý: Đang có {pendingCount} sự kiện chờ bạn phê duyệt.</Text>

                            </Space>

                        }

                        type="warning"

                        showIcon={false}

                        style={{ marginBottom: 24, borderRadius: 8, border: 'none', backgroundColor: '#fffbe6' }}

                    />

                )
            }



            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    rowKey="event_id"
                    columns={columns}

                    dataSource={filteredEvents}

                    pagination={{

                        pageSize: 10,

                        showTotal: (total) => `Tổng số ${total} sự kiện`

                    }}

                />

            </Card>



            <Modal

                title={<Text strong style={{ fontSize: 18 }}>Chi Tiết Sự Kiện</Text>}

                open={showModal}

                onCancel={() => setShowModal(false)}

                footer={selectedEvent && selectedEvent.status === 'PENDING_APPROVAL' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 24px' }}>
                        <Button
                            danger
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'REJECTED')}
                        >
                            Từ chối
                        </Button>
                        <Button
                            type="primary"
                            loading={actionLoading}
                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'APPROVED')}
                        >
                            Duyệt sự kiện
                        </Button>
                    </div>
                ) : null}
                width={800}
                style={{ top: 20 }}
                styles={{ body: { padding: 0 } }}
            >
                <Spin spinning={actionLoading} tip="Đang xử lý...">
                    {selectedEvent && (
                        <div>
                            <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage: `url(${getImageUrl(selectedEvent.banner_image_url)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(10px) brightness(0.7)'
                                }} />
                                <div style={{
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 32px',
                                    gap: 24
                                }}>
                                    <img
                                        src={getImageUrl(selectedEvent.banner_image_url)}
                                        alt={selectedEvent.event_name}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 8,
                                            objectFit: 'cover',
                                            border: '3px solid white',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                    <div style={{ color: 'white' }}>
                                        <Title level={4} style={{ color: 'white', margin: 0 }}>{selectedEvent.event_name}</Title>
                                        <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />}>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                <EnvironmentOutlined /> {selectedEvent.venue?.name || selectedEvent.venue_name}
                                            </Text>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                <CalendarOutlined /> {new Date(selectedEvent.start_datetime).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Space>
                                        <div style={{ marginTop: 12 }}>
                                            {getStatusConfig(selectedEvent.status).label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: 32 }}>
                                <Row gutter={32}>
                                    <Col span={24}>
                                        <Title level={5}>Mô tả</Title>
                                        <Paragraph type="secondary">
                                            {selectedEvent.description || 'Không có mô tả cho sự kiện này.'}
                                        </Paragraph>

                                        <Divider />

                                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                            <Text strong><AppstoreOutlined /> Sơ đồ chỗ ngồi</Text>
                                        </Space>
                                        {loadingMap ? (
                                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                                <Spin tip="Đang tải sơ đồ...">
                                                    <div style={{ padding: 20 }} />
                                                </Spin>
                                            </div>
                                        ) : venueTemplate ? (
                                            <Card size="small" style={{ background: '#262626', border: '1px solid #434343' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, fontSize: 11 }}>
                                                    <Space><Badge color="#f0f0f0" /> <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Trống</Text></Space>
                                                    <Space><Badge color="#2DC275" /> <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Đã gán</Text></Space>
                                                    <Space><Badge color="#ff4d4f" /> <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Hỏng/khác</Text></Space>
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

                                        {/* Discount/Coupon Section */}
                                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                            <Text strong><GiftOutlined /> Mã giảm giá ({eventDiscounts.length})</Text>
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
                                                            border: '1px solid #f0f0f0'
                                                        }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <div style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: 8,
                                                                    background: discount.discount_type === 'PERCENTAGE' ? '#e6f7ff' : '#fff7e6',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    {discount.discount_type === 'PERCENTAGE' ? (
                                                                        <PercentageOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                                                                    ) : (
                                                                        <GiftOutlined style={{ fontSize: 18, color: '#fa8c16' }} />
                                                                    )}
                                                                </div>
                                                            }
                                                            title={
                                                                <Space>
                                                                    <Text code style={{ fontSize: 13, fontWeight: 600 }}>{discount.discount_code}</Text>
                                                                    <Tag color={getDiscountStatusConfig(discount.status).color}>
                                                                        {getDiscountStatusConfig(discount.status).label}
                                                                    </Tag>
                                                                </Space>
                                                            }
                                                            description={
                                                                <Space direction="vertical" size={2}>
                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                        {discount.discount_name}
                                                                    </Text>
                                                                    <Space split={<Divider type="vertical" />} size={4}>
                                                                        <Text style={{ fontSize: 12, color: '#fa541c' }}>
                                                                            Giảm: {discount.discount_type === 'PERCENTAGE'
                                                                                ? `${discount.discount_value}%`
                                                                                : `${discount.discount_value.toLocaleString('vi-VN')}đ`}
                                                                        </Text>
                                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                                            Đã dùng: {discount.used_count || 0}/{discount.usage_limit || '∞'}
                                                                        </Text>
                                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                                            HSD: {new Date(discount.end_date).toLocaleDateString('vi-VN')}
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
                    )}
                </Spin>
            </Modal>

            <style dangerouslySetInnerHTML={{

                __html: `

    .pending - row { background - color: #fffbe6!important; }

                .pending - row:hover td { background - color: #fff1b8!important; }

`}} />

        </div >

    );

};



export default AdminEventsManagement;

