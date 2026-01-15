import React from 'react';
import {
    Row,
    Col,
    Typography,
    DatePicker,
    Space
} from 'antd';
import dayjs from 'dayjs';

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
            </Space>
        </div>
    );
};

export default EventDateTime;
