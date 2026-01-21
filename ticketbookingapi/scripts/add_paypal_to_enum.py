"""
Script Python để thêm PAYPAL vào enum payment_method
Có thể chạy trực tiếp hoặc chỉnh sửa thông tin kết nối database
"""
import pymysql

def add_paypal_to_enum():
    try:
        # ============================================
        # CẤU HÌNH KẾT NỐI DATABASE
        # ============================================
        # Thay đổi các thông tin sau theo database của bạn:
        host = 'localhost'  # hoặc địa chỉ server database
        user = 'root'        # username database
        password = ''        # password database
        database = 'ticketbookingdb'  # tên database
        port = 3306          # port MySQL (mặc định 3306)
        
        # Nếu dùng Aiven Cloud hoặc service khác yêu cầu SSL:
        # ssl_config = {'ssl': {}}
        # Nếu không cần SSL:
        ssl_config = None
        
        print(f"Đang kết nối đến {host}:{port}...")
        
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            ssl=ssl_config
        )
        
        with conn.cursor() as cursor:
            print("Đang kiểm tra cấu trúc bảng Payment...")
            
            # Kiểm tra enum hiện tại
            cursor.execute("SHOW COLUMNS FROM Payment LIKE 'payment_method'")
            col_info = cursor.fetchone()
            
            if not col_info:
                print("Lỗi: Không tìm thấy cột payment_method trong bảng Payment")
                return
            
            current_enum = col_info['Type']
            print(f"Enum hiện tại: {current_enum}")
            
            # Kiểm tra xem PAYPAL đã có trong enum chưa
            if 'PAYPAL' in current_enum:
                print("✓ PAYPAL đã có trong enum payment_method. Không cần cập nhật.")
                return
            
            print("Đang thêm PAYPAL vào enum payment_method...")
            
            # Cập nhật enum để bao gồm PAYPAL
            # Giữ nguyên tất cả các giá trị hiện có và thêm PAYPAL
            cursor.execute("""
                ALTER TABLE Payment 
                MODIFY COLUMN payment_method ENUM(
                    'CREDIT_CARD',
                    'BANK_TRANSFER',
                    'E_WALLET',
                    'MOMO',
                    'VNPAY',
                    'PAYPAL',
                    'CASH'
                ) NOT NULL
            """)
            
            conn.commit()
            print("✓ Đã thêm PAYPAL vào enum payment_method thành công!")
            
            # Kiểm tra lại
            cursor.execute("SHOW COLUMNS FROM Payment LIKE 'payment_method'")
            updated_col_info = cursor.fetchone()
            print(f"Enum sau khi cập nhật: {updated_col_info['Type']}")
            
    except pymysql.Error as e:
        print(f"Lỗi MySQL: {e}")
        if 'conn' in locals():
            conn.rollback()
    except Exception as e:
        print(f"Lỗi: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()
            print("Đã đóng kết nối database.")

if __name__ == "__main__":
    print("=" * 60)
    print("Script thêm PAYPAL vào enum payment_method")
    print("=" * 60)
    print()
    print("Lưu ý: Vui lòng chỉnh sửa thông tin kết nối database")
    print("trong hàm add_paypal_to_enum() trước khi chạy script.")
    print()
    
    # Hỏi xác nhận trước khi chạy
    confirm = input("Bạn đã cập nhật thông tin kết nối database chưa? (yes/no): ")
    if confirm.lower() in ['yes', 'y']:
        add_paypal_to_enum()
    else:
        print("Vui lòng chỉnh sửa thông tin kết nối database trong script trước khi chạy.")
