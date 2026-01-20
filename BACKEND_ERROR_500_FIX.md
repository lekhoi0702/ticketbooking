# 🔧 FIX: Backend API 500 Error

## ❌ VẤN ĐỀ

Frontend gặp lỗi:
```
Failed to load resource: the server responded with a status of 500
/api/banners → 500 ERROR
/api/categories → 500 ERROR
```

## 🔍 NGUYÊN NHÂN CÓ THỂ

1. **Database không kết nối được**
2. **Thiếu dependencies (python-dotenv, marshmallow, PyJWT)**
3. **File `.env` không đúng cấu hình**
4. **Backend code bị lỗi khi refactor**

---

## ✅ GIẢI PHÁP TỪNG BƯỚC

### Bước 1: Kiểm tra Backend có đang chạy không

```bash
# Windows: Check if Python process is running
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
```

**Nếu không có process** → Backend không chạy!

---

### Bước 2: Start Backend (nếu chưa chạy)

```bash
cd ticketbookingapi

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start server
python run.py
```

**Kết quả mong đợi**:
```
* Running on http://127.0.0.1:5000
* Debugger is active!
```

---

### Bước 3: Kiểm tra Backend Log

**Mở terminal khác** và xem log real-time:

```bash
# Windows
Get-Content ticketbookingapi\logs\backend.log -Tail 20 -Wait
```

**Tìm lỗi**:
- `ModuleNotFoundError` → Thiếu dependencies
- `OperationalError` → Database không kết nối được
- `AttributeError` → Code lỗi

---

### Bước 4: Test API Endpoints Manually

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test categories
curl http://localhost:5000/api/categories

# Test banners
curl http://localhost:5000/api/banners
```

**Nếu 500 error** → Xem response body để tìm lỗi cụ thể

---

### Bước 5: Fix Common Issues

#### Issue 1: Thiếu Dependencies

```bash
cd ticketbookingapi
.\venv\Scripts\Activate.ps1

pip install PyJWT python-dotenv marshmallow pymysql
```

#### Issue 2: Database Connection Failed

**Check file `.env`**:

```bash
# View current .env
cat ticketbookingapi\.env
```

**Đảm bảo có các biến**:
```env
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ticketbookingdb
DB_SSL_VERIFY_CERT=True
DB_SSL_VERIFY_IDENTITY=True
SECRET_KEY=your_secret_key_here
```

#### Issue 3: Backend Code Error

**Xem chi tiết lỗi trong terminal** nơi backend đang chạy.

**Common errors**:
- `Table doesn't exist` → Run database migration
- `Column doesn't exist` → Database schema không match code
- `ImportError` → Missing file hoặc circular import

---

## 🚨 QUICK FIX - ROLLBACK BACKEND REFACTORING

Nếu backend refactoring gây lỗi, rollback ngay:

### Option 1: Use Original __init__.py

```bash
cd ticketbookingapi/app

# Backup refactored version
mv __init__.py __init___refactored_backup.py

# Restore original (if you have it)
# Hoặc xóa các import không cần thiết
```

### Option 2: Remove Refactored Files

```bash
cd ticketbookingapi

# Remove new files I created
rm -rf app/decorators
rm -rf app/repositories  
rm -rf app/schemas
rm app/utils/logger.py
rm app/exceptions.py
rm app/routes/auth_refactored.py
rm app/routes/events_refactored.py
rm app/routes/orders_refactored.py
rm app/__init___refactored.py
```

**Sau đó restart backend**:
```bash
python run.py
```

---

## 🎯 DEBUG CHECKLIST

### Check 1: Backend Running?
```bash
curl http://localhost:5000/api/health
```
- [ ] Response OK → Backend running
- [ ] Connection refused → Backend not running
- [ ] 500 error → Backend running but has error

### Check 2: Dependencies Installed?
```bash
.\venv\Scripts\Activate.ps1
pip list | findstr "flask pymysql PyJWT dotenv marshmallow"
```
- [ ] All packages found → OK
- [ ] Missing packages → Run `pip install -r requirements.txt`

### Check 3: Database Connected?
```bash
# In Python console
python
>>> from app import create_app
>>> from app.extensions import db
>>> app = create_app()
>>> with app.app_context():
...     db.session.execute(db.text('SELECT 1'))
```
- [ ] No error → Database OK
- [ ] Error → Check .env database config

### Check 4: Tables Exist?
```bash
python
>>> from app import create_app
>>> from app.extensions import db
>>> from app.models.banner import Banner
>>> app = create_app()
>>> with app.app_context():
...     Banner.query.all()
```
- [ ] Returns list → Table exists
- [ ] Error → Table missing or schema wrong

---

## 🔧 SPECIFIC FIXES

### Fix 1: If `/api/banners` returns 500

**Check**:
```python
# In ticketbookingapi/app/routes/banners.py line 40-46
try:
    banners = Banner.query.filter_by(is_active=True).all()
    # ...
except Exception as e:
    return jsonify({'success': False, 'message': str(e)}), 500
```

**Common issues**:
- `Banner` model không tồn tại
- Column `is_active` không tồn tại trong DB
- Database connection failed

**Quick Fix**: Add better error logging
```python
except Exception as e:
    print(f"[ERROR] Banners route: {str(e)}")
    import traceback
    traceback.print_exc()
    return jsonify({'success': False, 'message': str(e)}), 500
```

### Fix 2: If `/api/categories` returns 500

**Same as above**, check `categories.py` route.

---

## 📊 EXPECTED RESULTS

After fixing:

1. **Backend terminal shows**:
```
* Running on http://127.0.0.1:5000
```

2. **Test endpoints return**:
```bash
curl http://localhost:5000/api/categories
# Should return: {"success": true, "data": [...]}

curl http://localhost:5000/api/banners
# Should return: {"success": true, "data": [...]}
```

3. **Frontend loads**:
- Banner hiển thị
- Events hiển thị
- No console errors

---

## 🚀 RECOMMENDED ACTION NOW

### Immediate Steps:

1. **Open terminal** → Navigate to `ticketbookingapi`
2. **Activate venv** → `.\venv\Scripts\Activate.ps1`
3. **Check running** → `python run.py` (see if it starts)
4. **Watch output** → Look for errors
5. **Test API** → `curl http://localhost:5000/api/health`

### If You See Errors:

**Copy the error message và gửi cho tôi!**

Example errors to look for:
- `ModuleNotFoundError: No module named 'X'`
- `sqlalchemy.exc.OperationalError`
- `pymysql.err.OperationalError`
- `AttributeError`
- `ImportError`

---

## 💡 MOST LIKELY ISSUE

Based on logs earlier: **`ModuleNotFoundError: No module named 'jwt'`**

**Fix**:
```bash
cd ticketbookingapi
.\venv\Scripts\Activate.ps1
pip install PyJWT
python run.py
```

**→ Backend sẽ chạy lại!**

---

**Bạn thử chạy backend và cho tôi biết có lỗi gì xuất hiện nhé!** 🚀

**Copy error message trong terminal để tôi giúp debug chi tiết hơn!**
