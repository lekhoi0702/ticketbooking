import React, { useState, useEffect } from 'react';
import {
    Button,
    Typography,
    Space,
    Image,
    message,
    Input,
    Select
} from 'antd';
import {
    DeleteOutlined,
    QrcodeOutlined,
    BankOutlined
} from '@ant-design/icons';
import { paymentApi } from '@services/api/payment';

const { Text, Title } = Typography;

const VietQRImageUpload = ({ qrPreview, handleURLChange, removeQR }) => {
    const [banks, setBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const [accountNo, setAccountNo] = useState('');
    const [bankCode, setBankCode] = useState('');
    const template = 'compact'; // Template mặc định là compact

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setLoadingBanks(true);
            const result = await paymentApi.getVietQRBanks();
            if (result.success) {
                setBanks(result.banks || []);
            }
        } catch (err) {
            console.error('Error fetching banks:', err);
            message.error('Không thể tải danh sách ngân hàng');
        } finally {
            setLoadingBanks(false);
        }
    };

    const generateQRFromBankInfo = async () => {
        // Validate inputs
        if (!accountNo || !accountNo.trim()) {
            message.error('Vui lòng nhập số tài khoản');
            return;
        }
        if (!/^[0-9]+$/.test(accountNo.trim())) {
            message.error('Số tài khoản chỉ chứa số');
            return;
        }
        if (!bankCode || !bankCode.trim()) {
            message.error('Vui lòng chọn ngân hàng');
            return;
        }

        try {
            setGeneratingQR(true);
            
            // Build Sepay API URL với template compact mặc định
            const qrImageUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(accountNo.trim())}&bank=${encodeURIComponent(bankCode)}&template=compact`;
            
            // Set the QR preview and URL
            handleURLChange(qrImageUrl);
            message.success('Đã tạo QR code thành công!');
        } catch (err) {
            console.error('Error generating QR:', err);
            message.error('Không thể tạo QR code. Vui lòng thử lại.');
        } finally {
            setGeneratingQR(false);
        }
    };

    return (
        <div>
            {qrPreview ? (
                <div
                    style={{
                        padding: 16,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 8,
                        backgroundColor: '#fafafa',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        marginBottom: 12 
                    }}>
                        <Image
                            src={qrPreview}
                            alt="VietQR Preview"
                            width={150}
                            height={150}
                            style={{
                                objectFit: 'contain',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                                backgroundColor: '#ffffff'
                            }}
                        />
                    </div>
                    <Space size="small">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={removeQR}
                        >
                            Xóa QR Code
                        </Button>
                        <Button
                            size="small"
                            icon={<BankOutlined />}
                            onClick={() => {
                                removeQR();
                                setAccountNo('');
                                setBankCode('');
                            }}
                        >
                            Tạo QR mới
                        </Button>
                    </Space>
                </div>
            ) : (
                <div
                    style={{
                        padding: 16,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 8,
                        backgroundColor: '#fafafa',
                        textAlign: 'left'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <QrcodeOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 8 }} />
                        <Title level={5} style={{ margin: '0 0 4px 0', fontSize: 14 }}>
                            Tạo QR Code từ thông tin ngân hàng
                        </Title>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            Nhập thông tin ngân hàng để tạo QR code tự động
                        </Text>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                                Số tài khoản <span style={{ color: '#ff4d4f' }}>*</span>
                            </Text>
                            <Input
                                placeholder="Nhập số tài khoản"
                                prefix={<BankOutlined style={{ color: '#bfbfbf' }} />}
                                value={accountNo}
                                onChange={(e) => setAccountNo(e.target.value)}
                                onPressEnter={generateQRFromBankInfo}
                                style={{ height: '40px' }}
                            />
                        </div>

                        <div>
                            <Text strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                                Ngân hàng <span style={{ color: '#ff4d4f' }}>*</span>
                            </Text>
                            <Select
                                placeholder="Chọn ngân hàng"
                                loading={loadingBanks}
                                showSearch
                                value={bankCode}
                                onChange={setBankCode}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                style={{ width: '100%', height: '40px' }}
                                options={banks.map(bank => ({
                                    value: bank.code || bank.short_name,
                                    label: `${bank.shortName || bank.name} (${bank.code})`
                                }))}
                            />
                        </div>

                        <Button
                            type="primary"
                            icon={<QrcodeOutlined />}
                            loading={generatingQR}
                            block
                            onClick={generateQRFromBankInfo}
                            style={{ backgroundColor: '#1A73E8', borderColor: '#1A73E8', marginTop: '4px', height: '40px' }}
                        >
                            {generatingQR ? 'Đang tạo QR...' : 'Tạo QR Code'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VietQRImageUpload;
