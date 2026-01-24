# Advertisement System - Quick Start

## Tổng Quan
Hệ thống quản lý quảng cáo cho phép chèn ảnh quảng cáo tại:
- ✅ Giữa các section sự kiện tại trang chủ
- ✅ Sidebar bên phải của trang chi tiết sự kiện

## Cài Đặt Nhanh

### 1. Chạy Migration
```bash
mysql -h <host> -u <user> -p ticketbookingdb < ticketbookingapi/migrations/add_advertisement_table.sql
```

### 2. Khởi động Backend
```bash
cd ticketbookingapi
python run.py
```

### 3. Khởi động Frontend
```bash
cd ticketbookingwebapp
npm run dev
```

## Tạo Quảng Cáo Mẫu

### Sử dụng SQL
```sql
-- Quảng cáo trang chủ
INSERT INTO Advertisement (title, image_url, link_url, position, display_order, is_active)
VALUES ('Quảng cáo trang chủ', '/uploads/misc/quangcao.webp', '#', 'HOME_BETWEEN_SECTIONS', 1, 1);

-- Quảng cáo sidebar
INSERT INTO Advertisement (title, image_url, link_url, position, display_order, is_active)
VALUES ('Shopee Ad', '/uploads/misc/quangcaoshopee.png', 'https://shopee.vn', 'EVENT_DETAIL_SIDEBAR', 1, 1);
```

### Sử dụng API (Admin)
```bash
curl -X POST http://localhost:5000/api/advertisements \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Ad",
    "image_url": "/uploads/my_ad.png",
    "link_url": "https://example.com",
    "position": "HOME_BETWEEN_SECTIONS",
    "is_active": true
  }'
```

## API Endpoints

### Public (Không cần auth)
- `GET /api/advertisements/position/<position>` - Lấy quảng cáo theo vị trí
- `POST /api/advertisements/<id>/view` - Track view
- `POST /api/advertisements/<id>/click` - Track click

### Admin Only
- `GET /api/advertisements` - Lấy tất cả
- `POST /api/advertisements` - Tạo mới
- `PUT /api/advertisements/<id>` - Cập nhật
- `DELETE /api/advertisements/<id>` - Xóa

## Vị Trí (Position)
- `HOME_BETWEEN_SECTIONS` - Giữa sections trang chủ
- `EVENT_DETAIL_SIDEBAR` - Sidebar chi tiết sự kiện
- `HOME_TOP` - Đầu trang chủ
- `HOME_BOTTOM` - Cuối trang chủ

## Kích Thước Ảnh Khuyến Nghị
- Trang chủ: **1200x300px** (ratio 4:1)
- Sidebar: **300x600px** hoặc **300x250px**

## Tài Liệu Chi Tiết
Xem file `ADVERTISEMENT_SYSTEM_GUIDE.md` để biết thêm chi tiết.

## Files Đã Tạo

### Backend
- `ticketbookingapi/migrations/add_advertisement_table.sql` - Database migration
- `ticketbookingapi/app/models/advertisement.py` - Model
- `ticketbookingapi/app/services/advertisement_service.py` - Business logic
- `ticketbookingapi/app/routes/advertisement.py` - API routes

### Frontend
- `ticketbookingwebapp/src/services/advertisementService.js` - API service
- `ticketbookingwebapp/src/shared/components/AdBanner.jsx` - Component hiển thị 1 ad
- `ticketbookingwebapp/src/shared/components/AdBanner.css` - Styles
- `ticketbookingwebapp/src/shared/components/AdSection.jsx` - Component hiển thị nhiều ads

### Tích hợp
- Đã cập nhật `Home.jsx` - Quảng cáo giữa sections
- Đã cập nhật `EventDetail.jsx` - Quảng cáo sidebar

## Kiểm Tra

1. Mở trang chủ: http://localhost:5173
2. Scroll xuống giữa các section → Sẽ thấy quảng cáo
3. Vào chi tiết sự kiện → Sidebar bên phải sẽ có quảng cáo
4. Click vào quảng cáo → Tracking tự động

## Troubleshooting

**Quảng cáo không hiển thị?**
- Kiểm tra `is_active = 1`
- Kiểm tra ảnh tồn tại trong `/uploads`
- Xem console browser để check lỗi API

**Tracking không hoạt động?**
- Kiểm tra Network tab
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings
