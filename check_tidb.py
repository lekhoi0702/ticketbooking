import pymysql
import os

# Database configuration from config.py
host = "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
user = "2CVjR46iAJPpbCG.root"
password = "Cojs8xqBx7I3q0Zb"
database = "ticketbookingdb"
port = 4000

# SSL configuration
ca_cert = "c:/Users/lekho/Desktop/ticketbooking/ticketbookingapi/CA_cert.pem"

try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        ssl={'ca': ca_cert}
    )
    cursor = conn.cursor()

    event_id = 60054
    print(f"Checking Event ID: {event_id}")

    # Check Ticket Types
    cursor.execute("SELECT ticket_type_id, type_name, quantity FROM TicketType WHERE event_id = %s", (event_id,))
    tts = cursor.fetchall()
    print(f"Ticket Types found: {len(tts)}")
    for tt_id, tt_name, qty in tts:
        print(f"  - TT: {tt_name} (ID: {tt_id}), Quantity in DB: {qty}")
        
        # Check Seats for this TT
        cursor.execute("SELECT count(*) FROM Seat WHERE ticket_type_id = %s", (tt_id,))
        seat_count = cursor.fetchone()[0]
        print(f"    - Found {seat_count} seats in Seat table")

    # Check all seats for this event (via join)
    query = """
    SELECT count(*) 
    FROM Seat 
    JOIN TicketType ON Seat.ticket_type_id = TicketType.ticket_type_id 
    WHERE TicketType.event_id = %s
    """
    cursor.execute(query, (event_id,))
    total_seats = cursor.fetchone()[0]
    print(f"Total seats for event via JOIN: {total_seats}")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
