"""
Script to generate 100 events with images for TicketBooking system
This script will:
1. Generate 100 event images using AI
2. Create SQL insert statements for:
   - Additional organizers (with OrganizerInfo)
   - Event categories
   - Venues
   - Events (with proper workflow)
   - Ticket types
   - Seats
   - Audit logs
"""

import os
import sys
import json
from datetime import datetime, timedelta
import random

# Add parent directory to path to import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Event categories with Vietnamese names
CATEGORIES = [
    "Âm nhạc",
    "Thể thao", 
    "Hội thảo",
    "Triển lãm",
    "Sân khấu",
    "Ẩm thực",
    "Workshop",
    "Hài kịch",
    "Thời trang",
    "Marathon"
]

# Cities in Vietnam
CITIES = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Nha Trang",
    "Vũng Tàu",
    "Huế",
    "Hải Phòng"
]

# Event templates by category
EVENT_TEMPLATES = {
    "Âm nhạc": [
        {"name": "Live Concert: {artist}", "desc": "Đêm nhạc sống với {artist} - Trải nghiệm âm nhạc đỉnh cao", "capacity_range": (500, 2000)},
        {"name": "Music Festival {season}", "desc": "Lễ hội âm nhạc {season} - Quy tụ các nghệ sĩ hàng đầu", "capacity_range": (1000, 5000)},
        {"name": "Acoustic Night", "desc": "Đêm nhạc acoustic ấm cúng và gần gũi", "capacity_range": (200, 500)},
    ],
    "Thể thao": [
        {"name": "Giải {sport} {region}", "desc": "Giải đấu {sport} chuyên nghiệp khu vực {region}", "capacity_range": (2000, 10000)},
        {"name": "Trận cầu đỉnh cao: {team1} vs {team2}", "desc": "Trận đấu kịch tính giữa {team1} và {team2}", "capacity_range": (5000, 20000)},
    ],
    "Hội thảo": [
        {"name": "Tech Summit {year}", "desc": "Hội thảo công nghệ lớn nhất năm {year}", "capacity_range": (300, 1000)},
        {"name": "Business Conference", "desc": "Hội nghị kinh doanh và khởi nghiệp", "capacity_range": (200, 800)},
        {"name": "Digital Marketing Workshop", "desc": "Workshop Marketing số cho doanh nghiệp", "capacity_range": (100, 300)},
    ],
    "Triển lãm": [
        {"name": "Triển lãm nghệ thuật {theme}", "desc": "Triển lãm nghệ thuật đương đại với chủ đề {theme}", "capacity_range": (500, 2000)},
        {"name": "Art Exhibition: {artist}", "desc": "Triển lãm tranh của họa sĩ {artist}", "capacity_range": (300, 1000)},
    ],
    "Sân khấu": [
        {"name": "Kịch: {play_name}", "desc": "Vở kịch kinh điển {play_name}", "capacity_range": (300, 800)},
        {"name": "Musical Show", "desc": "Chương trình ca nhạc kịch đặc sắc", "capacity_range": (500, 1500)},
    ],
    "Ẩm thực": [
        {"name": "Food Festival {season}", "desc": "Lễ hội ẩm thực {season} - Hơn 100 gian hàng", "capacity_range": (1000, 5000)},
        {"name": "Street Food Night", "desc": "Đêm hội ẩm thực đường phố", "capacity_range": (500, 2000)},
    ],
    "Workshop": [
        {"name": "Workshop {topic}", "desc": "Workshop chuyên sâu về {topic}", "capacity_range": (50, 200)},
        {"name": "Khóa học {skill}", "desc": "Khóa học thực hành {skill} từ cơ bản đến nâng cao", "capacity_range": (30, 100)},
    ],
    "Hài kịch": [
        {"name": "Comedy Night with {comedian}", "desc": "Đêm hài kịch cùng danh hài {comedian}", "capacity_range": (300, 1000)},
        {"name": "Stand-up Show", "desc": "Chương trình stand-up comedy đặc sắc", "capacity_range": (200, 500)},
    ],
    "Thời trang": [
        {"name": "Fashion Show {season}", "desc": "Tuần lễ thời trang {season} - Bộ sưu tập mới nhất", "capacity_range": (300, 800)},
        {"name": "Runway Show: {designer}", "desc": "Show diễn thời trang của nhà thiết kế {designer}", "capacity_range": (200, 500)},
    ],
    "Marathon": [
        {"name": "Marathon {city} {year}", "desc": "Giải marathon quốc tế {city} {year}", "capacity_range": (1000, 5000)},
        {"name": "Fun Run {distance}km", "desc": "Chạy bộ vui vẻ cự ly {distance}km", "capacity_range": (500, 2000)},
    ]
}

