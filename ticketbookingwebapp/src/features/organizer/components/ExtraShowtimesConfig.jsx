import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    DatePicker,
    Space,
    Button,
    Divider,
    Modal,
    Select,
    Spin
} from 'antd';
import dayjs from 'dayjs';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import TicketConfig from './TicketConfig';
import { api } from '@services/api';

const { Text } = Typography;

const ExtraShowtimesConfig = ({
    formData,
    addShowtime,
    removeShowtime,
    updateShowtime,
    venues = [],
    fieldErrors = {},
    disabled = false
}) => {
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [activeShowtimeIdx, setActiveShowtimeIdx] = useState(null);
    const [localST, setLocalST] = useState(null);
    const [localVenueTemplate, setLocalVenueTemplate] = useState(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Disable past dates
    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    // Effect to fetch venue template when localST.venue_id changes
    useEffect(() => {
        if (localST && localST.venue_id) {
            fetchVenueTemplate(localST.venue_id);
        } else {
            setLocalVenueTemplate(null);
        }
    }, [localST?.venue_id]);

    const fetchVenueTemplate = async (venueId) => {
        setLoadingTemplate(true);
        setLocalVenueTemplate(null);
        try {
            const res = await api.getVenue(venueId);
            if (res.success) {
                let template = res.data.seat_map_template;
                if (typeof template === 'string') {
                    try {
                        template = JSON.parse(template);
                    } catch (e) {
                        console.error('Error parsing seat_map_template', e);
                        template = null;
                    }
                }
                setLocalVenueTemplate(template);
            }
        } catch (error) {
            console.error("Failed to fetch venue template:", error);
            setLocalVenueTemplate(null);
        } finally {
            setLoadingTemplate(false);
        }
    };

    const handleOpenConfig = (idx) => {
        setActiveShowtimeIdx(idx);
        setLocalST(JSON.parse(JSON.stringify(formData.extra_showtimes[idx])));
        setConfigModalVisible(true);
    };

    const handleLocalSTChange = (field, value) => {
        setLocalST(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveConfig = () => {
        if (activeShowtimeIdx !== null && localST) {
            updateShowtime(activeShowtimeIdx, 'all', localST);
        }
        setConfigModalVisible(false);
        setActiveShowtimeIdx(null);
        setLocalST(null);
        setLocalVenueTemplate(null);
    };

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Space>
                    <AppstoreOutlined style={{ color: '#1677ff' }} />
                    <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>SUẤT DIỄN BỔ SUNG (NẾU CÓ)</Text>
                </Space>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addShowtime}
                    disabled={disabled}
                >
                    Thêm suất diễn
                </Button>
            </div>

            {formData.extra_showtimes && formData.extra_showtimes.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', background: '#fafafa', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
                    <Text type="secondary">Chưa có suất diễn bổ sung nào được thêm.</Text>
                </div>
            )}

            {formData.extra_showtimes && formData.extra_showtimes.map((st, idx) => (
                <div key={idx} style={{ marginBottom: 24, padding: '20px', border: '1px solid #f0f0f0', borderRadius: '12px', position: 'relative', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeShowtime(idx)}
                        style={{ position: 'absolute', top: 12, right: 12 }}
                        disabled={disabled}
                    />

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 12, color: '#1677ff' }}>BẮT ĐẦU (SUẤT {idx + 1})</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                value={st.start_datetime ? dayjs(st.start_datetime) : null}
                                onChange={(date) => updateShowtime(idx, 'start_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                disabled={disabled}
                                status={fieldErrors[`extra_showtime_${idx}_start`] ? 'error' : ''}
                                placeholder="Chọn thời gian"
                            />
                            {fieldErrors[`extra_showtime_${idx}_start`] && (
                                <Text type="danger" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                                    {fieldErrors[`extra_showtime_${idx}_start`]}
                                </Text>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 12, color: '#1677ff' }}>KẾT THÚC (SUẤT {idx + 1})</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                value={st.end_datetime ? dayjs(st.end_datetime) : null}
                                onChange={(date) => updateShowtime(idx, 'end_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                disabled={disabled}
                                status={fieldErrors[`extra_showtime_${idx}_end`] ? 'error' : ''}
                                placeholder="Chọn thời gian"
                            />
                            {fieldErrors[`extra_showtime_${idx}_end`] && (
                                <Text type="danger" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                                    {fieldErrors[`extra_showtime_${idx}_end`]}
                                </Text>
                            )}
                        </Col>
                    </Row>

                    <div style={{ marginTop: 16, padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space direction="vertical" size={2}>
                                <Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.5px' }}>ĐỊA ĐIỂM & VÉ</Text>
                                <Text strong style={{ fontSize: 14 }}>
                                    {venues.find(v => String(v.venue_id) === String(st.venue_id))?.venue_name || 'Kế thừa suất chính'}
                                    {' • '}
                                    <span style={{ color: '#2DC275' }}>{st.ticket_types?.length || 0} hạng vé</span>
                                </Text>
                            </Space>
                            <Button
                                type="primary"
                                ghost
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleOpenConfig(idx)}
                                disabled={disabled}
                            >
                                Tùy chỉnh
                            </Button>
                        </div>
                    </div>

                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>MỞ BÁN (TÙY CHỌN)</Text>
                            </div>
                            <DatePicker
                                showTime
                                size="small"
                                style={{ width: '100%' }}
                                value={st.sale_start_datetime ? dayjs(st.sale_start_datetime) : null}
                                onChange={(date) => updateShowtime(idx, 'sale_start_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                disabled={disabled}
                                status={fieldErrors[`extra_showtime_${idx}_sale_start`] ? 'error' : ''}
                                placeholder="Mặc định theo suất chính"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>KẾT THÚC BÁN (TÙY CHỌN)</Text>
                            </div>
                            <DatePicker
                                showTime
                                size="small"
                                style={{ width: '100%' }}
                                value={st.sale_end_datetime ? dayjs(st.sale_end_datetime) : null}
                                onChange={(date) => updateShowtime(idx, 'sale_end_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                disabled={disabled}
                                status={fieldErrors[`extra_showtime_${idx}_sale_end`] ? 'error' : ''}
                                placeholder="Mặc định theo suất chính"
                            />
                        </Col>
                    </Row>
                </div>
            ))}

            <Modal
                title={`Tùy chỉnh Suất diễn #${(activeShowtimeIdx !== null ? activeShowtimeIdx : 0) + 1}`}
                open={configModalVisible}
                onCancel={() => setConfigModalVisible(false)}
                onOk={handleSaveConfig}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                {localST && (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={24}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>ĐỊA ĐIỂM TỔ CHỨC CHO SUẤT NÀY</Text>
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    size="large"
                                    placeholder="Chọn địa điểm"
                                    value={localST.venue_id}
                                    onChange={(val) => handleLocalSTChange('venue_id', val)}
                                >
                                    {venues.map(v => (
                                        <Select.Option key={v.venue_id} value={v.venue_id}>
                                            {v.venue_name} ({v.address})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>

                        <Divider />

                        <Spin spinning={loadingTemplate} tip="Đang tải sơ đồ ghế...">
                            <TicketConfig
                                ticketTypes={localST.ticket_types || []}
                                handleTicketTypeChange={(idx, field, val) => {
                                    const newTT = [...localST.ticket_types];
                                    newTT[idx] = { ...newTT[idx], [field]: val };
                                    handleLocalSTChange('ticket_types', newTT);
                                }}
                                addTicketType={() => {
                                    const newTT = [...(localST.ticket_types || []), { type_name: '', price: '', quantity: '0', description: '', selectedSeats: [] }];
                                    handleLocalSTChange('ticket_types', newTT);
                                }}
                                removeTicketType={(idx) => {
                                    const newTT = localST.ticket_types.filter((_, i) => i !== idx);
                                    handleLocalSTChange('ticket_types', newTT);
                                }}
                                venueTemplate={localVenueTemplate}
                                toggleSeatSelection={(idx, seat, mode) => {
                                    const newTT = [...localST.ticket_types];
                                    const currentSeats = newTT[idx].selectedSeats || [];
                                    let updatedSeats;
                                    if (mode === 'select') {
                                        updatedSeats = [...currentSeats, seat];
                                    } else {
                                        updatedSeats = currentSeats.filter(s =>
                                            !(s.row_name === seat.row_name && s.seat_number === seat.seat_number && s.area === seat.area)
                                        );
                                    }
                                    newTT[idx] = { ...newTT[idx], selectedSeats: updatedSeats, quantity: String(updatedSeats.length) };
                                    handleLocalSTChange('ticket_types', newTT);
                                }}
                                toggleAreaSelection={(idx, areaName, seats) => {
                                    const newTT = [...localST.ticket_types];
                                    newTT[idx] = { ...newTT[idx], selectedSeats: seats, quantity: String(seats.length) };
                                    handleLocalSTChange('ticket_types', newTT);
                                }}
                                selectedVenueId={localST.venue_id}
                            />
                        </Spin>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ExtraShowtimesConfig;
