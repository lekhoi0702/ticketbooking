# 📁 Cấu Trúc Dự Án - Ticket Booking System

## 🎯 Tổng Quan

Dự án được tổ chức theo **feature-based architecture** để dễ dàng maintain và scale.

## 📂 Cấu Trúc Thư Mục

```
src/
├── features/              # Tất cả features của ứng dụng
│   ├── admin/            # Admin panel
│   ├── organizer/        # Organizer dashboard
│   └── user/             # User-facing features
│
├── shared/               # Code dùng chung
│   ├── components/       # Shared components
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   └── constants/        # Constants & configs
│
├── services/             # API services
├── context/              # React contexts
├── theme/                # Theme configuration
└── assets/               # Static assets
```

## 🎨 Features

### 👨‍💼 Admin (`features/admin/`)
Quản lý toàn bộ hệ thống

**Components:**
- `AdminLayout.jsx` - Layout cho admin panel
- `AdminLoadingScreen.jsx` - Loading screen

**Pages:**
- `Dashboard.jsx` - Tổng quan hệ thống
- `Users.jsx` - Quản lý người dùng
- `Events.jsx` - Quản lý sự kiện
- `Orders.jsx` - Quản lý đơn hàng
- `Venues.jsx` - Quản lý địa điểm
- `Login.jsx` - Đăng nhập admin

### 🎪 Organizer (`features/organizer/`)
Quản lý sự kiện của nhà tổ chức

**Components:**
- `OrganizerLayout.jsx` - Layout cho organizer
- `EventTable.jsx` - Bảng danh sách sự kiện
- `EventBasicInfo.jsx` - Form thông tin sự kiện
- `TicketConfig.jsx` - Cấu hình loại vé
- `SeatMapTemplateView.jsx` - Xem sơ đồ ghế
- ... và nhiều components khác

**Pages:**
- `EventList.jsx` - Danh sách sự kiện
- `CreateEvent.jsx` - Tạo sự kiện mới
- `EditEvent.jsx` - Chỉnh sửa sự kiện
- `EventDetails.jsx` - Chi tiết sự kiện
- `EventOrders.jsx` - Đơn hàng theo sự kiện
- `ManageSeats.jsx` - Quản lý ghế ngồi
- `OrganizerHome.jsx` - Trang chủ organizer
- `Login.jsx` - Đăng nhập organizer

### 👥 User (`features/user/`)
Giao diện người dùng cuối

**Components:**
- `UserLayout.jsx` - Layout chính
- `Header.jsx` - Header navigation
- `Footer.jsx` - Footer
- `Auth/` - Authentication components
- `Event/` - Event-related components
  - `EventCard.jsx` - Card hiển thị sự kiện
  - `TrendingSection.jsx` - Section sự kiện hot
  - `CategorySection.jsx` - Section theo danh mục
  - ... và nhiều components khác
- `Checkout/` - Checkout flow components
- `Profile/` - Profile components

**Pages:**
- `Home.jsx` - Trang chủ
- `EventDetail.jsx` - Chi tiết sự kiện
- `Checkout.jsx` - Thanh toán
- `OrderSuccess.jsx` - Đặt hàng thành công
- `VNPayReturn.jsx` - Xử lý VNPay callback
- `MyOrders.jsx` - Đơn hàng của tôi
- `MyTickets.jsx` - Vé của tôi
- `SearchResults.jsx` - Kết quả tìm kiếm
- `CategoryEvents.jsx` - Sự kiện theo danh mục
- `Profile.jsx` - Trang cá nhân
- `Login.jsx` - Đăng nhập

## 🔧 Shared Resources

### Hooks (`shared/hooks/`)
- `useAuth.js` - Authentication logic
- `useEventList.js` - Event list management
- `useCategories.js` - Categories data
- `useVenues.js` - Venues data
- `useTicketTypes.js` - Ticket types data

### Utils (`shared/utils/`)
- `formatters.js` - Format functions (date, currency, etc.)

### Constants (`shared/constants/`)
- `index.js` - API URLs, status configs, etc.

## 🌐 Services (`services/`)

API service layer:
- `api/index.js` - Main API object
- `api/admin.js` - Admin APIs
- `api/organizer.js` - Organizer APIs
- `api/user.js` - User APIs
- ... và các modules khác

## 🎨 Theme (`theme/`)
- `AntdThemeConfig.js` - Ant Design theme configuration

## 🔗 Path Aliases

Configured in `vite.config.js`:

```javascript
'@' → './src'
'@features' → './src/features'
'@shared' → './src/shared'
'@services' → './src/services'
'@context' → './src/context'
'@theme' → './src/theme'
```

## 📝 Import Examples

```javascript
// Features
import AdminLayout from '@features/admin/components/AdminLayout';
import EventCard from '@features/user/components/Event/EventCard';

// Shared
import { useAuth } from '@shared/hooks/useAuth';
import { formatCurrency } from '@shared/utils/formatters';

// Services
import { api } from '@services/api';

// Context
import { AuthProvider } from '@context/AuthContext';

// Theme
import { AntdThemeConfig } from '@theme/AntdThemeConfig';
```

## 🚀 Quy Tắc

1. **Feature Isolation** - Mỗi feature độc lập, không phụ thuộc lẫn nhau
2. **Shared First** - Code dùng chung phải nằm trong `shared/`
3. **Clear Naming** - Tên file và folder phải rõ ràng, mô tả chức năng
4. **Path Aliases** - Luôn dùng path aliases thay vì relative paths
5. **Component Organization** - Components phức tạp nên có folder riêng với CSS

## 📊 Thống Kê

- **Total Features**: 3 (admin, organizer, user)
- **Total Components**: 50+
- **Total Pages**: 25+
- **Shared Hooks**: 5
- **API Modules**: 8

## 🎯 Lợi Ích

✅ **Dễ tìm kiếm** - Code được tổ chức theo features
✅ **Dễ maintain** - Mỗi feature độc lập
✅ **Dễ scale** - Thêm feature mới rất đơn giản
✅ **Import ngắn gọn** - Sử dụng path aliases
✅ **Tái sử dụng** - Shared code rõ ràng

---

**Last Updated**: 2026-01-16
**Structure Version**: 2.0 (Feature-based)