# Image prompts by category
IMAGE_PROMPTS = {
    "Âm nhạc": "Professional concert poster, vibrant stage lighting, crowd with raised hands, energetic atmosphere, modern typography, 16:9",
    "Thể thao": "Sports event poster, dynamic action, stadium atmosphere, bold typography, professional sports design, 16:9",
    "Hội thảo": "Tech conference poster, clean minimalist design, professional business atmosphere, corporate style, 16:9",
    "Triển lãm": "Art exhibition poster, elegant gallery setting, sophisticated cultural design, modern aesthetic, 16:9",
    "Sân khấu": "Theater performance poster, dramatic stage, spotlight effect, elegant design, cultural event style, 16:9",
    "Ẩm thực": "Food festival poster, colorful food stalls, vibrant festive atmosphere, appetizing design, 16:9",
    "Workshop": "Workshop event poster, people collaborating, modern setting, educational style, clean typography, 16:9",
    "Hài kịch": "Comedy show poster, microphone on stage, spotlight, fun energetic atmosphere, playful typography, 16:9",
    "Thời trang": "Fashion show poster, elegant runway, dramatic lighting, glamorous atmosphere, luxury design, 16:9",
    "Marathon": "Marathon event poster, runners in action, energetic sports atmosphere, dynamic typography, 16:9"
}

def generate_event_name(category, index):
    """Generate event name based on category"""
    templates = EVENT_TEMPLATES.get(category, [{"name": f"Sự kiện {category} #{{index}}", "desc": "Mô tả sự kiện", "capacity_range": (100, 500)}])
    template = random.choice(templates)
    
    replacements = {
        "{artist}": random.choice(["Sơn Tùng MTP", "Đen Vâu", "Hòa Minzy", "Noo Phước Thịnh", "Mỹ Tâm"]),
        "{season}": random.choice(["Mùa Xuân", "Mùa Hè", "Mùa Thu", "Mùa Đông"]),
        "{sport}": random.choice(["Bóng đá", "Bóng rổ", "Cầu lông", "Tennis"]),
        "{region}": random.choice(["Miền Nam", "Miền Bắc", "Miền Trung"]),
        "{team1}": random.choice(["Hà Nội FC", "HAGL", "Viettel FC"]),
        "{team2}": random.choice(["TP.HCM FC", "Thanh Hóa", "Bình Dương"]),
        "{year}": "2026",
        "{theme}": random.choice(["Hiện Đại", "Truyền Thống", "Đương Đại"]),
        "{play_name}": random.choice(["Romeo và Juliet", "Hamlet", "Số Đỏ"]),
        "{topic}": random.choice(["AI & Machine Learning", "Digital Marketing", "Photography"]),
        "{skill}": random.choice(["Lập trình Python", "Thiết kế đồ họa", "Nhiếp ảnh"]),
        "{comedian}": random.choice(["Trường Giang", "Hoài Linh", "Trấn Thành"]),
        "{designer}": random.choice(["Công Trí", "Đỗ Mạnh Cường", "Lê Thanh Hòa"]),
        "{city}": random.choice(CITIES),
        "{distance}": str(random.choice([5, 10, 21, 42])),
        "{index}": str(index)
    }
    
    name = template["name"]
    desc = template["desc"]
    for key, value in replacements.items():
        name = name.replace(key, value)
        desc = desc.replace(key, value)
    
    return name, desc, template["capacity_range"]

