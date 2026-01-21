import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Tag,
    Input,
    Select,
    Space,
    Typography,
    DatePicker,
    Row,
    Col,
    Button,
    Tooltip,
    Badge,
    Drawer,
    Descriptions,
    Empty,
    message
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    CalendarOutlined,
    FileTextOutlined,
    EyeOutlined,
    FilterOutlined,
    HistoryOutlined,
    TeamOutlined,
    PlusCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// Action color mapping (matches ENUM: INSERT, UPDATE, DELETE)
const ACTION_COLORS = {
    'INSERT': 'green',
    'UPDATE': 'blue',
    'DELETE': 'red'
};

// Action icon mapping
const ACTION_ICONS = {
    'INSERT': <PlusCircleOutlined />,
    'UPDATE': <EditOutlined />,
    'DELETE': <DeleteOutlined />
};

// Action labels
const ACTION_LABELS = {
    'INSERT': 'Thêm mới',
    'UPDATE': 'Cập nhật',
    'DELETE': 'Xóa'
};

// Table name labels (maps table_name to Vietnamese)
const TABLE_LABELS = {
    'Event': 'Sự kiện',
    'Venue': 'Địa điểm',
    'Discount': 'Mã giảm giá',
    'TicketType': 'Loại vé',
    'Order': 'Đơn hàng',
    'Ticket': 'Vé',
    'User': 'Người dùng',
    'EventCategory': 'Thể loại',
    'Banner': 'Banner',
    'Seat': 'Ghế ngồi',
    'OrganizerInfo': 'Thông tin Organizer'
};

