import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const EventBannerUpload = ({ bannerPreview, handleImageChange, removeBanner }) => {
    return (
        <>
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
                            onClick={removeBanner}
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
        </>
    );
};

export default EventBannerUpload;
