import React, { useState, useEffect } from 'react';
import {
    ReloadOutlined,
    EnvironmentOutlined,
    EditOutlined,
    PlusOutlined,
    AppstoreOutlined,
    ToolOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {
    Table,
    Button,
    Space,
    Tag,
    message,
    Spin,
    Tooltip,
    Skeleton,
    Popconfirm,
    Card,
} from 'antd';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import VenueSeatMapEditor from '@features/organizer/components/VenueSeatMapEditor';
import VenueFormModal from '@features/organizer/components/VenueFormModal';

const OrganizerVenues = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [venues, setVenues] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editorInitialAreas, setEditorInitialAreas] = useState([]);

    const [showVenueModal, setShowVenueModal] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);

    useEffect(() => {
        if (user) fetchVenues();
    }, [user]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const res = await api.getOrganizerVenues(user.user_id, false);
            if (res.success) setVenues(res.data || []);
        } catch (error) {
            console.error('Error fetching venues:', error);
            message.error('Lỗi khi tải thông tin địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVenue = () => {
        setEditingVenue(null);
        setShowVenueModal(true);
    };

    const handleEditVenue = (venue) => {
        setEditingVenue(venue);
        setShowVenueModal(true);
    };

    const handleEditSelected = () => {
        if (selectedRowKeys.length !== 1) {
            message.warning('Vui lòng chọn một địa điểm để sửa');
            return;
        }
        const venue = venues.find((v) => v.venue_id === selectedRowKeys[0]);
        handleEditVenue(venue);
    };

    const handleEditLayout = (venue) => {
        setSelectedVenue(venue);
        const template = venue.seat_map || { areas: [] };
        setEditorInitialAreas(template.areas || []);
        setShowEditModal(true);
    };

    const handleEditLayoutSelected = () => {
        if (selectedRowKeys.length !== 1) {
            message.warning('Vui lòng chọn một địa điểm để chỉnh sửa sơ đồ');
            return;
        }
        const venue = venues.find((v) => v.venue_id === selectedRowKeys[0]);
        handleEditLayout(venue);
    };

    const handleSaveLayout = async (newAreas) => {
        try {
            setSaving(true);
            const totalCapacity = newAreas.reduce((sum, area) => sum + (area.rows * area.cols), 0);
            const payload = {
                capacity: totalCapacity,
                seat_map_template: { areas: newAreas },
            };

            const res = await api.updateVenueSeats(selectedVenue.venue_id, payload);
            if (res.success) {
                message.success('Cập nhật sơ đồ địa điểm thành công!');
                setShowEditModal(false);
                setSelectedVenue(null);
                setSelectedRowKeys([]);
                await fetchVenues();
                setRefreshKey((prev) => prev + 1);
            } else {
                message.error(res.message || 'Không thể lưu sơ đồ ghế');
            }
        } catch (error) {
            message.error(error.message || 'Không thể lưu sơ đồ ghế');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMaintenance = async (venue) => {
        const newStatus = venue.status === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE';
        try {
            const res = await api.updateVenue(venue.venue_id, { status: newStatus });
            if (res.success) {
                message.success(
                    `Đã chuyển ${venue.venue_name} sang ${
                        newStatus === 'MAINTENANCE' ? 'chế độ bảo trì' : 'trạng thái hoạt động'
                    }`
                );
                fetchVenues();
            }
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi chuyển trạng thái');
        }
    };

    const handleDeleteVenue = async (venueId) => {
        try {
            const res = await api.deleteVenue(venueId, user?.user_id);
            if (res.success) {
                message.success('Xóa địa điểm thành công');
                fetchVenues();
            } else {
                message.error(res.message || 'Lỗi khi xóa địa điểm');
            }
        } catch (error) {
            message.error(error.message || 'Lỗi khi xóa địa điểm');
        }
    };

    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    const columns = [
        {
            title: 'Tên địa điểm',
            dataIndex: 'venue_name',
            key: 'venue_name',
            width: 220,
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
            width: 280,
            ellipsis: { showTitle: false },
            render: (address) => (
                <Tooltip placement="topLeft" title={address}>
                    <EnvironmentOutlined /> {address}
                </Tooltip>
            ),
        },
        {
            title: 'Khu vực',
            key: 'areas',
            width: 90,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map || { areas: [] };
                return <span style={{ fontWeight: 600 }}>{template.areas?.length || 0}</span>;
            },
        },
        {
            title: 'Tổng ghế',
            key: 'total_seats',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map || { areas: [] };
                const totalSeats =
                    template.areas?.reduce((sum, a) => sum + (a.rows * a.cols), 0) || record.capacity || 0;
                return <span style={{ fontWeight: 600 }}>{totalSeats}</span>;
            },
        },
        {
            title: 'Ghế hỏng',
            key: 'locked_seats',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const template = record.seat_map || { areas: [] };
                const lockedCount =
                    template.areas?.reduce((sum, a) => sum + (a.locked_seats?.length || 0), 0) || 0;
                return (
                    <span style={{ fontWeight: 600, color: lockedCount > 0 ? '#ff4d4f' : '#2DC275' }}>
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
                    return (
                        <Tag color="warning" icon={<ToolOutlined />}>
                            BẢO TRÌ
                        </Tag>
                    );
                }
                return record.is_active ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                        SẴN SÀNG
                    </Tag>
                ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>
                        BẢN NHÁP
                    </Tag>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
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
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateVenue}>
                            Tạo địa điểm
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchVenues}>
                            Làm mới
                        </Button>
                    </Space>
                </div>

                {selectedRowKeys.length > 0 && (
                    <Card size="small" style={{ marginBottom: 16, background: '#e6f7ff', borderColor: '#91d5ff' }}>
                        <Space>
                            <span style={{ fontWeight: 600 }}>
                                Đã chọn địa điểm:{' '}
                                {venues.find((v) => v.venue_id === selectedRowKeys[0])?.venue_name || ''}
                            </span>
                            <Button type="primary" size="small" icon={<EditOutlined />} onClick={handleEditSelected}>
                                Sửa
                            </Button>
                            <Button
                                type="default"
                                size="small"
                                icon={<AppstoreOutlined />}
                                onClick={handleEditLayoutSelected}
                            >
                                Sơ đồ
                            </Button>
                            {(() => {
                                const selected = venues.find((v) => v.venue_id === selectedRowKeys[0]);
                                if (selected?.status === 'MAINTENANCE') {
                                    return (
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<ThunderboltOutlined />}
                                            onClick={() => handleToggleMaintenance(selected)}
                                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                        >
                                            Sẵn sàng
                                        </Button>
                                    );
                                }
                                if (selected?.status === 'ACTIVE' || (selected?.is_active && !selected?.status)) {
                                    return (
                                        <Button
                                            type="default"
                                            size="small"
                                            icon={<ToolOutlined />}
                                            onClick={() => handleToggleMaintenance(selected)}
                                        >
                                            Bảo trì
                                        </Button>
                                    );
                                }
                                return null;
                            })()}
                            <Popconfirm
                                title={`Bạn có chắc chắn muốn xóa địa điểm "${
                                    venues.find((v) => v.venue_id === selectedRowKeys[0])?.venue_name || ''
                                }"?`}
                                onConfirm={() => handleDeleteVenue(selectedRowKeys[0])}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger size="small" icon={<DeleteOutlined />}>
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                )}

                <Table
                    key={refreshKey}
                    columns={columns}
                    dataSource={venues}
                    rowKey="venue_id"
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} địa điểm`,
                    }}
                    scroll={{ x: 1200 }}
                    bordered
                />

                <VenueFormModal
                    visible={showVenueModal}
                    onCancel={() => setShowVenueModal(false)}
                    onSuccess={fetchVenues}
                    editingVenue={editingVenue}
                    user={user}
                />

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
