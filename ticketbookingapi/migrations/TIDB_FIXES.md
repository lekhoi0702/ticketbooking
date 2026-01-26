# TiDB Compatibility Fixes

## Các vấn đề đã được sửa

### 1. **remove_duplicate_indexes.sql**
- **Vấn đề**: Index `deleted_at` không có tên, không thể drop bằng tên
- **Giải pháp**: Tìm tên index thực tế từ INFORMATION_SCHEMA trước khi drop
- **Thay đổi**: Sử dụng `INDEX_NAME` thay vì giả định tên là `deleted_at`

### 2. **standardize_collation.sql**
- **Vấn đề**: TiDB không cho phép convert collation của column khi có index trên column đó
- **Lỗi**: `8200 - Unsupported converting collation of column 'status' from 'utf8mb4_0900_ai_ci' to 'utf8mb4_unicode_ci' when index is defined on it`
- **Giải pháp**: 
  - Drop index `status` trên Seat table trước khi convert
  - Convert collation
  - Recreate index `status` sau khi convert

### 3. **add_missing_indexes.sql**
- **Vấn đề**: SeatReservation table không tồn tại trong database
- **Lỗi**: `1146 - Table 'ticketbookingdb.SeatReservation' doesn't exist`
- **Giải pháp**: Loại bỏ phần code thêm index cho SeatReservation table

### 4. **OrganizerQRCode table**
- **Lưu ý**: Bảng OrganizerQRCode đã được xóa vì QR code sẽ được thêm riêng theo event
- **Giải pháp**: Không có references đến bảng này trong các migration files

### 4. **optimize_row_format.sql**
- **Vấn đề**: TiDB có thể không support ALTER TABLE ROW_FORMAT
- **Lỗi**: `8200 - This type of ALTER TABLE is currently unsupported`
- **Giải pháp**: 
  - Thêm warning comment
  - Loại bỏ SeatReservation table reference
  - **Lưu ý**: TiDB sử dụng Dynamic row format mặc định, nên migration này có thể không cần thiết

## Thứ tự chạy migrations (đã sửa)

1. ✅ **fix_views_remove_obsolete_columns.sql** - Đã sửa (loại bỏ WITH CASCADED CHECK OPTION)
2. ✅ **remove_duplicate_indexes.sql** - Đã sửa (tìm index name thực tế)
3. ✅ **standardize_collation.sql** - Đã sửa (drop index trước khi convert)
4. ✅ **add_missing_indexes.sql** - Đã sửa (loại bỏ SeatReservation)
5. ⚠️ **optimize_row_format.sql** - Có thể skip nếu TiDB không support
6. ✅ **add_composite_indexes.sql** - Nên OK
7. ✅ **add_check_constraints.sql** - Nên OK

## Lưu ý quan trọng

### TiDB Limitations

1. **ROW_FORMAT**: TiDB có thể không support `ALTER TABLE ROW_FORMAT`. Nếu gặp lỗi, skip migration này vì TiDB dùng Dynamic mặc định.

2. **Collation Conversion**: TiDB yêu cầu drop index trước khi convert collation của column có index.

3. **Index Names**: TiDB có thể tạo index với tên khác nếu không chỉ định tên. Luôn check INFORMATION_SCHEMA trước khi drop.

4. **Views**: TiDB không support đầy đủ `WITH CASCADED CHECK OPTION`, đã loại bỏ trong migration.

### Nếu vẫn gặp lỗi

1. **Skip optimize_row_format.sql**: Nếu gặp lỗi "unsupported ALTER TABLE", có thể skip file này vì TiDB đã dùng Dynamic format mặc định.

2. **Check index names**: Nếu gặp lỗi về index không tồn tại, chạy:
   ```sql
   SHOW INDEXES FROM `Order` WHERE Column_name = 'deleted_at';
   SHOW INDEXES FROM `Ticket` WHERE Column_name = 'deleted_at';
   ```

3. **Manual collation conversion**: Nếu vẫn gặp lỗi với collation, có thể cần convert từng column một thay vì cả table:
   ```sql
   ALTER TABLE `Seat` MODIFY COLUMN `status` enum(...) COLLATE utf8mb4_unicode_ci;
   ```

## Verification sau khi chạy

```sql
-- Check collation
SELECT TABLE_NAME, TABLE_COLLATION 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_COLLATION != 'utf8mb4_unicode_ci';

-- Check indexes
SHOW INDEXES FROM `Order` WHERE Column_name = 'deleted_at';
SHOW INDEXES FROM `Ticket` WHERE Column_name = 'deleted_at';

-- Check views
SELECT * FROM v_active_events LIMIT 1;
SELECT * FROM v_event_statistics LIMIT 1;
SELECT * FROM v_published_events LIMIT 1;
```