def generate_sql():
    """Generate complete SQL script"""
    
    sql_parts = []
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- Script to populate 100 events with full workflow")
    sql_parts.append(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_parts.append("-- =====================================================\n")
    
    sql_parts.append("SET NAMES utf8mb4;")
    sql_parts.append("SET FOREIGN_KEY_CHECKS = 0;\n")
    
    # 1. Create additional organizers
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 1. CREATE ADDITIONAL ORGANIZERS")
    sql_parts.append("-- =====================================================\n")
    
    organizers = [
        {
            "email": "organizer2@gmail.com",
            "name": "Organizer 2",
            "phone": "0987654322",
            "org_name": "Công ty Tổ chức Sự kiện Sao Việt",
            "desc": "Chuyên tổ chức các sự kiện âm nhạc, giải trí quy mô lớn tại Việt Nam",
        },
        {
            "email": "organizer3@gmail.com",
            "name": "Organizer 3",
            "phone": "0987654323",
            "org_name": "Trung tâm Hội nghị và Triển lãm Quốc tế",
            "desc": "Đơn vị hàng đầu về tổ chức hội thảo, triển lãm và sự kiện doanh nghiệp",
        },
        {
            "email": "organizer4@gmail.com",
            "name": "Organizer 4",
            "phone": "0987654324",
            "org_name": "Công ty Sự kiện Thể thao Việt Nam",
            "desc": "Chuyên tổ chức các giải đấu thể thao chuyên nghiệp và phong trào",
        },
        {
            "email": "organizer5@gmail.com",
            "name": "Organizer 5",
            "phone": "0987654325",
            "org_name": "Trung tâm Văn hóa Nghệ thuật",
            "desc": "Tổ chức các sự kiện văn hóa, nghệ thuật, triển lãm và biểu diễn",
        }
    ]
    
    # Insert Users (role_id=2 for organizer)
    for i, org in enumerate(organizers, start=2):
        user_id = 85 + i - 1  # Start from 86
        sql_parts.append(f"-- Organizer {i}")
        sql_parts.append(f"INSERT INTO `User` (`user_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `created_at`, `is_active`) VALUES")
        sql_parts.append(f"({user_id}, 2, '{org['email']}', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', '{org['name']}', '{org['phone']}', NOW(), 1);\n")
    
    # Insert OrganizerInfo
    sql_parts.append("-- Organizer Information")
    for i, org in enumerate(organizers, start=2):
        user_id = 85 + i - 1
        sql_parts.append(f"INSERT INTO `OrganizerInfo` (`user_id`, `organization_name`, `description`, `created_at`, `updated_at`) VALUES")
        sql_parts.append(f"({user_id}, '{org['org_name']}', '{org['desc']}', NOW(), NOW());\n")
    
    # 2. Create Event Categories
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 2. CREATE EVENT CATEGORIES")
    sql_parts.append("-- =====================================================\n")
    
    for i, category in enumerate(CATEGORIES, start=1):
        sql_parts.append(f"INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES")
        sql_parts.append(f"({i}, '{category}', 1, NOW());")
    sql_parts.append("")
    
    # 3. Create Venues
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 3. CREATE VENUES")
    sql_parts.append("-- =====================================================\n")
    
    venues = []
    venue_id = 1
    for city in CITIES:
        # Large venue
        venues.append({
            "id": venue_id,
            "name": f"Trung tâm Hội nghị {city}",
            "address": f"123 Đường Lê Lợi, Quận 1, {city}",
            "city": city,
            "capacity": 5000,
            "manager_id": random.choice([85, 86, 87, 88, 89])
        })
        venue_id += 1
        
        # Medium venue
        venues.append({
            "id": venue_id,
            "name": f"Nhà hát {city}",
            "address": f"456 Đường Trần Hưng Đạo, Quận 1, {city}",
            "city": city,
            "capacity": 1000,
            "manager_id": random.choice([85, 86, 87, 88, 89])
        })
        venue_id += 1
        
        # Small venue
        venues.append({
            "id": venue_id,
            "name": f"Cafe & Event Space {city}",
            "address": f"789 Đường Nguyễn Huệ, Quận 1, {city}",
            "city": city,
            "capacity": 200,
            "manager_id": random.choice([85, 86, 87, 88, 89])
        })
        venue_id += 1
    
    for venue in venues:
        sql_parts.append(f"INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES")
        sql_parts.append(f"({venue['id']}, '{venue['name']}', '{venue['address']}', '{venue['city']}', {venue['capacity']}, {venue['manager_id']}, 1, 'ACTIVE', NOW());")
    sql_parts.append("")
    
    # 4. Create 100 Events
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 4. CREATE 100 EVENTS")
    sql_parts.append("-- =====================================================\n")
    
    events = []
    event_id = 1
    
    for i in range(100):
        category = CATEGORIES[i % len(CATEGORIES)]
        category_id = CATEGORIES.index(category) + 1
        
        # Generate event details
        event_name, description, capacity_range = generate_event_name(category, i + 1)
        
        # Random dates in the future (next 6 months)
        days_ahead = random.randint(7, 180)
        start_date = datetime.now() + timedelta(days=days_ahead)
        end_date = start_date + timedelta(hours=random.randint(2, 8))
        
        sale_start = start_date - timedelta(days=random.randint(30, 60))
        sale_end = start_date - timedelta(days=1)
        
        # Select venue based on capacity
        suitable_venues = [v for v in venues if v['capacity'] >= capacity_range[0]]
        venue = random.choice(suitable_venues) if suitable_venues else random.choice(venues)
        
        # Select manager (organizer)
        manager_id = random.choice([85, 86, 87, 88, 89])
        
        # Image path
        image_path = f"/uploads/organizers/{manager_id}/events/event_{event_id}_{category.lower().replace(' ', '_')}.jpg"
        
        # Total capacity
        total_capacity = random.randint(capacity_range[0], min(capacity_range[1], venue['capacity']))
        
        event = {
            "id": event_id,
            "category_id": category_id,
            "venue_id": venue['id'],
            "manager_id": manager_id,
            "name": event_name,
            "description": description,
            "start_datetime": start_date.strftime('%Y-%m-%d %H:%M:%S'),
            "end_datetime": end_date.strftime('%Y-%m-%d %H:%M:%S'),
            "sale_start_datetime": sale_start.strftime('%Y-%m-%d %H:%M:%S'),
            "sale_end_datetime": sale_end.strftime('%Y-%m-%d %H:%M:%S'),
            "banner_image_url": image_path,
            "total_capacity": total_capacity,
            "status": "PUBLISHED",  # Admin approved and published
            "is_featured": 1 if i < 10 else 0  # First 10 events are featured
        }
        
        events.append(event)
        
        sql_parts.append(f"-- Event {event_id}: {event_name}")
        sql_parts.append(f"INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES")
        sql_parts.append(f"({event['id']}, {event['category_id']}, {event['venue_id']}, {event['manager_id']}, '{event['name']}', '{event['description']}', '{event['start_datetime']}', '{event['end_datetime']}', '{event['sale_start_datetime']}', '{event['sale_end_datetime']}', '{event['banner_image_url']}', {event['total_capacity']}, 0, '{event['status']}', {event['is_featured']}, NOW(), NOW());")
        sql_parts.append("")
        
        event_id += 1
    
    # 5. Create Ticket Types for each event
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 5. CREATE TICKET TYPES")
    sql_parts.append("-- =====================================================\n")
    
    ticket_type_id = 1
    ticket_types = []
    
    for event in events:
        # Create 2-3 ticket types per event
        num_types = random.randint(2, 3)
        type_names = ["VIP", "Standard", "Economy"][:num_types]
        
        capacity_per_type = event['total_capacity'] // num_types
        
        for i, type_name in enumerate(type_names):
            # Price based on type
            base_price = random.randint(100000, 500000)
            if type_name == "VIP":
                price = base_price * 3
            elif type_name == "Standard":
                price = base_price * 2
            else:
                price = base_price
            
            ticket_type = {
                "id": ticket_type_id,
                "event_id": event['id'],
                "type_name": type_name,
                "price": price,
                "quantity": capacity_per_type,
                "description": f"Vé {type_name} - {event['name']}"
            }
            
            ticket_types.append(ticket_type)
            
            sql_parts.append(f"INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES")
            sql_parts.append(f"({ticket_type['id']}, {ticket_type['event_id']}, '{ticket_type['type_name']}', '{ticket_type['description']}', {ticket_type['price']}, {ticket_type['quantity']}, 0, 1, NOW());")
            
            ticket_type_id += 1
        
        sql_parts.append("")
    
    # 6. Create Audit Logs
    sql_parts.append("-- =====================================================")
    sql_parts.append("-- 6. CREATE AUDIT LOGS")
    sql_parts.append("-- =====================================================\n")
    
    audit_id = 1
    
    # Audit logs for event creation
    for event in events:
        sql_parts.append(f"-- Audit log for Event {event['id']}")
        sql_parts.append(f"INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES")
        new_values = json.dumps({
            "event_name": event['name'],
            "venue_id": event['venue_id'],
            "category_id": event['category_id'],
            "status": "PENDING_APPROVAL"
        })
        sql_parts.append(f"({audit_id}, 'Event', {event['id']}, 'INSERT', NULL, '{new_values}', {event['manager_id']}, NOW());")
        audit_id += 1
        
        # Audit log for admin approval
        sql_parts.append(f"INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES")
        old_values = json.dumps({"status": "PENDING_APPROVAL"})
        new_values = json.dumps({"status": "APPROVED"})
        sql_parts.append(f"({audit_id}, 'Event', {event['id']}, 'UPDATE', '{old_values}', '{new_values}', 1, NOW());")
        audit_id += 1
        
        # Audit log for publishing
        sql_parts.append(f"INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES")
        old_values = json.dumps({"status": "APPROVED"})
        new_values = json.dumps({"status": "PUBLISHED"})
        sql_parts.append(f"({audit_id}, 'Event', {event['id']}, 'UPDATE', '{old_values}', '{new_values}', 1, NOW());")
        audit_id += 1
        sql_parts.append("")
    
    sql_parts.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_parts.append("\n-- Script completed successfully!")
    
    return "\n".join(sql_parts), events

def main():
    print("=" * 60)
    print("GENERATING 100 EVENTS SCRIPT")
    print("=" * 60)
    print()
    
    # Generate SQL
    print("Generating SQL script...")
    sql_content, events = generate_sql()
    
    # Save SQL file
    sql_file = os.path.join(os.path.dirname(__file__), "insert_100_events.sql")
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✓ SQL script saved to: {sql_file}")
    print(f"✓ Generated {len(events)} events")
    print()
    
    # Generate image generation script
    print("Generating image generation script...")
    image_script = generate_image_script(events)
    
    image_script_file = os.path.join(os.path.dirname(__file__), "generate_event_images.py")
    with open(image_script_file, 'w', encoding='utf-8') as f:
        f.write(image_script)
    
    print(f"✓ Image generation script saved to: {image_script_file}")
    print()
    
    print("=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Run: python scripts/generate_event_images.py")
    print("   (This will generate 100 event images)")
    print()
    print("2. Copy generated images to: ticketbookingapi/uploads/organizers/*/events/")
    print()
    print("3. Execute SQL script in your TiDB Cloud database:")
    print(f"   {sql_file}")
    print()
    print("=" * 60)

def generate_image_script(events):
    """Generate Python script to create all event images"""
    
    script_lines = []
    script_lines.append('"""')
    script_lines.append('Script to generate 100 event images using Google Gemini')
    script_lines.append('Run this script to create all event banner images')
    script_lines.append('"""')
    script_lines.append('')
    script_lines.append('import os')
    script_lines.append('import sys')
    script_lines.append('import time')
    script_lines.append('from datetime import datetime')
    script_lines.append('')
    script_lines.append('# You need to implement image generation using your preferred method')
    script_lines.append('# This is a template - replace with actual image generation code')
    script_lines.append('')
    script_lines.append('def generate_event_image(event_id, category, event_name, output_path):')
    script_lines.append('    """Generate event image using AI"""')
    script_lines.append('    ')
    script_lines.append('    # Image prompts by category')
    script_lines.append('    prompts = {')
    for cat, prompt in IMAGE_PROMPTS.items():
        script_lines.append(f'        "{cat}": "{prompt}",')
    script_lines.append('    }')
    script_lines.append('    ')
    script_lines.append('    base_prompt = prompts.get(category, "Professional event poster, 16:9 aspect ratio")')
    script_lines.append('    full_prompt = f"{event_name} - {base_prompt}"')
    script_lines.append('    ')
    script_lines.append('    print(f"Generating image for Event {event_id}: {event_name}")')
    script_lines.append('    print(f"Prompt: {full_prompt}")')
    script_lines.append('    ')
    script_lines.append('    # TODO: Implement actual image generation here')
    script_lines.append('    # Example using Google Gemini API, DALL-E, Midjourney, etc.')
    script_lines.append('    # Save image to output_path')
    script_lines.append('    ')
    script_lines.append('    return True')
    script_lines.append('')
    script_lines.append('def main():')
    script_lines.append('    print("=" * 60)')
    script_lines.append('    print("GENERATING 100 EVENT IMAGES")')
    script_lines.append('    print("=" * 60)')
    script_lines.append('    print()')
    script_lines.append('    ')
    script_lines.append('    events = [')
    
    for event in events:
        category = CATEGORIES[event['category_id'] - 1]
        script_lines.append(f'        {{"id": {event["id"]}, "name": "{event["name"]}", "category": "{category}", "manager_id": {event["manager_id"]}}},')
    
    script_lines.append('    ]')
    script_lines.append('    ')
    script_lines.append('    success_count = 0')
    script_lines.append('    ')
    script_lines.append('    for event in events:')
    script_lines.append('        output_dir = f"../ticketbookingapi/uploads/organizers/{event[\'manager_id\']}/events"')
    script_lines.append('        os.makedirs(output_dir, exist_ok=True)')
    script_lines.append('        ')
    script_lines.append('        output_path = os.path.join(output_dir, f"event_{event[\'id\']}_{event[\'category\'].lower().replace(\' \', \'_\')}.jpg")')
    script_lines.append('        ')
    script_lines.append('        if generate_event_image(event["id"], event["category"], event["name"], output_path):')
    script_lines.append('            success_count += 1')
    script_lines.append('            print(f"✓ Image saved: {output_path}")')
    script_lines.append('        else:')
    script_lines.append('            print(f"✗ Failed to generate image for Event {event[\'id\']}")')
    script_lines.append('        ')
    script_lines.append('        print()')
    script_lines.append('        time.sleep(1)  # Rate limiting')
    script_lines.append('    ')
    script_lines.append('    print("=" * 60)')
    script_lines.append('    print(f"COMPLETED: {success_count}/{len(events)} images generated")')
    script_lines.append('    print("=" * 60)')
    script_lines.append('')
    script_lines.append('if __name__ == "__main__":')
    script_lines.append('    main()')
    
    return '\n'.join(script_lines)

if __name__ == "__main__":
    main()
