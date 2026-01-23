"""
Script để migrate đường dẫn ảnh trong database Event
Phân tích đường dẫn hiện tại và tạo script SQL để update

Cách sử dụng:
1. Chỉnh sửa các biến cấu hình bên dưới (NEW_PATH_BASE, USE_ORGANIZER_STRUCTURE)
2. Chạy script: python scripts/migrate_image_paths.py
3. Kiểm tra file SQL được tạo ra
4. Chạy SQL script trong database (sau khi đã backup)
"""
import pymysql
import os
import sys
from collections import defaultdict
from dotenv import load_dotenv

# Load .env file
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
env_path = os.path.join(basedir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"✅ Đã load config từ: {env_path}\n")
else:
    print(f"⚠️  Không tìm thấy file .env tại: {env_path}\n")

# ============================================
# CẤU HÌNH DATABASE - Tự động đọc từ .env
# ============================================
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ticketbookingdb'),
    'port': int(os.getenv('DB_PORT', 3306)),
}

# Thêm SSL config nếu có
if os.getenv('DB_SSL_CA'):
    DB_CONFIG['ssl'] = {'ssl': {}}

# ============================================
# CẤU HÌNH ĐƯỜNG DẪN - ⚠️ CHỈNH SỬA THEO CẦN THIẾT
# ============================================
# Đường dẫn mới (base path)
# Nếu bạn đã di chuyển thư mục uploads sang nơi khác, chỉnh sửa ở đây
# Ví dụ: 
#   - Nếu di chuyển sang /media/uploads/ -> NEW_PATH_BASE = '/media/uploads/organizers'
#   - Nếu chỉ thay đổi cấu trúc bên trong uploads -> NEW_PATH_BASE = '/uploads/organizers'
NEW_PATH_BASE = '/uploads/organizers'

# Cấu trúc thư mục mới
# True: sử dụng cấu trúc /uploads/organizers/{manager_id}/events/{filename}
#       (khuyến nghị - phù hợp với upload_helper.py hiện tại)
# False: giữ nguyên cấu trúc cũ nhưng thay đổi base path
#        Ví dụ: /uploads/events/image.jpg -> {NEW_PATH_BASE}/events/image.jpg
USE_ORGANIZER_STRUCTURE = True


def get_new_path(old_path, manager_id):
    """
    Tạo đường dẫn mới từ đường dẫn cũ
    
    Args:
        old_path: Đường dẫn cũ (ví dụ: /uploads/events/image.jpg)
        manager_id: ID của organizer/manager
    
    Returns:
        Đường dẫn mới hoặc None nếu không cần update
    """
    if not old_path:
        return None
    
    # Giữ nguyên URL bên ngoài (http/https)
    if old_path.startswith('http://') or old_path.startswith('https://'):
        return None  # Không cần update
    
    # Chỉ xử lý đường dẫn local bắt đầu bằng /uploads/
    if not old_path.startswith('/uploads/'):
        return None  # Giữ nguyên các đường dẫn khác
    
    # Lấy filename từ đường dẫn cũ
    filename = old_path.split('/')[-1]
    if not filename:
        return None  # Không có filename
    
    if USE_ORGANIZER_STRUCTURE:
        # Cấu trúc mới: /uploads/organizers/{manager_id}/events/{filename}
        return f"{NEW_PATH_BASE}/{manager_id}/events/{filename}"
    else:
        # Chỉ thay đổi base path, giữ nguyên cấu trúc
        relative_path = old_path.replace('/uploads/', '')
        return f"{NEW_PATH_BASE}/{relative_path}"


