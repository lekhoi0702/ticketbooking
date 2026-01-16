import React, { useState, useEffect } from 'react';
import {
    Card,
    Input,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Collapse,
    Divider,
    Badge,
    InputNumber,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import SeatMapTemplateView from './SeatMapTemplateView';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const TicketConfig = ({
    ticketTypes,
    handleTicketTypeChange,
    addTicketType,
    removeTicketType,
    venueTemplate,
    toggleSeatSelection,
    toggleAreaSelection
}) => {
    const [expandedKeys, setExpandedKeys] = useState(['0']);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null);

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setDragMode(null);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const handleSeatMouseDown = (e, t, index) => {
        e.preventDefault();
        const selected = ticketTypes[index].selectedSeats || [];
        const isSelected = selected.some(s =>
            s.row_name === t.row_name &&
            String(s.seat_number) === String(t.seat_number) &&
            s.area === t.area
        );
        const mode = isSelected ? 'deselect' : 'select';
        setDragMode(mode);
        setIsDragging(true);
        toggleSeatSelection(index, t, mode);
    };

    const handleSeatMouseEnter = (t, index) => {
        if (isDragging && dragMode) {
            toggleSeatSelection(index, t, dragMode);
        }
    };

    const formatCurrency = (val) => {
        if (!val) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Space>
                    <AppstoreOutlined style={{ color: '#52c41a' }} />
                    <Title level={5} style={{ margin: 0 }}>Các hạng vé & Sơ đồ ghế</Title>
                </Space>
                <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={addTicketType}
                    style={{ fontWeight: 600 }}
                >
                    Thêm hạng vé
                </Button>
            </div>

            <Collapse
                activeKey={expandedKeys}
                onChange={setExpandedKeys}
                expandIconPosition="end"
                ghost
                style={{ backgroundColor: 'transparent' }}
            >
                {ticketTypes.map((tt, index) => (
                    <Panel
                        key={String(index)}
                        header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '95%', alignItems: 'center' }}>
                                <Space size={16}>
                                    <Text strong style={{ fontSize: 14 }}>{tt.type_name || `Hạng vé mới`}</Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>{formatCurrency(tt.price)}</Text>
                                    <Badge
                                        count={`${tt.selectedSeats?.length || 0} Ghế`}
                                        style={{ backgroundColor: '#52c41a' }}
                                    />
                                </Space>
                                {ticketTypes.length > 1 && (
                                    <Tooltip title="Xóa hạng vé">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => { e.stopPropagation(); removeTicketType(index); }}
                                        />
                                    </Tooltip>
                                )}
                            </div>
                        }
                        style={{
                            background: '#fff',
                            borderRadius: 8,
                            marginBottom: 16,
                            border: '1px solid #f0f0f0',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '0 8px 16px 8px' }}>
                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 12 }}>TÊN HẠNG VÉ</Text></div>
                                    <Input
                                        value={tt.type_name}
                                        onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                                        size="large"
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 12 }}>GIÁ VÉ (VND)</Text></div>
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        value={tt.price}
                                        onChange={(val) => handleTicketTypeChange(index, 'price', val)}
                                        size="large"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Col>
                            </Row>

                            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#fafafa',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Space>
                                        <AppstoreOutlined style={{ color: '#8c8c8c' }} />
                                        <Text strong style={{ fontSize: 11, color: '#8c8c8c' }}>CHỌN GHẾ TRÊN SƠ ĐỒ ĐỊA ĐIỂM</Text>
                                    </Space>
                                </div>

                                <div style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
                                    {venueTemplate ? (
                                        <div style={{ background: '#333', borderRadius: 8, padding: 16 }}>
                                            <SeatMapTemplateView
                                                venueTemplate={venueTemplate}
                                                selectedTemplateSeats={tt.selectedSeats || []}
                                                allOccupiedSeats={ticketTypes.filter((_, i) => i !== index).flatMap(t => t.selectedSeats || []).map(s => ({ ...s, ticket_type_id: 'other' }))}
                                                activeTicketType={{ ticket_type_id: 'current' }}
                                                handleSeatMouseDown={(e, t) => handleSeatMouseDown(e, t, index)}
                                                handleSeatMouseEnter={(t) => handleSeatMouseEnter(t, index)}
                                                toggleAreaSeats={(areaName, seatsInArea) => toggleAreaSelection(index, areaName, seatsInArea)}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                            <InfoCircleOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 16, opacity: 0.5 }} /><br />
                                            <Text type="danger">* Vui lòng chọn địa điểm tổ chức để hiển thị sơ đồ ghế.</Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
};

export default TicketConfig;
