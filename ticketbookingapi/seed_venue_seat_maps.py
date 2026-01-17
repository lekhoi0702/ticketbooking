import pymysql
import json

def create_seat_map_template(capacity, venue_name):
    """
    Create a realistic seat map template based on venue capacity.
    Returns a JSON structure with sections, rows, and seats.
    """
    
    # Determine venue type and layout based on capacity
    if capacity <= 1000:
        # Small venue (Theater/Hall)
        sections = [
            {
                "section_id": "VIP",
                "section_name": "Khu VIP",
                "rows": 5,
                "seats_per_row": min(20, capacity // 10),
                "start_row": "A",
                "color": "#FFD700"
            },
            {
                "section_id": "STANDARD",
                "section_name": "Khu Thường",
                "rows": 10,
                "seats_per_row": min(25, capacity // 15),
                "start_row": "F",
                "color": "#4CAF50"
            }
        ]
    elif capacity <= 5000:
        # Medium venue (Arena/Convention Center)
        sections = [
            {
                "section_id": "VIP",
                "section_name": "Khu VIP",
                "rows": 8,
                "seats_per_row": 30,
                "start_row": "A",
                "color": "#FFD700"
            },
            {
                "section_id": "STANDARD",
                "section_name": "Khu Thường",
                "rows": 15,
                "seats_per_row": 35,
                "start_row": "I",
                "color": "#4CAF50"
            },
            {
                "section_id": "ECONOMY",
                "section_name": "Khu Phổ thông",
                "rows": 20,
                "seats_per_row": 40,
                "start_row": "X",
                "color": "#2196F3"
            }
        ]
    else:
        # Large venue (Stadium)
        sections = [
            {
                "section_id": "VIP",
                "section_name": "Khán đài VIP",
                "rows": 10,
                "seats_per_row": 50,
                "start_row": "A",
                "color": "#FFD700"
            },
            {
                "section_id": "STANDARD",
                "section_name": "Khán đài Trung tâm",
                "rows": 25,
                "seats_per_row": 60,
                "start_row": "K",
                "color": "#4CAF50"
            },
            {
                "section_id": "ECONOMY",
                "section_name": "Khán đài Phổ thông",
                "rows": 30,
                "seats_per_row": 70,
                "start_row": "AJ",
                "color": "#2196F3"
            }
        ]
    
    # Build the complete seat map
    seat_map = {
        "venue_name": venue_name,
        "total_capacity": capacity,
        "sections": []
    }
    
    for section in sections:
        section_data = {
            "section_id": section["section_id"],
            "section_name": section["section_name"],
            "color": section["color"],
            "rows": []
        }
        
        # Generate rows
        for row_idx in range(section["rows"]):
            row_letter = chr(ord(section["start_row"]) + row_idx) if len(section["start_row"]) == 1 else f"{section['start_row']}{row_idx+1}"
            
            row_data = {
                "row_name": row_letter,
                "seats": []
            }
            
            # Generate seats in this row
            for seat_num in range(1, section["seats_per_row"] + 1):
                row_data["seats"].append({
                    "seat_number": seat_num,
                    "seat_id": f"{row_letter}{seat_num}",
                    "status": "available",
                    "type": section["section_id"].lower()
                })
            
            section_data["rows"].append(row_data)
        
        seat_map["sections"].append(section_data)
    
    return seat_map

def seed_venue_seat_maps():
    config = {
        'host': 'mysql-3b8d5202-dailyreport.i.aivencloud.com',
        'port': 20325,
        'user': 'avnadmin',
        'password': 'AVNS_Wyds9xpxDGzYAuRQ8Rm',
        'database': 'ticketbookingdb'
    }
    
    conn = pymysql.connect(**config)
    cursor = conn.cursor()
    
    try:
        # Get all venues
        cursor.execute("SELECT venue_id, venue_name, capacity FROM Venue")
        venues = cursor.fetchall()
        
        print(f"Found {len(venues)} venues. Creating seat maps...")
        
        for venue_id, venue_name, capacity in venues:
            # Create seat map template
            seat_map = create_seat_map_template(capacity, venue_name)
            seat_map_json = json.dumps(seat_map, ensure_ascii=False)
            
            # Calculate seat distribution
            vip_seats = 0
            standard_seats = 0
            economy_seats = 0
            
            for section in seat_map["sections"]:
                section_total = len(section["rows"]) * len(section["rows"][0]["seats"]) if section["rows"] else 0
                if section["section_id"] == "VIP":
                    vip_seats = section_total
                elif section["section_id"] == "STANDARD":
                    standard_seats = section_total
                elif section["section_id"] == "ECONOMY":
                    economy_seats = section_total
            
            # Update venue with seat map and seat counts
            sql = """
            UPDATE Venue 
            SET seat_map_template = %s,
                vip_seats = %s,
                standard_seats = %s,
                economy_seats = %s
            WHERE venue_id = %s
            """
            cursor.execute(sql, (seat_map_json, vip_seats, standard_seats, economy_seats, venue_id))
            
            print(f"✓ {venue_name}: VIP={vip_seats}, Standard={standard_seats}, Economy={economy_seats}")
        
        conn.commit()
        print(f"\n✅ Successfully created seat maps for {len(venues)} venues!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_venue_seat_maps()
