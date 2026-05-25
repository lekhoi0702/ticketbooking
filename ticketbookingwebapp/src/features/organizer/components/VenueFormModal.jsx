import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, AutoComplete, Alert } from 'antd';
import VenueLocationSearch from './VenueLocationSearch';
import { api } from '@services/api';
import { organizerApi } from '@services/api/organizer';

const vietnameseCities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
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
                    message.error(updateRes.message || 'Cập nhật địa điểm thất bại');
                    return;
                }
                message.success('Cập nhật địa điểm thành công');
            } else {
                const createRes = await api.createVenue({
                    ...values,
                    manager_id: user?.user_id,
                });
                if (!createRes.success) {
                    message.error(createRes.message || 'Tạo địa điểm thất bại');
                    return;
                }
                message.success('Tạo địa điểm mới thành công');
            }

            await onSuccess?.();
            onCancel?.();
        } catch (error) {
            if (error?.errorFields?.length) return;
            message.error(error?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const cityOptions = vietnameseCities.map((city) => ({ value: city, label: city }));

    return (
        <Modal
            title={editingVenue ? 'Cập nhật địa điểm' : 'Tạo địa điểm mới'}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={saving}
            width={700}
            okButtonProps={{ disabled: hasPublishedEvents }}
        >
            {hasPublishedEvents && (
                <Alert
                    message="Không thể sửa địa điểm này"
                    description={`Địa điểm đang được sử dụng bởi ${publishedEventCount} sự kiện đang được công bố.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}
            <Form form={form} layout="vertical" disabled={hasPublishedEvents || loadingVenueDetails}>
                <Form.Item
                    name="venue_name"
                    label="Tên địa điểm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm' }]}
                >
                    <Input placeholder="Ví dụ: Nhà hát lớn Hà Nội" />
                </Form.Item>

                <Form.Item
                    name="city"
                    label="Thành phố / Tỉnh"
                    rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
                >
                    <AutoComplete
                        options={cityOptions}
                        placeholder="Chọn hoặc nhập tên thành phố/tỉnh"
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
