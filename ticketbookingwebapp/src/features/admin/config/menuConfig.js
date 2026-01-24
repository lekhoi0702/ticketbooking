import {
    TeamOutlined,
    TagsOutlined,
    CalendarOutlined,
    FileTextOutlined,
    BarChartOutlined,
    PictureOutlined,
} from '@ant-design/icons';

export const ADMIN_MENU_ITEMS = [
    { key: '/admin/users', icon: TeamOutlined, label: 'Người dùng' },
    { key: '/admin/categories', icon: TagsOutlined, label: 'Quản lý thể loại' },
    { key: '/admin/events', icon: CalendarOutlined, label: 'Sự kiện' },
    { key: '/admin/orders', icon: FileTextOutlined, label: 'Đơn hàng' },
    { key: '/admin/statistics', icon: BarChartOutlined, label: 'Thống kê' },
    { key: '/admin/banners', icon: FileTextOutlined, label: 'Quản lý Banner' },
    { key: '/admin/advertisements', icon: PictureOutlined, label: 'Quản lý Quảng cáo' },
];

export const SIDER_WIDTH = 260;
export const SIDER_WIDTH_COLLAPSED = 80;
