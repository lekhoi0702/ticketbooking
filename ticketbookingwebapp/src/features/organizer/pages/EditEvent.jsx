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
    message,
    Affix,
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

// Hooks
import { useCreateEvent } from '@shared/hooks/useCreateEvent';
import { api } from '@services/api';

// Sub-components
import EventBasicInfo from '@features/organizer/components/EventBasicInfo';
import EventDateTime from '@features/organizer/components/EventDateTime';
import EventBannerUpload from '@features/organizer/components/EventBannerUpload';
import TicketConfig from '@features/organizer/components/TicketConfig';

const { Title, Text } = Typography;

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
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
        ticketTypes,
        setError,
        setSuccess,
        handleInputChange,
        handleImageChange,
        removeBanner,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        toggleAreaSelection,
        handleSubmit,
        setFormData,
        setTicketTypes,
        setBannerPreview,
        setIsLoadingData
    } = useCreateEvent();

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

                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    // Use local time for the date picker
                    const offset = d.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16).replace('T', ' ');
                    return localISOTime;
                };

                setFormData({
                    event_name: event.event_name,
                    description: event.description || '',
                    category_id: event.category_id,
                    venue_id: event.venue_id,
                    start_datetime: event.start_datetime ? event.start_datetime.replace('T', ' ').slice(0, 19) : '',
                    end_datetime: event.end_datetime ? event.end_datetime.replace('T', ' ').slice(0, 19) : '',
                    sale_start_datetime: event.sale_start_datetime ? event.sale_start_datetime.replace('T', ' ').slice(0, 19) : '',
                    sale_end_datetime: event.sale_end_datetime ? event.sale_end_datetime.replace('T', ' ').slice(0, 19) : '',
                    total_capacity: event.total_capacity,
                    status: event.status,
                    is_featured: event.is_featured,
                    manager_id: event.manager_id
                });

                if (event.banner_image_url) {
                    setBannerPreview(event.banner_image_url.startsWith('http')
                        ? event.banner_image_url
                        : `http://127.0.0.1:5000${event.banner_image_url}`);
                }

                const ttRes = await api.getTicketTypes(eventId);
                if (ttRes.success) {
                    const enrichedTT = await Promise.all(ttRes.data.map(async (tt) => {
                        const seatsRes = await api.getSeatsByTicketType(tt.ticket_type_id);
                        return {
                            ...tt,
                            price: String(tt.price),
                            quantity: String(tt.quantity),
                            selectedSeats: seatsRes.success ? seatsRes.data.map(s => ({
                                ...s,
                                area: s.area_name
                            })) : []
                        };
                    }));
                    setTicketTypes(enrichedTT);
                }
            } else {
                setError('Không tìm thấy thông tin sự kiện');
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Lỗi khi tải thông tin sự kiện');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleUpdate = async (e) => {
        await handleSubmit(e, eventId);
    };

    const handleDeleteRequest = () => {
        Modal.confirm({
            title: 'Xác nhận yêu cầu xóa',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: (
                <div>
                    <p>Hệ thống sẽ gửi yêu cầu xóa sự kiện <strong>{formData.event_name}</strong> tới quản trị viên.</p>
                    <p>Bạn sẽ không thể sửa đổi trong thời gian chờ phê duyệt xóa.</p>
                </div>
            ),
            okText: 'Xác nhận gửi',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    const formDataToSend = new FormData();
                    formDataToSend.append('status', 'PENDING_DELETION');
                    const res = await api.updateEvent(eventId, formDataToSend);
                    if (res.success) {
                        setSuccess(true);
                    } else {
                        message.error(res.message || 'Không thể gửi yêu cầu xóa');
                    }
                } catch (err) {
                    message.error('Lỗi khi gửi yêu cầu xóa');
                }
            }
        });
    };

    if (loadingData) {
        return <LoadingSpinner tip="Đang tải dữ liệu sự kiện..." />;
    }

    const isReadOnly = ['REJECTED', 'ONGOING', 'COMPLETED', 'PENDING_DELETION'].includes(formData.status);

    return (
        <>
            <Spin spinning={loading} fullscreen tip="Đang xử lý..." />
            <div>
                {/* Header Area */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginRight: 16 }}
                        disabled={loading}
                    />
                    <Title level={4} style={{ margin: 0 }}>Chỉnh sửa sự kiện</Title>
                </div>

                {isReadOnly && (
                    <Alert
                        message={formData.status === 'PENDING_DELETION' ? "Hệ thống đang xử lý yêu cầu xóa" : "Chế độ xem (Chỉ đọc)"}
                        description={
                            formData.status === 'PENDING_DELETION'
                                ? "Sự kiện này đang chờ Admin phê duyệt yêu cầu xóa. Bạn không thể thay đổi thông tin."
                                : `Sự kiện hiện đã ${formData.status === 'REJECTED' ? 'bị từ chối' : formData.status === 'ONGOING' ? 'bắt đầu' : 'kết thúc'}.`
                        }
                        type={formData.status === 'PENDING_DELETION' ? "info" : "warning"}
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <form onSubmit={handleUpdate}>
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                <Card title="1. Thông tin chung" headStyle={{ background: '#fafafa' }}>
                                    <EventBasicInfo
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        categories={categories}
                                        venues={venues}
                                        disabled={isReadOnly || loading}
                                    />
                                </Card>

                                <Card title="2. Thời gian diễn ra" headStyle={{ background: '#fafafa' }}>
                                    <EventDateTime
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        disabled={isReadOnly || loading}
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
                                        disabled={isReadOnly || loading}
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
                            <Affix offsetTop={80}>
                                <Card title="Quản lý sự kiện" headStyle={{ background: '#fafafa' }}>
                                    <EventBannerUpload
                                        bannerPreview={bannerPreview}
                                        handleImageChange={handleImageChange}
                                        removeBanner={removeBanner}
                                        disabled={isReadOnly || loading}
                                    />

                                    <Divider style={{ margin: '24px 0' }} />

                                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            loading={loading}
                                            disabled={isReadOnly}
                                            icon={<SaveOutlined />}
                                            style={{ height: 48, fontWeight: 600 }}
                                        >
                                            Lưu thay đổi
                                        </Button>
                                        <Button
                                            block
                                            size="large"
                                            onClick={() => navigate('/organizer/events')}
                                            disabled={loading}
                                        >
                                            Quay lại
                                        </Button>

                                        {!isReadOnly && (
                                            <Button
                                                type="text"
                                                danger
                                                block
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteRequest}
                                                style={{ marginTop: 8 }}
                                                disabled={loading}
                                            >
                                                Yêu cầu xóa sự kiện
                                            </Button>
                                        )}
                                    </Space>
                                </Card>
                            </Affix>
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
