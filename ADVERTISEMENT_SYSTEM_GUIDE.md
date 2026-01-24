# Hệ Thống Quảng Cáo - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống quảng cáo cho phép quản lý và hiển thị ảnh quảng cáo tại các vị trí khác nhau trên website:
- **Trang chủ**: Giữa các section sự kiện
- **Trang chi tiết sự kiện**: Sidebar bên phải

## Cấu Trúc Hệ Thống

### Backend (Python/Flask)

#### 1. Database Schema
```sql
-- Bảng Advertisement
CREATE TABLE `Advertisement` (
  `ad_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `link_url` varchar(500),
  `position` enum('HOME_BETWEEN_SECTIONS','EVENT_DETAIL_SIDEBAR','HOME_TOP','HOME_BOTTOM'),
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` datetime,
  `end_date` datetime,
  `click_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `created_by` int(11),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. API Endpoints

**Public Endpoints** (Không cần authentication):
- `GET /api/advertisements/position/<position>?limit=<number>` - Lấy quảng cáo theo vị trí
- `POST /api/advertisements/<ad_id>/view` - Track lượt xem
- `POST /api/advertisements/<ad_id>/click` - Track lượt click

**Admin Endpoints** (Cần authentication + admin role):
- `GET /api/advertisements` - Lấy tất cả quảng cáo
- `GET /api/advertisements/<ad_id>` - Lấy quảng cáo theo ID
- `POST /api/advertisements` - Tạo quảng cáo mới
- `PUT /api/advertisements/<ad_id>` - Cập nhật quảng cáo
- `DELETE /api/advertisements/<ad_id>` - Xóa quảng cáo

#### 3. Vị Trí Hiển Thị (Position)
- `HOME_BETWEEN_SECTIONS` - Giữa các section tại trang chủ
- `EVENT_DETAIL_SIDEBAR` - Sidebar bên phải trang chi tiết sự kiện
- `HOME_TOP` - Đầu trang chủ (dự phòng)
- `HOME_BOTTOM` - Cuối trang chủ (dự phòng)

### Frontend (React)

#### 1. Components

**AdBanner.jsx**
- Component hiển thị 1 quảng cáo
- Tự động track view khi component mount
- Track click khi người dùng click vào quảng cáo
- Hỗ trợ link external

**AdSection.jsx**
- Component hiển thị nhiều quảng cáo theo vị trí
- Tự động load quảng cáo từ API
- Hỗ trợ giới hạn số lượng quảng cáo hiển thị
- Flexible layout options

#### 2. Service

**advertisementService.js**
- `getAdsByPosition(position, limit)` - Lấy quảng cáo theo vị trí
- `trackView(adId)` - Track lượt xem
- `trackClick(adId)` - Track lượt click
- Admin methods: getAllAds, createAd, updateAd, deleteAd

## Hướng Dẫn Cài Đặt

### 1. Chạy Migration Database

```bash
# Kết nối vào MySQL/TiDB
mysql -h <host> -u <username> -p <database_name>

# Chạy migration script
source ticketbookingapi/migrations/add_advertisement_table.sql
```

### 2. Khởi động Backend

```bash
cd ticketbookingapi
python run.py
```

### 3. Khởi động Frontend

```bash
cd ticketbookingwebapp
npm install
npm run dev
```

## Hướng Dẫn Sử Dụng

### Tạo Quảng Cáo Mới (Admin)

#### Sử dụng API

```bash
curl -X POST http://localhost:5000/api/advertisements \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quảng cáo Shopee",
    "image_url": "/uploads/misc/shopee_ad.png",
    "link_url": "https://shopee.vn",
    "position": "EVENT_DETAIL_SIDEBAR",
    "display_order": 1,
    "is_active": true,
    "start_date": "2026-01-01T00:00:00",
    "end_date": "2026-12-31T23:59:59"
  }'
```

#### Các trường dữ liệu:

- **title** (required): Tiêu đề quảng cáo
- **image_url** (required): Đường dẫn ảnh (có thể là relative path hoặc full URL)
- **link_url** (optional): URL đích khi click vào quảng cáo
- **position** (required): Vị trí hiển thị
- **display_order** (optional, default: 0): Thứ tự hiển thị (số nhỏ hơn = ưu tiên cao hơn)
- **is_active** (optional, default: true): Trạng thái active
- **start_date** (optional): Ngày bắt đầu hiển thị
- **end_date** (optional): Ngày kết thúc hiển thị

### Cập Nhật Quảng Cáo

```bash
curl -X PUT http://localhost:5000/api/advertisements/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

### Xóa Quảng Cáo

```bash
curl -X DELETE http://localhost:5000/api/advertisements/1 \
  -H "Authorization: Bearer <admin_token>"
