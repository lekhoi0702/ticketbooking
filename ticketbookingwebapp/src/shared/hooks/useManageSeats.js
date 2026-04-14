import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@services/api';

/**
 * Custom hook for managing event seats logic
 */
export const useManageSeats = (eventId) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [activeTicketType, setActiveTicketType] = useState(null);
    const [initializing, setInitializing] = useState(false);

    // Global event state
    const [allOccupiedSeats, setAllOccupiedSeats] = useState([]);
    const [hasSeats, setHasSeats] = useState(false);

    // Template selection state
    const [selectedTemplateSeats, setSelectedTemplateSeats] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'

    // Handle global mouse up to stop dragging anywhere
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setDragMode(null);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // Grid initialization form
    const [initData, setInitData] = useState({
        rows: 5,
        seats_per_row: 10
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [eventRes, typesRes, occupiedRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId),
                api.getAllEventSeats(eventId)
            ]);

            if (eventRes.success) setEvent(eventRes.data);
            if (typesRes.success) {
                setTicketTypes(typesRes.data);
                if (typesRes.data.length > 0 && !activeTicketType) {
                    setActiveTicketType(typesRes.data[0]);
                }
            }
            if (occupiedRes.success) setAllOccupiedSeats(occupiedRes.data);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải thông tin cấu hình ghế');
        } finally {
            setLoading(false);
        }
    }, [eventId, activeTicketType]);

    useEffect(() => {
        fetchData();

        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [fetchData]);

    // Event seats are now shared by venue, no per-ticket-type mapping.
    useEffect(() => {
        setSelectedTemplateSeats((allOccupiedSeats || []).map((s) => ({
            row_name: s.row_name || s.RowNumber,
            seat_number: String(s.seat_number || s.SeatNumber),
            area: s.area_name || s.area || s.Area || 'MAIN',
            x_pos: s.x_pos || s.x_position || s.XPosition,
            y_pos: s.y_pos || s.y_position || s.YPosition
        })));
        setHasSeats(allOccupiedSeats.length > 0);
    }, [allOccupiedSeats]);

    const toggleTemplateSeat = useCallback((templateItem, forceMode = null) => {
        setSelectedTemplateSeats(prev => {
            const isSelected = prev.some(s =>
                s.row_name === templateItem.row_name &&
                String(s.seat_number) === String(templateItem.seat_number) &&
                s.area === templateItem.area
            );

            const mode = forceMode || (isSelected ? 'deselect' : 'select');

            if (mode === 'deselect' && isSelected) {
                return prev.filter(s => !(
                    s.row_name === templateItem.row_name &&
                    String(s.seat_number) === String(templateItem.seat_number) &&
                    s.area === templateItem.area
                ));
            } else if (mode === 'select' && !isSelected) {
                return [...prev, { ...templateItem, seat_number: String(templateItem.seat_number) }];
            }
            return prev;
        });
    }, []);

    const handleSeatMouseDown = useCallback((e, t) => {
        e.preventDefault();

        // Determine mode based on current state of the clicked seat
        const isSelected = selectedTemplateSeats.some(s =>
            s.row_name === t.row_name &&
            String(s.seat_number) === String(t.seat_number) &&
            s.area === t.area
        );

        const mode = isSelected ? 'deselect' : 'select';
        setDragMode(mode);
        setIsDragging(true);

        // Perform initial toggle
        toggleTemplateSeat(t, mode);
    }, [toggleTemplateSeat, selectedTemplateSeats]);

    const handleSeatMouseEnter = useCallback((templateItem) => {
        if (isDragging && dragMode) {
            toggleTemplateSeat(templateItem, dragMode);
        }
    }, [isDragging, dragMode, toggleTemplateSeat]);

    const handleInitializeSeats = async () => {
        try {
            setInitializing(true);
            const res = await api.initializeSeats({
                venue_id: event?.venue_id || event?.VenueID,
                rows: initData.rows,
                seats_per_row: initData.seats_per_row
            });
            if (res.success) {
                await fetchData();
                alert("Đã khởi tạo sơ đồ ghế mặc định thành công!");
            }
        } finally {
            setInitializing(false);
        }
    };

    const handleSaveTemplateAssignment = async () => {
        try {
            setInitializing(true);
            const res = await api.assignSeatsFromTemplate({
                venue_id: event?.venue_id || event?.VenueID,
                seats: selectedTemplateSeats
            });
            if (res.success) {
                await fetchData();
                alert("Lưu sơ đồ ghế thành công!");
            }
        } finally {
            setInitializing(false);
        }
    };

    const toggleAreaSeats = useCallback((areaName, seatsInArea) => {
        const availableSeatsInArea = seatsInArea;

        const currentSelectedInAreaCount = selectedTemplateSeats.filter(s =>
            s.area === areaName &&
            availableSeatsInArea.some(t =>
                t.row_name === s.row_name &&
                String(t.seat_number) === String(s.seat_number)
            )
        ).length;

        const allSelected = currentSelectedInAreaCount === availableSeatsInArea.length && availableSeatsInArea.length > 0;
        const mode = allSelected ? 'deselect' : 'select';

        setSelectedTemplateSeats(prev => {
            if (mode === 'deselect') {
                // Remove all seats in this area
                return prev.filter(s => s.area !== areaName);
            } else {
                // Add all available seats in this area that aren't already selected
                const seatsToSelect = availableSeatsInArea.filter(t =>
                    !prev.some(s =>
                        s.area === areaName &&
                        s.row_name === t.row_name &&
                        String(s.seat_number) === String(t.seat_number)
                    )
                ).map(t => ({ ...t, seat_number: String(t.seat_number) }));

                return [...prev, ...seatsToSelect];
            }
        });
    }, [selectedTemplateSeats]);

    const venueTemplate = useMemo(() => {
        const template = event?.venue?.seat_map;
        if (typeof template === 'string') {
            try {
                return JSON.parse(template);
            } catch (e) {
                console.error("Failed to parse seat_map", e);
                return null;
            }
        }
        return template;
    }, [event]);

    return {
        // States
        loading,
        error,
        event,
        ticketTypes,
        activeTicketType,
        initializing,
        allOccupiedSeats,
        hasSeats,
        selectedTemplateSeats,
        initData,
        venueTemplate,

        // Actions
        setActiveTicketType,
        setInitData,
        handleSeatMouseDown,
        handleSeatMouseEnter,
        toggleAreaSeats,
        handleInitializeSeats,
        handleSaveTemplateAssignment,
        setHasSeats
    };
};
