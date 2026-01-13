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
cursor.execute('SELECT event_id, event_name, banner_image_url FROM Event')
for r in cursor.fetchall():
    print(f"ID: {r[0]} | Name: {r[1]} | URL: {r[2]}")
conn.close()
