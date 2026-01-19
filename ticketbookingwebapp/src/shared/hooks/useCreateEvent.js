import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

/**
 * Custom hook for creating a new event
 */
export const useCreateEvent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const [createdEventId, setCreatedEventId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [venueTemplate, setVenueTemplate] = useState(null);
    const [allOccupiedSeats, setAllOccupiedSeats] = useState([]); // In create mode, this is usually empty unless editing (to-be-supported)

    // Helper to get formatted date for datetime-local input
    const getMockDate = (daysFromNow, hour = 19) => {
        const d = new Date();
        d.setDate(d.getDate() + daysFromNow);
        d.setHours(hour, 0, 0, 0);
        return d.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        event_name: '',
        description: '',
        category_id: '',
        venue_id: '',
        start_datetime: '',
        end_datetime: '',
        sale_start_datetime: '',
        sale_end_datetime: '',
        total_capacity: 0,
        status: 'PENDING_APPROVAL',
        is_featured: false,
        extra_showtimes: [],
        manager_id: user?.user_id || 1
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([
        { type_name: '', price: '', quantity: '0', description: '', selectedSeats: [] }
    ]);
    const [activeTicketTypeIndex, setActiveTicketTypeIndex] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [categoriesRes, venuesRes] = await Promise.all([
                api.getCategories(),
                api.getOrganizerVenues(user?.user_id || 1)
            ]);

            if (categoriesRes.success) {
                setCategories(categoriesRes.data);
                if (categoriesRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: categoriesRes.data[0].category_id }));
                }
            }
            if (venuesRes.success) {
                setVenues(venuesRes.data);
                if (venuesRes.data.length > 0) {
                    const firstVenueId = venuesRes.data[0].venue_id;
                    setFormData(prev => ({ ...prev, venue_id: firstVenueId }));
                    fetchVenueTemplate(firstVenueId);
                }
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Không thể tải dữ liệu danh mục và địa điểm');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchVenueTemplate = async (venueId) => {
        try {
            const res = await api.getVenue(venueId);
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
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'venue_id') {
            fetchVenueTemplate(value);
            // Optionally clear all selected seats when venue changes
            setTicketTypes(prev => prev.map(tt => ({ ...tt, selectedSeats: [], quantity: '0' })));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
            // Check if occupied by other types
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
                return; // cannot select
            }
        } else {
            return;
        }

        currentTT.selectedSeats = newSelected;
        currentTT.quantity = String(newSelected.length);
        setTicketTypes(newTicketTypes);
    };

    const toggleAreaSelection = (index, areaName, seatsInArea) => {
        const newTicketTypes = [...ticketTypes];
        const currentTT = newTicketTypes[index];
        const selected = currentTT.selectedSeats || [];

        // Determine available seats (not taken by other ticket types)
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
            // Add all available seats in this area that aren't already selected
            const seatsToSelect = availableSeatsInArea.filter(t =>
                !selected.some(s =>
                    s.area === areaName &&
                    s.row_name === t.row_name &&
                    String(s.seat_number) === String(t.seat_number)
                )
            ).map(t => ({ ...t, seat_number: String(t.seat_number) }));

            currentTT.selectedSeats = [...selected, ...seatsToSelect];
        }

        currentTT.quantity = String(currentTT.selectedSeats.length);
        setTicketTypes(newTicketTypes);
    };

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { type_name: '', price: '', quantity: '0', description: '', selectedSeats: [] }]);
    };

    const removeTicketType = (index) => {
        if (ticketTypes.length > 1) {
            const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
            setTicketTypes(newTicketTypes);
        }
    };

    const handleSubmit = async (e, eventId = null) => {
        if (e) e.preventDefault();

        // Validation
        if (!formData.event_name || !formData.category_id || !formData.venue_id ||
            !formData.start_datetime || !formData.end_datetime) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const isEdit = !!eventId;

        try {
            setLoading(true);
            setError(null);

            const formDataToSend = new FormData();

            // Add event data
            formDataToSend.append('event_name', formData.event_name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('venue_id', formData.venue_id);
            formDataToSend.append('start_datetime', formData.start_datetime);
            formDataToSend.append('end_datetime', formData.end_datetime);
            formDataToSend.append('total_capacity', formData.total_capacity || 0);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('is_featured', formData.is_featured);
            formDataToSend.append('manager_id', formData.manager_id);

            if (formData.sale_start_datetime) {
                formDataToSend.append('sale_start_datetime', formData.sale_start_datetime);
            }
            if (formData.sale_end_datetime) {
                formDataToSend.append('sale_end_datetime', formData.sale_end_datetime);
            }

            // Append extra showtimes
            if (formData.extra_showtimes && formData.extra_showtimes.length > 0) {
                formData.extra_showtimes.forEach(st => {
                    formDataToSend.append('extra_showtimes', JSON.stringify(st));
                });
            }

            // Add banner image if a new one was selected
            if (bannerImage) {
                formDataToSend.append('banner_image', bannerImage);
            }

            let response;
            if (isEdit) {
                // Also add ticket types for update mode if you want to support bulk update
                ticketTypes.forEach((tt) => {
                    if (tt.type_name && tt.price && tt.quantity) {
                        const ttPayload = {
                            type_name: tt.type_name,
                            price: tt.price,
                            quantity: tt.quantity,
                            description: tt.description
                        };
                        if (tt.ticket_type_id) {
                            ttPayload.ticket_type_id = tt.ticket_type_id;
                        }
                        formDataToSend.append('ticket_types', JSON.stringify(ttPayload));
                    }
                });
                response = await api.updateEvent(eventId, formDataToSend);
            } else {
                // Add ticket types for create mode
                ticketTypes.forEach((tt) => {
                    if (tt.type_name && tt.price && tt.quantity) {
                        formDataToSend.append('ticket_types', JSON.stringify({
                            type_name: tt.type_name,
                            price: tt.price,
                            quantity: tt.quantity,
                            description: tt.description
                        }));
                    }
                });
                response = await api.createEvent(formDataToSend);
            }

            if (response.success) {
                const eventIdToUse = isEdit ? eventId : response.data.event_id;
                const returnedTicketTypes = response.data.ticket_types;

                // Assign/Re-assign seats for each ticket type sequentially to avoid database deadlocks
                for (const localTT of ticketTypes) {
                    const matchedTT = returnedTicketTypes?.find(rtt =>
                        (localTT.ticket_type_id && rtt.ticket_type_id === localTT.ticket_type_id) ||
                        (!localTT.ticket_type_id && rtt.type_name === localTT.type_name)
                    );

                    if (matchedTT && localTT.selectedSeats && localTT.selectedSeats.length > 0) {
                        const assignResult = await api.assignSeatsFromTemplate({
                            ticket_type_id: matchedTT.ticket_type_id,
                            seats: localTT.selectedSeats
                        });

                        if (!assignResult.success) {
                            throw new Error(assignResult.message || `Lỗi khi lưu ghế cho hạng vé ${localTT.type_name}`);
                        }
                    }
                }

                if (!isEdit) {
                    setCreatedEventId(eventIdToUse);
                }

                setSuccess(true);
            } else {
                setError(response.message || `Không thể ${isEdit ? 'cập nhật' : 'tạo'} sự kiện`);
            }
        } catch (err) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} event:`, err);
            setError(err.message || `Không thể ${isEdit ? 'tập nhật' : 'tạo'} sự kiện`);
        } finally {
            setLoading(false);
        }
    };

    return {
        // States
        loading,
        loadingData,
        error,
        success,
        categories,
        venues,
        venueTemplate,
        allOccupiedSeats,
        formData,
        bannerPreview,
        ticketTypes,
        activeTicketTypeIndex,
        currentStep,
        createdEventId,

        // Setters for Edit mode
        setFormData,
        setTicketTypes,
        setBannerPreview,
        setIsLoadingData: setLoadingData,

        // Handlers
        setError,
        setSuccess,
        setCurrentStep,
        setActiveTicketTypeIndex,
        handleInputChange,
        handleImageChange,
        removeBanner: () => {
            setBannerImage(null);
            setBannerPreview(null);
        },
        handleTicketTypeChange,
        toggleSeatSelection,
        toggleAreaSelection,
        addTicketType,
        removeTicketType,
        handleSubmit,
        navigate
    };
};
