import React from 'react';
import {
    Card,
    Button,
    Typography,
    Space,
    Image,
    message
} from 'antd';
import {
    CloudUploadOutlined,
    DeleteOutlined,
    PictureOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const EventBannerUpload = ({ bannerPreview, handleImageChange, removeBanner }) => {
    return (
        <div>
            <div
                style={{
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s',
                    textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2DC275'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
            >
                {bannerPreview ? (
                    <div style={{ width: '100%' }}>
                        <Image
                            src={bannerPreview}
                            alt="Banner Preview"
                            width="100%"
                            height={180}
                            style={{
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 16,
                                border: '1px solid #f0f0f0'
                            }}
                        />
                        <Space size={12}>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={removeBanner}
                            >
                                Gỡ bỏ
                            </Button>
                            <Button
                                icon={<PictureOutlined />}
                                style={{ color: '#2DC275', borderColor: '#2DC275' }}
                            >
                                <label style={{ cursor: 'pointer' }}>
                                    Đổi ảnh
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </Button>
                        </Space>
                    </div>
                ) : (
                    <div>
                        <CloudUploadOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <Title level={5} style={{ margin: '0 0 8px 0', fontSize: 14 }}>Tải lên ảnh bìa sự kiện</Title>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 20 }}>
                            Kích thước gợi ý 1200x480px (Tỉ lệ 2.5:1)
                        </Text>
                        <Button
                            type="primary"
                            icon={<CloudUploadOutlined />}
                            style={{ backgroundColor: '#2DC275', borderColor: '#2DC275' }}
                        >
                            <label style={{ cursor: 'pointer' }}>
                                Chọn tệp
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Need Title for the component
const { Title } = Typography;

export default EventBannerUpload;
