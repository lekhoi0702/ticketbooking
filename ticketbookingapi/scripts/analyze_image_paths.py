"""
Script để phân tích đường dẫn ảnh hiện tại trong database Event
và tạo script SQL để update đường dẫn mới
"""
import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from sqlalchemy import text

def analyze_image_paths():
    """Phân tích tất cả các đường dẫn ảnh trong bảng Event"""
    app = create_app()
    
    with app.app_context():
        print("=" * 80)
        print("PHÂN TÍCH ĐƯỜNG DẪN ẢNH TRONG DATABASE")
        print("=" * 80)
        print()
        
        # Query tất cả events với image paths
        query = text("""
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
        """)
        
        results = db.session.execute(query).fetchall()
        
        if not results:
            print("❌ Không tìm thấy event nào có đường dẫn ảnh!")
            return
        
        print(f"📊 Tìm thấy {len(results)} events có đường dẫn ảnh\n")
        
        # Phân tích patterns
        banner_patterns = defaultdict(list)
        vietqr_patterns = defaultdict(list)
        all_banner_paths = []
        all_vietqr_paths = []
        
        print("📋 CHI TIẾT CÁC ĐƯỜNG DẪN:\n")
        print("-" * 80)
        
        for row in results:
            event_id, manager_id, event_name, banner_url, vietqr_url = row
            
            print(f"\nEvent ID: {event_id} | Manager ID: {manager_id}")
            print(f"Tên: {event_name}")
            
            if banner_url:
                print(f"  Banner: {banner_url}")
                all_banner_paths.append((event_id, manager_id, banner_url))
                
                # Phân tích pattern
                if banner_url.startswith('/uploads/'):
                    parts = banner_url.replace('/uploads/', '').split('/')
                    if len(parts) > 0:
                        pattern = '/'.join(parts[:2]) if len(parts) >= 2 else parts[0]
                        banner_patterns[pattern].append((event_id, manager_id, banner_url))
            
            if vietqr_url:
                print(f"  VietQR: {vietqr_url}")
                all_vietqr_paths.append((event_id, manager_id, vietqr_url))
                
                # Phân tích pattern
                if vietqr_url.startswith('/uploads/'):
                    parts = vietqr_url.replace('/uploads/', '').split('/')
                    if len(parts) > 0:
                        pattern = '/'.join(parts[:2]) if len(parts) >= 2 else parts[0]
                        vietqr_patterns[pattern].append((event_id, manager_id, vietqr_url))
        
        print("\n" + "=" * 80)
        print("📊 PHÂN TÍCH PATTERNS:\n")
        
        print("BANNER IMAGE PATTERNS:")
        print("-" * 80)
        for pattern, paths in sorted(banner_patterns.items()):
            print(f"\n  Pattern: {pattern}")
            print(f"  Số lượng: {len(paths)}")
            if len(paths) <= 5:
                for event_id, manager_id, path in paths:
                    print(f"    - Event {event_id} (Manager {manager_id}): {path}")
            else:
                print(f"    (Hiển thị 5 đầu tiên trong {len(paths)} paths)")
                for event_id, manager_id, path in paths[:5]:
                    print(f"    - Event {event_id} (Manager {manager_id}): {path}")
        
        print("\n" + "-" * 80)
        print("VIETQR IMAGE PATTERNS:")
        print("-" * 80)
        for pattern, paths in sorted(vietqr_patterns.items()):
            print(f"\n  Pattern: {pattern}")
            print(f"  Số lượng: {len(paths)}")
            if len(paths) <= 5:
                for event_id, manager_id, path in paths:
                    print(f"    - Event {event_id} (Manager {manager_id}): {path}")
            else:
                print(f"    (Hiển thị 5 đầu tiên trong {len(paths)} paths)")
                for event_id, manager_id, path in paths[:5]:
                    print(f"    - Event {event_id} (Manager {manager_id}): {path}")
        
        # Tạo file SQL
        print("\n" + "=" * 80)
        print("📝 TẠO SCRIPT SQL")
        print("=" * 80)
        
        generate_sql_script(all_banner_paths, all_vietqr_paths, banner_patterns, vietqr_patterns)
        
        print("\n✅ Hoàn thành phân tích!")
        print("\n⚠️  LƯU Ý:")
        print("   1. Kiểm tra kỹ script SQL trước khi chạy")
        print("   2. Backup database trước khi update")
        print("   3. Xác nhận đường dẫn mới đúng với cấu trúc thư mục mới")


