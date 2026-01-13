import pymysql

# Hardcoded database credentials
conn = pymysql.connect(
    host='mysql-3b8d5202-dailyreport.i.aivencloud.com',
    user='avnadmin',
    password='AVNS_Wyds9xpxDGzYAuRQ8Rm',
    database='ticketbookingdb',
    port=20325,
    ssl={'ssl':{}}
)
cursor = conn.cursor()

# Map IDs to local images
updates = [
    (10, "/uploads/events/sontung-concert.jpg"),
    (11, "/uploads/events/vleague.jpg"),
    (12, "/uploads/events/music-festival.jpg"),
    (13, "/uploads/events/vleague.jpg")
]

for event_id, url in updates:
    cursor.execute('UPDATE Event SET banner_image_url = %s WHERE event_id = %s', (url, event_id))

conn.commit()
print(f"Updated {len(updates)} events with local images.")
conn.close()
