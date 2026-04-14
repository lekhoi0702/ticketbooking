import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, AutoComplete, Alert } from 'antd';
import VenueLocationSearch from './VenueLocationSearch';
import { api } from '@services/api';
import { organizerApi } from '@services/api/organizer';

const vietnameseCities = [
    'Ha Noi', 'Ho Chi Minh', 'Da Nang', 'Hai Phong', 'Can Tho',
    'An Giang', 'Ba Ria - Vung Tau', 'Bac Giang', 'Bac Kan', 'Bac Lieu',
    'Bac Ninh', 'Ben Tre', 'Binh Dinh', 'Binh Duong', 'Binh Phuoc',
    'Binh Thuan', 'Ca Mau', 'Cao Bang', 'Dak Lak', 'Dak Nong',
    'Dien Bien', 'Dong Nai', 'Dong Thap', 'Gia Lai', 'Ha Giang',
    'Ha Nam', 'Ha Tinh', 'Hai Duong', 'Hau Giang', 'Hoa Binh',
    'Hung Yen', 'Khanh Hoa', 'Kien Giang', 'Kon Tum', 'Lai Chau',
    'Lam Dong', 'Lang Son', 'Lao Cai', 'Long An', 'Nam Dinh',
    'Nghe An', 'Ninh Binh', 'Ninh Thuan', 'Phu Tho', 'Phu Yen',
    'Quang Binh', 'Quang Nam', 'Quang Ngai', 'Quang Ninh', 'Quang Tri',
    'Soc Trang', 'Son La', 'Tay Ninh', 'Thai Binh', 'Thai Nguyen',
    'Thanh Hoa', 'Thua Thien Hue', 'Tien Giang', 'Tra Vinh',
    'Tuyen Quang', 'Vinh Long', 'Vinh Phuc', 'Yen Bai',
];

const VenueFormModal = ({ visible, onCancel, onSuccess, editingVenue, user }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [mapPreviewUrl, setMapPreviewUrl] = useState(null);
    const [hasPublishedEvents, setHasPublishedEvents] = useState(false);
    const [publishedEventCount, setPublishedEventCount] = useState(0);
    const [loadingVenueDetails, setLoadingVenueDetails] = useState(false);

    useEffect(() => {
        if (!visible) return;

        if (!editingVenue) {
            form.resetFields();
            setMapPreviewUrl(null);
            setHasPublishedEvents(false);
            setPublishedEventCount(0);
            return;
        }

        setLoadingVenueDetails(true);
        organizerApi.getVenue(editingVenue.venue_id)
            .then((res) => {
                const venue = (res.success && res.data) ? res.data : editingVenue;
                setHasPublishedEvents(!!venue.has_published_events);
                setPublishedEventCount(Number(venue.published_event_count || 0));
                form.setFieldsValue({
                    venue_name: venue.venue_name || editingVenue.venue_name || '',
                    address: venue.address || editingVenue.address || '',
                    city: venue.city || editingVenue.city || '',
                    capacity: venue.capacity || editingVenue.capacity || 0,
                    map_embed_code: venue.map_embed_code || editingVenue.map_embed_code || '',
                });
                setMapPreviewUrl(venue.map_embed_code || editingVenue.map_embed_code || null);
            })
            .catch(() => {
                form.setFieldsValue({
                    venue_name: editingVenue.venue_name || '',
                    address: editingVenue.address || '',
                    city: editingVenue.city || '',
                    capacity: editingVenue.capacity || 0,
                    map_embed_code: editingVenue.map_embed_code || '',
                });
                setMapPreviewUrl(editingVenue.map_embed_code || null);
            })
            .finally(() => setLoadingVenueDetails(false));
    }, [visible, editingVenue, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (editingVenue) {
                const updateRes = await api.updateVenue(editingVenue.venue_id, {
                    ...values,
                    status: editingVenue.status || 'ACTIVE',
                });
                if (!updateRes.success) {
                    message.error(updateRes.message || 'Cap nhat dia diem that bai');
                    return;
                }
                message.success('Cap nhat dia diem thanh cong');
            } else {
                const createRes = await api.createVenue({
                    ...values,
                    manager_id: user?.user_id,
                });
                if (!createRes.success) {
                    message.error(createRes.message || 'Tao dia diem that bai');
                    return;
                }
                message.success('Tao dia diem moi thanh cong');
            }

            await onSuccess?.();
            onCancel?.();
        } catch (error) {
            if (error?.errorFields?.length) return;
            message.error(error?.message || 'Co loi xay ra');
        } finally {
            setSaving(false);
        }
    };

    const cityOptions = vietnameseCities.map((city) => ({ value: city, label: city }));

    return (
        <Modal
            title={editingVenue ? 'Cap nhat dia diem' : 'Tao dia diem moi'}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={saving}
            width={700}
            okButtonProps={{ disabled: hasPublishedEvents }}
        >
            {hasPublishedEvents && (
                <Alert
                    message="Khong the sua dia diem nay"
                    description={`Dia diem dang duoc su dung boi ${publishedEventCount} su kien dang cong bo.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}
            <Form form={form} layout="vertical" disabled={hasPublishedEvents || loadingVenueDetails}>
                <Form.Item
                    name="venue_name"
                    label="Ten dia diem"
                    rules={[{ required: true, message: 'Vui long nhap ten dia diem' }]}
                >
                    <Input placeholder="Vi du: Nha hat lon Ha Noi" />
                </Form.Item>

                <Form.Item
                    name="city"
                    label="Thanh pho/Tinh"
                    rules={[{ required: true, message: 'Vui long chon thanh pho' }]}
                >
                    <AutoComplete
                        options={cityOptions}
                        placeholder="Chon hoac nhap ten thanh pho/tinh"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().includes(inputValue.toUpperCase())
                        }
                        allowClear
                    />
                </Form.Item>

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
