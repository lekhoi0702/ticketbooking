import React from 'react';
import { Form, Button, Card, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

// Hooks
import { useCreateEvent } from '../../hooks/useCreateEvent';

// Sub-components
import EventBasicInfo from '../../components/Organizer/EventBasicInfo';
import EventDateTime from '../../components/Organizer/EventDateTime';
import EventBannerUpload from '../../components/Organizer/EventBannerUpload';
import TicketConfig from '../../components/Organizer/TicketConfig';

import '../../components/Organizer/OrganizerDashboard.css';

/**
 * Page component for creating a new event.
 */
const CreateEvent = () => {
    const navigate = useNavigate();
    const {
        loading,
        loadingData,
        error,
        success,
        categories,
        venues,
        formData,
        bannerPreview,
        ticketTypes,
        setError,
        handleInputChange,
        handleImageChange,
        removeBanner,
        handleTicketTypeChange,
        addTicketType,
        removeTicketType,
        handleSubmit
    } = useCreateEvent();

    if (loadingData) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-3 text-muted">Đang tải cấu hình...</p>
            </div>
        );
    }

    if (success) {
        return (
            <Container className="py-5 text-center">
                <div className="bg-success bg-opacity-10 p-5 rounded-5 animate-fade-in" style={{ border: '1px solid rgba(45, 194, 117, 0.1)' }}>
                    <FaCheckCircle className="text-success display-1 mb-4" />
                    <h2 className="fw-bold text-white mb-3">Tạo sự kiện thành công!</h2>
                    <p className="text-muted mb-4 fs-5">Sự kiện của bạn đã được đăng tải và sẵn sàng để bán vé.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="success" size="lg" className="px-5 fw-bold" onClick={() => navigate('/organizer/events')}>
                            Danh sách sự kiện
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <div className="animate-fade-in pb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <Button
                        variant="link"
                        className="text-muted p-0 me-3 hover-text-white"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-white fw-bold mb-0">Tạo Sự Kiện Mới</h2>
                        <p className="text-muted mb-0">Bắt đầu hành trình tổ chức sự kiện của bạn</p>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" className="border-0 shadow-sm mb-4" dismissible onClose={() => setError(null)}>
                    <div className="d-flex align-items-center">
                        <span className="me-2">⚠️</span>
                        {error}
                    </div>
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="content-card mb-4">
                            <Card.Header className="content-card-header">
                                <h5 className="mb-0 fw-bold text-white">1. Thông tin cơ bản</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <EventBasicInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    categories={categories}
                                    venues={venues}
                                />
                            </Card.Body>
                        </Card>

                        <Card className="content-card mb-4">
                            <Card.Header className="content-card-header">
                                <h5 className="mb-0 fw-bold text-white">2. Thời gian tổ chức</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <EventDateTime
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            </Card.Body>
                        </Card>

                        <Card className="content-card mb-4">
                            <Card.Header className="content-card-header">
                                <h5 className="mb-0 fw-bold text-white">3. Thiết lập loại vé</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <TicketConfig
                                    ticketTypes={ticketTypes}
                                    handleTicketTypeChange={handleTicketTypeChange}
                                    addTicketType={addTicketType}
                                    removeTicketType={removeTicketType}
                                />
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="content-card mb-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <Card.Header className="content-card-header">
                                <h5 className="mb-0 fw-bold text-white">Ảnh bìa sự kiện</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <EventBannerUpload
                                    bannerPreview={bannerPreview}
                                    handleImageChange={handleImageChange}
                                    removeBanner={removeBanner}
                                />

                                <div className="mt-4 pt-4 border-top border-secondary border-opacity-10">
                                    <h6 className="text-white fw-bold mb-3">Hoàn tất đăng tin</h6>
                                    <p className="text-muted small mb-4">
                                        Vui lòng kiểm tra kỹ tất cả thông tin trước khi đăng sự kiện. Các thông tin này có thể chỉnh sửa sau khi đăng.
                                    </p>

                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="w-100 fw-bold py-3 mb-3 border-0 shadow-sm"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'ĐĂNG SỰ KIỆN NGAY'
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline-secondary"
                                        className="w-100 fw-bold py-2 border-secondary border-opacity-25"
                                        onClick={() => navigate('/organizer/dashboard')}
                                        disabled={loading}
                                    >
                                        Hủy bỏ
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default CreateEvent;
