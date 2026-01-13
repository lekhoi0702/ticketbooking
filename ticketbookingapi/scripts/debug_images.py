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
cursor.execute('SELECT event_id, event_name, banner_image_url FROM Event')
for r in cursor.fetchall():
    print(f"ID: {r[0]} | Name: {r[1]} | URL: {r[2]}")
conn.close()
