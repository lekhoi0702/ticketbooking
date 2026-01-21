import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Space,
    Steps,
    Modal,
    Result,
    Spin,
    Divider,
    message,
    Affix,
    Skeleton
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    EditOutlined,
    CalendarOutlined,
    FileTextOutlined,
    AppstoreAddOutlined,
    CloudUploadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';

// Hooks
import { useCreateEvent } from '@shared/hooks/useCreateEvent';

// Sub-components
import EventBasicInfo from '@features/organizer/components/EventBasicInfo';
import EventDateTime from '@features/organizer/components/EventDateTime';
import EventBannerUpload from '@features/organizer/components/EventBannerUpload';
import VietQRImageUpload from '@features/organizer/components/VietQRImageUpload';
import TicketConfig from '@features/organizer/components/TicketConfig';
import ExtraShowtimesConfig from '@features/organizer/components/ExtraShowtimesConfig';

const { Title, Text } = Typography;

const CreateEvent = () => {
    const navigate = useNavigate();
    const {
        loading,
        loadingData,
        error,
        success,
        fieldErrors,
        categories,
        venues,
        venueTemplate,
        formData,
        bannerPreview,
        vietqrPreview,
        ticketTypes,
        currentStep,
        setError,
        handleInputChange,
        handleImageChange,
        handleVietQRImageChange,
        handleVietQRURLChange,
        removeVietQR,
        removeBanner,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        addShowtime,
        removeShowtime,
        updateShowtime,
        toggleAreaSelection,
        handleSubmit
    } = useCreateEvent();

    if (loadingData) {
        return (
            <div>
                {/* Header Skeleton */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
                    <Skeleton.Button active size="default" style={{ width: 40, marginRight: 16 }} />
                    <Skeleton.Input active size="default" style={{ width: 200 }} />
                </div>

                {/* Steps Skeleton */}
                <Card style={{ marginBottom: 24 }}>
                    <Skeleton active paragraph={{ rows: 1 }} />
                </Card>

                {/* Form Content Skeleton */}
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />}>
                                <Skeleton active paragraph={{ rows: 4 }} />
                            </Card>
                            <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />}>
                                <Skeleton active paragraph={{ rows: 3 }} />
                            </Card>
                            <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />}>
                                <Skeleton active paragraph={{ rows: 5 }} />
                            </Card>
                        </Space>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />}>
                            <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                            <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 24 }} />
                            <Skeleton.Button active block size="large" style={{ marginTop: 12 }} />
                            <Skeleton.Button active block size="large" style={{ marginTop: 12 }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    return (
        <>
            <Spin spinning={loading} fullscreen tip="Đang tạo sự kiện..." />
            <div style={{ paddingTop: 0 }}>


                {/* Steps Progress */}
                <Card style={{ marginBottom: 24 }}>
                    <Steps
                        current={currentStep}
                        items={[
                            { title: 'Thông tin cơ bản', icon: <FileTextOutlined /> },
                            { title: 'Thời gian', icon: <CalendarOutlined /> },
                            { title: 'Vé & Sơ đồ', icon: <AppstoreAddOutlined /> },
                            { title: 'Banner & Hoàn tất', icon: <CloudUploadOutlined /> }
                        ]}
                    />
                </Card>

                <form onSubmit={handleSubmit}>
                    <Row gutter={24}>
                        {/* Main Form Content */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                {/* Section 1: Basic Info */}
                                <Card title="1. Thông tin chung" headStyle={{ background: '#fafafa' }}>
                                    <EventBasicInfo
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        categories={categories}
                                        venues={venues}
                                        fieldErrors={fieldErrors}
                                        disabled={loading}
                                    />
                                </Card>

                                {/* Section 2: Date Time */}
                                <Card title="2. Thời gian diễn ra" headStyle={{ background: '#fafafa' }}>
                                    <EventDateTime
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        fieldErrors={fieldErrors}
                                        disabled={loading}
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
                                        selectedVenueId={formData.venue_id}
                                        fieldErrors={fieldErrors}
                                        disabled={loading}
                                    />
                                </Card>

                                <Card title="4. Suất diễn bổ sung (Nâng cao)" headStyle={{ background: '#fafafa' }}>
                                    <ExtraShowtimesConfig
                                        formData={formData}
                                        addShowtime={addShowtime}
                                        removeShowtime={removeShowtime}
                                        updateShowtime={updateShowtime}
                                        venues={venues}
                                        fieldErrors={fieldErrors}
                                        disabled={loading}
                                    />
                                </Card>

                                <Card title="5. Ảnh QR Code VietQR (Tùy chọn)" headStyle={{ background: '#fafafa' }}>
                                    <div style={{ marginBottom: 16 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Upload ảnh QR code VietQR của bạn để khách hàng có thể thanh toán qua VietQR. 
                                            Nếu không upload, hệ thống sẽ tự động tạo QR code.
                                        </Text>
                                    </div>
                                    <VietQRImageUpload
                                        qrPreview={vietqrPreview}
                                        handleImageChange={handleVietQRImageChange}
                                        handleURLChange={handleVietQRURLChange}
                                        removeQR={removeVietQR}
                                    />
                                </Card>
                            </Space>
                        </Col>

                        {/* Sticky Sidebar */}
                        <Col xs={24} lg={8}>
                            <Affix offsetTop={80}>
                                <Card title="Ảnh bìa & Hoàn tất" headStyle={{ background: '#fafafa' }}>
                                    <EventBannerUpload
                                        bannerPreview={bannerPreview}
                                        handleImageChange={handleImageChange}
                                        removeBanner={removeBanner}
                                        disabled={loading}
                                    />

                                    <Divider style={{ margin: '24px 0' }} />

                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
                                        Bằng cách nhấn xác nhận, bạn đồng ý với các điều khoản dành cho nhà tổ chức. Sự kiện sẽ ở trạng thái chờ duyệt.
                                    </Text>

                                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            loading={loading}
                                            icon={<CheckCircleOutlined />}
                                            style={{ height: 48, fontWeight: 600 }}
                                        >
                                            Xác nhận tạo
                                        </Button>
                                        <Button
                                            block
                                            size="large"
                                            onClick={() => navigate('/organizer/events')}
                                            disabled={loading}
                                        >
                                            Hủy bỏ
                                        </Button>
                                    </Space>
                                </Card>
                            </Affix>
                        </Col>
                    </Row>
                </form>

                {/* Success Modal */}
                <Modal
                    open={success}
                    footer={null}
                    closable={false}
                    centered
                >
                    <Result
                        status="success"
                        title="Khởi tạo thành công!"
                        subTitle="Sự kiện và cấu hình sơ đồ ghế của bạn đã được nhận. Vui lòng chờ Admin phê duyệt để hiển thị công khai."
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

export default CreateEvent;
