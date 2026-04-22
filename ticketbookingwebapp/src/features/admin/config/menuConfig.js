import {
    TeamOutlined,
    TagsOutlined,
    CalendarOutlined,
    FileTextOutlined,
    BarChartOutlined,
    PercentageOutlined,
} from '@ant-design/icons';

export const ADMIN_MENU_ITEMS = [
    { key: '/admin/users', icon: TeamOutlined, label: 'Người dùng' },
    { key: '/admin/categories', icon: TagsOutlined, label: 'Quản lí thể loại' },
    { key: '/admin/events', icon: CalendarOutlined, label: 'Sự kiện' },
    { key: '/admin/orders', icon: FileTextOutlined, label: 'Đơn hàng' },
    { key: '/admin/statistics', icon: BarChartOutlined, label: 'Thống kê' },
    { key: '/admin/discounts', icon: PercentageOutlined, label: 'Mã tham gia' },
    { key: '/admin/banners', icon: FileTextOutlined, label: 'Quản lý Banner' },
];

export const SIDER_WIDTH = 260;
export const SIDER_WIDTH_COLLAPSED = 80;
