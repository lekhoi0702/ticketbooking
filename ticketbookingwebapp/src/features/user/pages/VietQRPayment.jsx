import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaClock, FaCopy, FaChevronLeft } from 'react-icons/fa';
import { paymentApi } from '@services/api/payment';
import { formatCurrency } from '@shared/utils/eventUtils';
import { QRCodeSVG } from 'qrcode.react';

const VietQRPayment = () => {
    const { paymentCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [qrData, setQrData] = useState(location.state?.qrData || null);
    const [checking, setChecking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [banks, setBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [copiedField, setCopiedField] = useState(null);
    const intervalRef = useRef(null);
    const checkIntervalRef = useRef(null);

    useEffect(() => {
        // Fetch banks list
        const fetchBanks = async () => {
            try {
                setLoadingBanks(true);
                const result = await paymentApi.getVietQRBanks();
                if (result.success) {
                    setBanks(result.banks || []);
                }
            } catch (err) {
                console.error('Error fetching banks:', err);
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();

        // If no qrData in state, fetch it
        if (!qrData && paymentCode) {
            setError('Vui lòng quay lại trang thanh toán');
        }

        // Start countdown timer
        if (qrData?.expires_in) {
            setTimeLeft(qrData.expires_in);
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Auto-check payment status every 5 seconds
        if (paymentCode && paymentStatus === 'PENDING') {
            checkIntervalRef.current = setInterval(() => {
                checkPaymentStatus();
            }, 5000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentCode, qrData]);

    const checkPaymentStatus = useCallback(async () => {
        if (!paymentCode || checking) return;

        try {
            setChecking(true);
            const response = await paymentApi.checkVietQRStatus(paymentCode);
            
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
    }, [paymentCode, checking]);

    const verifyPayment = async () => {
        try {
            const response = await paymentApi.verifyVietQRPayment(paymentCode);
            
            if (response.success) {
                setTimeout(() => {
                    navigate(`/order-success/${response.data.order_code}`);
                }, 2000);
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
            setError('Có lỗi xảy ra khi xác thực thanh toán');
        }
    };

    const handleManualCheck = () => {
        checkPaymentStatus();
    };

    const handleCancel = () => {
        navigate('/');
    };

    const handleCopy = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!qrData) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body className="py-5">
                        <FaTimesCircle className="text-danger" size={60} />
                        <h4 className="mt-3">Không tìm thấy thông tin thanh toán</h4>
                        <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
                            Về trang chủ
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const accountNo = qrData.qr_data?.accountNo || '970422';
    const accountName = qrData.qr_data?.accountName || 'TICKET BOOKING';
    const addInfo = qrData.qr_data?.addInfo || `Thanh toan don hang ${qrData.order_code}`;
    const bankName = qrData.qr_data?.bankName || 'Ngân hàng';

    return (
        <div style={{ 
            backgroundColor: '#ffffff', 
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <Container style={{ maxWidth: '420px', margin: '0 auto', padding: '20px 16px' }}>
                {/* Back Button */}
                <Button
                    variant="link"
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '8px 0',
                        color: '#005AAA',
                        textDecoration: 'none',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: 'none',
                        background: 'none'
                    }}
                >
                    <FaChevronLeft style={{ marginRight: '4px', fontSize: '12px' }} />
                    Quay lại
                </Button>

                {/* Main Card */}
                <Card className="border-0" style={{ borderRadius: '0', boxShadow: 'none' }}>
                    <Card.Body className="p-0">
                        {paymentStatus === 'SUCCESS' ? (
                            <div className="text-center" style={{ padding: '60px 20px' }}>
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
                            </div>
                        ) : (
                            <>
                                {/* VietQR Header - Official Style */}
                                <div style={{
                                    backgroundColor: '#005AAA',
                                    padding: '28px 20px',
                                    textAlign: 'center',
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    {/* VietQR Logo */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <FaQrcode style={{ color: '#005AAA', fontSize: '22px' }} />
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#005AAA',
                                                letterSpacing: '0.3px'
                                            }}>
                                                VietQR
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-white fw-bold mb-1" style={{ 
                                        fontSize: '20px',
                                        marginTop: '4px',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        Thanh toán bằng QR Code
                                    </h2>
                                    <p className="text-white mb-0" style={{ 
                                        fontSize: '13px',
                                        opacity: 0.9,
                                        fontWeight: '400'
                                    }}>
                                        Quét mã QR bằng ứng dụng ngân hàng
                                    </p>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                                    {/* Amount Display */}
                                    <div style={{
                                        backgroundColor: '#F5F5F5',
                                        borderRadius: '8px',
                                        padding: '18px',
                                        marginBottom: '20px',
                                        textAlign: 'center',
                                        border: '1px solid #E0E0E0'
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#757575',
                                            marginBottom: '6px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Số tiền cần thanh toán
                                        </div>
                                        <div style={{
                                            fontSize: '32px',
                                            fontWeight: '700',
                                            color: '#005AAA',
                                            lineHeight: '1.2'
                                        }}>
                                            {formatCurrency(qrData.amount)}
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="text-center mb-4">
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '20px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                        }}>
                                            {qrData.vietqr_image_url ? (
                                                <img
                                                    src={qrData.vietqr_image_url.startsWith('http') 
                                                        ? qrData.vietqr_image_url 
                                                        : `http://127.0.0.1:5000${qrData.vietqr_image_url}`}
                                                    alt="VietQR Code"
                                                    style={{
                                                        width: '220px',
                                                        height: '220px',
                                                        objectFit: 'contain',
                                                        display: 'block'
                                                    }}
                                                />
                                            ) : (
                                                <QRCodeSVG
                                                    value={qrData.qr_content || 'Mock QR Code'}
                                                    size={220}
                                                    level="H"
                                                    includeMargin={true}
                                                    bgColor="#FFFFFF"
                                                    fgColor="#000000"
                                                />
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '11px',
                                            color: '#9E9E9E',
                                            marginTop: '10px',
                                            marginBottom: 0
                                        }}>
                                            Quét mã QR bằng ứng dụng ngân hàng
                                        </p>
                                    </div>

                                    {/* Account Information */}
                                    <div style={{
                                        backgroundColor: '#FAFAFA',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '20px',
                                        border: '1px solid #E0E0E0'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#212121',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid #E0E0E0'
                                        }}>
                                            Thông tin chuyển khoản
                                        </div>

                                        {/* Bank Name */}
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#757575',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                Ngân hàng
                                            </div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#212121'
                                            }}>
                                                {bankName}
                                            </div>
                                        </div>

                                        {/* Account Number */}
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#757575',
                                                marginBottom: '4px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <span>Số tài khoản</span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleCopy(accountNo, 'accountNo')}
                                                    style={{
                                                        padding: 0,
                                                        fontSize: '11px',
                                                        color: '#005AAA',
                                                        textDecoration: 'none',
                                                        height: 'auto',
                                                        minWidth: 'auto',
                                                        border: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {copiedField === 'accountNo' ? (
                                                        <><FaCheckCircle style={{ marginRight: '4px', fontSize: '10px' }} />Đã copy</>
                                                    ) : (
                                                        <><FaCopy style={{ marginRight: '4px', fontSize: '10px' }} />Copy</>
                                                    )}
                                                </Button>
                                            </div>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#005AAA',
                                                fontFamily: 'monospace',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {accountNo}
                                            </div>
                                        </div>

                                        {/* Account Name */}
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#757575',
                                                marginBottom: '4px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <span>Tên chủ tài khoản</span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleCopy(accountName, 'accountName')}
                                                    style={{
                                                        padding: 0,
                                                        fontSize: '11px',
                                                        color: '#005AAA',
                                                        textDecoration: 'none',
                                                        height: 'auto',
                                                        minWidth: 'auto',
                                                        border: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {copiedField === 'accountName' ? (
                                                        <><FaCheckCircle style={{ marginRight: '4px', fontSize: '10px' }} />Đã copy</>
                                                    ) : (
                                                        <><FaCopy style={{ marginRight: '4px', fontSize: '10px' }} />Copy</>
                                                    )}
                                                </Button>
                                            </div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#212121',
                                                wordBreak: 'break-word'
                                            }}>
                                                {accountName}
                                            </div>
                                        </div>

                                        {/* Transfer Content */}
                                        <div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#757575',
                                                marginBottom: '4px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <span>Nội dung chuyển khoản</span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleCopy(addInfo, 'addInfo')}
                                                    style={{
                                                        padding: 0,
                                                        fontSize: '11px',
                                                        color: '#005AAA',
                                                        textDecoration: 'none',
                                                        height: 'auto',
                                                        minWidth: 'auto',
                                                        border: 'none',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {copiedField === 'addInfo' ? (
                                                        <><FaCheckCircle style={{ marginRight: '4px', fontSize: '10px' }} />Đã copy</>
                                                    ) : (
                                                        <><FaCopy style={{ marginRight: '4px', fontSize: '10px' }} />Copy</>
                                                    )}
                                                </Button>
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#212121',
                                                wordBreak: 'break-word',
                                                padding: '10px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '6px',
                                                border: '1px solid #E0E0E0',
                                                fontFamily: 'monospace',
                                                lineHeight: '1.5'
                                            }}>
                                                {addInfo}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 14px',
                                        backgroundColor: timeLeft < 300 ? '#FFF3E0' : '#F5F5F5',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        border: `1px solid ${timeLeft < 300 ? '#FF9800' : '#E0E0E0'}`
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: timeLeft < 300 ? '#E65100' : '#757575'
                                        }}>
                                            <FaClock style={{ fontSize: '14px' }} />
                                            Thời gian còn lại
                                        </div>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: timeLeft < 300 ? '#D84315' : '#005AAA',
                                            fontFamily: 'monospace',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {formatTime(timeLeft)}
                                        </div>
                                    </div>

                                    {/* Supported Banks */}
                                    {banks.length > 0 && (
                                        <div style={{
                                            backgroundColor: '#FAFAFA',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            marginBottom: '20px',
                                            border: '1px solid #E0E0E0'
                                        }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#212121',
                                                marginBottom: '12px',
                                                paddingBottom: '12px',
                                                borderBottom: '1px solid #E0E0E0'
                                            }}>
                                                Ngân hàng hỗ trợ VietQR
                                            </div>
                                            {loadingBanks ? (
                                                <div className="text-center py-3">
                                                    <Spinner animation="border" size="sm" className="me-2" style={{ color: '#005AAA' }} />
                                                    <span style={{ fontSize: '12px', color: '#757575' }}>
                                                        Đang tải...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
                                                    gap: '8px',
                                                    maxHeight: '160px',
                                                    overflowY: 'auto',
                                                    padding: '4px'
                                                }}>
                                                    {banks.map((bank) => (
                                                        <div
                                                            key={bank.id}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                padding: '8px 6px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#ffffff',
                                                                border: '1px solid #E0E0E0',
                                                                transition: 'all 0.2s',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.borderColor = '#005AAA';
                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 90, 170, 0.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.borderColor = '#E0E0E0';
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }}
                                                            title={bank.name}
                                                        >
                                                            <img
                                                                src={bank.logo}
                                                                alt={bank.shortName || bank.name}
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    objectFit: 'contain',
                                                                    marginBottom: '4px'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentElement;
                                                                    if (parent && !parent.querySelector('.bank-fallback')) {
                                                                        const fallback = document.createElement('div');
                                                                        fallback.className = 'bank-fallback';
                                                                        fallback.style.cssText = 'font-size: 9px; text-align: center; color: #757575; line-height: 1.2;';
                                                                        fallback.textContent = bank.shortName || bank.code;
                                                                        parent.appendChild(fallback);
                                                                    }
                                                                }}
                                                            />
                                                            <span style={{
                                                                fontSize: '9px',
                                                                color: '#757575',
                                                                textAlign: 'center',
                                                                lineHeight: '1.2',
                                                                wordBreak: 'break-word',
                                                                maxWidth: '100%',
                                                                fontWeight: '500'
                                                            }}>
                                                                {bank.shortName || bank.code}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    <div style={{
                                        backgroundColor: '#E3F2FD',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '20px',
                                        border: '1px solid #BBDEFB'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#1976D2',
                                            marginBottom: '10px'
                                        }}>
                                            📱 Hướng dẫn thanh toán
                                        </div>
                                        <ol style={{
                                            margin: 0,
                                            paddingLeft: '18px',
                                            fontSize: '12px',
                                            color: '#1976D2',
                                            lineHeight: '1.8',
                                            fontWeight: '400'
                                        }}>
                                            <li style={{ marginBottom: '6px' }}>
                                                Mở ứng dụng ngân hàng trên điện thoại
                                            </li>
                                            <li style={{ marginBottom: '6px' }}>
                                                Chọn tính năng <strong>"Quét QR"</strong> hoặc <strong>"Thanh toán QR"</strong>
                                            </li>
                                            <li style={{ marginBottom: '6px' }}>
                                                Quét mã QR ở trên hoặc nhập thông tin chuyển khoản
                                            </li>
                                            <li>
                                                Kiểm tra thông tin và xác nhận thanh toán
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Status Check */}
                                    {checking && (
                                        <div className="text-center mb-3" style={{
                                            padding: '12px',
                                            backgroundColor: '#F5F5F5',
                                            borderRadius: '8px',
                                            border: '1px solid #E0E0E0'
                                        }}>
                                            <Spinner animation="border" size="sm" className="me-2" style={{ color: '#005AAA' }} />
                                            <span style={{ color: '#757575', fontSize: '13px', fontWeight: '500' }}>
                                                Đang kiểm tra thanh toán...
                                            </span>
                                        </div>
                                    )}

                                    {error && (
                                        <Alert variant="danger" className="mb-3" style={{
                                            borderRadius: '8px',
                                            border: '1px solid #EF5350',
                                            backgroundColor: '#FFEBEE',
                                            color: '#C62828',
                                            fontSize: '13px'
                                        }}>
                                            {error}
                                        </Alert>
                                    )}

                                    {/* Actions */}
                                    <div className="d-grid gap-2">
                                        <Button
                                            style={{
                                                backgroundColor: '#005AAA',
                                                borderColor: '#005AAA',
                                                borderRadius: '8px',
                                                padding: '14px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                            size="lg"
                                            onClick={handleManualCheck}
                                            disabled={checking || timeLeft === 0}
                                            onMouseEnter={(e) => {
                                                if (!checking && timeLeft > 0) {
                                                    e.target.style.backgroundColor = '#004080';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!checking && timeLeft > 0) {
                                                    e.target.style.backgroundColor = '#005AAA';
                                                }
                                            }}
                                        >
                                            {checking ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Đang kiểm tra...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="me-2" />
                                                    Tôi đã thanh toán
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleCancel}
                                            style={{
                                                borderRadius: '8px',
                                                padding: '12px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                borderColor: '#E0E0E0',
                                                color: '#757575'
                                            }}
                                        >
                                            Hủy thanh toán
                                        </Button>
                                    </div>

                                    {timeLeft === 0 && (
                                        <Alert variant="warning" className="mt-3" style={{
                                            borderRadius: '8px',
                                            backgroundColor: '#FFF3E0',
                                            border: '1px solid #FF9800',
                                            color: '#E65100',
                                            fontSize: '13px'
                                        }}>
                                            ⚠️ Mã QR đã hết hạn. Vui lòng tạo đơn hàng mới.
                                        </Alert>
                                    )}

                                    {/* Footer Note */}
                                    <div className="text-center mt-4" style={{
                                        fontSize: '11px',
                                        color: '#9E9E9E',
                                        lineHeight: '1.6'
                                    }}>
                                        <div style={{ marginBottom: '6px' }}>
                                            💡 <strong style={{ color: '#757575' }}>Lưu ý:</strong> Giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận
                                        </div>
                                        <div>
                                            Mã đơn hàng: <strong style={{ color: '#005AAA' }}>{qrData.order_code}</strong>
                                        </div>
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E0E0E0' }}>
                                            <span style={{ fontSize: '10px', color: '#BDBDBD' }}>
                                                Powered by <strong style={{ color: '#005AAA' }}>VietQR</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default VietQRPayment;
