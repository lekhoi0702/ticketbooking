import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    DatePicker,
    Space,
    Divider,
    Button
} from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

const EventDateTime = ({
    formData,
    handleInputChange,
    existingSchedule,
    fieldErrors: externalErrors = {}
}) => {
    const [errors, setErrors] = useState({});

    // Merge external errors with internal validation errors
    const allErrors = { ...errors, ...externalErrors };

    const handleDateChange = (name, dateString) => {
        handleInputChange({ target: { name, value: dateString } });
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    useEffect(() => {
        validateDates();
    }, [formData.start_datetime, formData.end_datetime, formData.sale_start_datetime, formData.sale_end_datetime]);

    const validateDates = () => {
        const newErrors = {};
        const now = dayjs();
        const start = formData.start_datetime ? dayjs(formData.start_datetime) : null;
        const end = formData.end_datetime ? dayjs(formData.end_datetime) : null;
        const saleStart = formData.sale_start_datetime ? dayjs(formData.sale_start_datetime) : null;
        const saleEnd = formData.sale_end_datetime ? dayjs(formData.sale_end_datetime) : null;

        if (start && start.isBefore(now)) {
            newErrors.start_datetime = 'Thời gian bắt đầu phải sau thời điểm hiện tại';
        }
        if (end && start && end.isBefore(start)) {
            newErrors.end_datetime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }
        if (end && end.isBefore(now)) {
            newErrors.end_datetime = 'Thời gian kết thúc phải sau thời điểm hiện tại';
        }
        if (saleStart && saleStart.isBefore(now)) {
            newErrors.sale_start_datetime = 'Thời gian mở bán phải sau thời điểm hiện tại';
        }
        if (saleStart && start && saleStart.isAfter(start)) {
            newErrors.sale_start_datetime = 'Thời gian mở bán phải trước khi sự kiện bắt đầu';
        }
        if (saleEnd && saleStart && saleEnd.isBefore(saleStart)) {
            newErrors.sale_end_datetime = 'Thời gian kết thúc bán phải sau thời gian mở bán';
        }
        if (saleEnd && start && saleEnd.isAfter(start)) {
            newErrors.sale_end_datetime = 'Thời gian kết thúc bán phải trước khi sự kiện bắt đầu';
        }

        setErrors(newErrors);
    };

    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const disabledEndDate = (current) => {
        const start = formData.start_datetime ? dayjs(formData.start_datetime) : null;
        if (!start) return current && current < dayjs().startOf('day');
        return current && (current < dayjs().startOf('day') || current < start.startOf('day'));
    };

    const disabledSaleEndDate = (current) => {
        const saleStart = formData.sale_start_datetime ? dayjs(formData.sale_start_datetime) : null;
        const eventStart = formData.start_datetime ? dayjs(formData.start_datetime) : null;
        if (!saleStart) return current && current < dayjs().startOf('day');
        return current && (
            current < dayjs().startOf('day') ||
            current < saleStart.startOf('day') ||
            (eventStart && current > eventStart.startOf('day'))
        );
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
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>BẮT ĐẦU</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.start_datetime ? dayjs(formData.start_datetime) : null}
                                onChange={(date) => handleDateChange('start_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                status={allErrors.start_datetime ? 'error' : ''}
                                placeholder="Chọn thời gian bắt đầu"
                            />
                            {allErrors.start_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.start_datetime}
                                </Text>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>KẾT THÚC</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.end_datetime ? dayjs(formData.end_datetime) : null}
                                onChange={(date) => handleDateChange('end_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledEndDate}
                                status={allErrors.end_datetime ? 'error' : ''}
                                placeholder="Chọn thời gian kết thúc"
                            />
                            {allErrors.end_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.end_datetime}
                                </Text>
                            )}
                        </Col>

                        {existingSchedule && existingSchedule.length > 0 && (
                            <Col span={24}>
                                <div style={{ marginTop: 24, padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>LỊCH DIỄN HIỆN CÓ (Đã lưu)</Text>
                                    <div style={{ marginTop: 8 }}>
                                        {existingSchedule.map((item, idx) => (
                                            <div key={idx} style={{ marginBottom: 8, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <CalendarOutlined style={{ color: '#2DC275' }} />
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
                    </Row>
                </div>

                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>THỜI GIAN MỞ BÁN VÉ</Text>
                    </div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>MỞ BÁN</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.sale_start_datetime ? dayjs(formData.sale_start_datetime) : null}
                                onChange={(date) => handleDateChange('sale_start_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledDate}
                                status={allErrors.sale_start_datetime ? 'error' : ''}
                                placeholder="Chọn thời gian mở bán"
                            />
                            {allErrors.sale_start_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.sale_start_datetime}
                                </Text>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>KẾT THÚC BÁN</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.sale_end_datetime ? dayjs(formData.sale_end_datetime) : null}
                                onChange={(date) => handleDateChange('sale_end_datetime', date ? date.format('YYYY-MM-DD HH:mm:ss') : '')}
                                format="YYYY-MM-DD HH:mm:ss"
                                disabledDate={disabledSaleEndDate}
                                status={allErrors.sale_end_datetime ? 'error' : ''}
                                placeholder="Chọn thời gian kết thúc bán"
                            />
                            {allErrors.sale_end_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.sale_end_datetime}
                                </Text>
                            )}
                        </Col>
                    </Row>
                </div>
            </Space >
        </div >
    );
};

export default EventDateTime;
