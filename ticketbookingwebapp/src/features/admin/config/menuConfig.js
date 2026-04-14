import {
    TeamOutlined,
    TagsOutlined,
    CalendarOutlined,
    FileTextOutlined,
    BarChartOutlined,
    PercentageOutlined,
} from '@ant-design/icons';

export const ADMIN_MENU_ITEMS = [
    { key: '/admin/users', icon: TeamOutlined, label: 'Nguoi dung' },
    { key: '/admin/categories', icon: TagsOutlined, label: 'Quan ly the loai' },
    { key: '/admin/events', icon: CalendarOutlined, label: 'Su kien' },
    { key: '/admin/orders', icon: FileTextOutlined, label: 'Don hang' },
    { key: '/admin/statistics', icon: BarChartOutlined, label: 'Thong ke' },
    { key: '/admin/discounts', icon: PercentageOutlined, label: 'Ma giam gia' },
    { key: '/admin/banners', icon: FileTextOutlined, label: 'Quan ly Banner' },
];

export const SIDER_WIDTH = 260;
export const SIDER_WIDTH_COLLAPSED = 80;
