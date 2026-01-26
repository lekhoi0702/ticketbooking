# Database Optimization Migration Guide

## Tổng quan

Bộ migration này được tạo để tối ưu hóa database theo các best practices và chuẩn hóa cấu trúc database.

## Các Migration Files

### Phase 1 - Critical Fixes (Ưu tiên cao)

1. **fix_views_remove_obsolete_columns.sql**
   - Sửa các views để xóa references đến columns không còn tồn tại
   - Loại bỏ `deleted_at`, `sale_start_datetime`, `sale_end_datetime` từ views
   - **Thời gian**: ~1-2 giây
   - **Downtime**: Không cần

2. **remove_duplicate_indexes.sql**
   - Xóa duplicate indexes trên `deleted_at` trong Order và Ticket tables
   - **Thời gian**: ~1-2 giây
   - **Downtime**: Không cần

3. **standardize_collation.sql**
   - Chuẩn hóa collation về `utf8mb4_unicode_ci`
   - Drop và recreate index trên Seat.status trước khi convert
   - **Thời gian**: ~5-10 giây
   - **Downtime**: Có thể cần (ALTER TABLE)

### Phase 2 - Performance (Ưu tiên trung bình)

4. **add_missing_indexes.sql**
   - Thêm indexes cho Event.manager_id, Discount.manager_id, Discount.event_id
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Có thể cần

5. **add_composite_indexes.sql**
   - Thêm composite indexes cho các query patterns phổ biến
   - **Thời gian**: ~5-15 giây
   - **Downtime**: Có thể cần

### Phase 3 - Enhancement (Ưu tiên thấp)

6. **add_check_constraints.sql**
   - Thêm check constraints cho business logic validation
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần

## Data Types Optimization Migrations

### Phase 1 - Critical (Ưu tiên cao)

7. **optimize_integer_types.sql**
   - Đổi `int(11)` → `int UNSIGNED` cho capacity, quantity fields
   - Tránh overflow, tăng range gấp đôi
   - **Thời gian**: ~5-10 giây
   - **Downtime**: Có thể cần (ALTER TABLE)

### Phase 2 - Important (Ưu tiên trung bình)

8. **increase_varchar_lengths.sql**
   - URL fields: `varchar(500)` → `varchar(1000)`
   - Phone fields: `varchar(20)` → `varchar(30)`
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần

9. **standardize_datetime_types.sql**
   - Convert tất cả `timestamp` → `datetime`
   - Tránh timezone issues
   - **Thời gian**: ~5-10 giây
   - **Downtime**: Có thể cần

### Phase 3 - Enhancement (Ưu tiên thấp)

10. **convert_tinyint_to_boolean.sql**
    - Convert `tinyint(1)` → `BOOLEAN`
    - Cải thiện code readability
    - **Thời gian**: ~2-5 giây
    - **Downtime**: Không cần

11. **fix_nullable_fields.sql**
    - Fix nullable fields với DEFAULT values
    - **Thời gian**: ~2-5 giây
    - **Downtime**: Không cần

## Scripts Kiểm tra

### 1. quick_check.sql
Script nhanh để kiểm tra các vấn đề chính:
- Collation issues
- Duplicate indexes
- Missing indexes
- Row format
- Views issues
- Check constraints count

### 2. check_database_status.sql
Script chi tiết để kiểm tra toàn bộ database status với đầy đủ thông tin.

### 3. summary_report.sql
Script tạo báo cáo tóm tắt với recommendations cụ thể về migrations cần chạy.

### 4. analyze_data_types.sql
Script phân tích kiểu dữ liệu hiện tại để xác định vấn đề và cải thiện.

## Cách Sử dụng

### Bước 1: Kiểm tra Database Hiện tại

```bash
# Chạy script kiểm tra
mysql -u [username] -p [database_name] < summary_report.sql
```

Hoặc trong MySQL Workbench/TiDB client, mở và chạy `summary_report.sql`.

### Bước 2: Xem Kết quả

Script sẽ hiển thị:
- ✅ OK: Đã đúng, không cần sửa
- ❌ NEED FIX: Cần chạy migration
- ⚠️ CAN OPTIMIZE: Có thể tối ưu thêm

### Bước 3: Chạy Migrations theo Thứ tự

**Quan trọng**: Chạy theo đúng thứ tự!

