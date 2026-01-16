import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Row,
    Col,
    Space,
    Typography,
    Alert,
    Spin,
    Divider,
    Badge,
    Result
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

// Components
import SeatMap from '@features/user/components/Event/SeatMap';
import TicketTypeSidebar from '@features/organizer/components/TicketTypeSidebar';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';
import SeatGridInitializer from '@features/organizer/components/SeatGridInitializer';

// Hooks
import { useManageSeats } from '@shared/hooks/useManageSeats';

const { Title, Text } = Typography;

const ManageSeats = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const {
        loading,
        error,
        event,
        ticketTypes,
        activeTicketType,
        initializing,
        allOccupiedSeats,
        hasSeats,
        selectedTemplateSeats,
        initData,
        venueTemplate,
        setActiveTicketType,
        setInitData,
        handleSeatMouseDown,
        handleSeatMouseEnter,
        handleInitializeSeats,
        handleSaveTemplateAssignment,
        toggleAreaSeats,
        setHasSeats
    } = useManageSeats(eventId);

    const isComplete = useMemo(() => {
        if (!activeTicketType) return false;
        return selectedTemplateSeats.length === activeTicketType.quantity;
    }, [selectedTemplateSeats, activeTicketType]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
            <div>
                {/* Page Header Area */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={16}>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} disabled={loading} />
                        <Title level={4} style={{ margin: 0 }}>Thiết lập sơ đồ ghế</Title>
                    </Space>

                    {venueTemplate && (
                        <Space size={24}>
                            {activeTicketType && (
                                <Text strong style={{ color: isComplete ? '#52c41a' : '#ff4d4f' }}>
                                    {isComplete
                                        ? <Space><CheckCircleOutlined /> Đã đủ số lượng</Space>
                                        : <Space><ExclamationCircleOutlined /> Còn thiếu: {activeTicketType.quantity - selectedTemplateSeats.length} ghế</Space>
                                    }
                                </Text>
                            )}
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => {
                                    if (selectedTemplateSeats.length !== activeTicketType.quantity) {
                                        message.warning(`Vui lòng chọn đủ ${activeTicketType.quantity} ghế.`);
                                        return;
                                    }
                                    handleSaveTemplateAssignment();
                                }}
                                disabled={initializing || !activeTicketType || loading}
                            >
                                Lưu cấu hình
                            </Button>
                        </Space>
                    )}
                </div>

                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Row gutter={24}>
                    {/* Sidebar */}
                    <Col xs={24} lg={6}>
                        <TicketTypeSidebar
                            ticketTypes={ticketTypes}
                            activeTicketType={activeTicketType}
                            setActiveTicketType={setActiveTicketType}
                            allOccupiedSeats={allOccupiedSeats}
                            venueTemplate={venueTemplate}
                            venueName={event?.venue?.venue_name}
                            disabled={loading || initializing}
                        />
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={24} lg={18}>
                        <Card
                            styles={{ body: { padding: 0 } }}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <AppstoreOutlined style={{ color: '#8c8c8c' }} />
                                        <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                                            Khu vực thiết lập: <Text strong>{activeTicketType?.type_name || 'Chọn hạng vé'}</Text>
                                        </span>
                                    </Space>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Đã chọn: <Text strong style={{ color: '#52c41a' }}>{selectedTemplateSeats.length}</Text> / {activeTicketType?.quantity || 0} ghế
                                    </Text>
                                </div>
                            }
                        >
                            <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: 600, position: 'relative' }}>
                                {venueTemplate ? (
                                    <div style={{ background: '#333', borderRadius: 8, padding: 16 }}>
                                        <SeatMapTemplateView
                                            venueTemplate={venueTemplate}
                                            selectedTemplateSeats={selectedTemplateSeats}
                                            allOccupiedSeats={allOccupiedSeats}
                                            activeTicketType={activeTicketType}
                                            handleSeatMouseDown={handleSeatMouseDown}
                                            handleSeatMouseEnter={handleSeatMouseEnter}
                                            toggleAreaSeats={toggleAreaSeats}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                                        {!hasSeats && !initializing ? (
                                            <div style={{ maxWidth: 500, width: '100%', background: 'white', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                <SeatGridInitializer
                                                    initData={initData}
                                                    setInitData={setInitData}
                                                    handleInitializeSeats={handleInitializeSeats}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #f0f0f0', width: '100%' }}>
                                                <SeatMap
                                                    key={activeTicketType?.ticket_type_id}
                                                    ticketType={activeTicketType}
                                                    onSeatsLoaded={setHasSeats}
                                                    onSelectionChange={() => { }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(initializing || loading) && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 10,
                                        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        <Spin size="large" />
                                        <Text strong style={{ marginTop: 16 }}>Đang xử lý dữ liệu...</Text>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
                                <Space size={32}>
                                    <Space><Badge color="#d9d9d9" /> <Text type="secondary" style={{ fontSize: 12 }}>Chưa gán</Text></Space>
                                    <Space><Badge color="#52c41a" /> <Text type="secondary" style={{ fontSize: 12 }}>Đã gán hạng này</Text></Space>
                                    <Space><Badge color="#ff4d4f" /> <Text type="secondary" style={{ fontSize: 12 }}>Hạng vé khác</Text></Space>
                                </Space>
                            </div>
                        </Card>

                        <Alert
                            message="Hướng dẫn"
                            description="Kéo chuột để chọn nhiều ghế cùng lúc. Hệ thống sẽ tự động lưu sau khi bạn nhấn 'Lưu cấu hình'."
                            type="info"
                            showIcon
                            style={{ marginTop: 24 }}
                        />
                    </Col>
                </Row>
            </div>
        </Spin>
    );
};

export default ManageSeats;
