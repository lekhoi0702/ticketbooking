# Tài liệu Audit Log cho Organizer

## Tổng quan
Tài liệu này mô tả các chức năng của Organizer và cách audit log được triển khai để ghi nhận lại toàn bộ hoạt động.

## Các chức năng của Organizer

### 1. Event Management (Quản lý Sự kiện)

#### 1.1. Tạo sự kiện mới
- **Endpoint**: `POST /api/organizer/events`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `event_name`: Tên sự kiện
  - `venue_id`: ID địa điểm
  - `category_id`: ID danh mục
  - `status`: Trạng thái sự kiện
  - `start_date`: Ngày bắt đầu
  - `end_date`: Ngày kết thúc

#### 1.2. Cập nhật sự kiện
- **Endpoint**: `PUT /api/organizer/events/<event_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Giá trị cũ (event_name, status, venue_id, category_id)
  - `new_values`: Giá trị mới (các trường được cập nhật)

#### 1.3. Xóa sự kiện (Soft Delete)
- **Endpoint**: `DELETE /api/organizer/events/<event_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Thông tin sự kiện trước khi xóa

#### 1.4. Xóa nhiều sự kiện (Bulk Delete)
- **Endpoint**: `POST /api/organizer/events/bulk-delete`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**: Ghi log cho từng sự kiện bị xóa

#### 1.5. Duplicate sự kiện (Tạo suất diễn mới)
- **Endpoint**: `POST /api/organizer/events/<event_id>/duplicate`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `event_name`: Tên sự kiện mới
  - `duplicated_from`: ID sự kiện gốc
  - `venue_id`, `category_id`, `status`

### 2. Ticket Type Management (Quản lý Loại Vé)

#### 2.1. Tạo loại vé mới
- **Endpoint**: `POST /api/organizer/events/<event_id>/ticket-types`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `type_name`: Tên loại vé
  - `event_id`: ID sự kiện
  - `price`: Giá vé
  - `quantity`: Số lượng
  - `available_quantity`: Số lượng còn lại

#### 2.2. Cập nhật loại vé
- **Endpoint**: `PUT /api/organizer/ticket-types/<ticket_type_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Giá trị cũ (type_name, price, quantity, available_quantity)
  - `new_values`: Giá trị mới (các trường được cập nhật)

#### 2.3. Xóa loại vé
- **Endpoint**: `DELETE /api/organizer/ticket-types/<ticket_type_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Thông tin loại vé trước khi xóa

### 3. Venue Management (Quản lý Địa điểm)

#### 3.1. Tạo địa điểm mới
- **Endpoint**: `POST /api/organizer/venues`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `venue_name`: Tên địa điểm
  - `address`: Địa chỉ
  - `city`: Thành phố
  - `capacity`: Sức chứa
  - `contact_phone`: Số điện thoại

#### 3.2. Cập nhật địa điểm
- **Endpoint**: `PUT /api/organizer/venues/<venue_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Giá trị cũ (venue_name, address, city, contact_phone, capacity)
  - `new_values`: Giá trị mới (các trường được cập nhật)

#### 3.3. Xóa địa điểm
- **Endpoint**: `DELETE /api/organizer/venues/<venue_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Thông tin địa điểm trước khi xóa

#### 3.4. Cập nhật sơ đồ ghế
- **Endpoint**: `PUT /api/organizer/venues/<venue_id>/seats`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Sơ đồ ghế cũ
  - `new_values`: Sơ đồ ghế mới

### 4. Discount Management (Quản lý Mã giảm giá)

#### 4.1. Tạo mã giảm giá mới
- **Endpoint**: `POST /api/organizer/discounts`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `discount_code`: Mã giảm giá
  - `discount_name`: Tên mã giảm giá
  - `discount_type`: Loại giảm giá (PERCENTAGE/FIXED_AMOUNT)
  - `discount_value`: Giá trị giảm giá
  - `event_id`: ID sự kiện (nếu có)
  - `usage_limit`: Giới hạn sử dụng
  - `is_active`: Trạng thái kích hoạt

#### 4.2. Cập nhật mã giảm giá
- **Endpoint**: `PUT /api/organizer/discounts/<id>`
- **Audit Log**: ✅ Đã triển khai (đã cải thiện)
- **Thông tin ghi nhận**:
  - `old_values`: Giá trị cũ đầy đủ (discount_code, discount_name, discount_type, discount_value, event_id, usage_limit, is_active, start_date, end_date)
  - `new_values`: Giá trị mới (các trường được cập nhật)

#### 4.3. Xóa mã giảm giá
- **Endpoint**: `DELETE /api/organizer/discounts/<id>`
- **Audit Log**: ✅ Đã triển khai (đã cải thiện)
- **Thông tin ghi nhận**:
  - `old_values`: Thông tin đầy đủ về mã giảm giá trước khi xóa

### 5. Order Management (Quản lý Đơn hàng)

#### 5.1. Duyệt hoàn tiền
- **Endpoint**: `POST /api/organizer/orders/<order_id>/refund/approve`
- **Audit Log**: ✅ Đã triển khai (đã cải thiện)
- **Thông tin ghi nhận**:
  - `old_values`: Trạng thái đơn hàng cũ (order_status, order_id)
  - `new_values`: Trạng thái mới (order_status: 'REFUNDED', action: 'refund_approved')

