import os

def fix_encoding_and_text(file_path):
    try:
        with open(file_path, 'rb') as f:
            raw_bytes = f.read()
        
        # Try decoding as UTF-8 first
        try:
            content = raw_bytes.decode('utf-8')
            # Check for "fake utf-8" mangling (UTF-8 bytes interpreted as Latin-1)
            # This often has lots of 'Ã ', 'á»', etc.
            if 'Ã ' in content or 'á»' in content or 'áº' in content:
                # Try to recover by encoding to latin-1 and decoding as utf-8
                try:
                    content = content.encode('latin-1').decode('utf-8')
                except:
                    pass
        except:
            # If it fails, it might be Windows-1258 or something else
            try:
                content = raw_bytes.decode('windows-1258')
            except:
                content = raw_bytes.decode('latin-1', errors='replace')

        # Manually fix common mangled patterns found in the project
        mangled_patterns = {
            "Không th? t?i so d? gh?": "Không thể tải sơ đồ ghế",
            "L?i khi t?i danh sách s? ki?n": "Lỗi khi tải danh sách sự kiện",
            "C?p nh?t tr?ng thái thành công": "Cập nhật trạng thái thành công",
            "Ch? s? ki?n dă duy?t ho?c công khai m?i có th? dánh d?u n?i b?t": "Chỉ sự kiện đã duyệt hoặc công khai mới có thể đánh dấu nổi bật",
            "Đă b? dánh d?u n?i b?t": "Đã bỏ đánh dấu nổi bật",
            "Đă dánh d?u s? ki?n n?i b?t": "Đã đánh dấu sự kiện nổi bật",
            "Xác nh?n xóa vinh vi?n": "Xác nhận xóa vĩnh viễn",
            "B?n có ch?c ch?n mu?n XÓA VINH VI?N s? ki?n này không? Hành d?ng này không th? hoàn tác.": "Bạn có chắc chắn muốn XÓA VĨNH VIỄN sự kiện này không? Hành động này không thể hoàn tác.",
            "Đă xóa s? ki?n thành công": "Đã xóa sự kiện thành công",
            "Ch? duy?t": "Chờ duyệt",
            "Đă duy?t": "Đã duyệt",
            "B? t? ch?i": "Bị từ chối",
            "Đă h?y": "Đã hủy",
            "Đang di?n ra": "Đang diễn ra",
            "Ch? xóa": "Chờ xóa",
            "?NH B̀A": "ẢNH BÌA",
            "THÔNG TIN S? KI?N": "THÔNG TIN SỰ KIỆN",
            "NHÀ T? CH?C": "NHÀ TỔ CHỨC",
            "TR?NG THÁI": "TRẠNG THÁI",
            "N?I B?T": "NỔI BẬT",
            "B? n?i b?t": "Bỏ nổi bật",
            "Đánh d?u n?i b?t": "Đánh dấu nổi bật",
            "THAO TÁC": "THAO TÁC",
            "Duy?t": "Duyệt",
            "Chi ti?t": "Chi tiết",
            "Đang t?i danh sách s? ki?n...": "Đang tải danh sách sự kiện...",
            "Qu?n Lư S? Ki?n": "Quản Lý Sự Kiện",
            "Làm m?i": "Làm mới",
            "T̀M KI?M": "TÌM KIẾM",
            "Tên s? ki?n, d?a di?m...": "Tên sự kiện, địa điểm...",
            "T?t c? tr?ng thái": "Tất cả trạng thái",
            "Ch? phê duy?t": "Chờ phê duyệt",
            "Đă phê duy?t": "Đã phê duyệt",
            "Đă dang bán": "Đã đang bán",
            "Đă t? ch?i": "Đã từ chối",
            "Đă k?t thúc": "Đã kết thúc",
            "S? ki?n n?i b?t": "Sự kiện nổi bật",
            "S? ki?n thu?ng": "Sự kiện thường",
            "C?n chú ư: Đang có {pendingCount} s? ki?n ch? b?n phê duy?t.": "Cần chú ý: Đang có {pendingCount} sự kiện chờ bạn phê duyệt.",
            "T?ng s? ${total} s? ki?n": "Tổng số ${total} sự kiện",
            "Chi Ti?t S? Ki?n": "Chi Tiết Sự Kiện",
            "Đang x? lư...": "Đang xử lý...",
            "Mô t?": "Mô tả",
            "Không có mô t? cho s? ki?n này.": "Không có mô tả cho sự kiện này.",
            "So d? ch? ng?i": "Sơ đồ chỗ ngồi",
            "Đang t?i so d?...": "Đang tải sơ đồ...",
            "Tr?ng": "Trống",
            "Đă gán": "Đã gán",
            "H?ng khác": "Hỏng/khác",
            "so d? ch? ng?i": "sơ đồ chỗ ngồi",
            "Hành d?ng": "Hành động",
            "Phê duy?t": "Phê duyệt",
            "T? ch?i": "Từ chối",
            "B? n?i b?t": "Bỏ nổi bật",
            "Đ?t làm n?i b?t": "Đặt làm nổi bật",
            "Xóa vinh vi?n": "Xóa vĩnh viễn"
        }

        for old, new in mangled_patterns.items():
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

admin_dir = r'C:\Users\khoi.le\Desktop\ticketbooking\ticketbookingwebapp\src\features\admin'
for root, dirs, files in os.walk(admin_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            full_path = os.path.join(root, f)
            if fix_encoding_and_text(full_path):
                print(f"Fixed: {full_path}")
