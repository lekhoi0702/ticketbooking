import React, { useEffect } from 'react';
import { Modal, Form, Input, Space, Button, message, AutoComplete } from 'antd';
import VenueLocationSearch from './VenueLocationSearch';
import { api } from '@services/api';

// Danh sách tỉnh/thành phố Việt Nam
const vietnameseCities = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
];

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

    // Filter cities based on search input
    const cityOptions = vietnameseCities.map(city => ({
        value: city,
        label: city
    }));

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


                <Form.Item
                    name="city"
                    label="Thành phố/Tỉnh"
                    rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
                >
                    <AutoComplete
                        options={cityOptions}
                        placeholder="Chọn hoặc nhập tên thành phố/tỉnh"
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        allowClear
                    />
                </Form.Item>


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