#### 5.2. Từ chối hoàn tiền
- **Endpoint**: `POST /api/organizer/orders/<order_id>/refund/reject`
- **Audit Log**: ✅ Đã triển khai (đã cải thiện)
- **Thông tin ghi nhận**:
  - `old_values`: Trạng thái đơn hàng cũ (order_status, order_id)
  - `new_values`: Trạng thái mới (order_status: 'PAID', action: 'refund_rejected')

### 6. Ticket Management (Quản lý Vé)

#### 6.1. Check-in vé
- **Endpoint**: `POST /api/organizer/tickets/check-in`
- **Audit Log**: ✅ Đã triển khai (đã cải thiện)
- **Thông tin ghi nhận**:
  - `old_values`: Trạng thái vé cũ (ticket_status, ticket_id)
  - `new_values`: Trạng thái mới (ticket_status: 'USED', checked_in: True, action: 'check_in')

### 7. Profile Management (Quản lý Hồ sơ)

#### 7.1. Cập nhật thông tin organizer
- **Endpoint**: `PUT /api/organizer/profile/<user_id>`
- **Audit Log**: ✅ Đã triển khai
- **Thông tin ghi nhận**:
  - `old_values`: Thông tin cũ (organization_name, contact_phone, description)
  - `new_values`: Thông tin mới (các trường được cập nhật, bao gồm logo_url nếu có)

## Các chức năng KHÔNG cần Audit Log

Các chức năng chỉ đọc dữ liệu (GET requests) không cần audit log:
- `GET /api/organizer/dashboard` - Xem thống kê dashboard
- `GET /api/organizer/events` - Xem danh sách sự kiện
- `GET /api/organizer/events/<event_id>/ticket-types` - Xem loại vé
- `GET /api/organizer/events/<event_id>/orders` - Xem đơn hàng của sự kiện
- `GET /api/organizer/refund-requests` - Xem yêu cầu hoàn tiền
- `GET /api/organizer/venues` - Xem danh sách địa điểm
- `GET /api/organizer/venues/<venue_id>` - Xem chi tiết địa điểm
- `GET /api/organizer/tickets/search` - Tìm kiếm vé
- `GET /api/organizer/stats` - Xem thống kê chi tiết
- `GET /api/organizer/orders` - Xem danh sách đơn hàng
- `GET /api/organizer/profile/<user_id>` - Xem thông tin hồ sơ
- `GET /api/organizer/discounts` - Xem danh sách mã giảm giá

## Cấu trúc Audit Log

Mỗi audit log entry bao gồm:
- `audit_id`: ID duy nhất của log
- `table_name`: Tên bảng bị ảnh hưởng (Event, Venue, Discount, TicketType, Order, Ticket, OrganizerInfo)
- `record_id`: ID của record bị ảnh hưởng
- `action`: Loại hành động (INSERT, UPDATE, DELETE)
- `old_values`: JSON chứa giá trị cũ (cho UPDATE và DELETE)
- `new_values`: JSON chứa giá trị mới (cho INSERT và UPDATE)
- `changed_by`: ID của user thực hiện hành động
- `changed_at`: Thời gian thực hiện hành động
- `ip_address`: Địa chỉ IP của client
- `user_agent`: User agent của browser

## Error Handling

Tất cả các audit log đều được bọc trong try-except để đảm bảo:
- Nếu audit log fail, request vẫn được xử lý thành công
- Lỗi audit log được ghi vào console với prefix `[AUDIT WARNING]` hoặc `[AUDIT ERROR]`
- Database transaction được rollback nếu audit log fail, nhưng sau đó commit lại để đảm bảo business logic vẫn được thực thi

## Cải thiện đã thực hiện

1. ✅ Hoàn thiện audit log cho update discount (thêm old_values đầy đủ)
2. ✅ Cải thiện audit log cho create discount (thêm nhiều thông tin hơn)
3. ✅ Cải thiện audit log cho delete discount (thêm thông tin đầy đủ)
4. ✅ Cải thiện audit log cho create event (thêm venue_id, category_id, dates)
5. ✅ Cải thiện audit log cho duplicate event (thêm thông tin đầy đủ)
6. ✅ Cải thiện audit log cho create ticket type (thêm price, quantity)
7. ✅ Cải thiện audit log cho update ticket type (thêm old_values)
8. ✅ Cải thiện audit log cho create venue (thêm address, city, capacity, phone)
9. ✅ Cải thiện audit log cho approve/reject refund (thêm old_values từ order)
10. ✅ Cải thiện audit log cho check-in ticket (thêm old_values từ ticket)

## Kết luận

Tất cả các chức năng quan trọng của Organizer đã được tích hợp audit log đầy đủ. Audit log ghi nhận:
- ✅ Tất cả các thao tác CREATE (INSERT)
- ✅ Tất cả các thao tác UPDATE với old_values và new_values
- ✅ Tất cả các thao tác DELETE với old_values
- ✅ Error handling để đảm bảo business logic không bị ảnh hưởng nếu audit log fail
- ✅ Thông tin đầy đủ về user, IP address, và user agent
