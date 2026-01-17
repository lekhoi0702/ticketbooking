import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Modal,
    InputNumber,
    Input,
    message,
    Spin,
    Divider,
    Tooltip,
    Row,
    Col,
    Form
} from 'antd';
import {
    ReloadOutlined,
    EnvironmentOutlined,
    EditOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    StopOutlined,
    ToolOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const { Text, Title } = Typography;

const OrganizerVenues = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [venues, setVenues] = useState([]);

    // Seat Map Editor State
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [areas, setAreas] = useState([]);
    const [activeAreaIndex, setActiveAreaIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragAction, setDragAction] = useState(null);

    // Create/Edit Venue State
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [venueForm] = Form.useForm();
    const [editingVenue, setEditingVenue] = useState(null);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    useEffect(() => {
        if (user) {
            fetchVenues();
        }
    }, [user]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            // Use organizer API to get venues owned by this user
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
                    status: editingVenue.status // Keep existing status
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

    // --- SEAT MAP EDITOR ---
    const handleEditLayout = (venue) => {
        setSelectedVenue(venue);
        const template = venue.seat_map_template || { areas: [] };
        setAreas(template.areas || []);
        setActiveAreaIndex(0);
        setShowEditModal(true);
    };

    const addNewArea = () => {
        const newArea = {
            name: `Khu vực ${areas.length + 1}`,
            rows: 5,
            cols: 10,
            locked_seats: []
        };
        setAreas([...areas, newArea]);
        setActiveAreaIndex(areas.length);
    };

    const removeArea = (index) => {
        const newAreas = areas.filter((_, i) => i !== index);
        setAreas(newAreas);
        if (activeAreaIndex >= newAreas.length) {
            setActiveAreaIndex(Math.max(0, newAreas.length - 1));
        }
    };

    const updateAreaProperty = (index, prop, value) => {
        const newAreas = [...areas];
        newAreas[index][prop] = value;
        setAreas(newAreas);
    };

    const handleSeatMouseDown = (areaIndex, row, col) => {
        setIsDragging(true);
        const seatId = `${row}-${col}`;
        const area = areas[areaIndex];
        const isCurrentlyLocked = area.locked_seats.includes(seatId);
        const action = isCurrentlyLocked ? 'unlock' : 'lock';
        setDragAction(action);
        applySeatAction(areaIndex, row, col, action);
    };

    const handleSeatMouseEnter = (areaIndex, row, col) => {
        if (!isDragging) return;
        applySeatAction(areaIndex, row, col, dragAction);
    };

    const applySeatAction = (areaIndex, row, col, action) => {
        const seatId = `${row}-${col}`;
        const newAreas = [...areas];
        const area = newAreas[areaIndex];

        if (action === 'lock' && !area.locked_seats.includes(seatId)) {
            area.locked_seats = [...area.locked_seats, seatId];
            setAreas(newAreas);
        } else if (action === 'unlock' && area.locked_seats.includes(seatId)) {
            area.locked_seats = area.locked_seats.filter(id => id !== seatId);
            setAreas(newAreas);
        }
    };

    const handleSaveLayout = async () => {
        try {
            setSaving(true);
            const totalCapacity = areas.reduce((sum, area) => sum + (area.rows * area.cols), 0);

            const payload = {
                capacity: totalCapacity,
                seat_map_template: { areas }
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

    const renderSeatMap = (area, areaIndex) => {
        const rows = [];
        for (let r = 1; r <= area.rows; r++) {
            const cols = [];
            for (let c = 1; c <= area.cols; c++) {
                const isLocked = area.locked_seats.includes(`${r}-${c}`);
                cols.push(
                    <Tooltip title={`Hàng ${r}, Ghế ${c} ${isLocked ? '(Hỏng/Khóa)' : ''}`} key={`${r}-${c}`}><div
                        onMouseDown={() => handleSeatMouseDown(areaIndex, r, c)}
                        onMouseEnter={() => handleSeatMouseEnter(areaIndex, r, c)}
                        style={{
                            width: 28,
                            height: 28,
                            margin: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            backgroundColor: isLocked ? '#ff4d4f' : '#f0f0f0',
                            color: isLocked ? 'white' : 'rgba(0,0,0,0.45)',
                            fontSize: 10,
                            fontWeight: 'bold',
                            userSelect: 'none',
                            transition: 'all 0.2s',
                            border: isLocked ? 'none' : '1px solid #d9d9d9'
                        }}
                        className="seat-item"
                    >
                        {isLocked ? <StopOutlined style={{ fontSize: 14 }} /> : `${String.fromCharCode(64 + r)}${c}`}
                    </div>
                    </Tooltip>
                );
            }
            rows.push(
                <div key={r} style={{ display: 'flex', justifyContent: 'center' }}>
                    {cols}
                </div>
            );
        }
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#fafafa',
                borderRadius: 8,
                overflowX: 'auto',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ marginBottom: 32, width: '100%', textAlign: 'center' }}>
                    <div style={{
                        width: '60%',
                        margin: '0 auto',
                        padding: '8px',
                        background: '#e8e8e8',
                        borderRadius: '0 0 20px 20px',
                        fontSize: 12,
                        color: '#8c8c8c',
                        fontWeight: 600
                    }}>
                        SÂN KHẤU / MÀN HÌNH
                    </div>
                </div>
                {rows}
            </div>
        );
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

                {/* Seat Map Editor Modal (Same as Admin) */}
                <Modal
                    title={`Thiết Kế Sơ Đồ: ${selectedVenue?.venue_name}`}
                    open={showEditModal}
                    onCancel={() => !saving && setShowEditModal(false)}
                    width={1100}
                    style={{ top: 20 }}
                    footer={[
                        <Button key="cancel" onClick={() => setShowEditModal(false)} disabled={saving}>Hủy bỏ</Button>,
                        <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSaveLayout} loading={saving} disabled={areas.length === 0}>
                            Lưu sơ đồ địa điểm
                        </Button>
                    ]}
                    styles={{ body: { padding: 0 } }}
                >
                    <div style={{ display: 'flex', height: '70vh' }}>
                        {/* Sidebar */}
                        <div style={{ width: 280, borderRight: '1px solid #f0f0f0', padding: 24, backgroundColor: '#fafafa', overflowY: 'auto' }}>
                            <Button
                                block
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addNewArea}
                                style={{ marginBottom: 24 }}
                                disabled={saving}
                            >
                                Thêm khu vực mới
                            </Button>

                            <Text strong style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase' }}>
                                Danh sách khu vực ({areas.length})
                            </Text>

                            <div style={{ marginTop: 16 }}>
                                {areas.map((area, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => !saving && setActiveAreaIndex(idx)}
                                        style={{
                                            padding: '12px 16px',
                                            marginBottom: 8,
                                            borderRadius: 8,
                                            border: '1px solid',
                                            borderColor: activeAreaIndex === idx ? '#52c41a' : '#f0f0f0',
                                            backgroundColor: activeAreaIndex === idx ? '#f6ffed' : 'white',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            position: 'relative',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Text strong style={{ color: activeAreaIndex === idx ? '#52c41a' : 'inherit' }}>{area.name}</Text><br />
                                        <Text type="secondary" style={{ fontSize: 11 }}>{area.rows} x {area.cols} ({area.rows * area.cols} ghế)</Text>
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            style={{ position: 'absolute', top: 12, right: 8 }}
                                            onClick={(e) => { e.stopPropagation(); !saving && removeArea(idx); }}
                                            disabled={saving}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor */}
                        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
                            {areas.length > 0 ? (
                                <div>
                                    <Row gutter={24} style={{ marginBottom: 32 }}>
                                        <Col span={10}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>TÊN KHU VỰC</Text>
                                            <Input
                                                value={areas[activeAreaIndex].name}
                                                onChange={e => updateAreaProperty(activeAreaIndex, 'name', e.target.value)}
                                                disabled={saving}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>SỐ HÀNG</Text><br />
                                            <InputNumber
                                                min={1} max={50}
                                                value={areas[activeAreaIndex].rows}
                                                onChange={val => updateAreaProperty(activeAreaIndex, 'rows', val || 1)}
                                                style={{ width: '100%' }}
                                                disabled={saving}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>SỐ CỘT</Text><br />
                                            <InputNumber
                                                min={1} max={50}
                                                value={areas[activeAreaIndex].cols}
                                                onChange={val => updateAreaProperty(activeAreaIndex, 'cols', val || 1)}
                                                style={{ width: '100%' }}
                                                disabled={saving}
                                            />
                                        </Col>
                                        <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Tag color="error" icon={<StopOutlined />}>
                                                {areas[activeAreaIndex].locked_seats.length} ghế hỏng
                                            </Tag>
                                        </Col>
                                    </Row>

                                    <Title level={5}>Trình xem trước sơ đồ</Title>
                                    {renderSeatMap(areas[activeAreaIndex], activeAreaIndex)}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <AppstoreOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                                    <Text>Thêm khu vực để bắt đầu thiết kế sơ đồ</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .seat-item:hover {
                        box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
                        border-color: #52c41a !important;
                    }
                `}} />
            </div>
        </Spin>
    );
};

export default OrganizerVenues;
