# 📋 HƯỚNG DẪN BỔ SUNG DATA CHO 100 EVENTS

## 🔍 Tình trạng hiện tại

Database hiện tại **THIẾU DATA**:
- ✅ Events: **42/100** (thiếu 58 events)
- ❌ TicketType: **0/250** (thiếu hoàn toàn)
- ❌ AuditLog: **0/300** (thiếu hoàn toàn)
- ⚠️ OrganizerInfo: **1/5** (thiếu 4 organizers)

## 📁 Files đã tạo

```
scripts/
├── insert_missing_events.sql              ← Bổ sung 58 events + OrganizerInfo
├── generate_ticket_types_and_audit.py     ← Script Python
└── insert_ticket_types_and_audit.sql      ← Bổ sung TicketType + AuditLog
```

## 🚀 HƯỚNG DẪN THỰC HIỆN

### Bước 1: Chạy SQL Script 1 (Events + OrganizerInfo)

```sql
-- Trong TiDB Cloud SQL Editor:
-- Copy toàn bộ nội dung file: scripts/insert_missing_events.sql
-- Paste và Execute
```

**Kết quả:**
- ✅ Thêm 58 events (Event 43-100)
- ✅ Thêm 5 OrganizerInfo records
- ✅ Tổng: 100 events

### Bước 2: Chạy SQL Script 2 (TicketType + AuditLog)

```sql
-- Trong TiDB Cloud SQL Editor:
-- Copy toàn bộ nội dung file: scripts/insert_ticket_types_and_audit.sql
-- Paste và Execute
```

**Kết quả:**
- ✅ Thêm ~250 TicketType records (2-3 loại vé/event)
- ✅ Thêm 300 AuditLog records (3 logs/event)

### Bước 3: Verify Database

Chạy các query sau để kiểm tra:

```sql
-- 1. Kiểm tra số lượng Events
SELECT COUNT(*) as total_events FROM Event WHERE deleted_at IS NULL;
-- Expected: 100

-- 2. Kiểm tra số lượng TicketType
SELECT COUNT(*) as total_ticket_types FROM TicketType;
-- Expected: ~250

-- 3. Kiểm tra số lượng AuditLog
SELECT COUNT(*) as total_audit_logs FROM AuditLog;
-- Expected: 300

-- 4. Kiểm tra OrganizerInfo
SELECT COUNT(*) as total_organizers FROM OrganizerInfo;
-- Expected: 5

-- 5. Kiểm tra Events theo category
SELECT 
    c.category_name,
    COUNT(e.event_id) as event_count
FROM Event e
JOIN EventCategory c ON e.category_id = c.category_id
WHERE e.deleted_at IS NULL
GROUP BY c.category_name
ORDER BY event_count DESC;
-- Expected: Mỗi category có ~10 events

-- 6. Kiểm tra Events theo organizer
SELECT 
    u.full_name,
    COUNT(e.event_id) as event_count
FROM Event e
JOIN User u ON e.manager_id = u.user_id
WHERE e.deleted_at IS NULL
GROUP BY u.full_name
ORDER BY event_count DESC;
-- Expected: Phân bổ đều ~20 events/organizer

-- 7. Kiểm tra TicketType cho 1 event mẫu
SELECT * FROM TicketType WHERE event_id = 50;
-- Expected: 2-3 ticket types

-- 8. Kiểm tra AuditLog cho 1 event mẫu
SELECT * FROM AuditLog WHERE table_name = 'Event' AND record_id = 50;
-- Expected: 3 audit logs (INSERT, UPDATE x2)
```

## 📊 Tổng quan Data sau khi hoàn thành

| Table | Records | Mô tả |
|-------|---------|-------|
| **Event** | 100 | 100 events (PUBLISHED) |
| **EventCategory** | 10 | 10 categories |
| **Venue** | 24 | 24 venues (8 cities) |
| **User** | 5 organizers | Organizer accounts |
| **OrganizerInfo** | 5 | Organizer details |
| **TicketType** | ~250 | 2-3 types per event |
| **AuditLog** | 300 | 3 logs per event |

## 🎯 Phân bổ Events

### Theo Category (mỗi category ~10 events):
- Âm nhạc: 10 events
- Thể thao: 10 events
- Hội thảo: 10 events
- Triển lãm: 10 events
- Sân khấu: 10 events
- Ẩm thực: 10 events
- Workshop: 10 events
- Hài kịch: 10 events
- Thời trang: 10 events
- Marathon: 10 events

### Theo Organizer:
- Organizer 1 (ID: 85): ~20 events
- Organizer 2 (ID: 86): ~20 events
- Organizer 3 (ID: 87): ~20 events
- Organizer 4 (ID: 88): ~20 events
- Organizer 5 (ID: 89): ~20 events

### Theo City:
- Hồ Chí Minh: ~13 events
- Hà Nội: ~13 events
- Đà Nẵng: ~13 events
- Cần Thơ: ~13 events
- Nha Trang: ~12 events
- Vũng Tàu: ~12 events
- Huế: ~12 events
- Hải Phòng: ~12 events

## ⚠️ Lưu ý quan trọng

1. **Thứ tự thực hiện**: Phải chạy Script 1 trước, Script 2 sau
2. **Foreign Key**: Scripts đã tắt `FOREIGN_KEY_CHECKS` để tránh lỗi
3. **Encoding**: Sử dụng UTF-8 để hiển thị tiếng Việt đúng
4. **Backup**: Nên backup database trước khi chạy scripts

## 🐛 Troubleshooting

### Lỗi: "Duplicate entry"
```sql
-- Xóa data cũ nếu cần:
DELETE FROM AuditLog WHERE table_name = 'Event' AND record_id > 42;
DELETE FROM TicketType WHERE event_id > 42;
DELETE FROM Event WHERE event_id > 42;
DELETE FROM OrganizerInfo WHERE user_id IN (86, 87, 88, 89);
```

### Lỗi: "Foreign key constraint fails"
```sql
-- Kiểm tra User table:
SELECT * FROM User WHERE user_id IN (85, 86, 87, 88, 89);
-- Nếu thiếu, chạy lại phần User trong insert_missing_events.sql
```

### Lỗi: "Cannot add or update a child row"
```sql
-- Kiểm tra EventCategory:
SELECT * FROM EventCategory;
-- Nếu thiếu, chạy lại phần EventCategory
```

## ✅ Checklist hoàn thành

- [ ] Chạy `insert_missing_events.sql`
- [ ] Chạy `insert_ticket_types_and_audit.sql`
- [ ] Verify 100 events
- [ ] Verify ~250 ticket types
- [ ] Verify 300 audit logs
- [ ] Verify 5 organizers
- [ ] Test trên website (http://localhost:5173)
- [ ] Kiểm tra event details
- [ ] Kiểm tra ticket selection
- [ ] Kiểm tra organizer dashboard

## 🎉 Sau khi hoàn thành

Bạn sẽ có:
- ✅ **100 events** đầy đủ, sẵn sàng hiển thị
- ✅ **Ticket types** cho mọi event
- ✅ **Audit trail** đầy đủ
- ✅ **Organizer info** hoàn chỉnh
- ✅ Hệ thống sẵn sàng demo/production

---

**Chúc bạn thành công! 🚀**
