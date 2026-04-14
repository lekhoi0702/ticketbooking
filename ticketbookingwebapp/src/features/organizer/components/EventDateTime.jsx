import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_TIME_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm';

const EventDateTime = ({
    formData,
    handleInputChange,
    existingSchedule,
    fieldErrors: externalErrors = {},
    disabled = false,
}) => {
    const [errors, setErrors] = useState({});

    const allErrors = { ...errors, ...externalErrors };

    const handleDateChange = (name, dateValue) => {
        handleInputChange({
            target: {
                name,
                value: dateValue ? dateValue.format(DATE_TIME_FORMAT) : '',
            },
        });
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    useEffect(() => {
        validateDates();
    }, [formData.start_datetime, formData.end_datetime]);

    const validateDates = () => {
        const newErrors = {};
        const now = dayjs();
        const start = formData.start_datetime ? dayjs(formData.start_datetime) : null;
        const end = formData.end_datetime ? dayjs(formData.end_datetime) : null;

        if (start && start.isBefore(now) && !existingSchedule) {
            newErrors.start_datetime = 'Th?i gian b?t d?u ph?i sau th?i di?m hi?n t?i';
        }
        if (end && start && end.isBefore(start)) {
            newErrors.end_datetime = 'Th?i gian k?t thúc ph?i sau th?i gian b?t d?u';
        }
        if (end && end.isBefore(now) && !existingSchedule) {
            newErrors.end_datetime = 'Th?i gian k?t thúc ph?i sau th?i di?m hi?n t?i';
        }

        setErrors(newErrors);
    };

    const disabledDate = (current) => current && current < dayjs().startOf('day');

    const disabledEndDate = (current) => {
        const start = formData.start_datetime ? dayjs(formData.start_datetime) : null;
        if (!start) return current && current < dayjs().startOf('day');
        return current && (current < dayjs().startOf('day') || current < start.startOf('day'));
    };

    return (
        <div style={{ marginTop: 16 }}>
            <Space orientation="vertical" size={32} style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>THOI GIAN DIEN RA SU KIEN</Text>
                    </div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>BAT DAU</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.start_datetime ? dayjs(formData.start_datetime) : null}
                                onChange={(date) => handleDateChange('start_datetime', date)}
                                format={DATE_TIME_DISPLAY_FORMAT}
                                disabledDate={disabledDate}
                                status={allErrors.start_datetime ? 'error' : ''}
                                placeholder="Ch?n ngày gi? b?t d?u"
                                allowClear
                                disabled={disabled}
                            />
                            {allErrors.start_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.start_datetime}
                                </Text>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 13 }}>KET THUC</Text>
                                <Text type="danger"> *</Text>
                            </div>
                            <DatePicker
                                showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.end_datetime ? dayjs(formData.end_datetime) : null}
                                onChange={(date) => handleDateChange('end_datetime', date)}
                                format={DATE_TIME_DISPLAY_FORMAT}
                                disabledDate={disabledEndDate}
                                status={allErrors.end_datetime ? 'error' : ''}
                                placeholder="Ch?n ngày gi? k?t thúc"
                                allowClear
                                disabled={disabled}
                            />
                            {allErrors.end_datetime && (
                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                    <WarningOutlined /> {allErrors.end_datetime}
                                </Text>
                            )}
                        </Col>

                        {existingSchedule && existingSchedule.length > 0 && (
                            <Col span={24}>
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: '16px',
                                        background: '#f5f5f5',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>
                                        LICH DIEN HIEN CO (DA LUU)
                                    </Text>
                                    <div style={{ marginTop: 8 }}>
                                        {existingSchedule.map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{ marginBottom: 8, display: 'flex', gap: '8px', alignItems: 'center' }}
                                            >
                                                <CalendarOutlined style={{ color: '#2DC275' }} />
                                                <Text>
                                                    {dayjs(item.start_datetime).format('DD/MM/YYYY HH:mm')} -{' '}
                                                    {dayjs(item.end_datetime).format('HH:mm')}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>
            </Space>
        </div>
    );
};

export default EventDateTime;
