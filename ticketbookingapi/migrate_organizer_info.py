import pymysql

def add_organizer_info_columns():
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
        # Get existing columns
        cursor.execute("SHOW COLUMNS FROM OrganizerInfo")
        existing_columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}\n")
        
        # Define new columns to add
        new_columns = {
            'contact_phone': "VARCHAR(20)",
            'social_facebook': "VARCHAR(255)",
            'social_instagram': "VARCHAR(255)",
            'tax_code': "VARCHAR(50)",
            'bank_account': "VARCHAR(255)"
        }
        
        for column_name, column_type in new_columns.items():
            if column_name not in existing_columns:
                sql = f"ALTER TABLE OrganizerInfo ADD COLUMN {column_name} {column_type}"
                cursor.execute(sql)
                print(f"✓ Added column: {column_name}")
            else:
                print(f"⚠ Column already exists: {column_name}")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Show final structure
        cursor.execute("SHOW COLUMNS FROM OrganizerInfo")
        print("\nFinal table structure:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    add_organizer_info_columns()
