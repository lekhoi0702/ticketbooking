# Database Optimization Migrations

## Tổng quan

Các migration files này được tạo để tối ưu hóa database theo kế hoạch đã phân tích. Tất cả migrations đều được thiết kế để chạy an toàn và có thể rollback nếu cần.

## Thứ tự thực hiện

### Phase 1 - Critical Fixes (Thực hiện ngay)

1. **fix_views_remove_obsolete_columns.sql**
   - Sửa các views để xóa references đến columns không còn tồn tại
   - **Thời gian**: ~1-2 giây
   - **Downtime**: Không cần (chỉ sửa views)

2. **remove_duplicate_indexes.sql**
   - Xóa duplicate indexes trong Order và Ticket tables
   - **Thời gian**: ~1-2 giây
   - **Downtime**: Không cần

3. **standardize_collation.sql**
   - Chuẩn hóa collation về utf8mb4_unicode_ci
   - **Thời gian**: ~5-10 giây (tùy số lượng data)
   - **Downtime**: Có thể cần (ALTER TABLE có thể lock tables)

### Phase 2 - Performance (Thực hiện sau Phase 1)

4. **add_missing_indexes.sql**
   - Thêm missing indexes cho foreign keys
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Có thể cần (tùy kích thước table)

5. **add_composite_indexes.sql**
   - Thêm composite indexes cho query patterns phổ biến
   - **Thời gian**: ~5-15 giây (tùy kích thước tables)
   - **Downtime**: Có thể cần

6. **optimize_row_format.sql**
   - Đổi ROW_FORMAT từ Compact sang Dynamic
   - **Thời gian**: ~10-30 giây (tùy kích thước tables)
   - **Downtime**: Có thể cần (ALTER TABLE)

### Phase 3 - Enhancement (Thực hiện sau Phase 2)

7. **add_check_constraints.sql**
   - Thêm check constraints cho business logic
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần (chỉ thêm constraints)

## Cách chạy migrations

### Option 1: Chạy từng file riêng lẻ

```bash
# Kết nối database
mysql -u [username] -p [database_name] < fix_views_remove_obsolete_columns.sql
mysql -u [username] -p [database_name] < remove_duplicate_indexes.sql
mysql -u [username] -p [database_name] < standardize_collation.sql
# ... tiếp tục với các files khác
```

### Option 2: Chạy tất cả theo thứ tự

```bash
# Tạo script chạy tất cả
cat fix_views_remove_obsolete_columns.sql \
    remove_duplicate_indexes.sql \
    standardize_collation.sql \
    add_missing_indexes.sql \
    add_composite_indexes.sql \
    optimize_row_format.sql \
    add_check_constraints.sql | mysql -u [username] -p [database_name]
```

### Option 3: Sử dụng MySQL Workbench hoặc TiDB client

1. Mở từng file migration
2. Chạy theo thứ tự
3. Verify kết quả bằng các verification queries trong mỗi file

## Lưu ý quan trọng

### Trước khi chạy

1. **Backup database**: 
   ```bash
   mysqldump -u [username] -p [database_name] > backup_before_migrations.sql
   ```

2. **Test trên staging environment trước**

3. **Kiểm tra TiDB compatibility**: Một số features có thể khác với MySQL standard

4. **Thời gian tốt nhất**: Chạy vào giờ thấp điểm để giảm impact

### Trong khi chạy

1. **Monitor**: Theo dõi query execution time và lock wait time
2. **Không interrupt**: Không dừng migrations giữa chừng
3. **Log**: Ghi lại kết quả của mỗi migration

### Sau khi chạy

1. **Verify**: Chạy verification queries trong mỗi file
2. **Test application**: Test các chức năng chính của ứng dụng
3. **Monitor performance**: So sánh query performance trước và sau

## Rollback (nếu cần)

### Rollback views
```sql
-- Restore original views từ backup hoặc ticketbookingdb.sql
DROP VIEW IF EXISTS v_active_events;
DROP VIEW IF EXISTS v_event_statistics;
DROP VIEW IF EXISTS v_published_events;
-- Sau đó recreate từ backup
```

### Rollback indexes
```sql
-- Xóa indexes đã thêm (nếu cần)
ALTER TABLE `Event` DROP INDEX `idx_status_start_datetime`;
ALTER TABLE `Event` DROP INDEX `idx_category_status_start`;
-- ... (xóa các indexes khác nếu cần)
```

### Rollback collation
```sql
-- Restore collation từ backup
ALTER TABLE `Banner` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `OrganizerInfo` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `Seat` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `FavoriteEvent` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

### Rollback constraints
```sql
-- Xóa check constraints
ALTER TABLE `Event` DROP CONSTRAINT `chk_event_capacity`;
ALTER TABLE `Event` DROP CONSTRAINT `chk_event_datetime`;
ALTER TABLE `TicketType` DROP CONSTRAINT `chk_ticket_type_quantity`;
ALTER TABLE `TicketType` DROP CONSTRAINT `chk_ticket_type_price`;
ALTER TABLE `Discount` DROP CONSTRAINT `chk_discount_dates`;
ALTER TABLE `Discount` DROP CONSTRAINT `chk_discount_value_positive`;
ALTER TABLE `Order` DROP CONSTRAINT `chk_order_amount`;
ALTER TABLE `Order` DROP CONSTRAINT `chk_order_amounts_positive`;
ALTER TABLE `Advertisement` DROP CONSTRAINT `chk_advertisement_dates`;
```

## Verification Queries

Sau khi chạy migrations, có thể verify bằng các queries sau:

```sql
-- Check collation
SELECT TABLE_NAME, TABLE_COLLATION 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
ORDER BY TABLE_NAME;

-- Check indexes
SHOW INDEXES FROM `Event`;
SHOW INDEXES FROM `Order`;
SHOW INDEXES FROM `TicketType`;

-- Check constraints
SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY TABLE_NAME;

-- Check row format
SELECT TABLE_NAME, ROW_FORMAT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Test views
SELECT * FROM v_active_events LIMIT 5;
SELECT * FROM v_event_statistics LIMIT 5;
SELECT * FROM v_published_events LIMIT 5;
```

## Expected Results

Sau khi hoàn thành tất cả migrations:

- ✅ Tất cả tables sử dụng collation `utf8mb4_unicode_ci`
- ✅ Views không còn reference đến columns không tồn tại
- ✅ Không còn duplicate indexes
- ✅ Tất cả foreign keys đều có indexes
- ✅ Composite indexes được thêm cho các query patterns phổ biến
- ✅ ROW_FORMAT = Dynamic cho tất cả tables
- ✅ Check constraints được thêm cho business logic validation

## Performance Impact

### Expected Improvements

- **Query performance**: Cải thiện 20-50% cho các queries sử dụng composite indexes
- **Index scans**: Tăng tỷ lệ index scan vs table scan
- **Storage**: Dynamic row format có thể tiết kiệm 5-10% storage cho tables có nhiều VARCHAR/TEXT
- **Consistency**: Collation standardization giúp tránh lỗi khi join tables

### Monitoring

Sau khi chạy migrations, monitor:
- Query execution time
- Index usage statistics
- Table lock wait time
- Database size

## Support

Nếu gặp vấn đề khi chạy migrations:
1. Kiểm tra error messages
2. Verify database version compatibility
3. Check TiDB-specific limitations
4. Review backup và rollback nếu cần
