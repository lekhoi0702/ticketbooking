import os
import random
import urllib.request
import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash
import uuid

# Database Connection
DB_URI = "mysql+pymysql://avnadmin:AVNS_Wyds9xpxDGzYAuRQ8Rm@mysql-3b8d5202-dailyreport.i.aivencloud.com:20325/ticketbookingdb"
engine = create_engine(DB_URI, connect_args={'ssl': {'ssl_mode': 'REQUIRED'}})
Session = sessionmaker(bind=engine)
session = Session()

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')

if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

# Diverse Categories
CATEGORIES = {
    'Âm nhạc': ['Concert Anh Trai Say Hi', 'Đêm Nhạc Trịnh Công Sơn', 'EDM Neon Festival', 'Liveshow Lệ Quyên', 'Sky Tour - Sơn Tùng M-TP'],
    'Sân khấu': ['Kịch: Hồn Trương Ba Da Hàng Thịt', 'Cải Lương: Tiếng Trống Mê Linh', 'Kịch Nói: Đời Cười'],
    'Thể thao': ['Marathon Vì Cộng Đồng', 'Giải Bóng Đá Giao Hữu', 'Tennis Open 2026'],
    'Hội thảo': ['Hội Thảo AI & Tương Lai', 'Digital Marketing Summit', 'Workshop Startup'],
    'Giải trí': ['Lễ Hội Ẩm Thực', 'Triển Lãm Manga/Anime', 'Countdown Party 2026']
}

VENUE_TEMPLATES = [
    ('Sân vận động Mỹ Đình', 'Hà Nội', 40000),
    ('Phố đi bộ Hồ Gươm', 'Hà Nội', 10000),
    ('Sân vận động Quân khu 7', 'TP. Hồ Chí Minh', 25000),
    ('Saigon Exhibition center', 'TP. Hồ Chí Minh', 15000)
]

def download_image(index):
    """Downloads a reliable image from Picsum with User-Agent to avoid blocks."""
    filename = f"event_image_{index}_{uuid.uuid4().hex[:4]}.jpg"
    filepath = os.path.join(UPLOADS_DIR, filename)
    
    # Diverse seeds for picsum
    url = f"https://picsum.photos/seed/{index+100}/1200/600"
    
    try:
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0')]
        urllib.request.install_opener(opener)
        urllib.request.urlretrieve(url, filepath)
        # STORE WITH uploads/ PREFIX FOR FRONTEND
        return f"uploads/{filename}"
    except Exception as e:
        print(f"  Fail {index}: {e}")
        return "uploads/default.jpg"

def seed():
    print("Clearing DB...")
    session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
    for t in ['Ticket', 'Seat', 'TicketType', 'Payment', 'Order', 'Discount', 'Banner', 'Event', 'EventCategory', 'Venue', 'OrganizerInfo']:
        session.execute(text(f"TRUNCATE TABLE `{t}`"))
    session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    
    cat_map = {}
    for name in CATEGORIES.keys():
        res = session.execute(text("INSERT INTO EventCategory (category_name) VALUES (:n)"), {"n": name})
        cat_map[name] = res.lastrowid

    organizers = [r[0] for r in session.execute(text("SELECT user_id FROM User WHERE role_id = 2")).fetchall()]
    customers = [r[0] for r in session.execute(text("SELECT user_id FROM User WHERE role_id = 3")).fetchall()]

    venue_ids = []
    for name, city, cap in VENUE_TEMPLATES:
        res = session.execute(text("INSERT INTO Venue (venue_name, address, city, capacity, manager_id) VALUES (:n, :a, :c, :cp, :m)"),
                             {"n": name, "a": f"Địa chỉ {name}", "c": city, "cp": cap, "m": random.choice(organizers)})
        venue_ids.append(res.lastrowid)

    print("Seeding 50 Events...")
    for i in range(50):
        cat_name = random.choice(list(CATEGORIES.keys()))
        title = f"{random.choice(CATEGORIES[cat_name])} #{i+1}"
        img = download_image(i)
        
        start = datetime.datetime.now() + datetime.timedelta(days=random.randint(5, 120))
        res = session.execute(text("""
            INSERT INTO Event (category_id, venue_id, manager_id, event_name, description, start_datetime, end_datetime, banner_image_url, total_capacity, status, is_featured)
            VALUES (:cid, :vid, :mid, :name, :desc, :start, :end, :img, :cap, 'PUBLISHED', :f)
        """), {
            "cid": cat_map[cat_name], "vid": random.choice(venue_ids), "mid": random.choice(organizers),
            "name": title, "desc": f"Mô tả cho {title}.", "start": start, "end": start + datetime.timedelta(hours=3),
            "img": img, "cap": 500, "f": 1 if i < 10 else 0
        })
        eid = res.lastrowid
        
        # Tickets & Seats
        for tname, price in [('Thường', 500000), ('VIP', 1500000)]:
            res_tt = session.execute(text("INSERT INTO TicketType (event_id, type_name, price, quantity) VALUES (:eid, :n, :p, 50)"),
                                   {"eid": eid, "n": tname, "p": price})
            ttid = res_tt.lastrowid
            
            # 20 seats per type
            vals = []
            params = {"ttid": ttid}
            for ri, rname in enumerate(['A', 'B']):
                for num in range(1, 11):
                    k = f"e{eid}t{ttid}r{ri}n{num}"
                    vals.append(f"(:ttid, :row_{k}, :num_{k}, 'AVAILABLE')")
                    params[f"row_{k}"] = rname
                    params[f"num_{k}"] = str(num)
            session.execute(text(f"INSERT INTO Seat (ticket_type_id, row_name, seat_number, status) VALUES {', '.join(vals)}"), params)

    # Banners
    for i in range(4):
        session.execute(text("INSERT INTO Banner (image_url, title, is_active, `order`) VALUES (:u, :t, 1, :o)"),
                        {"u": download_image(i+100), "t": f"Khuyến mãi {i+1}", "o": i})

    # Orders
    print("Seeding Orders...")
    for i in range(20):
        uid = random.choice(customers)
        res_o = session.execute(text("INSERT INTO `Order` (user_id, order_code, total_amount, final_amount, order_status) VALUES (:u, :c, 500000, 500000, 'PAID')"),
                               {"u": uid, "c": f"ORD-{uuid.uuid4().hex[:6].upper()}"})
        oid = session.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]
        session.execute(text("INSERT INTO Payment (order_id, amount, payment_method, payment_status, payment_code) VALUES (:oid, 500000, 'BANK_TRANSFER', 'SUCCESS', :code)"),
                        {"oid": oid, "code": f"PAY-{uuid.uuid4().hex[:6].upper()}"})
        tt_id = session.execute(text("SELECT ticket_type_id FROM TicketType ORDER BY RAND() LIMIT 1")).fetchone()[0]
        session.execute(text("INSERT INTO Ticket (order_id, ticket_type_id, ticket_code, price) VALUES (:oid, :ttid, :c, 500000)"),
                        {"oid": oid, "ttid": tt_id, "c": f"TKT-{uuid.uuid4().hex[:8].upper()}"})

    session.commit()
    print("DONE!")

if __name__ == "__main__":
    seed()
    session.close()
