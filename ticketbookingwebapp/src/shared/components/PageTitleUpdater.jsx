import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP = {
    '/': 'TicketBooking - Đặt vé sự kiện trực tuyến',
    '/events': 'Tất cả sự kiện | TicketBooking',
    '/search': 'Tìm kiếm | TicketBooking',
    '/profile': 'Thông tin tài khoản | TicketBooking',

    // Admin
    '/admin/login': 'Đăng nhập Quản trị viên',
    '/admin/events': 'Quản lý sự kiện | Admin',
    '/admin/users': 'Quản lý người dùng | Admin',
    '/admin/orders': 'Quản lý đơn hàng | Admin',
    '/admin/statistics': 'Thống kê hệ thống | Admin',
    '/admin/categories': 'Quản lý danh mục | Admin',
    '/admin/banners': 'Quản lý Banner | Admin',

    // Organizer
    '/organizer/home': 'Dành cho Nhà tổ chức | TicketBooking',
    '/organizer/login': 'Đăng nhập Nhà tổ chức',
    '/organizer/events': 'Quản lý sự kiện | Organizer',
    '/organizer/create-event': 'Tạo sự kiện mới | Organizer',
    '/organizer/venues': 'Quản lý địa điểm | Organizer',
    '/organizer/tickets': 'Quản lý vé | Organizer',
    '/organizer/orders': 'Quản lý đơn hàng | Organizer',
    '/organizer/refund-requests': 'Yêu cầu hoàn tiền | Organizer',
    '/organizer/discounts': 'Quản lý mã giảm giá | Organizer',
    '/organizer/profile': 'Hồ sơ Nhà tổ chức | Organizer',
};

const PageTitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'TicketBooking'; // Fallback default

        // 1. Check exact matches
        if (TITLE_MAP[path]) {
            title = TITLE_MAP[path];
        }
        // 2. Check dynamic paths
        else if (path.startsWith('/event/')) {
            title = 'Chi tiết sự kiện | TicketBooking';
        } else if (path.startsWith('/category/')) {
            title = 'Sự kiện theo danh mục | TicketBooking';
        } else if (path.startsWith('/checkout/')) {
            title = 'Thanh toán đơn hàng | TicketBooking';
        } else if (path.startsWith('/order-success/')) {
            title = 'Đặt vé thành công | TicketBooking';
        } else if (path.startsWith('/organizer/edit-event/')) {
            title = 'Chỉnh sửa sự kiện | Organizer';
        } else if (path.startsWith('/organizer/event/')) {
            // Detailed view of event
            title = 'Chi tiết sự kiện | Organizer';
        } else if (path.startsWith('/organizer/manage-seats/')) {
            title = 'Quản lý sơ đồ ghế | Organizer';
        }

        document.title = title;
    }, [location]);

    return null;
};

export default PageTitleUpdater;
