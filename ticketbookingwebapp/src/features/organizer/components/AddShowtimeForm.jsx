import React, { useState } from 'react';
import { Form, DatePicker, Button, Typography, message } from 'antd';
import { organizerApi } from '@services/api/organizer';

const AddShowtimeForm = ({ sourceEvent, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await organizerApi.addShowtime(sourceEvent.event_id, {
                start_datetime: values.range[0].toISOString(),
                end_datetime: values.range[1].toISOString()
            });
            message.success('Thêm suất diễn thành công');
            onSuccess();
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Tạo bản sao của sự kiện <strong>{sourceEvent.event_name}</strong> với thời gian mới.
            </Typography.Text>
            <Form.Item
                name="range"
                label="Thời gian diễn ra"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
                <DatePicker.RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
                Xác nhận thêm
            </Button>
        </Form>
    );
};

export default AddShowtimeForm;
