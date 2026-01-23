# Swagger API Documentation Setup

## Tổng quan

Đã tích hợp Swagger/OpenAPI documentation vào Ticket Booking API sử dụng Flasgger.

**Cách đơn giản:** Tất cả API documentation được định nghĩa trong file `app/swagger_spec.yaml` - không cần thêm docstring vào code!

## Cài đặt

1. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

2. Khởi động server:
```bash
python run.py
```

## Truy cập Swagger UI

Sau khi server chạy, truy cập Swagger UI tại:

**URL:** `http://localhost:5000/api/docs`

## Các endpoint đã được document

### Authentication
- `POST /api/auth/login` - Đăng nhập ✅
- `POST /api/auth/register` - Đăng ký ✅
- `POST /api/auth/refresh` - Làm mới token ✅
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/change-password` - Đổi mật khẩu

### Events
- `GET /api/events` - Lấy danh sách sự kiện ✅

### Orders
- `POST /api/orders/create` - Tạo đơn hàng ✅
- `GET /api/orders/<order_id>` - Lấy chi tiết đơn hàng ✅

### Payments
- `POST /api/payments/create` - Tạo thanh toán ✅
- `POST /api/payments/vnpay/create-url` - Tạo URL thanh toán VNPay ✅
- `GET /api/payments/<payment_id>` - Lấy thông tin thanh toán ✅

### Categories
- `GET /api/categories` - Lấy danh sách danh mục ✅
- `GET /api/categories/<category_id>` - Lấy thông tin danh mục ✅

### Venues
- `GET /api/venues` - Lấy danh sách địa điểm ✅
- `GET /api/venues/<venue_id>` - Lấy thông tin địa điểm ✅

### Seats
- `GET /api/seats/event/<event_id>` - Lấy danh sách ghế của sự kiện ✅
- `POST /api/seats/lock` - Khóa ghế để đặt chỗ ✅

### Banners
- `GET /api/banners` - Lấy danh sách banner ✅

### Organizer
- `GET /api/organizer/dashboard` - Thống kê dashboard ✅
- `GET /api/organizer/events` - Lấy danh sách sự kiện của nhà tổ chức ✅
- `POST /api/organizer/discounts` - Tạo mã giảm giá ✅
- `GET /api/organizer/discounts` - Lấy danh sách mã giảm giá ✅

### Admin
- `GET /api/admin/stats` - Thống kê tổng quan ✅
- `GET /api/admin/users` - Lấy danh sách người dùng ✅
- `GET /api/admin/events` - Lấy danh sách sự kiện ✅

### Health
- `GET /api/health` - Health check ✅

## Thêm Swagger documentation cho các route khác

**Cách đơn giản:** Chỉ cần chỉnh sửa file `app/swagger_spec.yaml` - không cần sửa code!

Ví dụ thêm endpoint mới vào file YAML:

```yaml
paths:
  /your-endpoint:
    get:
      tags:
        - "YourTag"
      summary: "Tóm tắt endpoint"
      description: "Mô tả chi tiết"
      produces:
        - "application/json"
      parameters:
        - in: "query"
          name: "param_name"
          type: "string"
          description: "Mô tả tham số"
      responses:
        200:
          description: "Mô tả response"
          schema:
            type: "object"
            properties:
              success:
                type: "boolean"
```

Sau đó restart server là xong - không cần thêm docstring vào code!

## Cấu hình

**File chính:** `app/swagger_spec.yaml` - Tất cả API documentation ở đây!

**File cấu hình:** `app/swagger_config.py` - Cấu hình Swagger UI

Bạn có thể tùy chỉnh:
- **Trong `swagger_spec.yaml`**: Thông tin API, endpoints, parameters, responses
- **Trong `swagger_config.py`**: Cấu hình Swagger UI (route, static files, etc.)

## Lưu ý

- **Không cần docstring trong code!** Tất cả documentation nằm trong file `swagger_spec.yaml`
- Chỉ cần chỉnh sửa file YAML và restart server
- Dễ dàng quản lý và cập nhật API documentation
- Có thể chia nhỏ file YAML thành nhiều file nếu cần (nhưng hiện tại dùng 1 file cho đơn giản)
