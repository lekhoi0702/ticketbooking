import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Modal,
    Input,
    message,
    Spin,
    Divider,
    Row,
    Col,
    Form
} from 'antd';
import {
    ReloadOutlined,
    EnvironmentOutlined,
    EditOutlined,
    PlusOutlined,
    AppstoreOutlined,
    ToolOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import VenueSeatMapEditor from '@features/organizer/components/VenueSeatMapEditor';

const { Text, Title } = Typography;

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
    const [venueForm] = Form.useForm();
    const [editingVenue, setEditingVenue] = useState(null);

    useEffect(() => {
        if (user) {
            fetchVenues();
        }
    }, [user]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const res = await api.getVenues(user.user_id);
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
        venueForm.resetFields();
        setShowVenueModal(true);
    };

    const handleEditVenue = (venue) => {
        setEditingVenue(venue);
        venueForm.setFieldsValue({
            venue_name: venue.venue_name,
            address: venue.address,
            city: venue.city,
            contact_phone: venue.contact_phone,
            capacity: venue.capacity,
            vip_seats: venue.vip_seats,
            standard_seats: venue.standard_seats,
            economy_seats: venue.economy_seats
        });
        setShowVenueModal(true);
    };

    const handleVenueModalOk = async () => {
        try {
            const values = await venueForm.validateFields();
            setSaving(true);

            if (editingVenue) {
                // Update
                const res = await api.updateVenue(editingVenue.venue_id, {
                    ...values,
                    status: editingVenue.status
                });
                if (res.success) {
                    message.success("Cập nhật địa điểm thành công");
                    setShowVenueModal(false);
                    fetchVenues();
                }
            } else {
                // Create
                const res = await api.createVenue({
                    ...values,
                    manager_id: user.user_id
                });
                if (res.success) {
                    message.success("Tạo địa điểm mới thành công");
                    setShowVenueModal(false);
                    fetchVenues();
                }
            }
        } catch (error) {
            message.error(error.message || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
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

    if (loading && venues.length === 0) {
        return <LoadingSpinner tip="Đang tải danh sách địa điểm..." />;
    }

    return (
        <Spin spinning={loading || saving} tip="Vui lòng đợi...">
            <div>
                <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
                    <Title level={4}>Quản lý địa điểm</Title>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateVenue}>Tạo địa điểm</Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchVenues} disabled={loading || saving}>Làm mới</Button>
                    </Space>
                </Space>

                <Row gutter={[24, 24]}>
                    {venues.map((venue) => {
                        const template = venue.seat_map_template || { areas: [] };
                        const areaCount = template.areas?.length || 0;
                        const totalSeats = template.areas?.reduce((sum, a) => sum + (a.rows * a.cols), 0) || 0;
                        const lockedCount = template.areas?.reduce((sum, a) => sum + (a.locked_seats?.length || 0), 0) || 0;

                        return (
                            <Col xs={24} md={12} lg={8} key={venue.venue_id}>
                                <Card
                                    hoverable
                                    actions={[
                                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditVenue(venue)} disabled={loading || saving}>Sửa TT</Button>,
                                        <Button type="link" icon={<AppstoreOutlined />} onClick={() => handleEditLayout(venue)} disabled={loading || saving}>Sơ đồ ghế</Button>,
                                        <Button
                                            type="link"
                                            danger={venue.status !== 'MAINTENANCE'}
                                            icon={<ToolOutlined />}
                                            onClick={() => handleToggleMaintenance(venue)}
                                            disabled={loading || saving}
                                        >
                                            {venue.status === 'MAINTENANCE' ? 'Bảo trì xong' : 'Bảo trì'}
                                        </Button>
                                    ]}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>{venue.venue_name}</Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                <EnvironmentOutlined /> {venue.city || 'Chưa cập nhật'}
                                            </Text>
                                        </div>
                                        <Space size={4}>
                                            {venue.status === 'MAINTENANCE' && <Tag color="warning" icon={<ToolOutlined />}>BẢO TRÌ</Tag>}
                                            {venue.status !== 'MAINTENANCE' && (
                                                <Tag color={venue.is_active ? 'success' : 'default'}>
                                                    {venue.is_active ? 'SẴN SÀNG' : 'BẢN NHÁP'}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>

                                    <div style={{ marginBottom: 12 }}>
                                        <Text type="secondary"><EnvironmentOutlined /> {venue.address}</Text>
                                        <br />
                                        <Text type="secondary"><PhoneOutlined /> {venue.contact_phone || 'Không có sđt'}</Text>
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>KHU VỰC</Text><br />
                                            <Text strong>{areaCount}</Text>
                                        </Col>
                                        <Col span={8}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>TỔNG GHẾ</Text><br />
                                            <Text strong>{totalSeats || venue.capacity}</Text>
                                        </Col>
                                        <Col span={8}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>GHẾ HỎNG</Text><br />
                                            <Text strong style={{ color: lockedCount > 0 ? '#ff4d4f' : 'inherit' }}>{lockedCount}</Text>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Create/Edit Modal */}
                <Modal
                    title={editingVenue ? "Cập nhật địa điểm" : "Tạo địa điểm mới"}
                    open={showVenueModal}
                    onOk={handleVenueModalOk}
                    onCancel={() => setShowVenueModal(false)}
                    confirmLoading={saving}
                >
                    <Form
                        form={venueForm}
                        layout="vertical"
                        initialValues={{
                            capacity: 0,
                            vip_seats: 0,
                            standard_seats: 0,
                            economy_seats: 0,
                            city: 'Hồ Chí Minh'
                        }}
                    >
                        <Form.Item
                            name="venue_name"
                            label="Tên địa điểm"
                            rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm' }]}
                        >
                            <Input placeholder="Ví dụ: Nhà hát lớn Hà Nội" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Form.Item
                                name="city"
                                label="Thành phố/Tỉnh"
                                rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="contact_phone"
                                label="Số điện thoại liên hệ"
                            >
                                <Input />
                            </Form.Item>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Địa chỉ chi tiết"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Form>
                </Modal>

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
