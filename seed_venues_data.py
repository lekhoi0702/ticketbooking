import random
import os
import urllib.request
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database configuration (matching app/config.py)
DB_URL = "mysql+pymysql://avnadmin:AVNS_Wyds9xpxDGzYAuRQ8Rm@mysql-3b8d5202-dailyreport.i.aivencloud.com:20325/ticketbookingdb"
engine = create_engine(DB_URL, connect_args={"ssl": {"ssl_mode": "REQUIRED"}})
Session = sessionmaker(bind=engine)
session = Session()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Realistic Venues across Vietnam
VIEW_VENUES = [
    {"name": "Trung tâm Hội nghị Quốc gia", "address": "57 Phạm Hùng, Mễ Trì, Nam Từ Liêm", "city": "Hà Nội", "capacity": 3500},
    {"name": "Nhà thi đấu Phú Thọ", "address": "1 Lữ Gia, Phường 15, Quận 11", "city": "TP. Hồ Chí Minh", "capacity": 5000},
    {"name": "Sân vận động Mỹ Đình", "address": "Đường Lê Đức Thọ, Mỹ Đình", "city": "Hà Nội", "capacity": 40000},
    {"name": "Nhà hát Hòa Bình", "address": "240 Đường 3 Tháng 2, Phường 12, Quận 10", "city": "TP. Hồ Chí Minh", "capacity": 2500},
    {"name": "Cung Điền kinh Hà Nội", "address": "Trần Hữu Dực, Cầu Diễn, Nam Từ Liêm", "city": "Hà Nội", "capacity": 3000},
    {"name": "Nhà thi đấu Quân khu 7", "address": "202 Hoàng Văn Thụ, Phường 9, Phú Nhuận", "city": "TP. Hồ Chí Minh", "capacity": 4500},
    {"name": "Trung tâm Triển lãm SECC", "address": "799 Nguyễn Văn Linh, Quận 7", "city": "TP. Hồ Chí Minh", "capacity": 10000},
    {"name": "Bán đảo Tuần Châu", "address": "Phường Tuần Châu, TP. Hạ Long", "city": "Quảng Ninh", "capacity": 8000},
    {"name": "Cung Tiên Sơn", "address": "Số 1 Phan Đăng Lưu, Hòa Cường Bắc", "city": "Đà Nẵng", "capacity": 6500},
    {"name": "Nhà hát Lớn Hà Nội", "address": "01 Tràng Tiền, Hoàn Kiếm", "city": "Hà Nội", "capacity": 600},
    {"name": "Phim trường Smiley Ville", "address": "Đông Hội, Đông Anh", "city": "Hà Nội", "capacity": 2000},
    {"name": "Sân vận động Quân khu 7", "address": "2 Phổ Quang, Phường 2, Tân Bình", "city": "TP. Hồ Chí Minh", "capacity": 25000},
    {"name": "White Palace Phạm Văn Đồng", "address": "108 Phạm Văn Đồng, Hiệp Bình Chánh", "city": "TP. Hồ Chí Minh", "capacity": 4000},
    {"name": "GEM Center", "address": "8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1", "city": "TP. Hồ Chí Minh", "capacity": 3000},
    {"name": "Sun World Ba Na Hills", "address": "Hòa Ninh, Hòa Vang", "city": "Đà Nẵng", "capacity": 5000},
]

EVENT_TITLES = [
    "Đại nhạc hội EDM: Neon Lights 2024",
    "Live Concert: Đêm Tình Nhân",
    "Hội thảo Trí tuệ Nhân tạo & Tương lai",
    "Giải Chạy Marathon: Vì Một Việt Nam Xanh",
    "Triển lãm Nghệ thuật Đương đại: Sắc Màu Cuộc Sống",
    "Lễ hội Ẩm thực Đường phố Quốc tế",
    "Workshop: Kỹ năng Quản trị Thời đại 4.0",
    "Kịch nói: Lan và Điệp - Phiên bản mới",
    "Festival Âm nhạc Indie: Underground Vibe",
    "Hội chợ Tech Expo 2024",
    "Giải Golf Vô địch Quốc gia",
    "Concert: Giai điệu Mùa Thu",
    "Festival Hoa Đà Lạt 2024",
    "Tuần lễ Thời trang Việt Nam",
    "Đêm nhạc Trịnh Công Sơn",
    "Lễ hội Cosplay & Manga",
    "Hội thảo Đầu tư Bất động sản",
    "Giải đấu E-Sports: League of Legends Cup",
    "Workshop Vẽ tranh thư giãn",
    "Tour du lịch: Khám phá Hang Sơn Đoòng"
]

