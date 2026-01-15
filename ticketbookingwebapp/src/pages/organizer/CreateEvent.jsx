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
    Affix
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    EditOutlined,
    CalendarOutlined,
    FileTextOutlined,
    AppstoreAddOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';

// Hooks
import { useCreateEvent } from '../../hooks/useCreateEvent';

// Sub-components
import EventBasicInfo from '../../components/Organizer/EventBasicInfo';
import EventDateTime from '../../components/Organizer/EventDateTime';
import EventBannerUpload from '../../components/Organizer/EventBannerUpload';
import TicketConfig from '../../components/Organizer/TicketConfig';

const { Title, Text } = Typography;

const CreateEvent = () => {
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
        currentStep,
        setError,
        handleInputChange,
        handleImageChange,
        removeBanner,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        toggleAreaSelection,
        handleSubmit
    } = useCreateEvent();

    if (loadingData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu cấu hình..." />
            </div>
        );
    }

    return (
        <Spin spinning={loading} tip="Đang tạo sự kiện...">
            <div>
                {/* Header Area */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginRight: 16 }}
                        disabled={loading}
                    />
                    <Title level={4} style={{ margin: 0 }}>Tạo sự kiện mới</Title>
                </div>

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
                                        disabled={loading}
                                    />
                                </Card>

                                {/* Section 2: Date Time */}
                                <Card title="2. Thời gian diễn ra" headStyle={{ background: '#fafafa' }}>
                                    <EventDateTime
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        disabled={loading}
                                    />
                                </Card>

                                {/* Section 3: Tickets */}
                                <Card title="3. Cấu hình loại vé" headStyle={{ background: '#fafafa' }}>
                                    <TicketConfig
                                        ticketTypes={ticketTypes}
                                        handleTicketTypeChange={handleTicketTypeChange}
                                        addTicketType={addTicketType}
                                        removeTicketType={removeTicketType}
                                        venueTemplate={venueTemplate}
                                        toggleSeatSelection={toggleSeatSelection}
                                        toggleAreaSelection={toggleAreaSelection}
                                        disabled={loading}
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
        </Spin>
    );
};

export default CreateEvent;
