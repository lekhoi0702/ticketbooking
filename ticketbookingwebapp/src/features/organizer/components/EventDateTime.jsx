import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, DatePicker, Space, Button, Card } from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined, WarningOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_TIME_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm';

export default function EventDateTime({
    formData,
    handleInputChange,
    existingSchedule,
    fieldErrors: externalErrors = {},
    disabled = false,
}) {
    const [errors, setErrors] = useState({});

    const allErrors = { ...errors, ...externalErrors };
    const showtimes = Array.isArray(formData.showtimes) && formData.showtimes.length > 0
        ? formData.showtimes
        : [
            {
                start_datetime: formData.start_datetime || '',
                end_datetime: formData.end_datetime || '',
            },
        ];

    const syncShowtimes = (nextShowtimes) => {
        handleInputChange({
            target: {
                name: 'showtimes',
                value: nextShowtimes,
            },
        });

        const first = nextShowtimes[0] || { start_datetime: '', end_datetime: '' };
        handleInputChange({ target: { name: 'start_datetime', value: first.start_datetime || '' } });
        handleInputChange({ target: { name: 'end_datetime', value: first.end_datetime || '' } });
    };

    const handleDateChange = (index, name, dateValue) => {
        const next = showtimes.map((item, idx) => (
            idx === index
                ? {
                    ...item,
                    [name]: dateValue ? dateValue.format(DATE_TIME_FORMAT) : '',
                }
                : item
        ));
        syncShowtimes(next);
        setErrors((prev) => ({ ...prev, [`${name}_${index}`]: null }));
    };

    const addShowtime = () => {
        const next = [
            ...showtimes,
            {
                start_datetime: '',
                end_datetime: '',
            },
        ];
        syncShowtimes(next);
    };

    const removeShowtime = (index) => {
        if (showtimes.length <= 1) return;
        const next = showtimes.filter((_, idx) => idx !== index);
        syncShowtimes(next);
    };

    useEffect(() => {
        const newErrors = {};
        showtimes.forEach((slot, index) => {
            const start = slot.start_datetime ? dayjs(slot.start_datetime) : null;
            const end = slot.end_datetime ? dayjs(slot.end_datetime) : null;
            if (start && end && !end.isAfter(start)) {
                newErrors[`end_datetime_${index}`] = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            }
        });
        setErrors(newErrors);
    }, [JSON.stringify(showtimes)]);

    const disabledDate = (current) => current && current < dayjs().startOf('day');

    const disabledEndDate = (current, index) => {
        const start = showtimes[index]?.start_datetime ? dayjs(showtimes[index].start_datetime) : null;
        if (!start) return current && current < dayjs().startOf('day');
        return current && (current < dayjs().startOf('day') || current < start.startOf('day'));
    };

    return (
        <div style={{ marginTop: 16 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>Các suất diễn</Text>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addShowtime}
                        disabled={disabled}
                    >
                        Thêm suất diễn
                    </Button>
                </div>

                {showtimes.map((slot, index) => (
                    <Card
                        key={`showtime-${index}`}
                        size="small"
                        title={`Suất diễn ${index + 1}`}
                        extra={showtimes.length > 1 ? (
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeShowtime(index)}
                                disabled={disabled}
                            >
                                Xóa
                            </Button>
                        ) : null}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 13 }}>Bắt đầu</Text>
                                    <Text type="danger"> *</Text>
                                </div>
                                <DatePicker
                                    showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                    style={{ width: '100%' }}
                                    size="large"
                                    value={slot.start_datetime ? dayjs(slot.start_datetime) : null}
                                    onChange={(date) => handleDateChange(index, 'start_datetime', date)}
                                    format={DATE_TIME_DISPLAY_FORMAT}
                                    disabledDate={disabledDate}
                                    status={allErrors[`start_datetime_${index}`] ? 'error' : ''}
                                    placeholder="Chọn ngày giờ bắt đầu"
                                    allowClear
                                    disabled={disabled}
                                />
                                {allErrors[`start_datetime_${index}`] && (
                                    <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                        <WarningOutlined /> {allErrors[`start_datetime_${index}`]}
                                    </Text>
                                )}
                            </Col>
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 13 }}>Kết thúc</Text>
                                    <Text type="danger"> *</Text>
                                </div>
                                <DatePicker
                                    showTime={{ format: 'HH:mm', minuteStep: 5 }}
                                    style={{ width: '100%' }}
                                    size="large"
                                    value={slot.end_datetime ? dayjs(slot.end_datetime) : null}
                                    onChange={(date) => handleDateChange(index, 'end_datetime', date)}
                                    format={DATE_TIME_DISPLAY_FORMAT}
                                    disabledDate={(current) => disabledEndDate(current, index)}
                                    status={allErrors[`end_datetime_${index}`] || allErrors.end_datetime ? 'error' : ''}
                                    placeholder="Chọn ngày giờ kết thúc"
                                    allowClear
                                    disabled={disabled}
                                />
                                {(allErrors[`end_datetime_${index}`] || allErrors.end_datetime) && (
                                    <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                        <WarningOutlined /> {allErrors[`end_datetime_${index}`] || allErrors.end_datetime}
                                    </Text>
                                )}
                            </Col>
                        </Row>
                    </Card>
                ))}

                {existingSchedule && existingSchedule.length > 0 && (
                    <div
                        style={{
                            marginTop: 8,
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                        }}
                    >
                        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>
                            Lịch diễn hiện có (đã lưu)
                        </Text>
                        <div style={{ marginTop: 8 }}>
                            {existingSchedule.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{ marginBottom: 8, display: 'flex', gap: '8px', alignItems: 'center' }}
                                >
                                    <CalendarOutlined style={{ color: '#2DC275' }} />
                                    <Text>
                                        {dayjs(item.start_datetime || item.StartDateTime).format('DD/MM/YYYY HH:mm')} -{' '}
                                        {dayjs(item.end_datetime || item.EndDateTime).format('HH:mm')}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Space>
        </div>
    );
}
