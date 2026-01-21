import React, { useState } from 'react';
import {
    Card,
    Button,
    Typography,
    Space,
    Image,
    message,
    Input,
    Tabs
} from 'antd';
import {
    CloudUploadOutlined,
    DeleteOutlined,
    PictureOutlined,
    QrcodeOutlined,
    LinkOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const VietQRImageUpload = ({ qrPreview, handleImageChange, handleURLChange, removeQR }) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [urlInput, setUrlInput] = useState('');
    return (
        <div>
            <div
                style={{
                    minHeight: 200,
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
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1A73E8'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
            >
                {qrPreview ? (
                    <div style={{ width: '100%' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginBottom: 16 
                        }}>
                            <Image
                                src={qrPreview}
                                alt="VietQR Preview"
                                width={200}
                                height={200}
                                style={{
                                    objectFit: 'contain',
                                    borderRadius: 8,
                                    border: '1px solid #f0f0f0',
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </div>
                        <Space size={12}>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={removeQR}
                            >
                                Gỡ bỏ
                            </Button>
                            <Button
                                icon={<PictureOutlined />}
                                style={{ color: '#1A73E8', borderColor: '#1A73E8' }}
                            >
                                <label style={{ cursor: 'pointer' }}>
                                    Đổi ảnh
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleImageChange(e);
                                            setActiveTab('upload');
                                        }}
                                    />
                                </label>
                            </Button>
                            <Button
                                icon={<LinkOutlined />}
                                style={{ color: '#1A73E8', borderColor: '#1A73E8' }}
                                onClick={() => {
                                    removeQR(); // Clear current preview
                                    setActiveTab('url');
                                    setUrlInput('');
                                }}
                            >
                                Nhập Link
                            </Button>
                        </Space>
                    </div>
                ) : (
                    <div style={{ width: '100%' }}>
                        <QrcodeOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <Title level={5} style={{ margin: '0 0 8px 0', fontSize: 14 }}>
                            Tải lên ảnh QR Code VietQR
                        </Title>
                        
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                {
                                    key: 'upload',
                                    label: (
                                        <span>
                                            <CloudUploadOutlined /> Upload File
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '16px 0' }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                                                Upload ảnh QR code từ tài khoản VietQR của bạn (PNG, JPG)
                                            </Text>
                                            <Button
                                                type="primary"
                                                icon={<CloudUploadOutlined />}
                                                style={{ backgroundColor: '#1A73E8', borderColor: '#1A73E8' }}
                                            >
                                                <label style={{ cursor: 'pointer' }}>
                                                    Chọn ảnh QR
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            </Button>
                                        </div>
                                    )
                                },
                                {
                                    key: 'url',
                                    label: (
                                        <span>
                                            <LinkOutlined /> Nhập Link
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: '16px 0' }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                                Nhập URL ảnh QR code từ tài khoản VietQR của bạn
                                            </Text>
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Input
                                                    placeholder="https://example.com/qr-code.png"
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                    onPressEnter={() => {
                                                        if (urlInput.trim()) {
                                                            handleURLChange(urlInput.trim());
                                                        }
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                                <Button
                                                    type="primary"
                                                    icon={<LinkOutlined />}
                                                    onClick={() => {
                                                        if (urlInput.trim()) {
                                                            handleURLChange(urlInput.trim());
                                                        } else {
                                                            message.warning('Vui lòng nhập URL hợp lệ');
                                                        }
                                                    }}
                                                    style={{ backgroundColor: '#1A73E8', borderColor: '#1A73E8' }}
                                                >
                                                    Áp dụng
                                                </Button>
                                            </Space.Compact>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VietQRImageUpload;