```bash
# 1. Fix views
mysql -u [username] -p [database_name] < fix_views_remove_obsolete_columns.sql

# 2. Remove duplicate indexes
mysql -u [username] -p [database_name] < remove_duplicate_indexes.sql

# 3. Standardize collation
mysql -u [username] -p [database_name] < standardize_collation.sql

# 4. Add missing indexes
mysql -u [username] -p [database_name] < add_missing_indexes.sql

# 5. Add composite indexes
mysql -u [username] -p [database_name] < add_composite_indexes.sql

# 6. Add check constraints
mysql -u [username] -p [database_name] < add_check_constraints.sql

# Data Types Optimization (Optional but recommended)
# 7. Optimize integer types
mysql -u [username] -p [database_name] < optimize_integer_types.sql

# 8. Increase VARCHAR lengths
mysql -u [username] -p [database_name] < increase_varchar_lengths.sql

# 9. Standardize datetime types
mysql -u [username] -p [database_name] < standardize_datetime_types.sql

# 10. Convert tinyint to boolean (optional)
mysql -u [username] -p [database_name] < convert_tinyint_to_boolean.sql

# 11. Fix nullable fields (optional)
mysql -u [username] -p [database_name] < fix_nullable_fields.sql
```

### Bước 4: Verify sau khi chạy

Chạy lại `summary_report.sql` để verify tất cả đã được sửa.

## Lưu ý TiDB

### Đã được xử lý:
- ✅ Views: Loại bỏ `WITH CASCADED CHECK OPTION`
- ✅ Collation: Drop index trước khi convert
- ✅ Index names: Tìm tên index thực tế từ INFORMATION_SCHEMA
- ✅ SeatReservation: Loại bỏ references (table không tồn tại)

### Có thể skip:
- ⚠️ **optimize_row_format.sql**: TiDB dùng Dynamic format mặc định, có thể không cần thiết. Nếu gặp lỗi "unsupported ALTER TABLE", skip file này.

## Troubleshooting

### Lỗi: "Index doesn't exist"
- Script đã check index tồn tại trước khi drop
- Nếu vẫn lỗi, chạy: `SHOW INDEXES FROM [table_name]` để xem tên index thực tế

### Lỗi: "Unsupported converting collation"
- Đã được xử lý trong `standardize_collation.sql` (drop index trước)
- Nếu vẫn lỗi, có thể cần convert từng column một

### Lỗi: "Table doesn't exist"
- SeatReservation table đã được loại bỏ khỏi migrations
- Nếu gặp lỗi với table khác, kiểm tra tên table trong database

## Expected Results

Sau khi chạy tất cả migrations:

- ✅ Tất cả tables có collation `utf8mb4_unicode_ci`
- ✅ Không còn duplicate indexes
- ✅ Tất cả required indexes đã được thêm
- ✅ Composite indexes cho query patterns phổ biến
- ✅ Check constraints cho business logic
- ✅ Views không còn references đến columns không tồn tại
- ✅ Integer types được tối ưu (UNSIGNED)
- ✅ VARCHAR lengths đủ cho URLs và phone numbers
- ✅ DateTime types được chuẩn hóa
- ✅ Boolean fields dùng BOOLEAN type

## Rollback

Nếu cần rollback, xem file `README_MIGRATIONS.md` trong cùng thư mục để có hướng dẫn chi tiết.

## Lưu ý về Database Schema Changes

### Bảng đã bị xóa:
- **OrganizerQRCode**: Bảng này đã được xóa vì QR code sẽ được thêm riêng theo event. Các migration files không có references đến bảng này.

### Bảng không tồn tại:
- **SeatReservation**: Bảng này không tồn tại trong database hiện tại. Đã được loại bỏ khỏi các migration files.

## Data Types Optimization

Xem file `DATA_TYPES_OPTIMIZATION.md` để có hướng dẫn chi tiết về:
- Tối ưu integer types
- Tăng VARCHAR lengths
- Chuẩn hóa datetime types
- Convert boolean types
- Fix nullable fields

## Support

Nếu gặp vấn đề:
1. Kiểm tra error messages
2. Verify database version compatibility
3. Check TiDB-specific limitations
4. Review backup và rollback nếu cần
5. Xem `DATA_TYPES_OPTIMIZATION.md` cho data types issues