def analyze_and_generate_sql():
    """Phân tích database và tạo script SQL"""
    
    print("=" * 80)
    print("PHÂN TÍCH VÀ TẠO SCRIPT SQL ĐỂ MIGRATE ĐƯỜNG DẪN ẢNH")
    print("=" * 80)
    print()
    
    try:
        # Kết nối database
        print("🔌 Đang kết nối database...")
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("✅ Kết nối thành công!\n")
        
        # Query tất cả events
        query = """
            SELECT 
                event_id,
                manager_id,
                event_name,
                banner_image_url,
                vietqr_image_url
            FROM Event
            WHERE banner_image_url IS NOT NULL 
               OR vietqr_image_url IS NOT NULL
            ORDER BY event_id
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        if not results:
            print("❌ Không tìm thấy event nào có đường dẫn ảnh!")
            return
        
        print(f"📊 Tìm thấy {len(results)} events có đường dẫn ảnh\n")
        
        # Phân tích và tạo SQL
        banner_updates = []
        vietqr_updates = []
        banner_patterns = defaultdict(list)
        vietqr_patterns = defaultdict(list)
        
        print("📋 PHÂN TÍCH ĐƯỜNG DẪN:\n")
        print("-" * 80)
        
        for row in results:
            event_id, manager_id, event_name, banner_url, vietqr_url = row
            
            # Banner image
            if banner_url:
                # Phân tích pattern
                if banner_url.startswith('/uploads/'):
                    parts = banner_url.replace('/uploads/', '').split('/')
                    pattern = '/'.join(parts[:2]) if len(parts) >= 2 else parts[0]
                    banner_patterns[pattern].append((event_id, manager_id, banner_url))
                
                # Tạo đường dẫn mới
                new_banner_url = get_new_path(banner_url, manager_id)
                if new_banner_url and new_banner_url != banner_url:
                    banner_updates.append((event_id, manager_id, banner_url, new_banner_url))
                    print(f"Event {event_id} (Manager {manager_id}):")
                    print(f"  Banner: {banner_url}")
                    print(f"    -> {new_banner_url}")
                elif not new_banner_url:
                    print(f"Event {event_id}: Banner giữ nguyên (URL bên ngoài hoặc không hợp lệ): {banner_url}")
            
            # VietQR image
            if vietqr_url:
                # Phân tích pattern
                if vietqr_url.startswith('/uploads/'):
                    parts = vietqr_url.replace('/uploads/', '').split('/')
                    pattern = '/'.join(parts[:2]) if len(parts) >= 2 else parts[0]
                    vietqr_patterns[pattern].append((event_id, manager_id, vietqr_url))
                
                # Tạo đường dẫn mới
                new_vietqr_url = get_new_path(vietqr_url, manager_id)
                if new_vietqr_url and new_vietqr_url != vietqr_url:
                    vietqr_updates.append((event_id, manager_id, vietqr_url, new_vietqr_url))
                    print(f"  VietQR: {vietqr_url}")
                    print(f"    -> {new_vietqr_url}")
                elif not new_vietqr_url:
                    print(f"  VietQR giữ nguyên (URL bên ngoài hoặc không hợp lệ): {vietqr_url}")
        
        print("\n" + "=" * 80)
        print("📊 THỐNG KÊ PATTERNS:\n")
        
        if banner_patterns:
            print("BANNER IMAGE PATTERNS:")
            for pattern, paths in sorted(banner_patterns.items()):
                print(f"  {pattern}: {len(paths)} events")
        
        if vietqr_patterns:
            print("\nVIETQR IMAGE PATTERNS:")
            for pattern, paths in sorted(vietqr_patterns.items()):
                print(f"  {pattern}: {len(paths)} events")
        
        # Tạo file SQL
        print("\n" + "=" * 80)
        print("📝 TẠO SCRIPT SQL...")
        print("=" * 80)
        
        sql_file = os.path.join(os.path.dirname(__file__), 'migrate_image_paths.sql')
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- ============================================\n")
            f.write("-- SCRIPT MIGRATE ĐƯỜNG DẪN ẢNH CHO BẢNG EVENT\n")
            f.write("-- ============================================\n")
            f.write("-- \n")
            f.write("-- ⚠️  QUAN TRỌNG:\n")
            f.write("-- 1. BACKUP DATABASE TRƯỚC KHI CHẠY SCRIPT NÀY!\n")
            f.write("-- 2. Kiểm tra kỹ các đường dẫn mới bên dưới\n")
            f.write("-- 3. Đảm bảo thư mục ảnh đã được di chuyển đúng vị trí\n")
            f.write("-- 4. Test trên môi trường dev trước khi chạy production\n")
            f.write("-- \n")
            f.write("-- Tổng số updates: Banner={}, VietQR={}\n".format(
                len(banner_updates), len(vietqr_updates)
            ))
            f.write("-- \n\n")
            f.write("START TRANSACTION;\n\n")
            
            # Banner updates
            if banner_updates:
                f.write("-- ============================================\n")
                f.write("-- UPDATE BANNER IMAGE URLS\n")
                f.write("-- ============================================\n")
                f.write(f"-- Tổng số: {len(banner_updates)} updates\n\n")
                
                for event_id, manager_id, old_path, new_path in banner_updates:
                    f.write(f"-- Event {event_id} (Manager {manager_id})\n")
                    f.write(f"--   Cũ: {old_path}\n")
                    f.write(f"--   Mới: {new_path}\n")
                    # Escape single quotes trong SQL
                    new_path_escaped = new_path.replace("'", "''")
                    f.write(f"UPDATE Event SET banner_image_url = '{new_path_escaped}' WHERE event_id = {event_id};\n\n")
            
            # VietQR updates
            if vietqr_updates:
                f.write("-- ============================================\n")
                f.write("-- UPDATE VIETQR IMAGE URLS\n")
                f.write("-- ============================================\n")
                f.write(f"-- Tổng số: {len(vietqr_updates)} updates\n\n")
                
                for event_id, manager_id, old_path, new_path in vietqr_updates:
                    f.write(f"-- Event {event_id} (Manager {manager_id})\n")
                    f.write(f"--   Cũ: {old_path}\n")
                    f.write(f"--   Mới: {new_path}\n")
                    # Escape single quotes trong SQL
                    new_path_escaped = new_path.replace("'", "''")
                    f.write(f"UPDATE Event SET vietqr_image_url = '{new_path_escaped}' WHERE event_id = {event_id};\n\n")
            
            f.write("-- ============================================\n")
            f.write("-- KIỂM TRA KẾT QUẢ\n")
            f.write("-- ============================================\n\n")
            f.write("-- Xem lại các đường dẫn đã update:\n")
            f.write("SELECT event_id, event_name, manager_id, banner_image_url, vietqr_image_url \n")
            f.write("FROM Event \n")
            f.write("WHERE banner_image_url IS NOT NULL OR vietqr_image_url IS NOT NULL\n")
            f.write("ORDER BY event_id;\n\n")
            f.write("-- Nếu đúng, commit. Nếu sai, rollback:\n")
            f.write("-- COMMIT;\n")
            f.write("-- ROLLBACK;\n")
        
        print(f"\n✅ Đã tạo file SQL: {sql_file}")
        print(f"   - Banner updates: {len(banner_updates)}")
        print(f"   - VietQR updates: {len(vietqr_updates)}")
        print(f"\n⚠️  LƯU Ý:")
        print(f"   1. Kiểm tra kỹ file SQL trước khi chạy")
        print(f"   2. Backup database trước khi update")
        print(f"   3. Chạy từng phần và kiểm tra kết quả")
        print(f"   4. Chỉ commit khi đã xác nhận đúng")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("SCRIPT MIGRATE ĐƯỜNG DẪN ẢNH")
    print("=" * 80)
    print("\n⚠️  Trước khi chạy, vui lòng:")
    print("   1. Kiểm tra và chỉnh sửa DB_CONFIG ở đầu file")
    print("   2. Kiểm tra và chỉnh sửa NEW_PATH_BASE và USE_ORGANIZER_STRUCTURE")
    print("   3. Đảm bảo đã backup database\n")
    
    input("Nhấn Enter để tiếp tục hoặc Ctrl+C để hủy...")
    print()
    
    analyze_and_generate_sql()
