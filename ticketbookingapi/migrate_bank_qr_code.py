import pymysql

def add_bank_qr_code_field():
    """Add bank_qr_code field to OrganizerInfo table"""
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
        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ticketbookingdb' 
            AND TABLE_NAME = 'OrganizerInfo' 
            AND COLUMN_NAME = 'bank_qr_code'
        """)
        
        exists = cursor.fetchone()[0]
        
        if exists:
            print("✓ Column 'bank_qr_code' already exists in OrganizerInfo table")
        else:
            # Add the column
            cursor.execute("""
                ALTER TABLE OrganizerInfo 
                ADD COLUMN bank_qr_code VARCHAR(500) NULL 
                AFTER bank_account
            """)
            conn.commit()
            print("✅ Successfully added 'bank_qr_code' column to OrganizerInfo table")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    add_bank_qr_code_field()
