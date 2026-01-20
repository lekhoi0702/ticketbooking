# Tính năng Xóa Hàng Loạt Sự Kiện

## Tổng quan
Tính năng cho phép organizer xóa nhiều sự kiện cùng lúc với điều kiện các sự kiện phải ở trạng thái **DRAFT**.

## Quy tắc nghiệp vụ

### Điều kiện xóa
- ✅ **Được phép xóa**: Chỉ các sự kiện ở trạng thái `DRAFT`
- ❌ **Không được phép xóa**: Các sự kiện ở trạng thái khác:
  - `PENDING_APPROVAL` - Đang chờ duyệt
  - `APPROVED` - Đã được duyệt
  - `REJECTED` - Bị từ chối
  - `PUBLISHED` - Đã công khai
  - `ONGOING` - Đang diễn ra
  - `COMPLETED` - Đã hoàn thành
  - `CANCELLED` - Đã hủy

### Cột trạng thái
Cột trạng thái hiển thị chính xác giá trị từ database, bao gồm:
- **DRAFT** (Nháp) - Màu xám
- **PENDING_APPROVAL** (Đang duyệt) - Màu vàng
- **APPROVED** (Đã duyệt) - Màu xanh dương
- **REJECTED** (Bị từ chối) - Màu đỏ
- **PUBLISHED** (Công khai) - Màu xanh lá
- **ONGOING** (Đang diễn ra) - Màu xanh processing
- **COMPLETED** (Hoàn thành) - Màu xám
- **CANCELLED** (Đã hủy) - Màu đỏ

## Luồng hoạt động

### 1. Chọn sự kiện
- Người dùng tick chọn một hoặc nhiều sự kiện từ danh sách
- Nút "Xóa hàng loạt" chỉ hiển thị khi **TẤT CẢ** sự kiện được chọn đều ở trạng thái DRAFT

### 2. Xác nhận xóa
- Khi click nút "Xóa hàng loạt", hiển thị modal xác nhận
- Modal hiển thị số lượng sự kiện sẽ bị xóa
- Người dùng xác nhận hoặc hủy bỏ

### 3. Thực hiện xóa
Backend xử lý từng sự kiện:
- Kiểm tra sự kiện có tồn tại và thuộc về organizer
- Kiểm tra trạng thái phải là DRAFT
- Xóa các TicketType liên quan
- Xóa sự kiện

### 4. Hiển thị kết quả
Có 3 trường hợp:

#### Trường hợp 1: Tất cả thành công
```
✓ Đã xóa thành công [N] sự kiện
```

#### Trường hợp 2: Một phần thành công
```
Kết quả xóa sự kiện
✓ Đã xóa thành công: [N] sự kiện
✗ Không thể xóa: [M] sự kiện

• [Tên sự kiện 1]: Chỉ có thể xóa sự kiện ở trạng thái DRAFT. Trạng thái hiện tại: PUBLISHED
• [Tên sự kiện 2]: Không tìm thấy sự kiện hoặc bạn không có quyền xóa
```

#### Trường hợp 3: Tất cả thất bại
```
✗ Không thể xóa bất kỳ sự kiện nào
```

## API Endpoints

### POST `/organizer/events/bulk-delete`

**Request Body:**
```json
{
  "event_ids": [1, 2, 3],
  "manager_id": 85
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đã xóa thành công 3 sự kiện",
  "data": {
    "success_count": 3,
    "failed_events": [],
    "deleted_event_ids": [1, 2, 3]
  }
}
```

**Response (Partial Success):**
```json
{
  "success": true,
  "message": "Đã xóa 2 sự kiện. 1 sự kiện không thể xóa.",
  "data": {
    "success_count": 2,
    "failed_events": [
      {
        "event_id": 3,
        "event_name": "Sự kiện ABC",
        "status": "PUBLISHED",
        "reason": "Chỉ có thể xóa sự kiện ở trạng thái DRAFT. Trạng thái hiện tại: PUBLISHED"
      }
    ],
    "deleted_event_ids": [1, 2]
  }
}
```

