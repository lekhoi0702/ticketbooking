import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Space,
    Modal,
    Result,
    Spin,
    Divider,
    message ,
    Alert
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    SaveOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { useAuth } from '@context/AuthContext';
import { getImageUrl } from '@shared/utils/eventUtils';

// Hooks
import { useCreateEvent } from '@shared/hooks/useCreateEvent';
import { api } from '@services/api';

// Sub-components
import EventBasicInfo from '@features/organizer/components/EventBasicInfo';
import EventDateTime from '@features/organizer/components/EventDateTime';
import EventBannerUpload from '@features/organizer/components/EventBannerUpload';
import VietQRImageUpload from '@features/organizer/components/VietQRImageUpload';
import TicketConfig from '@features/organizer/components/TicketConfig';

const { Title, Text } = Typography;

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        loading,
        loadingData,
        error,
        success,
        categories,
        venues,
        venueTemplate,
        formData,
        bannerPreview,
        vietqrPreview,
        ticketTypes,
        fieldErrors,
        setError,
        setSuccess,
        handleInputChange,
        handleImageChange,
        handleVietQRImageChange,
        handleVietQRURLChange,
        handleVietQRBankInfoChange,
        removeBanner,
        removeVietQR,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        toggleAreaSelection,
        handleSubmit,
        setFormData,
        setTicketTypes,
        setBannerPreview,
        setVietqrPreview,
        setIsLoadingData
    } = useCreateEvent();

    const [eventRaw, setEventRaw] = useState(null);

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setIsLoadingData(true);
            const res = await api.getEvent(eventId);
            if (res.success) {
                const event = res.data;
                setEventRaw(event);

                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return '';
                    // Use local time for the date picker
                    const offset = d.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16); // e.g., "2023-10-27T10:00"
                    return localISOTime;
                };

                setFormData({
                    event_name: event.event_name,
                    description: event.description || '',
                    category_id: event.category_id,
                    venue_id: event.venue_id,
                    start_datetime: formatDate(event.start_datetime),
                    end_datetime: formatDate(event.end_datetime),
                    total_capacity: event.total_capacity || 0,
                    status: event.status,
                    is_featured: event.is_featured,
                    schedule: event.schedule || [],
                    manager_id: event.manager_id || user?.user_id || 1  // Ensure manager_id is set
                });

                if (event.banner_image_url) {
                    setBannerPreview(getImageUrl(event.banner_image_url));
                }

                if (event.qr_image_url) {
                    setVietqrPreview(getImageUrl(event.qr_image_url));
                }
                handleVietQRBankInfoChange({
                    bank_name: event.qr_bank_name || '',
                    account_number: event.qr_account_number || '',
                });

                let rawTicketTypes = event.ticket_types || [];
                if (rawTicketTypes && rawTicketTypes.length > 0) {
                    const enrichedTT = rawTicketTypes.map((tt) => {
                        const selectedSeatsRaw = tt.selected_seats || tt.SelectedSeats || [];
                        const matchedSeats = Array.isArray(selectedSeatsRaw)
                            ? selectedSeatsRaw.map((s) => ({
                                ...s,
                                seat_id: s.seat_id ?? s.SeatID,
                                area: s.area_name || s.area || s.Area || '',
                                area_name: s.area_name || s.area || s.Area || '',
                                seat_number: String(s.seat_number ?? s.SeatNumber ?? ''),
                                row_name: s.row_name || s.RowNumber || '',
                            }))
                            : [];

                        return {
                            ...tt,
                            id: tt.ticket_type_id, // Add id for UI keys
                            price: String(tt.price),
                            quantity: String(tt.quantity || matchedSeats.length),
                            sale_start_date: formatDate(tt.sale_start_date || tt.SaleStartDate),
                            sale_end_date: formatDate(tt.sale_end_date || tt.SaleEndDate),
                            selectedSeats: matchedSeats
                        };
                    });
                    setTicketTypes(enrichedTT);
                }
            } else {
                setError('Không tìm thấy thông tin sự kiện');
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Lỗi khi tải thông tin sự kiện: ' + err.message);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleUpdate = async (e) => {
        await handleSubmit(e, eventId);
    };



    if (loadingData) {
        return <LoadingSpinner tip="Đang tải dữ liệu sự kiện..." />;
    }

    const isReadOnly = ['REJECTED', 'ONGOING', 'COMPLETED'].includes(formData.status);

    return (
        <>
            <Spin spinning={loading} fullscreen tip="Đang xử lý..." />
            <div>


                {isReadOnly && (
                    <Alert
                        message="Chế độ xem (Chỉ đọc)"
                        description={`Sự kiện hiện đã ${formData.status === 'REJECTED' ? 'bị từ chối' : formData.status === 'ONGOING' ? 'bắt đầu' : 'kết thúc'}.`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <form onSubmit={handleUpdate}>
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                                <Card title="1. Thông tin chung" headStyle={{ background: '#fafafa' }}>
                                    <EventBasicInfo
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        categories={categories}
                                        venues={venues}
                                        disabled={isReadOnly || loading}
                                        fieldErrors={fieldErrors}
                                    />
                                </Card>

                                <Card title="2. Thời gian diễn ra" headStyle={{ background: '#fafafa' }}>
                                    <EventDateTime
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        existingSchedule={formData.schedule || []}
                                        disabled={isReadOnly || loading}
                                        fieldErrors={fieldErrors}
                                    />
                                </Card>

                                <Card title="3. Cấu hình loại vé" headStyle={{ background: '#fafafa' }}>
                                    <TicketConfig
                                        ticketTypes={ticketTypes}
                                        handleTicketTypeChange={handleTicketTypeChange}
                                        addTicketType={addTicketType}
                                        removeTicketType={removeTicketType}
                                        venueTemplate={venueTemplate}
                                        toggleSeatSelection={toggleSeatSelection}
                                        toggleAreaSelection={toggleAreaSelection}
                                        isEdit={true}
                                        eventStartDate={formData.start_datetime}
                                        eventEndDate={formData.end_datetime}
                                        disabled={isReadOnly || loading}
                                        fieldErrors={fieldErrors}
                                    />
                                    <Alert
                                        message="Lưu ý: Hạn chế thay đổi số lượng ghế khi vé đã bắt đầu mở bán."
                                        type="info"
                                        showIcon
                                        style={{ marginTop: 20 }}
                                    />
                                </Card>

                            </Space>
                        </Col>

                        <Col xs={24} lg={8}>
                            
                                <Card title="Quản lý sự kiện" headStyle={{ background: '#fafafa' }}>
                                    <EventBannerUpload
                                        bannerPreview={bannerPreview}
                                        handleImageChange={handleImageChange}
                                        removeBanner={removeBanner}
                                        disabled={isReadOnly || loading}
                                        fieldErrors={fieldErrors}
                                    />

                                    <Divider style={{ margin: '24px 0' }} />

                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                                            Ảnh QR Code VietQR
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                            Upload ảnh QR code VietQR của bạn để khách hàng có thể thanh toán qua VietQR.
                                        </Text>
                                    </div>
                                    <VietQRImageUpload
                                        qrPreview={vietqrPreview}
                                        handleURLChange={handleVietQRURLChange}
                                        removeQR={removeVietQR}
                                        onBankInfoChange={handleVietQRBankInfoChange}
                                    />

                                    <Divider style={{ margin: '24px 0' }} />

                                    <Space orientation="vertical" style={{ width: '100%' }} size={12}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            loading={loading}
                                            disabled={isReadOnly}
                                            icon={<CheckCircleOutlined />}
                                            style={{ height: 48, fontWeight: 600 }}
                                        >
                                            Xác nhận
                                        </Button>
                                        <Button
                                            block
                                            size="large"
                                            onClick={() => navigate('/organizer/events')}
                                            disabled={loading}
                                        >
                                            Quay lại
                                        </Button>


                                    </Space>
                                </Card>
                            
                        </Col>
                    </Row>
                </form>

                <Modal
                    open={success}
                    footer={null}
                    closable={false}
                    centered
                >
                    <Result
                        status="success"
                        title="Cập nhật thành công!"
                        subTitle="Thông tin sự kiện của bạn đã được thay đổi và đồng bộ vào hệ thống."
                        extra={[
                            <Button type="primary" key="home" onClick={() => navigate('/organizer/events')}>
                                Quay về danh sách
                            </Button>
                        ]}
                    />
                </Modal>
            </div>
        </>
    );
};

export default EditEvent;

