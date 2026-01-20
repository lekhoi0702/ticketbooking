# 🔧 FIX .ENV FILE - HƯỚNG DẪN

## ❌ VẤN ĐỀ

File `.env` hiện tại dùng tên biến SAI:
- `DB_USERNAME` → Phải là `DB_USER`
- `DB_DATABASE` → Phải là `DB_NAME`

---

## ✅ GIẢI PHÁP

### Bước 1: Mở file `.env`

```bash
notepad ticketbookingapi\.env
```

### Bước 2: THAY THẾ TOÀN BỘ NỘI DUNG bằng:

```env
# ============================================
# TICKETBOOKING API - ENVIRONMENT VARIABLES
# ============================================

# Flask Configuration
FLASK_DEBUG=True
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars

# Database Configuration (TiDB Cloud)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2CVjR46iAJPpbCG.root
DB_PASSWORD=Cojs8xqBx7I3q0Zb
DB_NAME=test

# SSL Configuration
DB_SSL_CA=CA_cert.pem
DB_SSL_VERIFY_CERT=True
DB_SSL_VERIFY_IDENTITY=True

# Database Pool Configuration
DB_POOL_RECYCLE=280
DB_POOL_PRE_PING=True
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-this-min-32-chars
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,svg

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=10

# Application Configuration
APP_NAME=TicketBooking API
APP_VERSION=2.0.0
```

### Bước 3: Save file (Ctrl + S)

### Bước 4: Restart backend

```bash
cd ticketbookingapi
.\venv\Scripts\Activate.ps1
python run_debug.py
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

```
============================================================
STARTING BACKEND IN DEBUG MODE
============================================================

[OK] Flask app created successfully
[INFO] Database URI: mysql+pymysql://2CVjR46iAJPpbCG.root:***@gateway01...

[TEST] Testing database connection...
[OK] Database connection successful!

[INFO] Starting Flask server...
============================================================
 * Running on http://0.0.0.0:5000
 * Debugger is active!
```

---

## ⚠️ QUAN TRỌNG

**3 THAY ĐỔI CHÍNH**:

1. `DB_USERNAME` → `DB_USER` ✅
2. `DB_DATABASE` → `DB_NAME` ✅
3. Bỏ dấu ngoặc đơn `'...'` ở giá trị ✅

---

## 📝 CHECKLIST

- [ ] Mở file `.env`
- [ ] Copy toàn bộ nội dung từ trên
- [ ] Paste vào `.env`
- [ ] Save (Ctrl + S)
- [ ] Close notepad
- [ ] Run `python run_debug.py`
- [ ] Thấy `[OK] Database connection successful!`

---

**SAU KHI FIX, CHẠY LỆNH VÀ CHO TÔI BIẾT KẾT QUẢ!** 🚀
