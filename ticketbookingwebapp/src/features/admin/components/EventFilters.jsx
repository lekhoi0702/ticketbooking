import React, { memo, useMemo, useCallback } from 'react';
import { Card, Row, Col, Input, Select, Divider, Button, Space, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';

const { Text } = Typography;

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
    // 1. Local state for immediate input feedback
    const [localSearch, setLocalSearch] = React.useState(searchQuery);

    // 2. Debounce search query to prevent excessive filtering lag
    const debouncedSetSearch = useMemo(
        () => debounce((val) => setSearchQuery(val), 300),
        [setSearchQuery]
    );

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setLocalSearch(val);
        debouncedSetSearch(val);
    };

    // 2.5 Clean up debounce on unmount
    React.useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [debouncedSetSearch]);

    // 3. Memoize options
    const STATUS_OPTIONS = useMemo(() => [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'DRAFT', label: 'Nháp' },
        { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
        { value: 'PUBLISHED', label: 'Công khai' },
        { value: 'REJECTED', label: 'Từ chối duyệt' },
        { value: 'CANCELLED', label: 'Hủy' },
        { value: 'ONGOING', label: 'Đang diễn ra' },
        { value: 'COMPLETED', label: 'Đã kết thúc' },
        { value: 'DELETED', label: 'Đã xóa' },
    ], []);

    const FEATURED_OPTIONS = useMemo(() => [
        { value: 'ALL', label: 'Tất cả' },
        { value: 'FEATURED', label: 'Sự kiện nổi bật' },
        { value: 'NOT_FEATURED', label: 'Sự kiện thường' },
    ], []);

    const hasSelection = selectedRowKeys?.length > 0;
    const firstRecord = hasSelection && events?.length
        ? events.find((e) => e.event_id === selectedRowKeys[0])
        : null;

    return (
        <Card style={{ marginBottom: 24, borderRadius: 12, overflow: 'visible' }}>
            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 8, fontSize: 16, color: '#8c8c8c', fontWeight: 600 }}>
                        TÌM KIẾM
                    </div>
                    <Input
                        placeholder="Tên sự kiện, địa điểm..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={localSearch}
                        onChange={handleSearchChange}
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
                        options={STATUS_OPTIONS}
                        placeholder="Chọn trạng thái"
                        allowClear
                        dropdownStyle={{ zIndex: 10001 }}
                        virtual={false}
                    />
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
                        options={FEATURED_OPTIONS}
                        placeholder="Chọn loại"
                        allowClear
                        dropdownStyle={{ zIndex: 10001 }}
                        virtual={false}
                    />
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
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button 
                        onClick={() => {
                            setLocalSearch('');
                            setSearchQuery('');
                            setFilterStatus('ALL');
                            setFilterFeatured('ALL');
                        }}
                        disabled={loading}
                    >
                        Xóa bộ lọc
                    </Button>
                    <Button 
                        type="primary"
                        onClick={onRefresh}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default memo(EventFilters);
