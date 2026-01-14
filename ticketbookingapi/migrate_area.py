import pymysql

def update_schema():
    try:
        # Hardcoded database credentials from seed_real_data.py
        host = 'mysql-3b8d5202-dailyreport.i.aivencloud.com'
        user = 'avnadmin'
        password = 'AVNS_Wyds9xpxDGzYAuRQ8Rm'
        database = 'ticketbookingdb'
        port = 20325
        
        conn = pymysql.connect(
            host=host, user=user, password=password, database=database, port=port,
            charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, ssl={'ssl': {}}
        )
        
        with conn.cursor() as cursor:
            print("Checking for area_name column in Seat table...")
            cursor.execute("SHOW COLUMNS FROM Seat LIKE 'area_name'")
            result = cursor.fetchone()
            
            if not result:
                print("Adding area_name column...")
                cursor.execute("ALTER TABLE Seat ADD COLUMN area_name VARCHAR(100) NULL AFTER is_active")
                print("Column added successfully!")
            else:
                print("Column already exists.")
                
            conn.commit()

    except Exception as e:
        print(f"Error updating schema: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    update_schema()
