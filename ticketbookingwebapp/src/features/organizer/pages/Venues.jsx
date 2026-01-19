import React, { useState, useEffect } from 'react';
import {
    ReloadOutlined,
    EnvironmentOutlined,
    EditOutlined,
    PlusOutlined,
    AppstoreOutlined,
    ToolOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {
    Table,
    Button,
    Typography,
    Space,
    Tag,
    message,
    Spin,
    Tooltip,
    Skeleton,
    Popconfirm
} from 'antd';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import VenueSeatMapEditor from '@features/organizer/components/VenueSeatMapEditor';
import VenueFormModal from '@features/organizer/components/VenueFormModal';

const { Title } = Typography;

const OrganizerVenues = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [venues, setVenues] = useState([]);

    // Seat Map Editor State
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editorInitialAreas, setEditorInitialAreas] = useState([]);

    // Create/Edit Venue State
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);

    useEffect(() => {
        if (user) {
            fetchVenues();
        }
    }, [user]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const res = await api.getOrganizerVenues(user.user_id);
            if (res.success) setVenues(res.data);
        } catch (error) {
            console.error("Error fetching venues:", error);
            message.error("Lỗi khi tải thông tin địa điểm");
        } finally {
            setLoading(false);
        }
    };

    // --- VENUE CRUD OPERATIONS ---
    const handleCreateVenue = () => {
        setEditingVenue(null);
        setShowVenueModal(true);
    };

    const handleEditVenue = (venue) => {
        setEditingVenue(venue);
        setShowVenueModal(true);
    };

    // --- SEAT MAP EDITOR Handlers ---
    const handleEditLayout = (venue) => {
        setSelectedVenue(venue);
        const template = venue.seat_map_template || { areas: [] };
        setEditorInitialAreas(template.areas || []);
        setShowEditModal(true);
    };

    const handleSaveLayout = async (newAreas) => {
        try {
            setSaving(true);
            const totalCapacity = newAreas.reduce((sum, area) => sum + (area.rows * area.cols), 0);

            const payload = {
                capacity: totalCapacity,
                seat_map_template: { areas: newAreas }
            };

            const res = await api.updateVenueSeats(selectedVenue.venue_id, payload);
            if (res.success) {
                message.success("Cập nhật sơ đồ địa điểm thành công!");
                setShowEditModal(false);
                fetchVenues();
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMaintenance = async (venue) => {
        const newStatus = venue.status === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE';
        try {
            const res = await api.updateVenue(venue.venue_id, { status: newStatus });
            if (res.success) {
                message.success(`Đã chuyển ${venue.venue_name} sang ${newStatus === 'MAINTENANCE' ? 'chế độ bảo trì' : 'trạng thái hoạt động'}`);
                fetchVenues();
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleDeleteVenue = async (venueId) => {
        try {
            const res = await api.deleteVenue(venueId);
            if (res.success) {
                message.success('Xóa địa điểm thành công');
                fetchVenues();
            }
        } catch (error) {
            message.error(error.message || 'Lỗi khi xóa địa điểm');
        }
    };

    // Table columns configuration
    const columns = [
        {
            title: 'Tên địa điểm',
            dataIndex: 'venue_name',
            key: 'venue_name',
            width: 200,
            fixed: 'left',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        <EnvironmentOutlined /> {record.city || 'Chưa cập nhật'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 250,
            ellipsis: {
                showTitle: false,
            },
            render: (address) => (
                <Tooltip placement="topLeft" title={address}>
                    <EnvironmentOutlined /> {address}
                </Tooltip>
            ),
        },
        {
            title: 'Liên hệ',
            dataIndex: 'contact_phone',
            key: 'contact_phone',
            width: 130,
            render: (phone) => phone ? (
                <>
                    <PhoneOutlined /> {phone}
                </>
            ) : (
                <span style={{ color: '#bfbfbf' }}>Chưa có</span>
            ),
        },
        {
            title: 'Khu vực',
            key: 'areas',
            width: 90,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map_template || { areas: [] };
                const areaCount = template.areas?.length || 0;
                return <span style={{ fontWeight: 600 }}>{areaCount}</span>;
            },
        },
        {
            title: 'Tổng ghế',
            key: 'total_seats',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map_template || { areas: [] };
                const totalSeats = template.areas?.reduce((sum, a) => sum + (a.rows * a.cols), 0) || record.capacity || 0;
                return <span style={{ fontWeight: 600 }}>{totalSeats}</span>;
            },
        },
        {
            title: 'Ghế hỏng',
            key: 'locked_seats',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map_template || { areas: [] };
                const lockedCount = template.areas?.reduce((sum, a) => sum + (a.locked_seats?.length || 0), 0) || 0;
                return (
                    <span style={{ fontWeight: 600, color: lockedCount > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {lockedCount}
                    </span>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                if (record.status === 'MAINTENANCE') {
                    return <Tag color="warning" icon={<ToolOutlined />}>BẢO TRÌ</Tag>;
                }
                return record.is_active ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>SẴN SÀNG</Tag>
                ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>BẢN NHÁP</Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 280,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditVenue(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<AppstoreOutlined />}
                        onClick={() => handleEditLayout(record)}
                    >
                        Sơ đồ
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger={record.status !== 'MAINTENANCE'}
                        icon={<ToolOutlined />}
                        onClick={() => handleToggleMaintenance(record)}
                    >
                        {record.status === 'MAINTENANCE' ? 'Hoàn tất' : 'Bảo trì'}
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa địa điểm này?"
                        onConfirm={() => handleDeleteVenue(record.venue_id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, gap: 10 }}>
                    <Skeleton.Button active size="default" style={{ width: 150 }} />
                    <Skeleton.Button active size="default" style={{ width: 100 }} />
                </div>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    return (
        <Spin spinning={saving} tip="Đang xử lý...">
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, alignItems: 'center' }}>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateVenue}
                        >
                            Tạo địa điểm
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchVenues}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={venues}
                    rowKey="venue_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} địa điểm`,
                    }}
                    scroll={{ x: 1200 }}
                    bordered
                />

                {/* Create/Edit Modal */}
                <VenueFormModal
                    visible={showVenueModal}
                    onCancel={() => setShowVenueModal(false)}
                    onSuccess={fetchVenues}
                    editingVenue={editingVenue}
                    user={user}
                />

                {/* Seat Map Editor Component */}
                <VenueSeatMapEditor
                    venueName={selectedVenue?.venue_name}
                    initialAreas={editorInitialAreas}
                    visible={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveLayout}
                    saving={saving}
                />
            </div>
        </Spin>
    );
};

export default OrganizerVenues;