const AuditLogs = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState(null);
    const [entityFilter, setEntityFilter] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [actionTypes, setActionTypes] = useState([]);
    const [entityTypes, setEntityTypes] = useState([]);
    
    // Detail drawer
    const [selectedLog, setSelectedLog] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const fetchLogs = useCallback(async (page = 1, pageSize = 20) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:104',message:'fetchLogs entry',data:{page,pageSize},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        try {
            setLoading(true);
            // Build params with filters
            const params = {
                page,
                per_page: pageSize
            };
            
            // Add filters if provided
            if (actionFilter) {
                params.action = actionFilter;
            }
            if (entityFilter) {
                params.table_name = entityFilter;
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:113',message:'Before API call',data:{params},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.log('[AuditLogs] Fetching logs with params:', params);
            const response = await api.getOrganizerAuditLogs(params);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:116',message:'After API call',data:{responseSuccess:response?.success,responseDataLength:response?.data?.length,responseKeys:Object.keys(response||{}),hasPagination:!!response?.pagination},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.log('[AuditLogs] Response:', response);
            
            if (response && response.success) {
                const logsData = response.data || [];
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:120',message:'Processing logs data',data:{logsDataLength:logsData.length,firstLogKeys:logsData[0]?Object.keys(logsData[0]):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                console.log('[AuditLogs] Logs data structure:', logsData);
                if (logsData.length > 0) {
                    console.log('[AuditLogs] First log item:', logsData[0]);
                    console.log('[AuditLogs] First log keys:', Object.keys(logsData[0]));
                }
                setLogs(logsData);
                setPagination({
                    current: response.pagination?.page || page,
                    pageSize: response.pagination?.per_page || pageSize,
                    total: response.pagination?.total || 0
                });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:131',message:'State updated',data:{logsSet:logsData.length,paginationTotal:response.pagination?.total||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                console.log('[AuditLogs] Set logs:', logsData.length, 'items');
            } else {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:133',message:'Response failed',data:{response,hasSuccess:!!response?.success,message:response?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                console.error('[AuditLogs] Response failed:', response);
                message.error(response?.message || 'Không thể tải audit logs');
            }
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:137',message:'Error caught',data:{errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            console.error('[AuditLogs] Error fetching audit logs:', error);
            message.error('Không thể tải audit logs: ' + error.message);
        } finally {
            setLoading(false);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:140',message:'fetchLogs exit',data:{loading:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.log('[AuditLogs] Loading set to false');
        }
    }, []);

    const fetchActionTypes = async () => {
        try {
            const response = await api.getAuditLogActionTypes();
            if (response.success) {
                setActionTypes(response.data.actions || []);
                setEntityTypes(response.data.entity_types || []);
            }
        } catch (error) {
            console.error('Error fetching action types:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchActionTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (pag) => {
        fetchLogs(pag.current, pag.pageSize);
    };

    const handleRefresh = () => {
        fetchLogs(pagination.current, pagination.pageSize);
    };

    // Refetch logs when filters change
    useEffect(() => {
        if (!loading) {
            fetchLogs(1, pagination.pageSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionFilter, entityFilter]);

    const handleViewDetail = (record) => {
        setSelectedLog(record);
        setDrawerVisible(true);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setActionFilter(null);
        setEntityFilter(null);
        setDateRange(null);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'changed_at',
            key: 'changed_at',
            width: 160,
            render: (val) => {
                if (!val) return <Text type="secondary">N/A</Text>;
                try {
                    const date = dayjs(val);
                    return (
                        <Tooltip title={date.format('DD/MM/YYYY HH:mm:ss')}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {date.format('DD/MM/YY HH:mm')}
                            </Text>
                        </Tooltip>
                    );
                } catch (e) {
                    console.error('Error rendering date:', e, val);
                    return <Text type="secondary">{String(val)}</Text>;
                }
            }
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 180,
            render: (name, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {name || 'N/A'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.user_email}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            width: 130,
            render: (action) => {
                if (!action) return <Tag>N/A</Tag>;
                return (
                    <Tag 
                        color={ACTION_COLORS[action] || 'default'} 
                        icon={ACTION_ICONS[action]}
                        style={{ minWidth: 80, textAlign: 'center' }}
                    >
                        {ACTION_LABELS[action] || action}
                    </Tag>
                );
            }
        },
        {
            title: 'Bảng dữ liệu',
            dataIndex: 'table_name',
            key: 'table_name',
            width: 130,
            render: (tableName) => (
                <Tag color="processing">
                    {TABLE_LABELS[tableName] || tableName}
                </Tag>
            )
        },
        {
            title: 'ID bản ghi',
            dataIndex: 'record_id',
            key: 'record_id',
            width: 100,
            render: (recordId) => (
                <Text strong>#{recordId}</Text>
            )
        },
        {
            title: 'IP',
            dataIndex: 'ip_address',
            key: 'ip_address',
            width: 120,
            render: (ip) => (
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {ip || 'N/A'}
                </Text>
            )
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewDetail(record)}
                    />
                </Tooltip>
            )
        }
    ];

    // Debug log
    console.log('[AuditLogs] Render state:', { loading, logsCount: logs.length });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:303',message:'Render state',data:{loading,logsCount:logs.length,logsIsArray:Array.isArray(logs)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    return (
        <div style={{ padding: '0' }}>
                {/* Main Table Card */}
                <Card
                    title={
                        <Space>
                            <HistoryOutlined style={{ color: '#1890ff' }} />
                            <span>Lịch sử hoạt động của Organizer</span>
                            <Badge count={pagination.total} style={{ backgroundColor: '#52c41a' }} />
                        </Space>
                    }
                    extra={
                        <Space>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    {/* Filters */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Input
                                placeholder="Tìm kiếm..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Hành động"
                                style={{ width: '100%' }}
                                value={actionFilter}
                                onChange={setActionFilter}
                                allowClear
                            >
                                {actionTypes.map(action => (
                                    <Select.Option key={action} value={action}>
                                        <Tag color={ACTION_COLORS[action]} style={{ margin: 0 }}>
                                            {action}
                                        </Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Đối tượng"
                                style={{ width: '100%' }}
                                value={entityFilter}
                                onChange={setEntityFilter}
                                allowClear
                            >
                                {entityTypes.map(entity => (
                                    <Select.Option key={entity} value={entity}>
                                        {TABLE_LABELS[entity] || entity}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Button 
                                icon={<FilterOutlined />} 
                                onClick={handleClearFilters}
                                style={{ width: '100%' }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>

                    {/* Table */}
                    {console.log('[AuditLogs] Rendering table with logs:', logs)}
                    {/* #region agent log */}
                    {(() => {
                        const dataSource = logs || [];
                        const firstRow = dataSource[0];
                        fetch('http://127.0.0.1:7242/ingest/1c270eb9-7d11-4245-9c09-eb7eb11b4709',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditLogs.jsx:480',message:'Before Table render detailed',data:{logsLength:dataSource.length,logsIsArray:Array.isArray(dataSource),firstRowKeys:firstRow?Object.keys(firstRow):null,firstRowAuditId:firstRow?.audit_id,columnsCount:columns.length,paginationTotal:pagination.total,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
                        return null;
                    })()}
                    {/* #endregion */}
                    <Table
                        columns={columns}
                        dataSource={logs || []}
                        rowKey="audit_id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
                            pageSizeOptions: ['10', '20', '50', '100']
                        }}
                        onChange={handleTableChange}
                        size="middle"
                        locale={{
                            emptyText: <Empty description="Chưa có hoạt động nào được ghi nhận" />
                        }}
                    />
                </Card>

                {/* Detail Drawer */}
                <Drawer
                    title={
                        <Space>
                            <FileTextOutlined />
                            <span>Chi tiết hoạt động</span>
                        </Space>
                    }
                    placement="right"
                    width={500}
                    open={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                >
                    {selectedLog && (
                        <div>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Audit ID">
                                    #{selectedLog.audit_id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian">
                                    {dayjs(selectedLog.changed_at).format('DD/MM/YYYY HH:mm:ss')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người thực hiện">
                                    <Space direction="vertical" size={0}>
                                        <Text strong>{selectedLog.user_name || 'N/A'}</Text>
                                        <Text type="secondary">{selectedLog.user_email || 'N/A'}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>User ID: {selectedLog.changed_by}</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hành động">
                                    <Tag color={ACTION_COLORS[selectedLog.action]} icon={ACTION_ICONS[selectedLog.action]}>
                                        {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Bảng dữ liệu">
                                    <Tag color="processing">
                                        {TABLE_LABELS[selectedLog.table_name] || selectedLog.table_name}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="ID bản ghi">
                                    #{selectedLog.record_id}
                                </Descriptions.Item>
                                <Descriptions.Item label="IP Address">
                                    {selectedLog.ip_address || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="User Agent">
                                    <Text 
                                        type="secondary" 
                                        style={{ fontSize: 11, wordBreak: 'break-all' }}
                                    >
                                        {selectedLog.user_agent || 'N/A'}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                                <Card 
                                    title="Giá trị cũ (trước khi thay đổi)" 
                                    size="small" 
                                    style={{ marginTop: 16 }}
                                    type="inner"
                                >
                                    <pre style={{ 
                                        background: '#fff1f0', 
                                        padding: 12, 
                                        borderRadius: 4,
                                        overflow: 'auto',
                                        maxHeight: 200,
                                        fontSize: 12
                                    }}>
                                        {JSON.stringify(selectedLog.old_values, null, 2)}
                                    </pre>
                                </Card>
                            )}

                            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                                <Card 
                                    title="Giá trị mới (sau khi thay đổi)" 
                                    size="small" 
                                    style={{ marginTop: 16 }}
                                    type="inner"
                                >
                                    <pre style={{ 
                                        background: '#f6ffed', 
                                        padding: 12, 
                                        borderRadius: 4,
                                        overflow: 'auto',
                                        maxHeight: 200,
                                        fontSize: 12
                                    }}>
                                        {JSON.stringify(selectedLog.new_values, null, 2)}
                                    </pre>
                                </Card>
                            )}
                        </div>
                    )}
                </Drawer>
            </div>
    );
};

export default AuditLogs;
