import React from 'react';
import {
    Input,
    Select,
    Row,
    Col,
    Form,
    Typography
} from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const EventBasicInfo = ({ formData, handleInputChange, categories, venues, fieldErrors = {} }) => {
    return (
        <div style={{ marginTop: 16 }}>
            <Row gutter={[16, 24]}>
                <Col span={24}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13 }}>TÊN SỰ KIỆN</Text>
                        <Text type="danger"> *</Text>
                    </div>
                    <Input
                        name="event_name"
                        value={formData.event_name}
                        onChange={(e) => handleInputChange({ target: { name: 'event_name', value: e.target.value } })}
                        size="large"
                        status={fieldErrors.event_name ? 'error' : ''}
                        placeholder="Nhập tên sự kiện"
                    />
                    {fieldErrors.event_name && (
                        <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            <WarningOutlined /> {fieldErrors.event_name}
                        </Text>
                    )}
                </Col>

                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13 }}>DANH MỤC</Text>
                        <Text type="danger"> *</Text>
                    </div>
                    <Select
                        style={{ width: '100%' }}
                        value={formData.category_id || undefined}
                        onChange={(val) => handleInputChange({ target: { name: 'category_id', value: val } })}
                        size="large"
                        status={fieldErrors.category_id ? 'error' : ''}
                        placeholder="Chọn danh mục"
                        options={categories.map(cat => ({
                            value: cat.category_id,
                            label: cat.category_name
                        }))}
                    />
                    {fieldErrors.category_id && (
                        <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            <WarningOutlined /> {fieldErrors.category_id}
                        </Text>
                    )}
                </Col>

                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13 }}>ĐỊA ĐIỂM TỔ CHỨC</Text>
                        <Text type="danger"> *</Text>
                    </div>
                    <Select
                        style={{ width: '100%' }}
                        value={formData.venue_id || undefined}
                        onChange={(val) => handleInputChange({ target: { name: 'venue_id', value: val } })}
                        size="large"
                        status={fieldErrors.venue_id ? 'error' : ''}
                        placeholder="Chọn địa điểm"
                        options={venues.map(venue => ({
                            value: venue.venue_id,
                            label: `${venue.venue_name} - ${venue.city}`
                        }))}
                    />
                    {fieldErrors.venue_id && (
                        <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            <WarningOutlined /> {fieldErrors.venue_id}
                        </Text>
                    )}
                </Col>

                <Col span={24}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13 }}>MÔ TẢ CHI TIẾT</Text>
                        <Text type="danger"> *</Text>
                    </div>
                    <TextArea
                        name="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange({ target: { name: 'description', value: e.target.value } })}
                        rows={6}
                        size="large"
                        status={fieldErrors.description ? 'error' : ''}
                        placeholder="Nhập mô tả chi tiết về sự kiện"
                    />
                    {fieldErrors.description && (
                        <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            <WarningOutlined /> {fieldErrors.description}
                        </Text>
                    )}
                </Col>

                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 8 }}><Text strong style={{ fontSize: 13 }}>TRẠNG THÁI LƯU</Text></div>
                    <Select
                        style={{ width: '100%' }}
                        value={formData.status}
                        onChange={(val) => handleInputChange({ target: { name: 'status', value: val } })}
                        size="large"
                        options={[
                            { value: 'DRAFT', label: 'Lưu bản nháp' },
                            { value: 'PENDING_APPROVAL', label: 'Gửi yêu cầu phê duyệt' }
                        ]}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default EventBasicInfo;
