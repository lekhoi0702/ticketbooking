import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaCloudUploadAlt, FaTrashAlt, FaImage } from 'react-icons/fa';

const EventBannerUpload = ({ bannerPreview, handleImageChange, removeBanner }) => {
    return (
        <div className="animate-fade-in">
            <div
                className={`banner-upload-container p-2 rounded-4 text-center d-flex flex-column align-items-center justify-content-center border-2 border-dashed ${bannerPreview ? 'border-success' : 'border-secondary'}`}
                style={{
                    minHeight: '280px',
                    backgroundColor: '#121214',
                    borderStyle: bannerPreview ? 'solid' : 'dashed',
                    transition: 'all 0.3s'
                }}
            >
                {bannerPreview ? (
                    <div className="position-relative w-100 h-100">
                        <img
                            src={bannerPreview}
                            alt="Banner Preview"
                            className="rounded-3 shadow-sm"
                            style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                        />
                        <div className="mt-3 d-flex justify-content-center gap-2">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={removeBanner}
                                className="px-3 border-danger border-opacity-25"
                            >
                                <FaTrashAlt className="me-2" /> Xóa ảnh
                            </Button>
                            <Form.Label
                                htmlFor="banner-upload"
                                className="btn btn-outline-success btn-sm mb-0 px-3 border-success border-opacity-25"
                            >
                                <FaImage className="me-2" /> Thay đổi
                            </Form.Label>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="bg-success bg-opacity-10 p-4 rounded-circle mb-3 d-inline-block">
                            <FaCloudUploadAlt className="text-success display-4" />
                        </div>
                        <h6 className="text-white fw-bold mb-2">Tải lên ảnh bìa (Banner)</h6>
                        <p className="text-muted small mb-4">
                            Định dạng JPG, PNG, WEBP. <br />
                            Kích thước gợi ý: 1200x480px (Tỉ lệ 2.5:1)
                        </p>
                        <Form.Label
                            htmlFor="banner-upload"
                            className="btn btn-success px-4 py-2 fw-bold border-0 shadow-sm"
                        >
                            Chọn Ảnh Từ Máy Tính
                        </Form.Label>
                    </div>
                )}
                <Form.Control
                    type="file"
                    id="banner-upload"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>
        </div>
    );
};

export default EventBannerUpload;