IMAGE_POOL = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000", # Music
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000", # DJ
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000", # Party
    "https://images.unsplash.com/photo-1514525253361-bee8d4ada4d1?q=80&w=1000", # Stage
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000", # Event
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1000", # Seminar
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000", # Gala
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000", # Festival
    "https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000", # Crowd
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000", # Nightlife
]

def download_image(url, filename):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return filename
    try:
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        req = urllib.request.Request(url, headers={'User-Agent': user_agent})
        with urllib.request.urlopen(req, timeout=10) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        return filename
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def seed_full_venues():
    print("Seeding robust venues...")
    for v in VIEW_VENUES:
        # Check if exists
        res = session.execute(text("SELECT venue_id FROM Venue WHERE venue_name = :name"), {"name": v['name']}).fetchone()
        if not res:
            session.execute(text(
                "INSERT INTO Venue (venue_name, address, city, capacity, status) VALUES (:name, :address, :city, :capacity, 'ACTIVE')"
            ), v)
    session.commit()

def seed_data():
    try:
        seed_full_venues()
        
        # Get all venue IDs and Category IDs
        venue_ids = [r[0] for r in session.execute(text("SELECT venue_id FROM Venue")).fetchall()]
        category_ids = [r[0] for r in session.execute(text("SELECT category_id FROM EventCategory")).fetchall()]
        
        # Get a valid organizer ID
        organizer_id = session.execute(text("SELECT user_id FROM User WHERE role_id = 2 LIMIT 1")).scalar()
        if not organizer_id:
            organizer_id = session.execute(text("SELECT user_id FROM User WHERE role_id = 1 LIMIT 1")).scalar()

        # Create some events if not enough
        current_events = session.execute(text("SELECT count(*) FROM Event")).scalar()
        if current_events < 50:
            print(f"Adding {50 - current_events} more events...")
            for i in range(current_events, 50):
                title = random.choice(EVENT_TITLES) + f" #{i}"
                v_id = random.choice(venue_ids)
                c_id = random.choice(category_ids)
                img_url = random.choice(IMAGE_POOL)
                filename = f"event_image_{i}_{random.randint(1000,9999)}.jpg"
                downloaded = download_image(img_url, filename)
                db_img_path = f"uploads/{downloaded}" if downloaded else "uploads/default.jpg"
                
                session.execute(text("""
                    INSERT INTO Event (event_name, description, start_datetime, end_datetime, 
                                     manager_id, category_id, venue_id, 
                                     banner_image_url, status, is_featured, total_capacity, sold_tickets)
                    VALUES (:name, :desc, '2024-06-01 19:00:00', '2024-06-01 22:00:00',
                            :mid, :cid, :vid, :img, 'APPROVED', :featured, 500, 0)
                """), {
                    "name": title,
                    "desc": f"Mô tả cho {title}.",
                    "mid": organizer_id,
                    "cid": c_id,
                    "vid": v_id,
                    "img": db_img_path,
                    "featured": 1 if random.random() > 0.8 else 0
                })
            session.commit()
            
        # Ensure Banners exist
        current_banners = session.execute(text("SELECT count(*) FROM Banner")).scalar()
        if current_banners < 4:
            print("Seeding Banners...")
            for i in range(4):
                img_url = IMAGE_POOL[i % len(IMAGE_POOL)]
                filename = f"banner_image_{i}_{random.randint(1000,9999)}.jpg"
                downloaded = download_image(img_url, filename)
                db_img_path = f"uploads/{downloaded}" if downloaded else "uploads/default.jpg"
                session.execute(text("""
                    INSERT INTO Banner (image_url, title, link, is_active, `order`)
                    VALUES (:img, :title, :link, 1, :order)
                """), {
                    "img": db_img_path,
                    "title": f"Sự kiện Nổi bật {i+1}",
                    "link": f"/event/{random.randint(1, 10)}",
                    "order": i
                })
            session.commit()
            
        print("Done seeding data!")
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()
