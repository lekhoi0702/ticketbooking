import React from 'react';
import { Typography, Button, Space, Badge } from 'antd';
import {
    CheckSquareOutlined,
    BorderOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import TemplateSeat from './TemplateSeat';

const { Text } = Typography;

/**
 * Premium SeatMapTemplateView for selecting seats from venue template.
 */
const SeatMapTemplateView = ({
    venueTemplate,
    selectedTemplateSeats,
    allOccupiedSeats,
    activeTicketType,
    handleSeatMouseDown,
    handleSeatMouseEnter,
    toggleAreaSeats,
    scale = 1
}) => {
    // Robust seat matching logic
    const isSameSeat = (s1, s2) => {
        if (!s1 || !s2) return false;

        const r1 = String(s1.row_name || '').trim().toUpperCase();
        const r2 = String(s2.row_name || '').trim().toUpperCase();

        // Row must match
        if (r1 !== r2) return false;

        // Seat number match - try numeric comparison if possible
        const n1 = String(s1.seat_number || '').trim();
        const n2 = String(s2.seat_number || '').trim();

        if (n1 !== n2) {
            // Fallback to numeric comparison to handle "01" vs "1"
            const p1 = parseInt(n1, 10);
            const p2 = parseInt(n2, 10);
            if (isNaN(p1) || isNaN(p2) || p1 !== p2) {
                return false;
            }
        }

        // Lenient Area Match
        const cleanArea = (a) => {
            if (!a) return '';
            return String(a)
                .trim()
                .toUpperCase()
                .replace(/^(KHU VỰC|KHU|KHÁN ĐÀI|AREA|ZONE|SECTION)\s+/g, '') // Remove common prefixes
                .replace(/\s+/g, '') // Remove all internal spaces
                .trim();
        };

        const a1 = s1.area || s1.area_name || '';
        const a2 = s2.area || s2.area_name || s2.name || '';

        const ca1 = cleanArea(a1);
        const ca2 = cleanArea(a2);

        // Only compare if both have a non-empty cleaned area name
        if (ca1 && ca2 && ca1 !== ca2) return false;

        return true;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', userSelect: 'none' }}>
            {/* Debug info - can be removed after testing */}
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, marginBottom: 8 }}>
                Ghế hiện có: {selectedTemplateSeats?.length || 0} | Tổng ghế đã gán: {allOccupiedSeats?.length || 0}
            </div>
            {/* Stage element — scale theo prop scale */}
            <div style={{ marginBottom: Math.round(32 * scale), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: Math.round(250 * scale),
                    padding: `${Math.round(8 * scale)}px ${Math.round(40 * scale)}px`,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: `0 0 ${Math.round(20 * scale)}px ${Math.round(20 * scale)}px`,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderTop: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 'bold',
                    fontSize: Math.max(12, Math.round(12 * scale)),
                    textAlign: 'center',
                    letterSpacing: Math.round(2 * scale)
                }}>
                    SÂN KHẤU / STAGE
                </div>
            </div>

            <div
                className="seats-map-interaction-area"
                style={{
                    width: '100%',
                    padding: 24,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 12,
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 32
                }}
            >
                {/* Case 2: Grouped by areas (Admin Venue Designer Structure) */}
                {venueTemplate && venueTemplate.areas && Array.isArray(venueTemplate.areas) ? (
                    venueTemplate.areas.map((area, areaIdx) => {
                        const seatsInArea = [];
                        for (let r = 0; r < area.rows; r++) {
                            const rowName = String.fromCharCode(65 + r);
                            for (let c = 0; c < area.cols; c++) {
                                seatsInArea.push({
                                    row_name: rowName,
                                    seat_number: String(c + 1),
                                    area: area.name
                                });
                            }
                        }

                        const availableSeatsCount = seatsInArea.filter(t =>
                            !allOccupiedSeats.some(s =>
                                isSameSeat(s, t) &&
                                String(s.ticket_type_id) !== String(activeTicketType?.ticket_type_id)
                            )
                        ).length;

                        const selectedInAreaCount = selectedTemplateSeats.filter(s =>
                            String(s.area || s.area_name || '').trim().toUpperCase() === String(area.name).trim().toUpperCase()
                        ).length;

                        const isAllSelected = selectedInAreaCount >= availableSeatsCount && availableSeatsCount > 0;

                        return (
                            <div key={areaIdx} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    maxWidth: 800,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16,
                                    paddingBottom: 8,
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <Space size={12}>
                                        <Badge status="processing" color="#2DC275" text={
                                            <Text strong style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>KHU VỰC: {area.name}</Text>
                                        } />
                                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                            {area.rows} hàng x {area.cols} ghế
                                        </Text>
                                    </Space>

                                    {toggleAreaSeats && (
                                        <Button
                                            size="small"
                                            type="text"
                                            icon={isAllSelected ? <BorderOutlined /> : <CheckSquareOutlined />}
                                            onClick={() => toggleAreaSeats(area.name, seatsInArea)}
                                            style={{
                                                color: isAllSelected ? '#ff4d4f' : 'rgba(255,255,255,0.45)',
                                                fontSize: 12
                                            }}
                                        >
                                            {isAllSelected ? 'Hủy chọn tất cả' : 'Chọn nhanh'}
                                        </Button>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: Math.round(8 * scale),
                                    padding: Math.round(16 * scale),
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: Math.round(8 * scale)
                                }}>
                                    {[...Array(area.rows)].map((_, rIdx) => {
                                        const rowName = String.fromCharCode(65 + rIdx);
                                        const rowLabelWidth = Math.round(24 * scale);
                                        const rowLabelHeight = Math.round(32 * scale);
                                        const rowLabelFontSize = Math.max(12, Math.round(12 * scale));
                                        const rowGap = Math.round(8 * scale);
                                        return (
                                            <div key={rowName} style={{ display: 'flex', alignItems: 'center', gap: rowGap }}>
                                                <div style={{
                                                    width: rowLabelWidth,
                                                    height: rowLabelHeight,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'rgba(255,255,255,0.5)',
                                                    fontWeight: 'bold',
                                                    fontSize: rowLabelFontSize,
                                                    userSelect: 'none'
                                                }}>
                                                    {rowName}
                                                </div>
                                                {[...Array(area.cols)].map((_, cIdx) => {
                                                    const seatNumber = String(cIdx + 1);
                                                    const seatId = `${rIdx + 1}-${cIdx + 1}`;
                                                    const isLocked = area.locked_seats?.includes(seatId);

                                                    const t = {
                                                        row_name: rowName,
                                                        seat_number: seatNumber,
                                                        area: area.name
                                                    };

                                                    const isSelected = selectedTemplateSeats.some(s => isSameSeat(s, t));
                                                    const occupiedBy = allOccupiedSeats.find(s => isSameSeat(s, t));

                                                    return (
                                                        <TemplateSeat
                                                            key={`${area.name}-${rowName}-${seatNumber}`}
                                                            t={t}
                                                            isSelected={isSelected}
                                                            occupiedBy={occupiedBy}
                                                            isLocked={isLocked}
                                                            activeTicketTypeId={activeTicketType?.ticket_type_id}
                                                            onMouseDown={handleSeatMouseDown}
                                                            onMouseEnter={handleSeatMouseEnter}
                                                            scale={scale}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : Array.isArray(venueTemplate) ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: Math.round(8 * scale) }}>
                        {venueTemplate.map((t, idx) => {
                            const isSelected = selectedTemplateSeats.some(s => isSameSeat(s, t));
                            const occupiedBy = allOccupiedSeats.find(s => isSameSeat(s, t));

                            return (
                                <TemplateSeat
                                    key={`${t.row_name}-${t.seat_number}`}
                                    t={t}
                                    isSelected={isSelected}
                                    occupiedBy={occupiedBy}
                                    activeTicketTypeId={activeTicketType?.ticket_type_id}
                                    onMouseDown={handleSeatMouseDown}
                                    onMouseEnter={handleSeatMouseEnter}
                                    scale={scale}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '64px 0', textAlign: 'center' }}>
                        <AppstoreOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                        <Text type="secondary" style={{ display: 'block' }}>Không có dữ liệu sơ đồ mẫu cho địa điểm này.</Text>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatMapTemplateView;
