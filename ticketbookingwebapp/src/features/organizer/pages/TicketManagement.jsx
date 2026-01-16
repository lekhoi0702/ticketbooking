import React, { useState } from 'react';
import {
    Card,
    Input,
    Button,
    Typography,
    Table,
    Tag,
    Space,
    message,
    Modal,
    Divider,
    Descriptions,
    Badge,
    Select
} from 'antd';
import {
    SearchOutlined,
    QrcodeOutlined,
    CheckCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    BarcodeOutlined
} from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';

const { Title, Text } = Typography;
const { Search } = Input;

const TicketManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [searched, setSearched] = useState(false);

    // Filters
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchStatus, setSearchStatus] = useState('ALL');

    // Check-in Modal
    const [checkInTicket, setCheckInTicket] = useState(null);
    const [showCheckInModal, setShowCheckInModal] = useState(false);

    React.useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        if (!user) return;
        try {
            const res = await api.getOrganizerEvents(user.user_id);
            if (res.success) {
                setEvents(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (value) => {
        if (!value && !selectedEvent && searchStatus === 'ALL') {
            message.warning('Vui lòng nhập từ khóa hoặc chọn bộ lọc');
            return;
        }

        try {
            setLoading(true);
            const res = await api.searchTickets(value, user.user_id, selectedEvent, searchStatus);
            if (res.success) {
                setTickets(res.data);
                setSearched(true);
                if (res.data.length === 0) {
                    message.info('Không tìm thấy vé nào phù hợp');
                }
            }
        } catch (error) {
            message.error('Lỗi khi tìm kiếm vé: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCheckIn = async (ticketCode) => {
        try {
            setCheckInLoading(true);
            const res = await api.checkInTicket(ticketCode, user.user_id);
            if (res.success) {
                message.success('Check-in thành công!');
                // Update local state
                setTickets(tickets.map(t =>
                    t.ticket_code === ticketCode
                        ? { ...t, ticket_status: 'USED', checked_in_at: new Date().toISOString() }
                        : t
                ));

                // If modal is open, update it or close it
                if (showCheckInModal && checkInTicket?.ticket_code === ticketCode) {
                    setShowCheckInModal(false);
                    setCheckInTicket(null);
                }
            }
        } catch (error) {
            Modal.error({
                title: 'Check-in Thất Bại',
                content: error.message,
            });
        } finally {
            setCheckInLoading(false);
        }
    };

    const openCheckInModal = (ticket) => {
        setCheckInTicket(ticket);
        setShowCheckInModal(true);
    };

    const columns = [
        {
            title: 'Mã vé',
            dataIndex: 'ticket_code',
            key: 'ticket_code',
            render: (text) => <Text copyable strong>{text}</Text>
        },
        {
            title: 'Sự kiện',
            dataIndex: 'event_name',
            key: 'event_name',
        },
        {
            title: 'Loại vé',
            dataIndex: 'ticket_type_name',
            key: 'ticket_type_name',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Khách hàng',
            key: 'holder',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong><UserOutlined /> {record.holder_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.holder_email}</Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'ticket_status',
            key: 'ticket_status',
            render: (status, record) => {
                const color = status === 'ACTIVE' ? 'green' : status === 'USED' ? 'gold' : 'red';
                const label = status === 'ACTIVE' ? 'Chưa sử dụng' : status === 'USED' ? 'Đã Check-in' : 'Đã hủy';
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color={color}>{label}</Tag>
                        {status === 'USED' && record.checked_in_at && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(record.checked_in_at).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={record.ticket_status !== 'ACTIVE'}
                    onClick={() => openCheckInModal(record)}
                >
                    Soát vé
                </Button>
            )
        }
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>Quản lý vé & Check-in</Title>

            <Card style={{ marginBottom: 24 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Title level={2} style={{ margin: 0 }}>
                            <QrcodeOutlined style={{ color: '#1890ff' }} /> Tra cứu vé
                        </Title>
                        <Text type="secondary">Tìm kiếm và kiểm soát vé tham dự sự kiện</Text>
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Select
                            placeholder="Chọn sự kiện"
                            style={{ width: 300 }}
                            allowClear
                            onChange={setSelectedEvent}
                            options={events.map(e => ({ label: e.event_name, value: e.event_id }))}
                        />
                        <Select
                            defaultValue="ALL"
                            style={{ width: 150 }}
                            onChange={setSearchStatus}
                            options={[
                                { label: 'Tất cả trạng thái', value: 'ALL' },
                                { label: 'Chưa sử dụng', value: 'ACTIVE' },
                                { label: 'Đã Check-in', value: 'USED' },
                            ]}
                        />
                    </div>

                    <Search
                        placeholder="Nhập mã vé / Email / Tên khách hàng"
                        allowClear
                        enterButton="Tìm kiếm"
                        size="large"
                        onSearch={handleSearch}
                        loading={loading}
                        style={{ maxWidth: 600, margin: '0 auto', display: 'block' }}
                        prefix={<BarcodeOutlined style={{ color: '#bfbfbf' }} />}
                    />
                </Space>
            </Card>

            {searched && (
                <Card title={`Kết quả tìm kiếm (${tickets.length})`}>
                    <Table
                        dataSource={tickets}
                        columns={columns}
                        rowKey="ticket_id"
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            )}

            <Modal
                title={[
                    <Space key="title">
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Xác nhận Check-in</span>
                    </Space>
                ]}
                open={showCheckInModal}
                onCancel={() => setShowCheckInModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowCheckInModal(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => handleQuickCheckIn(checkInTicket?.ticket_code)}
                        loading={checkInLoading}
                        size="large"
                    >
                        Xác nhận CHECK-IN
                    </Button>
                ]}
            >
                {checkInTicket && (
                    <div style={{ padding: '0 20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Badge status="processing" />
                            <Title level={3} style={{ margin: '10px 0', color: '#1890ff' }}>
                                {checkInTicket.ticket_code}
                            </Title>
                            <Tag color="blue" style={{ fontSize: 16, padding: '5px 10px' }}>
                                {checkInTicket.ticket_type_name}
                            </Tag>
                        </div>

                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Sự kiện">
                                <Text strong>{checkInTicket.event_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {checkInTicket.holder_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {checkInTicket.holder_email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghế ngồi">
                                {checkInTicket.seat_id ? `Ghế ID: ${checkInTicket.seat_id}` : 'Tự do'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider plain>Thông tin kiểm soát</Divider>
                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Tag icon={<CalendarOutlined />}>
                                {new Date().toLocaleDateString('vi-VN')}
                            </Tag>
                            <Tag icon={<ClockCircleOutlined />}>
                                {new Date().toLocaleTimeString('vi-VN')}
                            </Tag>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TicketManagement;
