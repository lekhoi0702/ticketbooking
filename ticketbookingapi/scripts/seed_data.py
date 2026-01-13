"""
Seed script to populate the database with sample data
Run this script after creating the database tables
"""
import os
import sys
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import (
    Role, User, EventCategory, Venue, Event, TicketType
)

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("Starting database seeding...")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.drop_all()
        # db.create_all()
        
        # 1. Seed Roles
        print("Seeding roles...")
        roles_data = [
            {'role_name': 'Admin'},
            {'role_name': 'Event Manager'},
            {'role_name': 'Customer'}
        ]
        
        for role_data in roles_data:
            if not Role.query.filter_by(role_name=role_data['role_name']).first():
                role = Role(**role_data)
                db.session.add(role)
        
        db.session.commit()
        print("✓ Roles seeded")
        
        # 2. Seed Users
        print("Seeding users...")
        admin_role = Role.query.filter_by(role_name='Admin').first()
        manager_role = Role.query.filter_by(role_name='Event Manager').first()
        customer_role = Role.query.filter_by(role_name='Customer').first()
        
        users_data = [
            {
                'role_id': admin_role.role_id,
                'email': 'admin@ticketbox.vn',
                'password_hash': generate_password_hash('admin123'),
                'full_name': 'Admin TicketBox',
                'phone': '0901234567'
            },
            {
                'role_id': manager_role.role_id,
                'email': 'manager@ticketbox.vn',
                'password_hash': generate_password_hash('manager123'),
                'full_name': 'Event Manager',
                'phone': '0901234568'
            }
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(email=user_data['email']).first():
                user = User(**user_data)
                db.session.add(user)
        
        db.session.commit()
        print("✓ Users seeded")
        
        # 3. Seed Event Categories
        print("Seeding event categories...")
        categories_data = [
            {'category_name': 'Nhạc sống'},
            {'category_name': 'Sân khấu & Nghệ thuật'},
            {'category_name': 'Thể Thao'},
            {'category_name': 'Hội thảo & Workshop'},
            {'category_name': 'Tham quan & Trải nghiệm'},
            {'category_name': 'Khác'}
        ]
        
        for cat_data in categories_data:
            if not EventCategory.query.filter_by(category_name=cat_data['category_name']).first():
                category = EventCategory(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        print("✓ Event categories seeded")
        
        # 4. Seed Venues
        print("Seeding venues...")
        venues_data = [
            {
                'venue_name': 'Nhà hát Hòa Bình',
                'address': '240 Đường 3/2, Phường 12, Quận 10',
                'city': 'TP.HCM',
                'capacity': 1500,
                'contact_phone': '0283 8650 129'
            },
            {
                'venue_name': 'Sân vận động Mỹ Đình',
                'address': 'Đường Lê Đức Thọ, Phường Mỹ Đình 1, Quận Nam Từ Liêm',
                'city': 'Hà Nội',
                'capacity': 40000,
                'contact_phone': '024 3768 5969'
            },
            {
                'venue_name': 'Nhà hát Lớn Hà Nội',
                'address': '1 Tràng Tiền, Hoàn Kiếm',
                'city': 'Hà Nội',
                'capacity': 900,
                'contact_phone': '024 3933 0113'
            },
            {
                'venue_name': 'Công viên Hoàng Văn Thụ',
                'address': 'Hoàng Văn Thụ, Phường 4, Quận Tân Bình',
                'city': 'TP.HCM',
                'capacity': 5000,
                'contact_phone': '028 3844 6969'
            },
            {
                'venue_name': 'Sân vận động Quân khu 7',
                'address': '2 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận',
                'city': 'TP.HCM',
                'capacity': 15000,
                'contact_phone': '028 3997 5555'
            },
            {
                'venue_name': 'Nhà hát Kịch TP.HCM',
                'address': '12 Đinh Tiên Hoàng, Bến Nghé, Quận 1',
                'city': 'TP.HCM',
                'capacity': 500,
                'contact_phone': '028 3829 4659'
            },
            {
                'venue_name': 'Nhà thi đấu Phú Thọ',
                'address': '1 Lữ Gia, Phường 15, Quận 11',
                'city': 'TP.HCM',
                'capacity': 3000,
                'contact_phone': '028 3962 2222'
            },
            {
                'venue_name': 'Sân Pleiku',
                'address': 'Đường Phù Đổng, Thành phố Pleiku',
                'city': 'Gia Lai',
                'capacity': 25000,
                'contact_phone': '0269 3824 555'
            }
        ]
        
        for venue_data in venues_data:
            if not Venue.query.filter_by(venue_name=venue_data['venue_name']).first():
                venue = Venue(**venue_data)
                db.session.add(venue)
        
        db.session.commit()
        print("✓ Venues seeded")
        
        # 5. Seed Events
        print("Seeding events...")
        manager = User.query.filter_by(email='manager@ticketbox.vn').first()
        
        # Get categories
        cat_music = EventCategory.query.filter_by(category_name='Nhạc sống').first()
        cat_theater = EventCategory.query.filter_by(category_name='Sân khấu & Nghệ thuật').first()
        cat_sports = EventCategory.query.filter_by(category_name='Thể Thao').first()
        
        # Get venues
        venue_hoa_binh = Venue.query.filter_by(venue_name='Nhà hát Hòa Bình').first()
        venue_my_dinh = Venue.query.filter_by(venue_name='Sân vận động Mỹ Đình').first()
        venue_ha_noi = Venue.query.filter_by(venue_name='Nhà hát Lớn Hà Nội').first()
        venue_hoang_van_thu = Venue.query.filter_by(venue_name='Công viên Hoàng Văn Thụ').first()
        venue_quan_khu_7 = Venue.query.filter_by(venue_name='Sân vận động Quân khu 7').first()
        venue_kich = Venue.query.filter_by(venue_name='Nhà hát Kịch TP.HCM').first()
        venue_phu_tho = Venue.query.filter_by(venue_name='Nhà thi đấu Phú Thọ').first()
        venue_pleiku = Venue.query.filter_by(venue_name='Sân Pleiku').first()
        
        events_data = [
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_hoa_binh.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Chương trình Hòa nhạc Năm mới 2026',
                'description': 'Đón chào năm mới với đêm hòa nhạc đặc sắc cùng dàn nhạc giao hưởng',
                'start_datetime': datetime(2025, 12, 31, 20, 0),
                'end_datetime': datetime(2025, 12, 31, 23, 0),
                'sale_start_datetime': datetime(2025, 11, 1, 0, 0),
                'sale_end_datetime': datetime(2025, 12, 30, 23, 59),
                'banner_image_url': '/uploads/events/new-year-concert.jpg',
                'total_capacity': 1500,
                'status': 'PUBLISHED',
                'is_featured': True
            },
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_my_dinh.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Live Concert - Sơn Tùng M-TP',
                'description': 'Đại nhạc hội của Sơn Tùng M-TP với những ca khúc hit đình đám',
                'start_datetime': datetime(2026, 1, 15, 19, 30),
                'end_datetime': datetime(2026, 1, 15, 22, 30),
                'sale_start_datetime': datetime(2025, 12, 1, 0, 0),
                'sale_end_datetime': datetime(2026, 1, 14, 23, 59),
                'banner_image_url': '/uploads/events/sontung-concert.jpg',
                'total_capacity': 40000,
                'status': 'PUBLISHED',
                'is_featured': True
            },
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_ha_noi.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Đêm nhạc Trịnh Công Sơn',
                'description': 'Tưởng nhớ nhạc sĩ Trịnh Công Sơn với những ca khúc bất hủ',
                'start_datetime': datetime(2026, 1, 20, 20, 0),
                'end_datetime': datetime(2026, 1, 20, 22, 0),
                'sale_start_datetime': datetime(2025, 12, 15, 0, 0),
                'sale_end_datetime': datetime(2026, 1, 19, 23, 59),
                'banner_image_url': '/uploads/events/trinh-cong-son.jpg',
                'total_capacity': 900,
                'status': 'PUBLISHED',
                'is_featured': False
            },
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_hoang_van_thu.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Festival Âm nhạc Quốc tế',
                'description': 'Lễ hội âm nhạc quốc tế với sự tham gia của nhiều nghệ sĩ nổi tiếng',
                'start_datetime': datetime(2026, 1, 25, 18, 0),
                'end_datetime': datetime(2026, 1, 25, 23, 0),
                'sale_start_datetime': datetime(2026, 1, 1, 0, 0),
                'sale_end_datetime': datetime(2026, 1, 24, 23, 59),
                'banner_image_url': '/uploads/events/music-festival.jpg',
                'total_capacity': 5000,
                'status': 'PUBLISHED',
                'is_featured': True
            },
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_quan_khu_7.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Anh Trai "Say Hi" Concert 2026',
                'description': 'Đại nhạc hội Anh Trai Say Hi với dàn line-up đình đám',
                'start_datetime': datetime(2026, 2, 10, 19, 0),
                'end_datetime': datetime(2026, 2, 10, 22, 30),
                'sale_start_datetime': datetime(2026, 1, 5, 0, 0),
                'sale_end_datetime': datetime(2026, 2, 9, 23, 59),
                'banner_image_url': '/uploads/events/anh-trai-say-hi.jpg',
                'total_capacity': 15000,
                'status': 'PUBLISHED',
                'is_featured': True
            },
            {
                'category_id': cat_music.category_id,
                'venue_id': venue_phu_tho.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Liveshow Đen Vâu',
                'description': 'Đêm nhạc của rapper Đen Vâu với những ca khúc đầy cảm xúc',
                'start_datetime': datetime(2026, 2, 18, 19, 30),
                'end_datetime': datetime(2026, 2, 18, 22, 0),
                'sale_start_datetime': datetime(2026, 1, 10, 0, 0),
                'sale_end_datetime': datetime(2026, 2, 17, 23, 59),
                'banner_image_url': '/uploads/events/den-vau.jpg',
                'total_capacity': 3000,
                'status': 'PUBLISHED',
                'is_featured': True
            },
            {
                'category_id': cat_theater.category_id,
                'venue_id': venue_kich.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'Kịch nói: Số Đỏ',
                'description': 'Vở kịch kinh điển Số Đỏ của nhà văn Vũ Trọng Phụng',
                'start_datetime': datetime(2026, 2, 3, 19, 30),
                'end_datetime': datetime(2026, 2, 3, 21, 30),
                'sale_start_datetime': datetime(2026, 1, 15, 0, 0),
                'sale_end_datetime': datetime(2026, 2, 2, 23, 59),
                'banner_image_url': '/uploads/events/so-do.jpg',
                'total_capacity': 500,
                'status': 'PUBLISHED',
                'is_featured': False
            },
            {
                'category_id': cat_sports.category_id,
                'venue_id': venue_pleiku.venue_id,
                'manager_id': manager.user_id,
                'event_name': 'V.League: HAGL vs Hà Nội FC',
                'description': 'Trận đấu đỉnh cao giữa HAGL và Hà Nội FC tại V.League 2026',
                'start_datetime': datetime(2026, 2, 6, 18, 0),
                'end_datetime': datetime(2026, 2, 6, 20, 0),
                'sale_start_datetime': datetime(2026, 1, 20, 0, 0),
                'sale_end_datetime': datetime(2026, 2, 6, 12, 0),
                'banner_image_url': '/uploads/events/vleague.jpg',
                'total_capacity': 25000,
                'status': 'PUBLISHED',
                'is_featured': True
            }
        ]
        
        for event_data in events_data:
            if not Event.query.filter_by(event_name=event_data['event_name']).first():
                event = Event(**event_data)
                db.session.add(event)
        
        db.session.commit()
        print("✓ Events seeded")
        
        # 6. Seed Ticket Types
        print("Seeding ticket types...")
        
        # Get events
        event_new_year = Event.query.filter_by(event_name='Chương trình Hòa nhạc Năm mới 2026').first()
        event_sontung = Event.query.filter_by(event_name='Live Concert - Sơn Tùng M-TP').first()
        event_trinh = Event.query.filter_by(event_name='Đêm nhạc Trịnh Công Sơn').first()
        event_festival = Event.query.filter_by(event_name='Festival Âm nhạc Quốc tế').first()
        event_anh_trai = Event.query.filter_by(event_name='Anh Trai "Say Hi" Concert 2026').first()
        event_den_vau = Event.query.filter_by(event_name='Liveshow Đen Vâu').first()
        event_so_do = Event.query.filter_by(event_name='Kịch nói: Số Đỏ').first()
        event_vleague = Event.query.filter_by(event_name='V.League: HAGL vs Hà Nội FC').first()
        
        ticket_types_data = [
            # New Year Concert
            {'event_id': event_new_year.event_id, 'type_name': 'VIP', 'price': 800000, 'quantity': 200, 'description': 'Ghế VIP hàng đầu'},
            {'event_id': event_new_year.event_id, 'type_name': 'Standard', 'price': 500000, 'quantity': 800, 'description': 'Ghế thường'},
            {'event_id': event_new_year.event_id, 'type_name': 'Economy', 'price': 300000, 'quantity': 500, 'description': 'Ghế phổ thông'},
            
            # Sơn Tùng Concert
            {'event_id': event_sontung.event_id, 'type_name': 'VIP', 'price': 1500000, 'quantity': 5000, 'description': 'Khu vực VIP gần sân khấu'},
            {'event_id': event_sontung.event_id, 'type_name': 'Standard', 'price': 800000, 'quantity': 20000, 'description': 'Khu vực thường'},
            {'event_id': event_sontung.event_id, 'type_name': 'Economy', 'price': 400000, 'quantity': 15000, 'description': 'Khu vực xa sân khấu'},
            
            # Trịnh Công Sơn
            {'event_id': event_trinh.event_id, 'type_name': 'VIP', 'price': 500000, 'quantity': 200, 'description': 'Ghế VIP'},
            {'event_id': event_trinh.event_id, 'type_name': 'Standard', 'price': 300000, 'quantity': 700, 'description': 'Ghế thường'},
            
            # Music Festival (Free event)
            {'event_id': event_festival.event_id, 'type_name': 'General Admission', 'price': 0, 'quantity': 5000, 'description': 'Vé miễn phí'},
            
            # Anh Trai Say Hi
            {'event_id': event_anh_trai.event_id, 'type_name': 'VIP', 'price': 2000000, 'quantity': 2000, 'description': 'Khu vực VIP'},
            {'event_id': event_anh_trai.event_id, 'type_name': 'Standard', 'price': 1200000, 'quantity': 8000, 'description': 'Khu vực thường'},
            {'event_id': event_anh_trai.event_id, 'type_name': 'Economy', 'price': 600000, 'quantity': 5000, 'description': 'Khu vực phổ thông'},
            
            # Đen Vâu
            {'event_id': event_den_vau.event_id, 'type_name': 'VIP', 'price': 1000000, 'quantity': 500, 'description': 'Ghế VIP'},
            {'event_id': event_den_vau.event_id, 'type_name': 'Standard', 'price': 700000, 'quantity': 2500, 'description': 'Ghế thường'},
            
            # Số Đỏ
            {'event_id': event_so_do.event_id, 'type_name': 'Standard', 'price': 200000, 'quantity': 500, 'description': 'Ghế thường'},
            
            # V.League
            {'event_id': event_vleague.event_id, 'type_name': 'VIP', 'price': 200000, 'quantity': 1000, 'description': 'Khán đài VIP'},
            {'event_id': event_vleague.event_id, 'type_name': 'Standard', 'price': 100000, 'quantity': 24000, 'description': 'Khán đài thường'},
        ]
        
        for ticket_data in ticket_types_data:
            ticket_type = TicketType(**ticket_data)
            db.session.add(ticket_type)
        
        db.session.commit()
        print("✓ Ticket types seeded")
        
        print("\n✅ Database seeding completed successfully!")
        print(f"   - Roles: {Role.query.count()}")
        print(f"   - Users: {User.query.count()}")
        print(f"   - Categories: {EventCategory.query.count()}")
        print(f"   - Venues: {Venue.query.count()}")
        print(f"   - Events: {Event.query.count()}")
        print(f"   - Ticket Types: {TicketType.query.count()}")

if __name__ == "__main__":
    seed_database()
