# AdminLTE Integration - TicketBox Management System

## Tổng quan thay đổi

Đã tích hợp **AdminLTE 4 (Bootstrap 5)** vào toàn bộ giao diện quản trị của hệ thống TicketBox, bao gồm:

### 1. **Admin Panel** (Trang quản trị viên)
- **Theme**: Indigo/Slate - Giao diện sáng, chuyên nghiệp
- **Màu chủ đạo**: 
  - Primary: #6366f1 (Indigo)
  - Sidebar: #0f172a (Slate 900)
  - Accent: #818cf8 (Indigo 400)

### 2. **Organizer Panel** (Trang nhà tổ chức)
- **Theme**: Green/Dark - Giao diện tối, hiện đại
- **Màu chủ đạo**:
  - Primary: #10b981 (Green)
  - Sidebar: #111827 (Gray 900)
  - Accent: #34d399 (Green 400)

### 3. **User Panel** (Trang khách hàng)
- **Không thay đổi** - Giữ nguyên giao diện hiện tại

## Các file đã thay đổi

### Layouts
1. `src/components/Admin/AdminLayout.jsx` - Layout chính cho Admin
2. `src/components/Organizer/OrganizerLayout.jsx` - Layout chính cho Organizer

### Pages - Admin
1. `src/pages/admin/Dashboard.jsx` - Trang tổng quan Admin
2. `src/pages/admin/Events.jsx` - Quản lý sự kiện (đã có sẵn thiết kế tốt)
3. `src/pages/admin/Users.jsx` - Quản lý người dùng (cần cập nhật)
4. `src/pages/admin/Orders.jsx` - Lịch sử giao dịch (cần cập nhật)

### Pages - Organizer
1. `src/pages/organizer/Dashboard.jsx` - Trang tổng quan Organizer
2. `src/pages/organizer/EventList.jsx` - Danh sách sự kiện (đã có sẵn)
3. `src/pages/organizer/CreateEvent.jsx` - Tạo sự kiện (giữ nguyên)

### Styles
1. `src/assets/adminlte-custom.css` - File CSS tùy chỉnh cho AdminLTE
2. `src/utils/adminlte-init.js` - Script khởi tạo AdminLTE

### Configuration
1. `src/main.jsx` - Thêm import AdminLTE CSS và JS
2. `package.json` - Thêm dependencies: admin-lte, @fortawesome/fontawesome-free

## Tính năng AdminLTE đã tích hợp

### Layout Components
- ✅ Responsive sidebar với toggle
- ✅ Top navbar với dropdown menu
- ✅ User menu với avatar
- ✅ Breadcrumbs navigation
- ✅ Content header với title
- ✅ Footer

### UI Components
- ✅ Stat cards với icons và gradients
- ✅ Modern tables với hover effects
- ✅ Cards với shadows và borders
- ✅ Badges với custom colors
- ✅ Buttons với gradients
- ✅ Forms với modern styling
- ✅ Modals với animations
- ✅ Toasts/Notifications

### Features
- ✅ Dark theme cho Organizer
- ✅ Light theme cho Admin
- ✅ Smooth animations
- ✅ Custom scrollbar
- ✅ Responsive design
- ✅ Icon integration (FontAwesome)

## Cách sử dụng

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

## Cấu trúc Theme

### Admin Theme Classes
- `.admin-theme` - Container class cho admin panel
- `.admin-stat-card` - Stat card component
- `.btn-admin-primary` - Primary button
- `.badge-status` - Status badges

### Organizer Theme Classes
- `.organizer-theme` - Container class cho organizer panel
- `.org-stat-card` - Stat card component
- `.btn-org-primary` - Primary button
- `.badge-status` - Status badges

## Customization

Để tùy chỉnh màu sắc, chỉnh sửa file `src/assets/adminlte-custom.css`:

```css
:root {
    /* Admin Theme Colors */
    --admin-primary: #6366f1;
    --admin-primary-dark: #4f46e5;
    
    /* Organizer Theme Colors */
    --org-primary: #10b981;
    --org-primary-dark: #059669;
}
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies
- admin-lte: ^4.0.0-beta.2
- @fortawesome/fontawesome-free: latest
- bootstrap: ^5.3.8
- react-bootstrap: ^2.10.10

## Notes
- Trang user (khách hàng) không bị ảnh hưởng bởi các thay đổi này
- AdminLTE sidebar toggle hoạt động tự động
- Responsive breakpoints tuân theo Bootstrap 5
- Custom CSS được tổ chức theo component-based structure
