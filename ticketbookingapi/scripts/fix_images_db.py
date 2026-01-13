import os, pymysql
from dotenv import load_dotenv
load_dotenv()
conn = pymysql.connect(
    host=os.getenv('DB_HOST'), 
    user=os.getenv('DB_USER'), 
    password=os.getenv('DB_PASSWORD'), 
    database=os.getenv('DB_NAME'), 
    port=int(os.getenv('DB_PORT', 20325)), 
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
