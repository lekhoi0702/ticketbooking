import sqlite3
import os

db_path = 'ticketbookingapi/instance/ticketbooking.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get latest event
cursor.execute("SELECT event_id, event_name FROM Event ORDER BY event_id DESC LIMIT 1")
event = cursor.fetchone()
if not event:
    print("No events found")
    exit(0)

event_id, event_name = event
print(f"Checking Event: {event_name} (ID: {event_id})")

# Get ticket types for this event
cursor.execute("SELECT ticket_type_id, type_name FROM TicketType WHERE event_id = ?", (event_id,))
tts = cursor.fetchall()
print(f"Ticket Types found: {len(tts)}")
for tt_id, tt_name in tts:
    cursor.execute("SELECT count(*) FROM Seat WHERE ticket_type_id = ?", (tt_id,))
    count = cursor.fetchone()[0]
    print(f"  - TT: {tt_name} (ID: {tt_id}) has {count} seats")

conn.close()
