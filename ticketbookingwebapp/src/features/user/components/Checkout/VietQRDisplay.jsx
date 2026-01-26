import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle } from 'react-icons/fa';
import { paymentApi } from '@services/api/payment';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '@shared/utils/eventUtils';

const VietQRDisplay = ({ qrData, onPaymentSuccess }) => {
    const [checking, setChecking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const checkIntervalRef = useRef(null);

    useEffect(() => {
        // Auto-check payment status every 5 seconds
        if (qrData?.payment_code && paymentStatus === 'PENDING') {
            checkIntervalRef.current = setInterval(() => {
                checkPaymentStatus();
            }, 5000);
        }

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrData]);

    const checkPaymentStatus = useCallback(async () => {
        if (!qrData?.payment_code || checking) return;

        try {
            setChecking(true);
            const response = await paymentApi.checkVietQRStatus(qrData.payment_code);
            
            if (response.success) {
                const status = response.data.payment_status;
                setPaymentStatus(status);
                
                if (status === 'SUCCESS') {
                    await verifyPayment();
                }
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
        } finally {
            setChecking(false);
        }
    }, [qrData?.payment_code, checking]);

    const verifyPayment = async () => {
        try {
            const response = await paymentApi.verifyVietQRPayment(qrData.payment_code);
            
            if (response.success && onPaymentSuccess) {
                onPaymentSuccess(response.data.order_code);
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
        }
    };

    if (!qrData) return null;

    if (paymentStatus === 'SUCCESS') {
        return (
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '8px' }}>
                <Card.Body className="text-center p-5">
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        backgroundColor: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <FaCheckCircle style={{ color: '#4CAF50', fontSize: '40px' }} />
                    </div>
                    <h3 className="mb-3 fw-bold" style={{ color: '#212121', fontSize: '22px', fontWeight: '600' }}>
                        Thanh toán thành công!
                    </h3>
                    <p style={{ color: '#757575', fontSize: '14px', marginBottom: 0 }}>
                        Đang chuyển hướng...
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            {/* VietQR Header */}
            <div style={{
                backgroundColor: '#005AAA',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px 8px 0 0'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaQrcode style={{ color: '#005AAA', fontSize: '18px' }} />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#005AAA',
                            letterSpacing: '0.3px'
                        }}>
                            VietQR
                        </span>
                    </div>
                </div>
                
                <h4 className="text-white fw-bold mb-0" style={{ 
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Quét mã QR để thanh toán
                </h4>
            </div>

            <Card.Body style={{ padding: '30px', backgroundColor: '#ffffff', textAlign: 'center' }}>
                {/* QR Code Section */}
                <div style={{
                    display: 'inline-block',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '16px'
                }}>
                    {qrData.qr_image_url ? (
                        <img
                            src={getImageUrl(qrData.qr_image_url)}
                            alt="VietQR Code"
                            style={{
                                width: '280px',
                                height: '280px',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                    ) : (
                        <QRCodeSVG
                            value={qrData.qr_content || 'Mock QR Code'}
                            size={280}
                            level="H"
                            includeMargin={true}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                        />
                    )}
                </div>
                
                <p style={{
                    fontSize: '12px',
                    color: '#757575',
                    marginBottom: 0
                }}>
                    Mở ứng dụng ngân hàng và quét mã QR ở trên
                </p>
            </Card.Body>
        </Card>
    );
};

export default VietQRDisplay;
