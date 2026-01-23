"""
Script to generate TicketType and AuditLog for all 100 events
This completes the missing data in the database
"""

import random
from datetime import datetime, timedelta

# Event data (all 100 events)
EVENTS = []
for i in range(1, 101):
    EVENTS.append({
        'event_id': i,
        'manager_id': [85, 86, 87, 88, 89][i % 5]  # Distribute among organizers
    })

# Generate SQL
output_file = "insert_ticket_types_and_audit.sql"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("""-- ============================================================================
-- SCRIPT BỔ SUNG TICKET TYPES VÀ AUDIT LOGS CHO 100 EVENTS
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- BƯỚC 1: Thêm TicketType cho tất cả 100 events
-- ============================================================================

""")
    
    ticket_type_id = 1
    
    for event in EVENTS:
        event_id = event['event_id']
        
        # Random số lượng loại vé (2-3 loại)
        num_ticket_types = random.choice([2, 3])
        
        # Base price
        base_price = random.choice([100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000])
        
        ticket_types = []
        
        if num_ticket_types == 3:
            # VIP, Standard, Economy
            ticket_types = [
                {
                    'name': 'VIP',
                    'price': base_price * 2,
                    'quantity': random.randint(50, 200),
                    'description': 'Vé VIP - Chỗ ngồi tốt nhất'
                },
                {
                    'name': 'Standard',
                    'price': base_price,
                    'quantity': random.randint(100, 500),
                    'description': 'Vé tiêu chuẩn - Chỗ ngồi tốt'
                },
                {
                    'name': 'Economy',
                    'price': base_price * 0.6,
                    'quantity': random.randint(200, 1000),
                    'description': 'Vé phổ thông - Giá tốt nhất'
                }
            ]
        else:
            # VIP, Standard
            ticket_types = [
                {
                    'name': 'VIP',
                    'price': base_price * 1.5,
                    'quantity': random.randint(50, 200),
                    'description': 'Vé VIP - Chỗ ngồi tốt nhất'
                },
                {
                    'name': 'Standard',
                    'price': base_price,
                    'quantity': random.randint(200, 800),
                    'description': 'Vé tiêu chuẩn'
                }
            ]
        
        for ticket in ticket_types:
            f.write(f"INSERT INTO `TicketType` VALUES ({ticket_type_id}, {event_id}, '{ticket['name']}', '{ticket['description']}', {ticket['price']:.2f}, {ticket['quantity']}, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');\n")
            ticket_type_id += 1
    
    f.write("""
-- ============================================================================
-- BƯỚC 2: Thêm AuditLog cho tất cả 100 events
-- ============================================================================

""")
    
    audit_id = 1
    base_time = datetime(2026, 1, 23, 3, 30, 20)
    
    for event in EVENTS:
        event_id = event['event_id']
        manager_id = event['manager_id']
        
        # Timestamp cho mỗi action
        create_time = base_time + timedelta(seconds=event_id)
        approve_time = create_time + timedelta(seconds=30)
        publish_time = approve_time + timedelta(seconds=30)
        
        # 1. INSERT log (event creation)
        f.write(f"INSERT INTO `AuditLog` VALUES ({audit_id}, 'Event', {event_id}, 'INSERT', NULL, ")
        f.write(f"'{{\"event_name\": \"Event {event_id}\", \"status\": \"PENDING_APPROVAL\"}}', ")
        f.write(f"{manager_id}, '{create_time.strftime('%Y-%m-%d %H:%M:%S')}', NULL, NULL);\n")
        audit_id += 1
        
        # 2. UPDATE log (admin approval)
        f.write(f"INSERT INTO `AuditLog` VALUES ({audit_id}, 'Event', {event_id}, 'UPDATE', ")
        f.write(f"'{{\"status\": \"PENDING_APPROVAL\"}}', '{{\"status\": \"APPROVED\"}}', ")
        f.write(f"1, '{approve_time.strftime('%Y-%m-%d %H:%M:%S')}', NULL, NULL);\n")
        audit_id += 1
        
        # 3. UPDATE log (publishing)
        f.write(f"INSERT INTO `AuditLog` VALUES ({audit_id}, 'Event', {event_id}, 'UPDATE', ")
        f.write(f"'{{\"status\": \"APPROVED\"}}', '{{\"status\": \"PUBLISHED\"}}', ")
        f.write(f"{manager_id}, '{publish_time.strftime('%Y-%m-%d %H:%M:%S')}', NULL, NULL);\n")
        audit_id += 1
    
    f.write("""
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- HOÀN THÀNH!
-- Đã thêm:
-- - TicketType cho 100 events (200-300 records)
-- - AuditLog cho 100 events (300 records)
-- ============================================================================
""")

print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ĐÃ TẠO SCRIPT BỔ SUNG TICKET TYPES & AUDIT LOGS           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📁 File đã tạo: {output_file}

📊 Nội dung:
   - TicketType: ~250 records (2-3 loại vé/event)
   - AuditLog: 300 records (3 logs/event)

🚀 Bước tiếp theo:
   1. Chạy script: scripts/insert_missing_events.sql
   2. Chạy script: scripts/{output_file}
   3. Verify database

✅ Sau khi chạy xong, bạn sẽ có đầy đủ 100 events với:
   - Events: 100 records
   - TicketTypes: ~250 records
   - AuditLogs: 300 records
   - OrganizerInfo: 5 records
""")
