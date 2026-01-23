# 🔧 HƯỚNG DẪN FIX VÀ BỔ SUNG DATA HOÀN CHỈNH

## 🔍 PHÁT HIỆN CÁC VẤN ĐỀ NGHIÊM TRỌNG

Sau khi kiểm tra kỹ database, tôi phát hiện **3 vấn đề quan trọng**:

### ❌ Vấn đề 1: User ID 88 SAI ROLE
```sql
-- HIỆN TẠI (SAI):
User ID 88: role_id = 3 (Customer), email = 'user@gmail.com'

-- CẦN SỬA:
User ID 88: role_id = 2 (Organizer), email = 'organizer4@gmail.com'
```
**Lý do:** User 88 được dùng làm `manager_id` cho nhiều events, nhưng lại có role Customer!

### ❌ Vấn đề 2: Thiếu OrganizerInfo cho User 85
```sql
-- Database hiện có OrganizerInfo cho: 86, 87, 88, 89
-- THIẾU: User 85 (organizer@gmail.com)
```

### ❌ Vấn đề 3: Thiếu 58 Events
```sql
-- Hiện tại: 42 events (ID: 1-42)
-- Cần có: 100 events
-- THIẾU: 58 events (ID: 43-100)
```

## 📁 FILE ĐÃ TẠO

### ⭐ Script chính (KHUYẾN NGHỊ):
```
scripts/fix_database_complete.sql  ← ALL-IN-ONE FIX
```
**Nội dung:**
- ✅ Fix User 88 role
- ✅ Thêm OrganizerInfo cho User 85
- ✅ Thêm 58 events còn thiếu

### 📄 Scripts phụ (nếu cần chạy riêng):
```
scripts/insert_ticket_types_and_audit.sql  ← TicketType + AuditLog
```

## 🚀 HƯỚNG DẪN THỰC HIỆN

### ✅ CÁCH 1: Chạy 1 file duy nhất (KHUYẾN NGHỊ)

```sql
-- Trong TiDB Cloud SQL Editor:
-- 1. Copy toàn bộ nội dung: scripts/fix_database_complete.sql
-- 2. Paste và Execute
```

**Kết quả:**
- ✅ User 88 đã được sửa thành Organizer
- ✅ OrganizerInfo cho User 85 đã được thêm
- ✅ 58 events đã được thêm (tổng 100 events)

### ✅ CÁCH 2: Chạy từng bước

**Bước 1:** Fix Users và OrganizerInfo
```sql
-- Copy phần đầu của fix_database_complete.sql
-- Từ dòng 1 đến dòng 30
```

**Bước 2:** Thêm Events
```sql
-- Copy phần còn lại của fix_database_complete.sql
```

**Bước 3:** Thêm TicketType và AuditLog
```sql
-- Copy nội dung: scripts/insert_ticket_types_and_audit.sql
```

## 📊 TỔNG QUAN DATA SAU KHI FIX

| Table | Trước | Sau | Thêm |
|-------|-------|-----|------|
| **User** | 5 (1 sai role) | 5 (đúng role) | Fix 1 |
| **OrganizerInfo** | 4 | 5 | +1 |
| **Event** | 42 | 100 | +58 |
| **TicketType** | 0 | ~250 | +250 |
| **AuditLog** | 0 | 300 | +300 |

## ✅ VERIFICATION QUERIES

Sau khi chạy scripts, verify bằng các query sau:

### 1. Kiểm tra User 88 đã fix chưa
```sql
SELECT user_id, role_id, email, full_name 
FROM User 
WHERE user_id = 88;
-- Expected: role_id = 2, email = 'organizer4@gmail.com'
```

### 2. Kiểm tra OrganizerInfo
```sql
SELECT COUNT(*) as total FROM OrganizerInfo;
-- Expected: 5

SELECT user_id, organization_name FROM OrganizerInfo ORDER BY user_id;
-- Expected: 85, 86, 87, 88, 89
```

### 3. Kiểm tra tổng Events
```sql
SELECT COUNT(*) as total FROM Event WHERE deleted_at IS NULL;
-- Expected: 100
```

### 4. Kiểm tra Events theo Organizer
```sql
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    COUNT(e.event_id) as event_count
FROM User u
LEFT JOIN Event e ON u.user_id = e.manager_id AND e.deleted_at IS NULL
WHERE u.role_id = 2
GROUP BY u.user_id
ORDER BY u.user_id;
-- Expected: Mỗi organizer có ~20 events
```