def generate_sql_script(banner_paths, vietqr_paths, banner_patterns, vietqr_patterns):
    """Tạo script SQL để update đường dẫn"""
    
    sql_file = os.path.join(os.path.dirname(__file__), 'update_image_paths.sql')
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("-- ============================================\n")
        f.write("-- SCRIPT UPDATE ĐƯỜNG DẪN ẢNH CHO BẢNG EVENT\n")
        f.write("-- ============================================\n")
        f.write("-- Ngày tạo: " + str(__import__('datetime').datetime.now()) + "\n")
        f.write("-- \n")
        f.write("-- LƯU Ý: \n")
        f.write("-- 1. Backup database trước khi chạy script này\n")
        f.write("-- 2. Kiểm tra kỹ các đường dẫn mới\n")
        f.write("-- 3. Đảm bảo thư mục ảnh đã được di chuyển đúng\n")
        f.write("-- \n")
        f.write("-- CÁCH SỬ DỤNG:\n")
        f.write("-- 1. Xem lại các patterns bên dưới\n")
        f.write("-- 2. Chỉnh sửa các đường dẫn mới theo cấu trúc thư mục mới của bạn\n")
        f.write("-- 3. Chạy script này trong MySQL\n")
        f.write("\n")
        f.write("START TRANSACTION;\n\n")
        
        # Banner images
        if banner_paths:
            f.write("-- ============================================\n")
            f.write("-- UPDATE BANNER IMAGE URLS\n")
            f.write("-- ============================================\n\n")
            
            f.write("-- Các patterns hiện tại:\n")
            for pattern in sorted(banner_patterns.keys()):
                f.write(f"--   {pattern}: {len(banner_patterns[pattern])} events\n")
            f.write("\n")
            
            f.write("-- ⚠️  CHỈNH SỬA CÁC ĐƯỜNG DẪN MỚI DƯỚI ĐÂY:\n\n")
            
            for event_id, manager_id, old_path in banner_paths:
                # Tạo đường dẫn mới dựa trên pattern mới
                # Giả sử đường dẫn mới là: /uploads/organizers/{manager_id}/events/{filename}
                if old_path.startswith('/uploads/'):
                    # Lấy filename từ đường dẫn cũ
                    filename = old_path.split('/')[-1]
                    new_path = f"/uploads/organizers/{manager_id}/events/{filename}"
                    
                    f.write(f"-- Event {event_id}: {old_path}\n")
                    f.write(f"UPDATE Event SET banner_image_url = '{new_path}' WHERE event_id = {event_id};\n\n")
        
        # VietQR images
        if vietqr_paths:
            f.write("-- ============================================\n")
            f.write("-- UPDATE VIETQR IMAGE URLS\n")
            f.write("-- ============================================\n\n")
            
            f.write("-- Các patterns hiện tại:\n")
            for pattern in sorted(vietqr_patterns.keys()):
                f.write(f"--   {pattern}: {len(vietqr_patterns[pattern])} events\n")
            f.write("\n")
            
            f.write("-- ⚠️  CHỈNH SỬA CÁC ĐƯỜNG DẪN MỚI DƯỚI ĐÂY:\n\n")
            
            for event_id, manager_id, old_path in vietqr_paths:
                # Tạo đường dẫn mới dựa trên pattern mới
                if old_path.startswith('/uploads/'):
                    # Lấy filename từ đường dẫn cũ
                    filename = old_path.split('/')[-1]
                    new_path = f"/uploads/organizers/{manager_id}/events/{filename}"
                    
                    f.write(f"-- Event {event_id}: {old_path}\n")
                    f.write(f"UPDATE Event SET vietqr_image_url = '{new_path}' WHERE event_id = {event_id};\n\n")
        
        f.write("-- ============================================\n")
        f.write("-- KIỂM TRA KẾT QUẢ\n")
        f.write("-- ============================================\n\n")
        f.write("-- Xem lại các đường dẫn đã update:\n")
        f.write("SELECT event_id, event_name, banner_image_url, vietqr_image_url FROM Event WHERE banner_image_url IS NOT NULL OR vietqr_image_url IS NOT NULL;\n\n")
        f.write("-- Nếu đúng, commit. Nếu sai, rollback:\n")
        f.write("-- COMMIT;\n")
        f.write("-- ROLLBACK;\n")
    
    print(f"\n✅ Đã tạo file SQL: {sql_file}")
    print(f"   Vui lòng kiểm tra và chỉnh sửa file này trước khi chạy!")


if __name__ == "__main__":
    analyze_image_paths()
