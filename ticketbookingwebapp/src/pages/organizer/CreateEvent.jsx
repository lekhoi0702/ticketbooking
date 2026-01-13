import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaCloudUploadAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const CreateEvent = () => {
    const navigate = useNavigate();
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
        status: 'DRAFT',
        is_featured: false,
        manager_id: 1 // Default manager ID
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
        e.preventDefault();

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

    if (loadingData) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold">Tạo Sự Kiện Mới</h2>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success">Tạo sự kiện thành công! Đang chuyển hướng...</Alert>}

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={8} className="pe-md-4">
                                <h5 className="mb-3 text-primary">Thông Tin Sự Kiện</h5>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Tên Sự Kiện <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên sự kiện"
                                        className="py-2"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Mô Tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Mô tả chi tiết về sự kiện..."
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Danh Mục <span className="text-danger">*</span></Form.Label>
                                            <Form.Select
                                                name="category_id"
                                                value={formData.category_id}
                                                onChange={handleInputChange}
                                                className="py-2"
                                                required
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.map(cat => (
                                                    <option key={cat.category_id} value={cat.category_id}>
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Địa Điểm <span className="text-danger">*</span></Form.Label>
                                            <Form.Select
                                                name="venue_id"
                                                value={formData.venue_id}
                                                onChange={handleInputChange}
                                                className="py-2"
                                                required
                                            >
                                                <option value="">Chọn địa điểm</option>
                                                {venues.map(venue => (
                                                    <option key={venue.venue_id} value={venue.venue_id}>
                                                        {venue.venue_name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Thời Gian Bắt Đầu <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="start_datetime"
                                                value={formData.start_datetime}
                                                onChange={handleInputChange}
                                                className="py-2"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Thời Gian Kết Thúc <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="end_datetime"
                                                value={formData.end_datetime}
                                                onChange={handleInputChange}
                                                className="py-2"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Bắt Đầu Bán Vé</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="sale_start_datetime"
                                                value={formData.sale_start_datetime}
                                                onChange={handleInputChange}
                                                className="py-2"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Kết Thúc Bán Vé</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="sale_end_datetime"
                                                value={formData.sale_end_datetime}
                                                onChange={handleInputChange}
                                                className="py-2"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">Trạng Thái</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="py-2"
                                            >
                                                <option value="DRAFT">Nháp</option>
                                                <option value="PUBLISHED">Đã Đăng</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={handleInputChange}
                                                label="Sự kiện nổi bật"
                                                className="mt-4"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>

                            <Col md={4} className="border-start-md ps-md-4 mt-4 mt-md-0">
                                <h5 className="mb-3 text-primary">Hình Ảnh</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Poster Sự Kiện</Form.Label>
                                    {bannerPreview ? (
                                        <div className="position-relative">
                                            <img src={bannerPreview} alt="Preview" className="img-fluid rounded mb-2" />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 m-2"
                                                onClick={() => {
                                                    setBannerImage(null);
                                                    setBannerPreview(null);
                                                }}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed rounded p-4 text-center bg-light d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                                            <FaCloudUploadAlt className="h1 text-muted mb-3" />
                                            <div className="mb-2 text-muted small">Kéo thả hoặc nhấn để tải lên</div>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="d-none"
                                                id="banner-upload"
                                            />
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => document.getElementById('banner-upload').click()}
                                            >
                                                Chọn Tập Tin
                                            </Button>
                                        </div>
                                    )}
                                    <Form.Text className="text-muted small">
                                        Kích thước đề xuất: 1200x600px, tối đa 5MB.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="my-5" />

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="text-primary mb-0">Cấu Hình Vé</h5>
                            <Button variant="outline-primary" size="sm" onClick={addTicketType}>
                                <FaPlus className="me-1" /> Thêm Loại Vé
                            </Button>
                        </div>

                        {ticketTypes.map((ticket, index) => (
                            <div key={index} className="bg-light p-3 rounded mb-3 border">
                                <Row className="g-2 align-items-end">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Tên Loại Vé</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ví dụ: Vé VIP"
                                                value={ticket.type_name}
                                                onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Giá Vé (VND)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                value={ticket.price}
                                                onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Số Lượng</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="100"
                                                value={ticket.quantity}
                                                onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Mô tả</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Mô tả ngắn"
                                                value={ticket.description}
                                                onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={1} className="text-end">
                                        {ticketTypes.length > 1 && (
                                            <Button
                                                variant="link"
                                                className="text-danger p-0 text-decoration-none"
                                                onClick={() => removeTicketType(index)}
                                            >
                                                <FaTimes size={20} />
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                            <Button
                                variant="secondary"
                                className="me-2 px-4"
                                size="lg"
                                onClick={() => navigate('/organizer/events')}
                                disabled={loading}
                            >
                                Hủy Bỏ
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                className="px-4"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Đang tạo...' : 'Đăng Sự Kiện'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CreateEvent;
