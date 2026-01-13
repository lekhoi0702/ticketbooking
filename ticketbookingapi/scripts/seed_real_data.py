import pymysql
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def seed_real_data():
    try:
        host = os.getenv('DB_HOST')
        user = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        database = os.getenv('DB_NAME')
        port = int(os.getenv('DB_PORT', 20325))
        
        conn = pymysql.connect(
            host=host, user=user, password=password, database=database, port=port,
            charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, ssl={'ssl': {}}
        )
        
        with conn.cursor() as cursor:
            print("Cleaning up old demo data...")
            # We don't delete everything, just set a fresh start for featured events
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            cursor.execute("TRUNCATE TABLE Seat")
            cursor.execute("TRUNCATE TABLE Ticket")
            cursor.execute("TRUNCATE TABLE TicketType")
            cursor.execute("DELETE FROM Event")
            cursor.execute("DELETE FROM Venue")
            cursor.execute("DELETE FROM EventCategory")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

            # 1. Categories
            print("Seeding Categories...")
            categories = [
                ('Nhạc Sống',),
                ('Sân Khấu',),
                ('Thể Thao',),
                ('Workshop',),
                ('Trải nghiệm',)
            ]
            cursor.executemany("INSERT INTO EventCategory (category_name) VALUES (%s)", categories)
            conn.commit()
            
            # Get category IDs
            cursor.execute("SELECT category_id, category_name FROM EventCategory")
            cat_map = {row['category_name']: row['category_id'] for row in cursor.fetchall()}

            # 2. Venues
            print("Seeding Venues...")
            venues = [
                ('Nhà hát Hòa Bình', '240 đường 3/2, Quận 10', 'TP. Hồ Chí Minh', 2500),
                ('SVĐ Quân Khu 7', '202 Hoàng Văn Thụ, Phú Nhuận', 'TP. Hồ Chí Minh', 15000),
                ('Trung tâm Hội nghị Quốc gia', '01 Đại lộ Thăng Long', 'Hà Nội', 3800),
                ('Phố đi bộ Nguyễn Huệ', 'Quận 1', 'TP. Hồ Chí Minh', 50000),
                ('The Lab Showroom', 'Quận 2', 'TP. Hồ Chí Minh', 200)
            ]
            cursor.executemany("INSERT INTO Venue (venue_name, address, city, capacity) VALUES (%s, %s, %s, %s)", venues)
            conn.commit()
            
            # Get venue IDs
            cursor.execute("SELECT venue_id, venue_name FROM Venue")
            venue_map = {row['venue_name']: row['venue_id'] for row in cursor.fetchall()}

            # 3. Events, TicketTypes, and Seats
            print("Seeding Events & Seats (This might take a moment)...")
            
            event_data = [
                {
                    'name': 'Sơn Tùng M-TP - Sky Tour 2026',
                    'cat': 'Nhạc Sống',
                    'venue': 'SVĐ Quân Khu 7',
                    'desc': 'Sự kiện âm nhạc lớn nhất năm của nghệ sĩ Sơn Tùng M-TP. Một đêm nhạc bùng nổ với hiệu ứng âm thanh ánh sáng triệu đô.',
                    'banner': 'https://vcdn-giaitri.vnecdn.net/2020/06/11/son-tung-m-tp-sky-tour-movie-1-1591848634_m_600x600.jpg',
                    'tickets': [
                        ('VVIP', 2500000, 50, True),  # Special seats for seating map
                        ('VIP', 1500000, 100, False),
                        ('GA', 600000, 500, False)
                    ],
                    'featured': True
                },
                {
                    'name': 'Crescendo - Đêm Nhạc Cổ Điển',
                    'cat': 'Nhạc Sống',
                    'venue': 'Trung tâm Hội nghị Quốc gia',
                    'desc': 'Dưới sự chỉ huy của nhạc trưởng lừng danh, đêm nhạc mang đến những giai điệu bất tận của Mozart và Beethoven.',
                    'banner': 'https://ticketbox.vn/storage/images/event/87000/87123/banner.jpg',
                    'tickets': [
                        ('Premium', 1200000, 30, True),
                        ('Standard', 500000, 100, False)
                    ],
                    'featured': True
                },
                {
                    'name': 'Workshop: Làm Gốm Thủ Công',
                    'cat': 'Workshop',
                    'venue': 'The Lab Showroom',
                    'desc': 'Học cách tạo ra những sản phẩm gốm mang dấu ấn cá nhân trong không gian sang trọng.',
                    'banner': 'https://img.atpsoftware.vn/2021/04/workshop-la-gi.jpg',
                    'tickets': [
                        ('Vé Tham Gia', 350000, 20, False)
                    ],
                    'featured': False
                },
                {
                    'name': 'V-League 2026: Hà Nội vs HAGL',
                    'cat': 'Thể Thao',
                    'venue': 'SVĐ Quân Khu 7',
                    'desc': 'Trận cầu tâm điểm vòng 10 V-League. Cuộc đối đầu kịch tính giữa hai thế lực bóng đá Việt Nam.',
                    'banner': 'https://image.vov.vn/w720/uploaded/unregep3jgyueyivf9w/2023_08_27/v-league-2023-1693138356.jpg',
                    'tickets': [
                        ('Khán đài A', 200000, 50, True),
                        ('Khán đài B', 100000, 500, False)
                    ],
                    'featured': True
                }
            ]

            manager_id = 1 # Default admin/manager

            for ed in event_data:
                start_dt = datetime.now() + timedelta(days=30)
                end_dt = start_dt + timedelta(hours=3)
                total_cap = sum(t[2] for t in ed['tickets'])
                
                cursor.execute("""
                    INSERT INTO Event (event_name, category_id, venue_id, manager_id, description, 
                                     start_datetime, end_datetime, banner_image_url, status, is_featured, total_capacity)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PUBLISHED', %s, %s)
                """, (ed['name'], cat_map[ed['cat']], venue_map[ed['venue']], manager_id, ed['desc'], 
                      start_dt, end_dt, ed['banner'], ed['featured'], total_cap))
                
                event_id = cursor.lastrowid
                
                for tname, price, qty, has_seats in ed['tickets']:
                    cursor.execute("""
                        INSERT INTO TicketType (event_id, type_name, price, quantity, sold_quantity, is_active)
                        VALUES (%s, %s, %s, %s, 0, TRUE)
                    """, (event_id, tname, price, qty))
                    
                    tt_id = cursor.lastrowid
                    
                    if has_seats:
                        # Generate 5x10 seats for these types
                        rows = "ABCDE"
                        for r in range(5):
                            for s in range(1, 11):
                                cursor.execute("""
                                    INSERT INTO Seat (ticket_type_id, row_name, seat_number, status, x_pos, y_pos)
                                    VALUES (%s, %s, %s, 'AVAILABLE', %s, %s)
                                """, (tt_id, rows[r], str(s), s*40, (r+1)*40))
                
            conn.commit()
            print("Successfully seeded all realistic test data!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    seed_real_data()
