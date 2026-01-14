import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);

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
        manager_id: user?.user_id || 1
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([
        { type_name: '', price: '', quantity: '', description: '' }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [categoriesRes, venuesRes] = await Promise.all([
                api.getCategories(),
                api.getVenues()
            ]);

            if (categoriesRes.success) {
                setCategories(categoriesRes.data);
            }
            if (venuesRes.success) {
                setVenues(venuesRes.data);
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Không thể tải dữ liệu danh mục và địa điểm');
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
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

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { type_name: '', price: '', quantity: '', description: '' }]);
    };

    const removeTicketType = (index) => {
        if (ticketTypes.length > 1) {
            const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
            setTicketTypes(newTicketTypes);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validation
        if (!formData.event_name || !formData.category_id || !formData.venue_id ||
            !formData.start_datetime || !formData.end_datetime) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        // Calculate total capacity from ticket types
        const totalCapacity = ticketTypes.reduce((sum, tt) => {
            return sum + (parseInt(tt.quantity) || 0);
        }, 0);

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
            formDataToSend.append('total_capacity', totalCapacity);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('is_featured', formData.is_featured);
            formDataToSend.append('manager_id', formData.manager_id);

            if (formData.sale_start_datetime) {
                formDataToSend.append('sale_start_datetime', formData.sale_start_datetime);
            }
            if (formData.sale_end_datetime) {
                formDataToSend.append('sale_end_datetime', formData.sale_end_datetime);
            }

            // Add banner image
            if (bannerImage) {
                formDataToSend.append('banner_image', bannerImage);
            }

            // Add ticket types
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

            const response = await api.createEvent(formDataToSend);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/organizer/events');
                }, 1500);
            } else {
                setError(response.message || 'Không thể tạo sự kiện');
            }
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err.message || 'Không thể tạo sự kiện');
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
        formData,
        bannerPreview,
        ticketTypes,

        // Handlers
        setError,
        handleInputChange,
        handleImageChange,
        removeBanner: () => {
            setBannerImage(null);
            setBannerPreview(null);
        },
        handleTicketTypeChange,
        addTicketType,
        removeTicketType,
        handleSubmit,
        navigate
    };
};
