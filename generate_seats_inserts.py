#!/usr/bin/env python3
"""
Script: Generate Seats SQL cho tất cả Events
Tạo INSERT statements cho bảng Seat dựa trên TicketType
"""

def get_row_letter(row_index):
    """Convert row index (1-based) to letter (A, B, C, ..., Z, AA, AB, ...)"""
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if row_index <= 26:
        return alphabet[row_index - 1]
    else:
        first = (row_index - 1) // 26
        second = (row_index - 1) % 26
        return alphabet[first - 1] + alphabet[second]

def generate_seats_for_ticket_type(ticket_type_id, area_name, rows, cols, start_seat_id):
    """Generate INSERT statements for seats"""
    inserts = []
    seat_id = start_seat_id
    
    for row_idx in range(1, rows + 1):
        row_letter = get_row_letter(row_idx)
        for col_idx in range(1, cols + 1):
            insert = f"INSERT INTO `Seat` VALUES ({seat_id}, {ticket_type_id}, '{row_letter}', '{col_idx}', 'AVAILABLE', 1, '{area_name}', {col_idx}, {row_idx});"
            inserts.append(insert)
            seat_id += 1
    
    return inserts, seat_id

# Mapping ticket types với areas dựa trên venue seatmap
# Format: ticket_type_id: [(area_name, rows, cols), ...]
ticket_type_configs = {
    # Event 1: Music Festival Mùa Đông (Venue 17)
    1: [('VIP - Hàng Đầu', 10, 16)],  # 163 seats
    2: [('Standard - Giữa', 20, 23)],  # 466 seats
    3: [('Economy - Sau', 30, 24)],  # 717 seats
    
    # Event 2: Giải Bóng đá (Venue 10)
    4: [('Floor VIP', 5, 14)],  # 71 seats
    5: [('Lower Bowl', 10, 23)],  # 230 seats
    6: [('Upper Bowl', 15, 33)],  # 497 seats
    
    # Event 3: Digital Marketing Workshop (Venue 21)
    7: [('Executive Front', 5, 11)],  # 57 seats
    8: [('Business Class', 20, 26)],  # 516 seats
    
    # Event 4: Triển lãm nghệ thuật (Venue 5)
    9: [('Parterre VIP', 10, 19)],  # 187 seats
    10: [('Balcony Tier', 8, 51)],  # 409 seats
    
    # Event 5: Kịch Số Đỏ (Venue 8)
    11: [('Premium Orchestra', 7, 27)],  # 186 seats
    12: [('Orchestra', 15, 27)],  # 402 seats
    
    # Event 6: Street Food Night (Venue 11)
    13: [('Front Center', 8, 24)],  # 192 seats
    14: [('Side Left', 12, 23)],  # 279 seats
    15: [('Rear Risers', 30, 27)],  # 814 seats
    
    # Event 7: Khóa học Lập trình Python (Venue 17)
    16: [('Executive Front', 5, 17)],  # 87 seats
    17: [('Business Class', 15, 23)],  # 342 seats
    18: [('General Admission', 30, 27)],  # 798 seats
    
    # Event 8: Stand-up Show (Venue 16)
    19: [('Recliner VIP', 6, 12)],  # 75 seats
    20: [('Premium Standard', 15, 25)],  # 371 seats
    21: [('Economy', 20, 25)],  # 493 seats
    
    # Event 9: Fashion Show Mùa Hè (Venue 14)
    22: [('Main Floor VIP', 6, 10)],  # 58 seats
    23: [('Loge Level', 12, 24)],  # 288 seats
    
    # Event 10: Marathon Vũng Tàu 2026 (Venue 22)
    24: [('Platinum Zone', 10, 19)],  # 189 seats
    25: [('Gold Zone', 10, 19)],  # 189 seats
    26: [('Silver Zone', 15, 27)],  # 410 seats
}

def main():
    output_file = 'insert_seats_data.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- =====================================================\n")
        f.write("-- Auto-generated Seat INSERT statements\n")
        f.write("-- Generated for Events 1-10\n")
        f.write("-- =====================================================\n\n")
        f.write("USE ticketbookingdb;\n\n")
        f.write("-- Disable foreign key checks for faster insertion\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")
        
        current_seat_id = 1
        total_seats = 0
        
        for ticket_type_id, areas in sorted(ticket_type_configs.items()):
            f.write(f"\n-- =====================================================\n")
            f.write(f"-- Ticket Type {ticket_type_id}\n")
            f.write(f"-- =====================================================\n\n")
            
            for area_name, rows, cols in areas:
                inserts, current_seat_id = generate_seats_for_ticket_type(
                    ticket_type_id, area_name, rows, cols, current_seat_id
                )
                
                f.write(f"-- Area: {area_name} ({rows} rows x {cols} cols = {len(inserts)} seats)\n")
                for insert in inserts:
                    f.write(insert + "\n")
                f.write("\n")
                
                total_seats += len(inserts)
                print(f"Generated {len(inserts)} seats for Ticket Type {ticket_type_id} - {area_name}")
        
        f.write("\n-- Re-enable foreign key checks\n")
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n\n")
        
        f.write(f"-- Total seats generated: {total_seats}\n")
        f.write(f"-- Last seat_id: {current_seat_id - 1}\n")
    
    print(f"\n✅ Generated {total_seats} seat INSERT statements")
    print(f"📄 Output file: {output_file}")
    print(f"🎫 Ticket types processed: {len(ticket_type_configs)}")

if __name__ == '__main__':
    main()
