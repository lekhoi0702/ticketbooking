import pymysql

def fix_db():
    try:
        # Hardcoded database credentials
        host = 'mysql-3b8d5202-dailyreport.i.aivencloud.com'
        user = 'avnadmin'
        password = 'AVNS_Wyds9xpxDGzYAuRQ8Rm'
        database = 'ticketbookingdb'
        port = 20325
        
        print(f"Connecting to {host}:{port}...")
        
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            ssl={'ssl': {}} # Aiven usually requires SSL
        )
        
        with conn.cursor() as cursor:
            print("Checking Payment table structure...")
            
            # Check if payment_code exists
            cursor.execute("SHOW COLUMNS FROM Payment LIKE 'payment_code'")
            if not cursor.fetchone():
                print("Adding payment_code column...")
                cursor.execute("ALTER TABLE Payment ADD COLUMN payment_code VARCHAR(50) UNIQUE AFTER order_id")
            
            # Check if paid_at exists
            cursor.execute("SHOW COLUMNS FROM Payment LIKE 'paid_at'")
            if not cursor.fetchone():
                print("Adding paid_at column...")
                cursor.execute("ALTER TABLE Payment ADD COLUMN paid_at DATETIME AFTER payment_status")
            
            # Check and Update payment_method ENUM
            cursor.execute("SHOW COLUMNS FROM Payment LIKE 'payment_method'")
            col_info = cursor.fetchone()
            if col_info and "CASH" not in col_info['Type']:
                print("Updating payment_method ENUM to include 'CASH'...")
                # Extract existing values and add 'CASH'
                # For simplicity, we just set the new full list
                cursor.execute("ALTER TABLE Payment MODIFY COLUMN payment_method ENUM('CREDIT_CARD','BANK_TRANSFER','E_WALLET','MOMO','VNPAY','CASH')")
            
            conn.commit()
            print("Database updated successfully on Aiven Cloud!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fix_db()
