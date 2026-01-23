# Hướng Dẫn Migrate Đường Dẫn Ảnh

## Vấn Đề
Khi bạn di chuyển thư mục lưu ảnh sang một nơi khác, các đường dẫn trong database bảng `Event` (các cột `banner_image_url` và `vietqr_image_url`) sẽ bị sai và cần được cập nhật.

## Giải Pháp

### Bước 1: Phân Tích Dữ Liệu Hiện Tại

Chạy script Python để phân tích và tạo script SQL:

```bash
cd ticketbookingapi
python scripts/migrate_image_paths.py
```

Script này sẽ:
- Kết nối database và đọc tất cả đường dẫn ảnh hiện tại
- Phân tích các patterns đường dẫn
- Tạo file SQL `migrate_image_paths.sql` để update

### Bước 2: Chỉnh Sửa Cấu Hình (Nếu Cần)

Trước khi chạy script, mở file `scripts/migrate_image_paths.py` và chỉnh sửa:

```python
# Đường dẫn mới (base path)
NEW_PATH_BASE = '/uploads/organizers'  # Thay đổi theo đường dẫn mới của bạn

# Cấu trúc thư mục mới
USE_ORGANIZER_STRUCTURE = True  # True: /uploads/organizers/{manager_id}/events/{filename}
```

**Ví dụ:**
- Nếu bạn di chuyển thư mục uploads sang `/media/uploads/`:
  ```python
  NEW_PATH_BASE = '/media/uploads/organizers'
  ```

- Nếu bạn chỉ thay đổi cấu trúc bên trong uploads:
  ```python
  NEW_PATH_BASE = '/uploads/organizers'  # Giữ nguyên
  ```

### Bước 3: Kiểm Tra File SQL

Sau khi chạy script, kiểm tra file `scripts/migrate_image_paths.sql`:
- Xem lại các đường dẫn cũ và mới
- Đảm bảo đường dẫn mới đúng với cấu trúc thư mục mới
- Chỉnh sửa thủ công nếu cần

### Bước 4: Backup Database

**QUAN TRỌNG:** Luôn backup database trước khi chạy script SQL!

```sql
-- Backup bảng Event
CREATE TABLE Event_backup AS SELECT * FROM Event;
```

### Bước 5: Chạy Script SQL

Chạy file SQL trong MySQL:

```bash
mysql -u username -p database_name < scripts/migrate_image_paths.sql
```

Hoặc mở MySQL và chạy:

```sql
SOURCE scripts/migrate_image_paths.sql;
```

### Bước 6: Kiểm Tra Kết Quả

Script SQL sẽ tự động tạo câu lệnh SELECT để kiểm tra:

```sql
SELECT event_id, event_name, manager_id, banner_image_url, vietqr_image_url 
FROM Event 
WHERE banner_image_url IS NOT NULL OR vietqr_image_url IS NOT NULL
ORDER BY event_id;
```

Nếu đúng, commit:
```sql
COMMIT;
```

Nếu sai, rollback:
```sql
ROLLBACK;
```

## Cấu Trúc Đường Dẫn

### Cấu Trúc Cũ (Có Thể)
```
/uploads/events/image.jpg
```

### Cấu Trúc Mới (Khuyến Nghị)
```
/uploads/organizers/{manager_id}/events/image.jpg
/uploads/organizers/{manager_id}/events/vietqr_image.jpg
```

Cấu trúc này phù hợp với `upload_helper.py` hiện tại và giúp:
- Tổ chức ảnh theo organizer
- Dễ dàng quản lý và backup
- Tránh xung đột tên file

## Lưu Ý

1. **Luôn backup database** trước khi chạy script
2. **Test trên môi trường dev** trước khi chạy production
3. **Kiểm tra kỹ đường dẫn mới** đúng với cấu trúc thư mục thực tế
4. **Đảm bảo thư mục ảnh đã được di chuyển** đúng vị trí trước khi update database
5. Nếu có nhiều patterns đường dẫn khác nhau, có thể cần chỉnh sửa script để xử lý từng pattern riêng

## Troubleshooting

### Lỗi: "ModuleNotFoundError: No module named 'pymysql'"
```bash
pip install pymysql python-dotenv
```

### Lỗi: "Access denied for user"
- Kiểm tra lại thông tin database trong file `.env`
- Đảm bảo user có quyền SELECT và UPDATE trên bảng Event

### Đường dẫn mới không đúng
- Kiểm tra lại `NEW_PATH_BASE` và `USE_ORGANIZER_STRUCTURE` trong script
- Chỉnh sửa thủ công file SQL nếu cần

## Liên Hệ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs của script
2. File SQL được tạo ra
3. Cấu trúc thư mục thực tế
