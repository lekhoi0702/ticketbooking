# Data Types Optimization Guide

## Tổng quan

Bộ migration này tối ưu hóa kiểu dữ liệu trong database để:
- Tránh integer overflow
- Hỗ trợ URLs và phone numbers dài hơn
- Chuẩn hóa datetime types
- Cải thiện code readability với BOOLEAN type
- Đảm bảo data integrity với NOT NULL constraints

## Các Migration Files

### Phase 1 - Critical (Ưu tiên cao)

1. **optimize_integer_types.sql**
   - Đổi `int(11)` → `int UNSIGNED` cho capacity, quantity fields
   - Đổi `int(11)` → `smallint UNSIGNED` cho max_per_order
   - **Lý do**: Tránh overflow, tăng range gấp đôi, đảm bảo không có giá trị âm
   - **Thời gian**: ~5-10 giây
   - **Downtime**: Có thể cần (ALTER TABLE)

### Phase 2 - Important (Ưu tiên trung bình)

2. **increase_varchar_lengths.sql**
   - URL fields: `varchar(500)` → `varchar(1000)`
   - Phone fields: `varchar(20)` → `varchar(30)`
   - **Lý do**: Hỗ trợ URLs dài hơn và phone numbers quốc tế
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần (chỉ tăng length)

3. **standardize_datetime_types.sql**
   - Convert tất cả `timestamp` → `datetime`
   - **Lý do**: Tránh timezone issues, consistency
   - **Thời gian**: ~5-10 giây
   - **Downtime**: Có thể cần (ALTER TABLE)

### Phase 3 - Enhancement (Ưu tiên thấp)

4. **convert_tinyint_to_boolean.sql**
   - Convert `tinyint(1)` → `BOOLEAN`
   - **Lý do**: Code readability, semantic clarity
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần (BOOLEAN = alias của tinyint(1))

5. **fix_nullable_fields.sql**
   - Fix nullable fields với DEFAULT values
   - **Lý do**: Data integrity, consistency
   - **Thời gian**: ~2-5 giây
   - **Downtime**: Không cần

## Thứ tự thực hiện

**Quan trọng**: Chạy theo đúng thứ tự!

```bash
# Phase 1 - Critical
mysql -u [username] -p [database_name] < optimize_integer_types.sql

# Phase 2 - Important
mysql -u [username] -p [database_name] < increase_varchar_lengths.sql
mysql -u [username] -p [database_name] < standardize_datetime_types.sql

# Phase 3 - Enhancement (Optional)
mysql -u [username] -p [database_name] < convert_tinyint_to_boolean.sql
mysql -u [username] -p [database_name] < fix_nullable_fields.sql
```

## Chi tiết các thay đổi

### 1. Integer Types Optimization

**Fields được thay đổi**:
- `Event.total_capacity`: `int(11)` → `int UNSIGNED`
- `Event.sold_tickets`: `int(11)` → `int UNSIGNED`
- `TicketType.quantity`: `int(11)` → `int UNSIGNED`
- `TicketType.sold_quantity`: `int(11)` → `int UNSIGNED`
- `TicketType.max_per_order`: `int(11)` → `smallint UNSIGNED`
- `Venue.capacity`: `int(11)` → `int UNSIGNED`
- `Discount.usage_limit`: `int(11)` → `int UNSIGNED`
- `Discount.used_count`: `int(11)` → `int UNSIGNED`
- `Advertisement.display_order`: `int(11)` → `int UNSIGNED`
- `Banner.display_order`: `int(11)` → `int UNSIGNED`
- `Seat.x_pos`, `Seat.y_pos`: `int(11)` → `int UNSIGNED`

**Lợi ích**:
- Range tăng từ 2.1B → 4.3B (gấp đôi)
- Đảm bảo không có giá trị âm
- Tránh overflow cho events lớn

### 2. VARCHAR Lengths Increase

**URL Fields** (500 → 1000):
- `Advertisement.image`, `Advertisement.url`
- `Banner.image`, `Banner.url`
- `Event.banner_image_url`, `Event.qr_image_url`
- `Ticket.qr_code_url`
- `OrganizerInfo.logo_url`

**Phone Fields** (20 → 30):
- `User.phone`
- `Order.customer_phone`
- `Venue.contact_phone`
- `OrganizerInfo.contact_phone`

### 3. DateTime Standardization

