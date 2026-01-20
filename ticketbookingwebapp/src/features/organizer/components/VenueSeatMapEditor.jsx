import React, { useState, useEffect } from 'react';
import {
    Button,
    Typography,
    Tag,
    Modal,
    InputNumber,
    Input,
    Row,
    Col,
    Tooltip
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    StopOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const VenueSeatMapEditor = ({ venueName, initialAreas, visible, onClose, onSave, saving }) => {
    const [areas, setAreas] = useState([]);
    const [activeAreaIndex, setActiveAreaIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragAction, setDragAction] = useState(null);

    useEffect(() => {
        if (visible && initialAreas) {
            setAreas(JSON.parse(JSON.stringify(initialAreas))); // Deep copy
            setActiveAreaIndex(0);
        }
    }, [visible, initialAreas]);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const addNewArea = () => {
        const newArea = {
            name: `Khu vực ${areas.length + 1}`,
            rows: 5,
            cols: 10,
            locked_seats: []
        };
        setAreas([...areas, newArea]);
        setActiveAreaIndex(areas.length);
    };

    const removeArea = (index) => {
        const newAreas = areas.filter((_, i) => i !== index);
        setAreas(newAreas);
        if (activeAreaIndex >= newAreas.length) {
            setActiveAreaIndex(Math.max(0, newAreas.length - 1));
        }
    };

    const updateAreaProperty = (index, prop, value) => {
        const newAreas = [...areas];
        newAreas[index][prop] = value;
        setAreas(newAreas);
    };

    const handleSeatMouseDown = (areaIndex, row, col) => {
        setIsDragging(true);
        const seatId = `${row}-${col}`;
        const area = areas[areaIndex];
        const isCurrentlyLocked = area.locked_seats.includes(seatId);
        const action = isCurrentlyLocked ? 'unlock' : 'lock';
        setDragAction(action);
        applySeatAction(areaIndex, row, col, action);
    };

    const handleSeatMouseEnter = (areaIndex, row, col) => {
        if (!isDragging) return;
        applySeatAction(areaIndex, row, col, dragAction);
    };

    const applySeatAction = (areaIndex, row, col, action) => {
        const seatId = `${row}-${col}`;
        const newAreas = [...areas];
        const area = newAreas[areaIndex];

        if (action === 'lock' && !area.locked_seats.includes(seatId)) {
            area.locked_seats = [...area.locked_seats, seatId];
            setAreas(newAreas);
        } else if (action === 'unlock' && area.locked_seats.includes(seatId)) {
            area.locked_seats = area.locked_seats.filter(id => id !== seatId);
            setAreas(newAreas);
        }
    };

    const handleSave = () => {
        onSave(areas);
    };

    const renderSeatMap = (area, areaIndex) => {
        const rows = [];
        for (let r = 1; r <= area.rows; r++) {
            const cols = [];
            for (let c = 1; c <= area.cols; c++) {
                const isLocked = area.locked_seats.includes(`${r}-${c}`);
                cols.push(
                    <Tooltip title={`Hàng ${r}, Ghế ${c} ${isLocked ? '(Hỏng/Khóa)' : ''}`} key={`${r}-${c}`}><div
                        onMouseDown={() => handleSeatMouseDown(areaIndex, r, c)}
                        onMouseEnter={() => handleSeatMouseEnter(areaIndex, r, c)}
                        style={{
                            width: 28,
                            height: 28,
                            margin: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            backgroundColor: isLocked ? '#ff4d4f' : '#f0f0f0',
                            color: isLocked ? 'white' : 'rgba(0,0,0,0.45)',
                            fontSize: 10,
                            fontWeight: 'bold',
                            userSelect: 'none',
                            transition: 'all 0.2s',
                            border: isLocked ? 'none' : '1px solid #d9d9d9'
                        }}
                        className="seat-item"
                    >
                        {isLocked ? <StopOutlined style={{ fontSize: 14 }} /> : `${String.fromCharCode(64 + r)}${c}`}
                    </div>
                    </Tooltip>
                );
            }
            rows.push(
                <div key={r} style={{ display: 'flex', justifyContent: 'center' }}>
                    {cols}
                </div>
            );
        }
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#fafafa',
                borderRadius: 8,
                overflowX: 'auto',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ marginBottom: 32, width: '100%', textAlign: 'center' }}>
                    <div style={{
                        width: '60%',
                        margin: '0 auto',
                        padding: '8px',
                        background: '#e8e8e8',
                        borderRadius: '0 0 20px 20px',
                        fontSize: 12,
                        color: '#8c8c8c',
                        fontWeight: 600
                    }}>
                        SÂN KHẤU / MÀN HÌNH
                    </div>
                </div>
                {rows}
            </div>
        );
    };

    return (
        <Modal
            title={`Thiết Kế Sơ Đồ: ${venueName}`}
            open={visible}
            onCancel={onClose}
            width={1100}
            style={{ top: 20 }}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={saving}>Hủy bỏ</Button>,
                <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving} disabled={areas.length === 0}>
                    Lưu sơ đồ địa điểm
                </Button>
            ]}
            styles={{ body: { padding: 0 } }}
        >
            <div style={{ display: 'flex', height: '70vh' }}>
                {/* Sidebar */}
                <div style={{ width: 280, borderRight: '1px solid #f0f0f0', padding: 24, backgroundColor: '#fafafa', overflowY: 'auto' }}>
                    <Button
                        block
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addNewArea}
                        style={{ marginBottom: 24 }}
                        disabled={saving}
                    >
                        Thêm khu vực mới
                    </Button>

                    <Text strong style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        Danh sách khu vực ({areas.length})
                    </Text>

                    <div style={{ marginTop: 16 }}>
                        {areas.map((area, idx) => (
                            <div
                                key={idx}
                                onClick={() => !saving && setActiveAreaIndex(idx)}
                                style={{
                                    padding: '12px 16px',
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    border: '1px solid',
                                    borderColor: activeAreaIndex === idx ? '#2DC275' : '#f0f0f0',
                                    backgroundColor: activeAreaIndex === idx ? '#f6ffed' : 'white',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Text strong style={{ color: activeAreaIndex === idx ? '#2DC275' : 'inherit' }}>{area.name}</Text><br />
                                <Text type="secondary" style={{ fontSize: 11 }}>{area.rows} x {area.cols} ({area.rows * area.cols} ghế)</Text>
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    style={{ position: 'absolute', top: 12, right: 8 }}
                                    onClick={(e) => { e.stopPropagation(); !saving && removeArea(idx); }}
                                    disabled={saving}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
                    {areas.length > 0 ? (
                        <div>
                            <Row gutter={24} style={{ marginBottom: 32 }}>
                                <Col span={10}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>TÊN KHU VỰC</Text>
                                    <Input
                                        value={areas[activeAreaIndex].name}
                                        onChange={e => updateAreaProperty(activeAreaIndex, 'name', e.target.value)}
                                        disabled={saving}
                                    />
                                </Col>
                                <Col span={4}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>SỐ HÀNG</Text><br />
                                    <InputNumber
                                        min={1} max={50}
                                        value={areas[activeAreaIndex].rows}
                                        onChange={val => updateAreaProperty(activeAreaIndex, 'rows', val || 1)}
                                        style={{ width: '100%' }}
                                        disabled={saving}
                                    />
                                </Col>
                                <Col span={4}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>SỐ CỘT</Text><br />
                                    <InputNumber
                                        min={1} max={50}
                                        value={areas[activeAreaIndex].cols}
                                        onChange={val => updateAreaProperty(activeAreaIndex, 'cols', val || 1)}
                                        style={{ width: '100%' }}
                                        disabled={saving}
                                    />
                                </Col>
                                <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Tag color="error" icon={<StopOutlined />}>
                                        {areas[activeAreaIndex].locked_seats.length} ghế hỏng
                                    </Tag>
                                </Col>
                            </Row>

                            <Title level={5}>Trình xem trước sơ đồ</Title>
                            {renderSeatMap(areas[activeAreaIndex], activeAreaIndex)}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <AppstoreOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                            <Text>Thêm khu vực để bắt đầu thiết kế sơ đồ</Text>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .seat-item:hover {
                    box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
                    border-color: #2DC275 !important;
                }
            `}} />
        </Modal>
    );
};

export default VenueSeatMapEditor;
