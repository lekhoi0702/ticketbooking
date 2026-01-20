# ⚡ Quick Start - Database Migration

## TL;DR - Chạy Migration Ngay

### 🎯 3 Bước Đơn Giản:

```bash
# 1. Backup (QUAN TRỌNG!)
mysqldump -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  --single-transaction \
  ticketbookingdb > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Connect to database
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  ticketbookingdb

# 3. Run commands below
```

---

## 📝 Copy-Paste Script (Run từng phần)

### PART 1: Add Indexes (An toàn - chạy bao nhiêu lần cũng được)

```sql
USE ticketbookingdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Event indexes
ALTER TABLE Event ADD INDEX IF NOT EXISTS idx_event_name (event_name(100));
ALTER TABLE Event ADD INDEX IF NOT EXISTS idx_status_start (status, start_datetime);
ALTER TABLE Event ADD INDEX IF NOT EXISTS idx_published_featured (status, is_featured, start_datetime);
ALTER TABLE Event ADD INDEX IF NOT EXISTS idx_category_status (category_id, status, start_datetime);

-- Order indexes
ALTER TABLE `Order` ADD INDEX IF NOT EXISTS idx_customer_email (customer_email);
ALTER TABLE `Order` ADD INDEX IF NOT EXISTS idx_user_status_created (user_id, order_status, created_at DESC);
ALTER TABLE `Order` ADD INDEX IF NOT EXISTS idx_status_created (order_status, created_at DESC);

-- Ticket indexes
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_holder_email (holder_email);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_ticket_type_status (ticket_type_id, ticket_status);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_order_status (order_id, ticket_status);

-- Payment indexes
ALTER TABLE Payment ADD INDEX IF NOT EXISTS idx_transaction (transaction_id);
ALTER TABLE Payment ADD INDEX IF NOT EXISTS idx_payment_status_date (payment_status, paid_at);
ALTER TABLE Payment ADD INDEX IF NOT EXISTS idx_method_status (payment_method, payment_status);

-- TicketType indexes
ALTER TABLE TicketType ADD INDEX IF NOT EXISTS idx_event_active (event_id, is_active);
ALTER TABLE TicketType ADD INDEX IF NOT EXISTS idx_event_price (event_id, price);

-- Venue indexes
ALTER TABLE Venue ADD INDEX IF NOT EXISTS idx_city_active (city, is_active, status);

-- Discount indexes
ALTER TABLE Discount ADD INDEX IF NOT EXISTS idx_dates (start_date, end_date, is_active);
ALTER TABLE Discount ADD INDEX IF NOT EXISTS idx_manager (manager_id, is_active);
ALTER TABLE Discount ADD INDEX IF NOT EXISTS idx_event (event_id, is_active);

-- Seat indexes
ALTER TABLE Seat ADD INDEX IF NOT EXISTS idx_type_status_area (ticket_type_id, status, area_name);

-- FavoriteEvent indexes
ALTER TABLE FavoriteEvent ADD INDEX IF NOT EXISTS idx_user_created (user_id, created_at DESC);

SET FOREIGN_KEY_CHECKS = 1;

-- Verify indexes added
SELECT COUNT(*) as total_indexes 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'ticketbookingdb' 
  AND INDEX_NAME LIKE 'idx_%';

-- Should show ~40-50 indexes
```

✅ **DONE! Indexes added successfully!**

---

### PART 2: Check Constraints (Kiểm tra trước khi chạy)

**Bước 1**: Kiểm tra constraints đã tồn tại chưa

```sql
-- Check existing constraints
SELECT CONSTRAINT_NAME, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb' 
  AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY TABLE_NAME;
```

**Nếu có kết quả**: Constraints đã tồn tại → SKIP PART 2  
**Nếu KHÔNG có kết quả**: Tiếp tục bước 2

---

**Bước 2**: Kiểm tra data có hợp lệ không

```sql
-- Check for invalid data
SELECT 
    'Invalid event dates' as issue, 
    COUNT(*) as count
FROM Event
WHERE start_datetime >= end_datetime
UNION ALL
SELECT 'Invalid order amounts', COUNT(*)
FROM `Order`
WHERE final_amount > total_amount
UNION ALL
SELECT 'Oversold tickets', COUNT(*)
FROM TicketType
WHERE sold_quantity > quantity;
```

**Nếu count > 0**: Fix data trước (xem hướng dẫn dưới)  
**Nếu count = 0**: An toàn, tiếp tục bước 3

---

**Bước 3**: Add constraints