## Thay đổi UI

### Các nút chức năng:
1. ✅ **"Sửa sự kiện"** - Hiển thị với sự kiện DRAFT, cho phép chỉnh sửa trực tiếp
2. ✅ **"Lấy về sửa"** - Hiển thị với sự kiện PENDING_APPROVAL và PUBLISHED, chuyển về DRAFT để chỉnh sửa
3. ✅ **"Xem"** - Xem chi tiết sự kiện
4. ✅ **"Đơn hàng"** - Xem đơn hàng của sự kiện
5. ✅ **"Suất diễn"** - Thêm suất diễn mới
6. ✅ **"Đăng sự kiện"** - Chỉ hiển thị với sự kiện APPROVED
7. ✅ **"Xóa / Xóa hàng loạt"** - Chỉ hiển thị khi tất cả sự kiện chọn là DRAFT

### Đã bỏ các tính năng:
- ❌ Nút "Hủy duyệt" cho PENDING_APPROVAL (thay bằng "Lấy về sửa")

## Files đã thay đổi

### Backend
1. `ticketbookingapi/app/services/organizer_event_service.py`
   - Thêm method `delete_events_bulk()`

2. `ticketbookingapi/app/routes/organizer.py`
   - Thêm endpoint `/organizer/events/bulk-delete`

### Frontend
1. `ticketbookingwebapp/src/services/api/organizer.js`
   - Thêm method `bulkDeleteEvents()`

2. `ticketbookingwebapp/src/shared/hooks/useEventList.js`
   - Thêm method `handleBulkDelete()`

3. `ticketbookingwebapp/src/features/organizer/pages/EventList.jsx`
   - Cập nhật UI để hỗ trợ xóa hàng loạt
   - Bỏ nút "Lấy về sửa" và "Hủy duyệt"
   - Chỉ hiển thị nút xóa khi tất cả sự kiện chọn là DRAFT

4. `ticketbookingwebapp/src/features/organizer/components/EventTable.jsx`
   - Hiển thị đúng trạng thái từ database

## Kiểm thử

### Test Case 1: Xóa nhiều sự kiện DRAFT
1. Tạo 3 sự kiện ở trạng thái DRAFT
2. Chọn cả 3 sự kiện
3. Click "Xóa hàng loạt"
4. Xác nhận
5. **Kết quả mong đợi**: Cả 3 sự kiện bị xóa thành công

### Test Case 2: Chọn hỗn hợp trạng thái
1. Chọn 2 sự kiện DRAFT và 1 sự kiện PUBLISHED
2. **Kết quả mong đợi**: Nút "Xóa hàng loạt" không hiển thị

### Test Case 3: Xóa sự kiện không phải DRAFT
1. Chọn 1 sự kiện PUBLISHED
2. Thử gọi API trực tiếp
3. **Kết quả mong đợi**: API trả về lỗi, sự kiện không bị xóa

### Test Case 4: Xóa sự kiện của organizer khác
1. Thử xóa sự kiện không thuộc về organizer hiện tại
2. **Kết quả mong đợi**: API trả về lỗi "Không tìm thấy sự kiện hoặc bạn không có quyền xóa"

## Lưu ý kỹ thuật

1. **Transaction Safety**: Tất cả các thao tác xóa được thực hiện trong một transaction, chỉ commit khi có ít nhất 1 sự kiện xóa thành công

2. **Cascade Delete**: Khi xóa sự kiện, các TicketType liên quan cũng bị xóa. Seats sẽ tự động xóa nhờ CASCADE constraint

3. **Permission Check**: Mỗi sự kiện được kiểm tra xem có thuộc về organizer hiện tại không

4. **Status Validation**: Chỉ sự kiện DRAFT mới được phép xóa trực tiếp

5. **Error Handling**: Lỗi của từng sự kiện được thu thập và trả về, không làm gián đoạn việc xóa các sự kiện khác
