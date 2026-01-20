# 🚀 AUTO IMPORT DATABASE - HƯỚNG DẪN

## ✅ CHẠY SCRIPT TỰ ĐỘNG

Tôi đã tạo script `import_database.py` để **tự động import** file SQL vào TiDB Cloud!

---

## 📝 CÁCH CHẠY

### Mở terminal mới và chạy:

```bash
cd ticketbookingapi
.\venv\Scripts\Activate.ps1
python import_database.py
```

**Script sẽ tự động**:
1. ✅ Kết nối đến TiDB Cloud
2. ✅ Tạo database `ticketbookingdb` (nếu chưa có)
3. ✅ Đọc file `ticketbookingdb.sql`
4. ✅ Import tất cả tables và data
5. ✅ Verify tables đã được tạo

---

## 🎯 KẾT QUẢ MONG ĐỢI

```
======================================================================
AUTO IMPORT DATABASE TO TIDB CLOUD
======================================================================

[CONFIG]
  Host: gateway01.ap-southeast-1.prod.aws.tidbcloud.com
  Port: 4000
  User: 2CVjR46iAJPpbCG.root
  Target DB: ticketbookingdb

[SQL FILE]
  Path: C:\Users\lekho\Desktop\ticketbooking\ticketbookingdb.sql
  [OK] File found

[STEP 1] Connecting to TiDB Cloud...
  [OK] Connected successfully!

[STEP 2] Creating database 'ticketbookingdb'...
  [OK] Database 'ticketbookingdb' ready!

[STEP 3] Reading SQL file...
  [OK] Read XXXXX characters

[STEP 4] Parsing SQL statements...
  [OK] Found XXX SQL statements

[STEP 5] Executing SQL statements...
  Progress: 10/XXX statements...
  Progress: 20/XXX statements...
  ...
  [DONE] XXX succeeded, 0 errors

[STEP 6] Verifying tables...
  [OK] Found XX tables:
      - Banner
      - Discount
      - Event
      - EventCategory
      - FavoriteEvent
      - Order
      - OrganizerInfo
      - Payment
      - Role
      - Seat
      - Ticket
      - TicketType
      - User
      - Venue

======================================================================
IMPORT COMPLETE!
======================================================================

[NEXT STEPS]
1. Update .env file:
   DB_NAME=ticketbookingdb
2. Restart backend:
   python run_debug.py
3. Test API:
   http://localhost:5000/api/categories
```

---

## ⚙️ SAU KHI IMPORT

### 1. Update file `.env`:

```bash
notepad .env
```

**Sửa dòng này**:
```env
DB_NAME=ticketbookingdb
```

### 2. Restart backend:

```bash
python run_debug.py
```

### 3. Test API:

Mở browser → http://localhost:5000/api/categories

**Nếu thấy**:
```json
{
  "success": true,
  "data": [...]
}
```

**→ THÀNH CÔNG!** ✅

### 4. Refresh frontend:

```
Ctrl + Shift + R
```

**→ Banner và events sẽ hiển thị!** 🎉

---

## 🔧 NẾU GẶP LỖI

### Lỗi: "File not found"

**Nguyên nhân**: File `ticketbookingdb.sql` không có trong project root

**Giải pháp**:
```bash
# Kiểm tra file có tồn tại không
ls ticketbookingdb.sql
```

### Lỗi: "Connection failed"

**Nguyên nhân**: TiDB credentials sai hoặc SSL cert không đúng

**Giải pháp**: Check lại file `.env` và `CA_cert.pem`

### Lỗi: "Permission denied"

**Nguyên nhân**: User không có quyền CREATE DATABASE

**Giải pháp**: Contact TiDB support để cấp quyền

---

## 💡 HOẶC IMPORT BẰNG TAY

Nếu script không chạy được:

### Option 1: TiDB Cloud Console

1. Đăng nhập https://tidbcloud.com
2. Chọn cluster
3. Click "Chat2Query" hoặc "SQL Editor"
4. Mở file `ticketbookingdb.sql`
5. Copy & paste vào SQL Editor
6. Click "Run"

### Option 2: MySQL Client

```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
      -P 4000 \
      -u 2CVjR46iAJPpbCG.root \
      -p \
      --ssl-ca=CA_cert.pem \
      < ticketbookingdb.sql
```

---

## 📊 CHECKLIST

- [ ] Chạy `python import_database.py`
- [ ] Xem output: "IMPORT COMPLETE!"
- [ ] Update `.env` → `DB_NAME=ticketbookingdb`
- [ ] Restart backend: `python run_debug.py`
- [ ] Test API: http://localhost:5000/api/categories
- [ ] Refresh frontend: `Ctrl + Shift + R`
- [ ] Verify banner và events hiển thị

---

**CHẠY SCRIPT VÀ CHO TÔI BIẾT KẾT QUẢ NHÉ!** 🚀
