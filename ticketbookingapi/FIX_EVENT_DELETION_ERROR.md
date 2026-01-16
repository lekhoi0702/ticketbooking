# Fix: Lỗi 500 khi Admin duyệt xóa sự kiện

## Vấn đề
Khi admin approve event deletion request, server trả về lỗi:
```
(pymysql.err.IntegrityError) (1048, "Column 'event_id' cannot be null")
```

## Nguyên nhân
Database schema của bảng `EventDeletionRequest` không cho phép cột `event_id` NULL, nhưng khi event bị xóa, foreign key constraint `ondelete='SET NULL'` cố gắng set giá trị này thành NULL.

## Giải pháp

### Bước 1: Chạy Migration SQL
Mở MySQL Workbench hoặc command line và chạy lệnh sau:

```sql
USE ticketbookingdb;

ALTER TABLE EventDeletionRequest 
MODIFY COLUMN event_id INT NULL;
```

Hoặc chạy file migration đã tạo sẵn:
```bash
mysql -u root -p ticketbookingdb < migrations/allow_null_event_id.sql
```

### Bước 2: Verify Migration
Kiểm tra xem migration đã thành công:
```sql
DESCRIBE EventDeletionRequest;
```

Cột `event_id` bây giờ phải có `Null` = `YES`

### Bước 3: Test lại
1. Vào admin panel
2. Approve một event deletion request
3. Kiểm tra xem event đã bị xóa thành công

## Chi tiết kỹ thuật

### Thay đổi trong code (đã hoàn thành):
File: `app/routes/event_deletion.py`

```python
# Delete the event first (this will trigger ondelete='SET NULL' for event_id)
db.session.delete(event)
db.session.flush()  # Flush to trigger the cascade

# Now update deletion request status
deletion_request.request_status = 'APPROVED'
deletion_request.reviewed_by = admin_id
deletion_request.reviewed_at = datetime.utcnow()
deletion_request.admin_note = admin_note

# Commit everything in a single transaction
db.session.commit()
```

### Thay đổi trong database (cần thực hiện):
- Cho phép `event_id` NULL trong bảng `EventDeletionRequest`
- Điều này cho phép lưu trữ lịch sử deletion requests ngay cả khi event đã bị xóa

## Lợi ích
- ✅ Có thể xóa event thành công
- ✅ Giữ lại lịch sử deletion requests cho mục đích audit
- ✅ Không vi phạm database constraints
- ✅ Dữ liệu nhất quán và an toàn