**Converted từ TIMESTAMP → DATETIME**:
- `Event.created_at`, `Event.updated_at`
- `EventCategory.created_at`
- `Order.created_at`, `Order.updated_at`, `Order.paid_at`, `Order.deleted_at`
- `Payment.payment_date`, `Payment.created_at`
- `Ticket.checked_in_at`, `Ticket.created_at`, `Ticket.deleted_at`
- `TicketType.created_at`
- `User.created_at`, `User.updated_at`
- `Venue.created_at`

**Lý do chọn DATETIME**:
- Application đã có timezone handling riêng (now_gmt7)
- Không có automatic timezone conversion (ít confusion)
- Dễ debug và maintain

### 4. Boolean Conversion

**Converted từ TINYINT(1) → BOOLEAN**:
- `Advertisement.is_active`
- `Banner.is_active`
- `Discount.is_active`
- `Event.is_featured`
- `EventCategory.is_active`
- `Seat.is_active`
- `TicketType.is_active`
- `User.is_active`, `User.must_change_password`
- `Venue.is_active`

**Lưu ý**: BOOLEAN là alias của tinyint(1), nên conversion này an toàn và không thay đổi storage.

### 5. Nullable Fields Fix

**Fields được fix**:
- `Banner.is_active`: NULL → NOT NULL DEFAULT TRUE
- `Banner.display_order`: NULL → NOT NULL DEFAULT 0
- Các `is_active` fields khác: Đảm bảo NOT NULL với DEFAULT

## Lưu ý quan trọng

### Trước khi chạy

1. **Backup database**: 
   ```bash
   mysqldump -u [username] -p [database_name] > backup_before_data_types.sql
   ```

2. **Verify không có negative values**:
   ```sql
   SELECT COUNT(*) FROM `Event` WHERE `total_capacity` < 0;
   SELECT COUNT(*) FROM `Event` WHERE `sold_tickets` < 0;
   ```

3. **Check current max values**:
   ```sql
   SELECT MAX(`total_capacity`) FROM `Event`;
   SELECT MAX(`quantity`) FROM `TicketType`;
   ```

### TiDB Compatibility

- ✅ TiDB support UNSIGNED integers
- ✅ TiDB support BOOLEAN type
- ✅ TiDB support DATETIME và TIMESTAMP
- ✅ VARCHAR length increase an toàn

### Potential Issues

1. **Integer overflow**: Nếu có data vượt quá 2.1B, cần xử lý trước
2. **Timezone**: Sau khi convert timestamp → datetime, verify timezone handling
3. **Application code**: Verify application code vẫn hoạt động với types mới

## Verification sau khi chạy

```sql
-- Check integer types
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check VARCHAR lengths
SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND (COLUMN_NAME LIKE '%url%' OR COLUMN_NAME LIKE '%phone%')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check datetime types
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND DATA_TYPE IN ('datetime', 'timestamp')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check boolean types
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
ORDER BY TABLE_NAME, COLUMN_NAME;
```

## Expected Results

Sau khi chạy tất cả migrations:

- ✅ Tất cả capacity/quantity fields dùng `int UNSIGNED` hoặc `smallint UNSIGNED`
- ✅ URL fields có length >= 1000
- ✅ Phone fields có length >= 30
- ✅ Tất cả datetime fields dùng `DATETIME` type
- ✅ Boolean fields dùng `BOOLEAN` type
- ✅ Important fields có NOT NULL với DEFAULT values

## Rollback

Nếu cần rollback:

```sql
-- Rollback integer types (example)
ALTER TABLE `Event` MODIFY COLUMN `total_capacity` int(11) NOT NULL;
ALTER TABLE `Event` MODIFY COLUMN `sold_tickets` int(11) NULL DEFAULT 0;

-- Rollback VARCHAR lengths (example)
ALTER TABLE `Advertisement` MODIFY COLUMN `image` varchar(500) ...;

-- Rollback datetime (example)
ALTER TABLE `Event` MODIFY COLUMN `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP;

-- Rollback boolean (example)
ALTER TABLE `Event` MODIFY COLUMN `is_featured` tinyint(1) NULL DEFAULT 0;
```

## Support

Nếu gặp vấn đề:
1. Kiểm tra error messages
2. Verify data không vượt quá range mới
3. Check TiDB-specific limitations
4. Review backup và rollback nếu cần
