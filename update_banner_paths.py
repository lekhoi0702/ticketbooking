import pymysql

conn = pymysql.connect(
    host='mysql-3b8d5202-dailyreport.i.aivencloud.com',
    port=20325,
    user='avnadmin',
    password='AVNS_Wyds9xpxDGzYAuRQ8Rm',
    database='ticketbookingdb'
)

cursor = conn.cursor()

# Update banner paths to use .jpg files
cursor.execute("UPDATE Banner SET image_url = 'uploads/banner/banner_1.jpg' WHERE banner_id = 8")
cursor.execute("UPDATE Banner SET image_url = 'uploads/banner/banner_2.jpg' WHERE banner_id = 9")
cursor.execute("UPDATE Banner SET image_url = 'uploads/banner/banner_3.jpg' WHERE banner_id = 10")

conn.commit()
print("✅ Updated banner paths to .jpg files")

# Verify
cursor.execute("SELECT banner_id, title, image_url FROM Banner WHERE is_active = 1")
print("\nActive banners:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} - {row[2]}")

conn.close()
