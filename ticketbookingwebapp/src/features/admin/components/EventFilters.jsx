import React, { memo } from 'react';
import { Card, Row, Col, Input, Select, Divider, Button, Space, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import AdminToolbar from './AdminToolbar';

const { Text } = Typography;
const { Option } = Select;

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
    { value: 'PUBLISHED', label: 'Công khai' },
    { value: 'REJECTED', label: 'Từ chối duyệt' },
    { value: 'CANCELLED', label: 'Hủy' },
    { value: 'ONGOING', label: 'Đang diễn ra' },
    { value: 'COMPLETED', label: 'Đã kết thúc' },
    { value: 'DELETED', label: 'Đã xóa' },
];

const FEATURED_OPTIONS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'FEATURED', label: 'Sự kiện nổi bật' },
    { value: 'NOT_FEATURED', label: 'Sự kiện thường' },
];

const EventFilters = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterFeatured,
    setFilterFeatured,
    selectedRowKeys,
    events,
    onViewDetail,
    onUndo,
    onRefresh,
    undoDisabled,
    undoLoading,
    loading,
}) => {
    const hasSelection = selectedRowKeys?.length > 0;
    const firstRecord = hasSelection && events?.length
        ? events.find((e) => e.event_id === selectedRowKeys[0])
        : null;

    return (
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 8, fontSize: 16, color: '#8c8c8c', fontWeight: 600 }}>
                        TÌM KIẾM
                    </div>
                    <Input
                        placeholder="Tên sự kiện, địa điểm..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        size="large"
                    />
                </Col>
                <Col xs={12} md={8}>
                    <div style={{ marginBottom: 8, fontSize: 16, color: '#8c8c8c', fontWeight: 600 }}>
                        TRẠNG THÁI
                    </div>
                    <Select
                        value={filterStatus}
                        style={{ width: '100%' }}
                        onChange={setFilterStatus}
                        size="large"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <Option key={o.value} value={o.value}>
                                {o.label}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={12} md={8}>
                    <div style={{ marginBottom: 8, fontSize: 16, color: '#8c8c8c', fontWeight: 600 }}>
                        NỔI BẬT
                    </div>
                    <Select
                        value={filterFeatured}
                        style={{ width: '100%' }}
                        onChange={setFilterFeatured}
                        size="large"
                    >
                        {FEATURED_OPTIONS.map((o) => (
                            <Option key={o.value} value={o.value}>
                                {o.label}
                            </Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    {hasSelection && (
                        <Space size="middle">
                            <Text strong>Đã chọn:</Text>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => firstRecord && onViewDetail?.(firstRecord)}
                            >
                                Xem chi tiết
                            </Button>
                        </Space>
                    )}
                </div>
                <AdminToolbar
                    onUndo={onUndo}
                    onRefresh={onRefresh}
                    undoDisabled={undoDisabled}
                    undoLoading={undoLoading}
                    refreshLoading={loading}
                    refreshDisabled={loading}
                />
            </div>
        </Card>
    );
};

export default memo(EventFilters);
