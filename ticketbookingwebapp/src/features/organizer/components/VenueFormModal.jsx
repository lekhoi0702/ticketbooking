import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Space, Button, message } from 'antd';
import VenueLocationSearch from './VenueLocationSearch';
import { api } from '@services/api';

const VenueFormModal = ({
    visible,
    onCancel,
    onSuccess, // Callback to refresh list
    editingVenue,
    user
}) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = React.useState(false);
    const [mapPreviewUrl, setMapPreviewUrl] = React.useState(null);

    useEffect(() => {
        if (visible) {
            if (editingVenue) {
                form.setFieldsValue({
                    venue_name: editingVenue.venue_name,
                    address: editingVenue.address,
                    city: editingVenue.city,
                    contact_phone: editingVenue.contact_phone,
                    capacity: editingVenue.capacity,
                    vip_seats: editingVenue.vip_seats,
                    standard_seats: editingVenue.standard_seats,
                    economy_seats: editingVenue.economy_seats,
                    map_embed_code: editingVenue.map_embed_code,
                });
                setMapPreviewUrl(editingVenue.map_embed_code);
            } else {
                form.resetFields();
                setMapPreviewUrl(null);
            }
        }
    }, [visible, editingVenue, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (editingVenue) {
                // Update
                const res = await api.updateVenue(editingVenue.venue_id, {
                    ...values,
                    status: editingVenue.status
                });
                if (res.success) {
                    message.success("Cập nhật địa điểm thành công");
                    onSuccess();
                    onCancel();
                }
            } else {
                // Create
                const valuesToSubmit = { ...values };

                // Fallback auto-generate map (legacy logic) if somehow empty but address exists
                if (!valuesToSubmit.map_embed_code && valuesToSubmit.address && valuesToSubmit.city) {
                    const query = encodeURIComponent(`${valuesToSubmit.address}, ${valuesToSubmit.city}`);
                    // Fallback to simple query logic if not selected from dropdown
                    valuesToSubmit.map_embed_code = `<iframe width="100%" height="450" style="border:0" loading="lazy" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}"></iframe>`;
                }

                const res = await api.createVenue({
                    ...valuesToSubmit,
                    manager_id: user.user_id
                });
                if (res.success) {
                    message.success("Tạo địa điểm mới thành công");
                    onSuccess();
                    onCancel();
                }
            }
        } catch (error) {
            message.error(error.message || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={editingVenue ? "Cập nhật địa điểm" : "Tạo địa điểm mới"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={saving}
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="venue_name"
                    label="Tên địa điểm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm' }]}
                >
                    <Input placeholder="Ví dụ: Nhà hát lớn Hà Nội" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="city"
                            label="Thành phố/Tỉnh"
                            rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="contact_phone"
                            label="Số điện thoại liên hệ"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Extracted Location Component */}
                <VenueLocationSearch
                    form={form}
                    mapPreviewUrl={mapPreviewUrl}
                    setMapPreviewUrl={setMapPreviewUrl}
                />
            </Form>
        </Modal>
    );
};

export default VenueFormModal;
