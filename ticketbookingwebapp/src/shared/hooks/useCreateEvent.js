import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
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
    const [fieldErrors, setFieldErrors] = useState({}); // Track field-level errors

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
    const [vietqrImage, setVietqrImage] = useState(null);
    const [vietqrPreview, setVietqrPreview] = useState(null);
    const [vietqrImageUrl, setVietqrImageUrl] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([
        { type_name: '', price: '', quantity: '0', description: '', selectedSeats: [] }
    ]);
    const [activeTicketTypeIndex, setActiveTicketTypeIndex] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.venue_id) {
            fetchVenueTemplate(formData.venue_id);
        }
    }, [formData.venue_id]);

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
                    setFormData(prev => ({
                        ...prev,
                        category_id: prev.category_id || categoriesRes.data[0].category_id
                    }));
                }
            }
            if (venuesRes.success) {
                // Filter out venues that are in maintenance or inactive
                const availableVenues = venuesRes.data.filter(venue => 
                    venue.status !== 'MAINTENANCE' && 
                    venue.is_active !== false &&
                    venue.status !== 'INACTIVE'
                );
                setVenues(availableVenues);
                
                // Only auto-select venue if no venue_id is currently set (new event)
                if (availableVenues.length > 0 && !formData.venue_id) {
                    const firstVenueId = availableVenues[0].venue_id;
                    setFormData(prev => ({
                        ...prev,
                        venue_id: firstVenueId
                    }));
                } else if (availableVenues.length === 0 && !formData.venue_id) {
                    // No available venues and no current venue_id, clear it
                    setFormData(prev => ({
                        ...prev,
                        venue_id: null
                    }));
                }
                // If formData.venue_id exists (editing event), keep it even if venue is in maintenance
                // This allows editing events with venues that later went into maintenance
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

    const handleVietQRImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVietqrImage(file);
            setVietqrImageUrl(null); // Clear URL if file is selected
            const reader = new FileReader();
            reader.onloadend = () => {
                setVietqrPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVietQRURLChange = (url) => {
        if (url && url.trim()) {
            setVietqrImageUrl(url.trim());
            setVietqrImage(null); // Clear file if URL is selected
            setVietqrPreview(url.trim());
        }
    };

    const handleTicketTypeChange = (index, field, value) => {
        const newTicketTypes = [...ticketTypes];
        newTicketTypes[index][field] = value;
        setTicketTypes(newTicketTypes);
    };

    // Helper for robust seat matching
    const isSameSeat = (s1, s2) => {
        if (!s1 || !s2) return false;

        const r1 = String(s1.row_name || '').trim().toUpperCase();
        const r2 = String(s2.row_name || '').trim().toUpperCase();

        if (r1 !== r2) return false;

        const n1 = String(s1.seat_number || '').trim();
        const n2 = String(s2.seat_number || '').trim();

        if (n1 !== n2) {
            const p1 = parseInt(n1, 10);
            const p2 = parseInt(n2, 10);
            if (isNaN(p1) || isNaN(p2) || p1 !== p2) return false;
        }

        const cleanArea = (a) => {
            if (!a) return '';
            return String(a).trim().toUpperCase()
                .replace(/^(KHU VỰC|KHU|KHÁN ĐÀI|AREA|ZONE|SECTION)\s+/g, '')
                .replace(/\s+/g, '')
                .trim();
        };

        const ca1 = cleanArea(s1.area || s1.area_name);
        const ca2 = cleanArea(s2.area || s2.area_name);

        if (ca1 && ca2 && ca1 !== ca2) return false;

        return true;
    };

    const toggleSeatSelection = (index, templateItem, targetMode) => {
        const newTicketTypes = [...ticketTypes];
        const currentTT = newTicketTypes[index];
        const selected = currentTT.selectedSeats || [];

        const isSelected = selected.some(s => isSameSeat(s, templateItem));
        let newSelected = [...selected];

        if (targetMode === 'deselect' && isSelected) {
            newSelected = selected.filter(s => !isSameSeat(s, templateItem));
        } else if (targetMode === 'select' && !isSelected) {
            // Check if occupied by other types
            const isOccupiedByOthers = ticketTypes.some((tt, i) =>
                i !== index && tt.selectedSeats?.some(s => isSameSeat(s, templateItem))
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
                i !== index && tt.selectedSeats?.some(s => isSameSeat(s, t))
            );
            return !isTakenByOthers;
        });

        const currentSelectedInArea = selected.filter(s =>
            seatsInArea.some(t => isSameSeat(s, t))
        );
        const allSelected = currentSelectedInArea.length === availableSeatsInArea.length && availableSeatsInArea.length > 0;
        const mode = allSelected ? 'deselect' : 'select';

        if (mode === 'deselect') {
            currentTT.selectedSeats = selected.filter(s =>
                !seatsInArea.some(t => isSameSeat(s, t))
            );
        } else {
            // Add all available seats in this area that aren't already selected
            const seatsToSelect = availableSeatsInArea.filter(t =>
                !selected.some(s => isSameSeat(s, t))
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

    const addShowtime = () => {
        setFormData(prev => ({
            ...prev,
            extra_showtimes: [
                ...(prev.extra_showtimes || []),
                {
                    id: Date.now(),
                    start_datetime: '',
                    end_datetime: '',
                    sale_start_datetime: '',
                    sale_end_datetime: '',
                    venue_id: prev.venue_id,
                    ticket_types: JSON.parse(JSON.stringify(ticketTypes))
                }
            ]
        }));
    };

    const removeShowtime = (index) => {
        setFormData(prev => ({
            ...prev,
            extra_showtimes: prev.extra_showtimes.filter((_, i) => i !== index)
        }));
    };

    const updateShowtime = (index, field, value) => {
        setFormData(prev => {
            const newShowtimes = [...prev.extra_showtimes];
            if (field === 'all') {
                newShowtimes[index] = value;
            } else {
                newShowtimes[index] = { ...newShowtimes[index], [field]: value };
            }
            return { ...prev, extra_showtimes: newShowtimes };
        });
    };

    const handleSubmit = async (e, eventId = null) => {
        if (e) e.preventDefault();

        // Clear previous errors
        setFieldErrors({});
        setError(null);

        // Validate required fields
        const errors = {};

        if (!formData.event_name || formData.event_name.trim() === '') {
            errors.event_name = 'Vui lòng nhập tên sự kiện';
        }

        if (!formData.description || formData.description.trim() === '') {
            errors.description = 'Vui lòng nhập mô tả sự kiện';
        }

        if (!formData.category_id) {
            errors.category_id = 'Vui lòng chọn danh mục';
        }

        if (!formData.venue_id) {
            errors.venue_id = 'Vui lòng chọn địa điểm';
        }

        if (!formData.start_datetime) {
            errors.start_datetime = 'Vui lòng chọn thời gian bắt đầu';
        }

        if (!formData.end_datetime) {
            errors.end_datetime = 'Vui lòng chọn thời gian kết thúc';
        }

        if (!formData.sale_start_datetime) {
            errors.sale_start_datetime = 'Vui lòng chọn thời gian mở bán';
        }

        if (!formData.sale_end_datetime) {
            errors.sale_end_datetime = 'Vui lòng chọn thời gian kết thúc bán';
        }

        // Validate extra showtimes
        if (formData.extra_showtimes && formData.extra_showtimes.length > 0) {
            formData.extra_showtimes.forEach((st, idx) => {
                const s = st.start_datetime ? dayjs(st.start_datetime) : null;
                const e = st.end_datetime ? dayjs(st.end_datetime) : null;

                if (!st.start_datetime) {
                    errors[`extra_showtime_${idx}_start`] = 'Vui lòng chọn thời gian bắt đầu';
                }
                if (!st.end_datetime) {
                    errors[`extra_showtime_${idx}_end`] = 'Vui lòng chọn thời gian kết thúc';
                }
                if (s && e && e.isBefore(s)) {
                    errors[`extra_showtime_${idx}_end`] = 'Thời gian kết thúc phải sau bắt đầu';
                }

                // Optional sale times validation
                const ss = st.sale_start_datetime ? dayjs(st.sale_start_datetime) : null;
                const se = st.sale_end_datetime ? dayjs(st.sale_end_datetime) : null;

                if (ss && se && se.isBefore(ss)) {
                    errors[`extra_showtime_${idx}_sale_end`] = 'Kết thúc bán phải sau mở bán';
                }
                if (ss && s && ss.isAfter(s)) {
                    errors[`extra_showtime_${idx}_sale_start`] = 'Mở bán phải trước khi diễn ra';
                }
            });
        }

        // Validate ticket types
        if (ticketTypes.length === 0) {
            errors.ticket_types = 'Vui lòng thêm ít nhất một loại vé';
        } else {
            // Validate each ticket type
            ticketTypes.forEach((tt, index) => {
                const isNameEmpty = !tt.type_name || tt.type_name.trim() === '';
                const isPriceEmpty = !tt.price || parseFloat(tt.price) <= 0;
                const isSeatsEmpty = !tt.selectedSeats || tt.selectedSeats.length === 0;

                if (isNameEmpty) {
                    errors[`ticket_type_${index}_name`] = 'Vui lòng nhập tên hạng vé';
                }

                if (isPriceEmpty) {
                    errors[`ticket_type_${index}_price`] = 'Vui lòng nhập giá vé hợp lệ';
                }

                if (isSeatsEmpty) {
                    errors[`ticket_type_${index}_seats`] = `Vui lòng chọn ghế cho loại vé "${tt.type_name || (index + 1)}"`;
                }

                if (isNameEmpty || isPriceEmpty || isSeatsEmpty) {
                    if (!errors.ticket_types) {
                        errors.ticket_types = 'Vui lòng hoàn thiện thông tin các hạng vé';
                    }
                }
            });
        }

        const isEdit = !!eventId;
        const djs = dayjs;
        const now = djs();
        const start = formData.start_datetime ? djs(formData.start_datetime) : null;
        const end = formData.end_datetime ? djs(formData.end_datetime) : null;
        const saleStart = formData.sale_start_datetime ? djs(formData.sale_start_datetime) : null;
        const saleEnd = formData.sale_end_datetime ? djs(formData.sale_end_datetime) : null;

        // If not editing, or if editing but user might have changed dates, we usually want to be careful.
        // However, for editing an existing event, it's common that the start_datetime is already in the past.
        // So we only enforce "future" for NEW events.
        if (!isEdit) {
            if (start && start.isBefore(now)) {
                errors.start_datetime = 'Thời gian bắt đầu phải sau thời điểm hiện tại';
            }
            if (saleStart && saleStart.isBefore(now)) {
                errors.sale_start_datetime = 'Thời gian mở bán phải sau thời điểm hiện tại';
            }
        }

        // Event end must always be after start
        if (end && start && end.isBefore(start)) {
            errors.end_datetime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }

        // Sale end must always be before event start and after sale start
        if (saleEnd && saleStart && saleEnd.isBefore(saleStart)) {
            errors.sale_end_datetime = 'Thời gian kết thúc bán phải sau thời gian mở bán';
        }
        if (saleEnd && start && saleEnd.isAfter(start)) {
            errors.sale_end_datetime = 'Thời gian kết thúc bán phải trước khi sự kiện bắt đầu';
        }

        // If there are errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Vui lòng điền đầy đủ thông tin bắt buộc và hợp lệ');
            return;
        }

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

            // Add QR image if a new one was selected (file or URL). Backend accepts legacy keys too.
            if (vietqrImage) {
                formDataToSend.append('qr_image', vietqrImage);
            } else if (vietqrImageUrl) {
                formDataToSend.append('qr_image_url', vietqrImageUrl);
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

                    if (matchedTT && localTT.selectedSeats) {
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
        fieldErrors, // Add field errors
        categories,
        venues,
        venueTemplate,
        allOccupiedSeats,
        formData,
        bannerPreview,
        vietqrPreview,
        ticketTypes,
        activeTicketTypeIndex,
        currentStep,
        createdEventId,

        // Setters for Edit mode
        setFormData,
        setTicketTypes,
        setBannerPreview,
        setVietqrPreview,
        setIsLoadingData: setLoadingData,

        // Handlers
        setError,
        setSuccess,
        setCurrentStep,
        setActiveTicketTypeIndex,
        handleInputChange,
        handleImageChange,
        handleVietQRImageChange,
        handleVietQRURLChange,
        removeBanner: () => {
            setBannerImage(null);
            setBannerPreview(null);
        },
        removeVietQR: () => {
            setVietqrImage(null);
            setVietqrImageUrl(null);
            setVietqrPreview(null);
        },
        handleTicketTypeChange,
        toggleSeatSelection,
        toggleAreaSelection,
        addTicketType,
        removeTicketType,
        addShowtime,
        removeShowtime,
        updateShowtime,
        handleSubmit,
        fetchVenueTemplate,
        navigate
    };
};