```sql
-- Event constraints
ALTER TABLE Event ADD CONSTRAINT chk_event_dates 
CHECK (start_datetime < end_datetime);

ALTER TABLE Event ADD CONSTRAINT chk_event_capacity
CHECK (total_capacity > 0);

ALTER TABLE Event ADD CONSTRAINT chk_event_sold
CHECK (sold_tickets >= 0 AND sold_tickets <= total_capacity);

-- TicketType constraints
ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_quantity 
CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_price 
CHECK (price >= 0);

ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_quantity_positive
CHECK (quantity > 0);

-- Ticket constraints
ALTER TABLE Ticket ADD CONSTRAINT chk_ticket_price_positive 
CHECK (price >= 0);

-- Order constraints
ALTER TABLE `Order` ADD CONSTRAINT chk_order_amounts 
CHECK (total_amount >= 0 AND final_amount >= 0 AND final_amount <= total_amount);

-- Payment constraints
ALTER TABLE Payment ADD CONSTRAINT chk_payment_amount 
CHECK (amount >= 0);

-- Discount constraints
ALTER TABLE Discount ADD CONSTRAINT chk_discount_dates
CHECK (start_date < end_date);

ALTER TABLE Discount ADD CONSTRAINT chk_discount_value
CHECK (discount_value >= 0);

-- Venue constraints
ALTER TABLE Venue ADD CONSTRAINT chk_venue_capacity
CHECK (capacity > 0);

-- Verify constraints added
SELECT COUNT(*) as total_constraints
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb' 
  AND CONSTRAINT_TYPE = 'CHECK';

-- Should show ~15-20 constraints
```

✅ **DONE! Constraints added successfully!**

---

### PART 3: Verify Migration

```sql
-- Update statistics
ANALYZE TABLE Event, `Order`, Ticket, Payment, TicketType;

-- Test index usage
EXPLAIN SELECT * FROM Event 
WHERE event_name LIKE '%concert%' 
  AND status = 'PUBLISHED'
LIMIT 10;
-- Should show: Using index

-- Final summary
SELECT 
    'Migration completed!' as status,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'ticketbookingdb' AND INDEX_NAME LIKE 'idx_%') as indexes,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = 'ticketbookingdb' AND CONSTRAINT_TYPE = 'CHECK') as constraints;
```

---

## 🔧 Fix Invalid Data (Nếu cần)

### Fix invalid event dates
```sql
-- Preview
SELECT event_id, event_name, start_datetime, end_datetime
FROM Event
WHERE start_datetime >= end_datetime;

-- Fix: Set end = start + 2 hours
UPDATE Event 
SET end_datetime = DATE_ADD(start_datetime, INTERVAL 2 HOUR)
WHERE start_datetime >= end_datetime;
```

### Fix invalid order amounts
```sql
-- Preview
SELECT order_id, order_code, total_amount, final_amount
FROM `Order`
WHERE final_amount > total_amount;

-- Fix: Set final = total
UPDATE `Order`
SET final_amount = total_amount
WHERE final_amount > total_amount;
```

### Fix oversold tickets
```sql
-- Preview
SELECT ticket_type_id, event_id, quantity, sold_quantity
FROM TicketType
WHERE sold_quantity > quantity;

-- Fix: Set quantity = sold_quantity
UPDATE TicketType
SET quantity = sold_quantity
WHERE sold_quantity > quantity;
```

---

## ❌ Common Errors

### Error: "IF NOT EXISTS syntax error"
```
1064 - You have an error in your SQL syntax... near "IF NOT EXISTS chk_event_dates"
```

**Fix**: Đây là lỗi ở PART 2 (constraints). TiDB không hỗ trợ `IF NOT EXISTS` cho constraints.  
**Solution**: Dùng script trong hướng dẫn này (đã bỏ IF NOT EXISTS)

### Error: "Duplicate constraint name"
```
1061 - Duplicate constraint name 'chk_event_dates'
```

**Fix**: Constraint đã tồn tại → SKIP statement này  
**Solution**: An toàn, tiếp tục với statement tiếp theo

### Error: "Duplicate key name"
```
1061 - Duplicate key name 'idx_event_name'
```

**Fix**: Index đã tồn tại → SKIP  
**Solution**: Do có `IF NOT EXISTS`, error này KHÔNG nên xuất hiện. Nếu có, ignore.

---

## ✅ Success Checklist

- [ ] Backup hoàn tất
- [ ] Part 1 (Indexes) chạy thành công
- [ ] Data validation passed
- [ ] Part 2 (Constraints) chạy thành công
- [ ] Verification queries OK
- [ ] Application chạy bình thường

---

## 🎯 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Total Indexes | ~20 | 45+ |
| CHECK Constraints | 0 | 15-20 |
| Query Speed | 100-200ms | 20-50ms |

---

## 🆘 Need Help?

**Nếu gặp lỗi**:
1. Copy error message
2. Check "Common Errors" section
3. Xem MIGRATION_EXECUTION_GUIDE.md (chi tiết hơn)
4. Check TROUBLESHOOTING section

**Rollback** (nếu cần):
```bash
mysql ... < backup_YYYYMMDD_HHMMSS.sql
```

---

**Migration time**: 5-10 phút  
**Risk**: Low (chỉ thêm indexes + constraints)  
**Downtime**: Không cần  
**Reversible**: Có (có backup)

**Good luck! 🚀**
