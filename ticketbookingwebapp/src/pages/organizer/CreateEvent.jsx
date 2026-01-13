import React from 'react';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useCreateEvent } from '../../hooks/useCreateEvent';

// Sub-components
import EventBasicInfo from '../../components/organizer/EventBasicInfo';
import EventDateTime from '../../components/organizer/EventDateTime';
import EventBannerUpload from '../../components/organizer/EventBannerUpload';
import TicketConfig from '../../components/organizer/TicketConfig';

/**
 * Page component for creating a new event.
 * Refactored for better maintainability.
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
                        <div className="row">
                            <div className="col-md-8 pe-md-4">
                                <EventBasicInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    categories={categories}
                                    venues={venues}
                                />
                                <EventDateTime
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-4 border-start-md ps-md-4 mt-4 mt-md-0">
                                <EventBannerUpload
                                    bannerPreview={bannerPreview}
                                    handleImageChange={handleImageChange}
                                    removeBanner={removeBanner}
                                />
                            </div>
                        </div>

                        <hr className="my-5" />

                        <TicketConfig
                            ticketTypes={ticketTypes}
                            handleTicketTypeChange={handleTicketTypeChange}
                            addTicketType={addTicketType}
                            removeTicketType={removeTicketType}
                        />

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
