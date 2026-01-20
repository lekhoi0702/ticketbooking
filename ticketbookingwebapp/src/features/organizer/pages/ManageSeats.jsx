import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Space,
    Typography,
    Alert,
    Spin
} from 'antd';
import {
    AppstoreOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';

// Components
import SeatMap from '@features/user/components/Event/SeatMap';
import TicketTypeSidebar from '@features/organizer/components/TicketTypeSidebar';
import SeatMapTemplateView from '@features/organizer/components/SeatMapTemplateView';
import SeatGridInitializer from '@features/organizer/components/SeatGridInitializer';
import SeatMapHeader from '@features/organizer/components/ManageSeats/SeatMapHeader';
import SeatMapLegend from '@features/organizer/components/ManageSeats/SeatMapLegend';

// Hooks
import { useManageSeats } from '@shared/hooks/useManageSeats';

const { Text } = Typography;

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
        return <LoadingSpinner tip="Đang tải dữ liệu..." />;
    }

    return (
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
            <div>
                {/* Page Header Area */}
                <SeatMapHeader
                    onBack={() => navigate(-1)}
                    loading={loading}
                    venueTemplate={venueTemplate}
                    activeTicketType={activeTicketType}
                    selectedCount={selectedTemplateSeats.length}
                    isComplete={isComplete}
                    onSave={handleSaveTemplateAssignment}
                    initializing={initializing}
                />

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
                                        Đã chọn: <Text strong style={{ color: '#2DC275' }}>{selectedTemplateSeats.length}</Text> / {activeTicketType?.quantity || 0} ghế
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
                            <SeatMapLegend />
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
