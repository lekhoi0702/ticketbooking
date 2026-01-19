import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    message,
    Steps,
    Space
} from 'antd';
import { CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import EventDateTime from './EventDateTime';
import TicketConfig from './TicketConfig';

/**
 * Modal for adding a new showtime to an approved event
 * Uses the same components as create event flow (EventDateTime + TicketConfig)
 */
const AddShowtimeModal = ({ visible, onCancel, onSuccess, eventId, eventData }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [venueTemplate, setVenueTemplate] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([
        { type_name: '', price: '', quantity: 0, description: '', selectedSeats: [] }
    ]);
    const [activeTicketTypeIndex, setActiveTicketTypeIndex] = useState(0);
    const [allOccupiedSeats] = useState([]);

    const [formData, setFormData] = useState({
        start_datetime: '',
        end_datetime: '',
        extra_showtimes: []
    });

    useEffect(() => {
        if (visible && eventData) {
            fetchVenueTemplate();
            // Pre-fill with existing ticket types from the main event
            if (eventData.ticket_types && eventData.ticket_types.length > 0) {
                const defaultTypes = eventData.ticket_types.map(tt => ({
                    type_name: tt.type_name,
                    price: tt.price,
                    quantity: 0,
                    description: tt.description || '',
                    selectedSeats: []
                }));
                setTicketTypes(defaultTypes);
            }
        }
    }, [visible, eventData]);

    const fetchVenueTemplate = async () => {
        if (!eventData?.venue_id) return;

        try {
            const res = await api.getVenue(eventData.venue_id);
            if (res.success) {
                let template = res.data.seat_map_template;
                if (typeof template === 'string') {
                    try {
                        template = JSON.parse(template);
                    } catch (e) {
                        console.error('Error parsing seat_map_template', e);
                        template = null;
                    }
                }
                setVenueTemplate(template);
            }
        } catch (error) {
            console.error("Error fetching venue template:", error);
            message.error("Không thể tải sơ đồ ghế");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTicketTypeChange = (index, field, value) => {
        const newTicketTypes = [...ticketTypes];
        newTicketTypes[index][field] = value;
        setTicketTypes(newTicketTypes);
    };

    const toggleSeatSelection = (index, templateItem, mode) => {
        const newTicketTypes = [...ticketTypes];
        const currentTT = newTicketTypes[index];
        const selected = currentTT.selectedSeats || [];

        const isSelected = selected.some(s =>
            s.row_name === templateItem.row_name &&
            String(s.seat_number) === String(templateItem.seat_number) &&
            s.area === templateItem.area
        );

        const targetMode = mode || (isSelected ? 'deselect' : 'select');

        let newSelected;
        if (targetMode === 'deselect' && isSelected) {
            newSelected = selected.filter(s => !(
                s.row_name === templateItem.row_name &&
                String(s.seat_number) === String(templateItem.seat_number) &&
                s.area === templateItem.area
            ));
        } else if (targetMode === 'select' && !isSelected) {
            const isOccupiedByOthers = ticketTypes.some((tt, i) =>
                i !== index && tt.selectedSeats?.some(s =>
                    s.row_name === templateItem.row_name &&
                    String(s.seat_number) === String(templateItem.seat_number) &&
                    s.area === templateItem.area
                )
            );

            if (!isOccupiedByOthers) {
                newSelected = [...selected, { ...templateItem, seat_number: String(templateItem.seat_number) }];
            } else {
                return;
            }
        } else {
            return;
        }

        currentTT.selectedSeats = newSelected;
        currentTT.quantity = newSelected.length;
        setTicketTypes(newTicketTypes);
    };

    const toggleAreaSelection = (index, areaName, seatsInArea) => {
        const newTicketTypes = [...ticketTypes];
        const currentTT = newTicketTypes[index];
        const selected = currentTT.selectedSeats || [];

        const availableSeatsInArea = seatsInArea.filter(t => {
            const isTakenByOthers = ticketTypes.some((tt, i) =>
                i !== index && tt.selectedSeats?.some(s =>
                    s.row_name === t.row_name &&
                    String(s.seat_number) === String(t.seat_number) &&
                    s.area === areaName
                )
            );
            return !isTakenByOthers;
        });

        const currentSelectedInArea = selected.filter(s => s.area === areaName);
        const allSelected = currentSelectedInArea.length === availableSeatsInArea.length && availableSeatsInArea.length > 0;
        const mode = allSelected ? 'deselect' : 'select';

        if (mode === 'deselect') {
            currentTT.selectedSeats = selected.filter(s => s.area !== areaName);
        } else {
            const seatsToSelect = availableSeatsInArea.filter(t =>
                !selected.some(s =>
                    s.area === areaName &&
                    s.row_name === t.row_name &&
                    String(s.seat_number) === String(t.seat_number)
                )
            ).map(t => ({ ...t, seat_number: String(t.seat_number) }));

            currentTT.selectedSeats = [...selected, ...seatsToSelect];
        }

        currentTT.quantity = currentTT.selectedSeats.length;
        setTicketTypes(newTicketTypes);
    };

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, {
            type_name: '',
            price: '',
            quantity: 0,
            description: '',
            selectedSeats: []
        }]);
    };

    const removeTicketType = (index) => {
        if (ticketTypes.length > 1) {
            const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
            setTicketTypes(newTicketTypes);
            if (activeTicketTypeIndex >= newTicketTypes.length) {
                setActiveTicketTypeIndex(newTicketTypes.length - 1);
            }
        }
    };

    const handleNext = () => {
        if (currentStep === 0) {
            // Validate datetime
            if (!formData.start_datetime || !formData.end_datetime) {
                message.error('Vui lòng chọn thời gian bắt đầu và kết thúc');
                return;
            }
            setCurrentStep(1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate ticket types
            const validTicketTypes = ticketTypes.filter(tt =>
                tt.type_name && tt.price && tt.selectedSeats.length > 0
            );

            if (validTicketTypes.length === 0) {
                message.error('Vui lòng cấu hình ít nhất một loại vé với ghế đã chọn');
                return;
            }

            setLoading(true);

            // Format datetime
            const showtimeData = {
                start_datetime: formData.start_datetime,
                end_datetime: formData.end_datetime
            };

            // Call API to add showtime
            const response = await api.addShowtime(eventId, showtimeData);

            if (response.success) {
                const newEventId = response.data.event_id;

                // Assign seats for each ticket type
                for (const tt of validTicketTypes) {
                    // Create ticket type for the new event
                    const ttResponse = await api.createTicketType(newEventId, {
                        type_name: tt.type_name,
                        price: tt.price,
                        quantity: tt.selectedSeats.length,
                        description: tt.description
                    });

                    if (ttResponse.success && tt.selectedSeats.length > 0) {
                        // Assign seats
                        await api.assignSeatsFromTemplate({
                            ticket_type_id: ttResponse.data.ticket_type_id,
                            seats: tt.selectedSeats
                        });
                    }
                }

                message.success('Thêm suất diễn thành công!');

                // Reset form
                setFormData({
                    start_datetime: '',
                    end_datetime: '',
                    extra_showtimes: []
                });
                setTicketTypes([{ type_name: '', price: '', quantity: 0, description: '', selectedSeats: [] }]);
                setCurrentStep(0);

                onSuccess();
            } else {
                message.error(response.message || 'Không thể thêm suất diễn');
            }
        } catch (error) {
            console.error('Error adding showtime:', error);
            message.error(error.message || 'Có lỗi xảy ra khi thêm suất diễn');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Thời gian',
            icon: <CalendarOutlined />,
            content: (
                <EventDateTime
                    formData={formData}
                    handleInputChange={handleInputChange}
                    existingSchedule={[]}
                />
            )
        },
        {
            title: 'Cấu hình vé',
            icon: <AppstoreOutlined />,
            content: (
                <TicketConfig
                    ticketTypes={ticketTypes}
                    setTicketTypes={setTicketTypes}
                    activeTicketTypeIndex={activeTicketTypeIndex}
                    setActiveTicketTypeIndex={setActiveTicketTypeIndex}
                    venueTemplate={venueTemplate}
                    allOccupiedSeats={allOccupiedSeats}
                    handleTicketTypeChange={handleTicketTypeChange}
                    toggleSeatSelection={toggleSeatSelection}
                    toggleAreaSelection={toggleAreaSelection}
                    addTicketType={addTicketType}
                    removeTicketType={removeTicketType}
                />
            )
        }
    ];

    const handleCancel = () => {
        setCurrentStep(0);
        setFormData({
            start_datetime: '',
            end_datetime: '',
            extra_showtimes: []
        });
        setTicketTypes([{ type_name: '', price: '', quantity: 0, description: '', selectedSeats: [] }]);
        onCancel();
    };

    return (
        <Modal
            title="Thêm Suất Diễn Mới"
            open={visible}
            onCancel={handleCancel}
            width={1200}
            footer={
                <Space>
                    <Button onClick={handleCancel}>
                        Hủy
                    </Button>
                    {currentStep > 0 && (
                        <Button onClick={handleBack}>
                            Quay lại
                        </Button>
                    )}
                    {currentStep < steps.length - 1 ? (
                        <Button type="primary" onClick={handleNext}>
                            Tiếp theo
                        </Button>
                    ) : (
                        <Button type="primary" loading={loading} onClick={handleSubmit}>
                            Xác nhận thêm
                        </Button>
                    )}
                </Space>
            }
        >
            <Steps
                current={currentStep}
                items={steps.map(step => ({
                    title: step.title,
                    icon: step.icon
                }))}
                style={{ marginBottom: 32 }}
            />

            <div style={{ minHeight: 400 }}>
                {steps[currentStep].content}
            </div>
        </Modal>
    );
};

export default AddShowtimeModal;
