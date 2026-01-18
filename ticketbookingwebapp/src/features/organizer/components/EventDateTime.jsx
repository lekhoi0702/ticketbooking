import React from 'react';
import {
    Row,
    Col,
    Typography,
    DatePicker,
    Space,
    Button
} from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

const EventDateTime = ({ formData, handleInputChange }) => {
    const handleDateChange = (name, dateString) => {
        handleInputChange({ target: { name, value: dateString } });
    };

    return (
        <div style={{ marginTop: 16 }}>
            <Space direction="vertical" size={32} style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>THỜI GIAN DIỄN RA SỰ KIỆN</Text>
                    </div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 13 }}>BẮT ĐẦU</Text></div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.start_datetime ? dayjs(formData.start_datetime) : null}
                                onChange={(date, dateString) => handleDateChange('start_datetime', dateString)}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 13 }}>KẾT THÚC</Text></div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.end_datetime ? dayjs(formData.end_datetime) : null}
                                onChange={(date, dateString) => handleDateChange('end_datetime', dateString)}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Col>

                        {/* Existing Schedule Display (Read-only) */}
                        {existingSchedule && existingSchedule.length > 0 && (
                            <Col span={24}>
                                <div style={{ marginTop: 24, padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>LỊCH DIỄN HIỆN CÓ (Đã lưu)</Text>
                                    <div style={{ marginTop: 8 }}>
                                        {existingSchedule.map((item, idx) => (
                                            <div key={idx} style={{ marginBottom: 8, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                                <Text>
                                                    {dayjs(item.start_datetime).format('DD/MM/YYYY HH:mm')} - {dayjs(item.end_datetime).format('HH:mm')}
                                                </Text>
                                                {item.event_id !== formData.id && (
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>(Sự kiện khác trong nhóm)</Text>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col span={24}>
                            <div style={{ marginTop: 16 }}>
                                <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>CÁC SUẤT DIỄN BỔ SUNG</Text>
                                {formData.extra_showtimes?.map((st, index) => (
                                    <Row key={index} gutter={16} style={{ marginTop: 8 }} align="middle">
                                        <Col flex="1">
                                            <Space>
                                                <DatePicker
                                                    showTime
                                                    placeholder="Bắt đầu"
                                                    value={st.start_datetime ? dayjs(st.start_datetime) : null}
                                                    onChange={(d, s) => {
                                                        const newShowtimes = [...(formData.extra_showtimes || [])];
                                                        newShowtimes[index] = { ...st, start_datetime: s };
                                                        handleInputChange({ target: { name: 'extra_showtimes', value: newShowtimes } });
                                                    }}
                                                />
                                                <span>-</span>
                                                <DatePicker
                                                    showTime
                                                    placeholder="Kết thúc"
                                                    value={st.end_datetime ? dayjs(st.end_datetime) : null}
                                                    onChange={(d, s) => {
                                                        const newShowtimes = [...(formData.extra_showtimes || [])];
                                                        newShowtimes[index] = { ...st, end_datetime: s };
                                                        handleInputChange({ target: { name: 'extra_showtimes', value: newShowtimes } });
                                                    }}
                                                />
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Button
                                                danger
                                                type="text"
                                                onClick={() => {
                                                    const newShowtimes = formData.extra_showtimes.filter((_, i) => i !== index);
                                                    handleInputChange({ target: { name: 'extra_showtimes', value: newShowtimes } });
                                                }}
                                            >
                                                Xóa
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Button
                                    type="dashed"
                                    style={{ marginTop: 8 }}
                                    block
                                    onClick={() => {
                                        const newShowtimes = [...(formData.extra_showtimes || []), { start_datetime: '', end_datetime: '' }];
                                        handleInputChange({ target: { name: 'extra_showtimes', value: newShowtimes } });
                                    }}
                                >
                                    + Thêm suất diễn
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>THỜI GIAN MỞ BÁN VÉ</Text>
                    </div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 13 }}>MỞ BÁN</Text></div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.sale_start_datetime ? dayjs(formData.sale_start_datetime) : null}
                                onChange={(date, dateString) => handleDateChange('sale_start_datetime', dateString)}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 13 }}>KẾT THÚC BÁN</Text></div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.sale_end_datetime ? dayjs(formData.sale_end_datetime) : null}
                                onChange={(date, dateString) => handleDateChange('sale_end_datetime', dateString)}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Col>
                    </Row>
                </div>
            </Space >
        </div >
    );
};

export default EventDateTime;