```

### Xem Thống Kê

```bash
# Lấy thông tin quảng cáo kèm số liệu
curl -X GET http://localhost:5000/api/advertisements/1 \
  -H "Authorization: Bearer <admin_token>"
```

Response:
```json
{
  "success": true,
  "data": {
    "ad_id": 1,
    "title": "Quảng cáo Shopee",
    "image_url": "/uploads/misc/shopee_ad.png",
    "link_url": "https://shopee.vn",
    "position": "EVENT_DETAIL_SIDEBAR",
    "display_order": 1,
    "is_active": true,
    "click_count": 150,
    "view_count": 5000,
    "created_at": "2026-01-24T00:00:00",
    "updated_at": "2026-01-24T00:00:00"
  }
}
```

## Tích Hợp Vào Trang Mới

### Trang chủ hoặc trang có nhiều sections:

```jsx
import AdSection from '@shared/components/AdSection';

function MyPage() {
    return (
        <div>
            <EventSection />
            
            {/* Chèn quảng cáo giữa các section */}
            <AdSection 
                position="HOME_BETWEEN_SECTIONS" 
                limit={1}
                containerClassName="my-ad-section"
            />
            
            <AnotherSection />
        </div>
    );
}
```

### Sidebar:

```jsx
import AdSection from '@shared/components/AdSection';

function EventDetail() {
    return (
        <Row>
            <Col lg={9}>
                {/* Main content */}
            </Col>
            <Col lg={3}>
                <div className="sidebar">
                    {/* Quảng cáo sidebar */}
                    <AdSection 
                        position="EVENT_DETAIL_SIDEBAR"
                        limit={3}
                        showContainer={false}
                        spacing="0"
                    />
                </div>
            </Col>
        </Row>
    );
}
```

## Best Practices

### 1. Kích Thước Ảnh Khuyến Nghị

- **Trang chủ (HOME_BETWEEN_SECTIONS)**: 1200x300px (ratio 4:1)
- **Sidebar (EVENT_DETAIL_SIDEBAR)**: 300x600px hoặc 300x250px

### 2. Tối Ưu Hiệu Suất

- Sử dụng định dạng WebP cho ảnh
- Compress ảnh trước khi upload
- Giới hạn số lượng quảng cáo hiển thị (limit parameter)

### 3. Quản Lý Quảng Cáo

- Đặt `display_order` để kiểm soát thứ tự hiển thị
- Sử dụng `start_date` và `end_date` cho campaigns có thời hạn
- Theo dõi `click_count` và `view_count` để đánh giá hiệu quả
- Tắt quảng cáo không còn hiệu quả bằng cách set `is_active = false`

### 4. A/B Testing

Tạo nhiều quảng cáo cho cùng 1 vị trí với `display_order` khác nhau để test hiệu quả:

```sql
-- Quảng cáo A
INSERT INTO Advertisement (title, image_url, position, display_order, is_active)
VALUES ('Ad A', '/uploads/ad_a.png', 'HOME_BETWEEN_SECTIONS', 1, 1);

-- Quảng cáo B
INSERT INTO Advertisement (title, image_url, position, display_order, is_active)
VALUES ('Ad B', '/uploads/ad_b.png', 'HOME_BETWEEN_SECTIONS', 2, 1);
```

## Troubleshooting

### Quảng cáo không hiển thị

1. Kiểm tra `is_active = true`
2. Kiểm tra `start_date` và `end_date` (nếu có)
3. Kiểm tra đường dẫn ảnh `image_url`
4. Kiểm tra console browser để xem lỗi API

### Tracking không hoạt động

1. Kiểm tra network tab để xem API calls
2. Đảm bảo `ad_id` được truyền đúng
3. Kiểm tra CORS settings nếu gọi từ domain khác

### Ảnh không load

1. Kiểm tra file tồn tại trong thư mục `uploads`
2. Kiểm tra permissions của thư mục uploads
3. Kiểm tra UPLOADS_BASE_URL trong constants

## Mở Rộng Tương Lai

### 1. Admin Dashboard
Tạo trang quản lý quảng cáo với UI thân thiện:
- Upload ảnh trực tiếp
- Preview quảng cáo
- Xem thống kê chi tiết
- Quản lý campaigns

### 2. Advanced Analytics
- CTR (Click-Through Rate) calculation
- Conversion tracking
- A/B testing framework
- Revenue tracking

### 3. Targeting
- Geo-targeting (hiển thị theo vị trí)
- User-targeting (hiển thị theo user profile)
- Time-based targeting (hiển thị theo giờ trong ngày)

### 4. Ad Rotation
- Tự động rotate quảng cáo
- Weighted rotation based on performance
- Frequency capping

## Liên Hệ & Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên repository hoặc liên hệ team phát triển.