### 5. Kiểm tra TicketType
```sql
SELECT COUNT(*) as total FROM TicketType;
-- Expected: ~250

SELECT event_id, COUNT(*) as ticket_types
FROM TicketType
GROUP BY event_id
LIMIT 10;
-- Expected: Mỗi event có 2-3 ticket types
```

### 6. Kiểm tra AuditLog
```sql
SELECT COUNT(*) as total FROM AuditLog;
-- Expected: 300

SELECT action, COUNT(*) as count
FROM AuditLog
WHERE table_name = 'Event'
GROUP BY action;
-- Expected: INSERT: 100, UPDATE: 200
```

## 🎯 DANH SÁCH ORGANIZERS SAU KHI FIX

| ID | Email | Password | Tên | Organization |
|----|-------|----------|-----|--------------|
| 85 | organizer@gmail.com | 123456 | Organizer 1 | Công ty TNHH Sự kiện Việt Nam |
| 86 | organizer2@gmail.com | 123456 | Organizer 2 | Công ty Tổ chức Sự kiện Sao Việt |
| 87 | organizer3@gmail.com | 123456 | Organizer 3 | Trung tâm Hội nghị và Triển lãm Quốc tế |
| 88 | organizer4@gmail.com | 123456 | Organizer 4 | Công ty Sự kiện Thể thao Việt Nam |
| 89 | organizer5@gmail.com | 123456 | Organizer 5 | Trung tâm Văn hóa Nghệ thuật |

**Lưu ý:** Tất cả organizers đều có password: `123456`

## 📋 CHECKLIST HOÀN THÀNH

- [ ] Chạy `fix_database_complete.sql`
- [ ] Verify User 88 đã đúng role
- [ ] Verify có 5 OrganizerInfo
- [ ] Verify có 100 events
- [ ] Chạy `insert_ticket_types_and_audit.sql`
- [ ] Verify có ~250 ticket types
- [ ] Verify có 300 audit logs
- [ ] Test login với 5 organizer accounts
- [ ] Test hiển thị events trên website
- [ ] Test organizer dashboard

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Thứ tự thực hiện
```
1. fix_database_complete.sql (PHẢI CHẠY TRƯỚC)
2. insert_ticket_types_and_audit.sql (SAU ĐÓ)
```

### 2. Nếu gặp lỗi "Duplicate entry"
```sql
-- Xóa data cũ trước:
DELETE FROM Event WHERE event_id > 42;
-- Sau đó chạy lại script
```

### 3. Nếu User 88 đã có events
```sql
-- Script sẽ tự động UPDATE, không INSERT mới
-- Không cần lo lắng về duplicate
```

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot add foreign key constraint"
```sql
-- Kiểm tra User table:
SELECT * FROM User WHERE user_id IN (85, 86, 87, 88, 89);
-- Nếu thiếu, cần thêm User trước
```

### Lỗi: "Duplicate entry for key 'PRIMARY'"
```sql
-- Kiểm tra event_id đã tồn tại:
SELECT event_id FROM Event WHERE event_id BETWEEN 43 AND 100;
-- Nếu có, xóa trước khi chạy lại
```

### User 88 vẫn là Customer sau khi UPDATE
```sql
-- Chạy lại UPDATE:
UPDATE User SET role_id = 2 WHERE user_id = 88;
-- Verify:
SELECT role_id FROM User WHERE user_id = 88;
```

## 🎉 SAU KHI HOÀN THÀNH

Bạn sẽ có hệ thống hoàn chỉnh:
- ✅ **5 Organizers** với đúng role và OrganizerInfo
- ✅ **100 Events** (PUBLISHED)
- ✅ **~250 Ticket Types** (đa dạng giá)
- ✅ **300 Audit Logs** (tuân thủ workflow)
- ✅ **24 Venues** (8 cities)
- ✅ **10 Categories**

### Test ngay:
1. Login với organizer accounts
2. Xem dashboard của từng organizer
3. Kiểm tra events trên homepage
4. Test booking flow

---

**Chúc bạn thành công! 🚀**

Nếu gặp vấn đề, hãy check lại từng bước trong checklist!
