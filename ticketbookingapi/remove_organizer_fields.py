"""
Migration script to remove unnecessary fields from OrganizerInfo table
Removes: website, address, social_facebook, social_instagram, tax_code, bank_account, bank_qr_code
Keeps: organizer_id, user_id, organization_name, description, logo_url, contact_phone, created_at, updated_at
"""

import pymysql

def remove_organizer_info_fields():
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
        fields_to_remove = [
            'website',
            'address', 
            'social_facebook',
            'social_instagram',
            'tax_code',
            'bank_account',
            'bank_qr_code'
        ]
        
        print("Removing fields from OrganizerInfo table...")
        
        for field in fields_to_remove:
            try:
                # Check if column exists first
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'ticketbookingdb' 
                    AND TABLE_NAME = 'OrganizerInfo' 
                    AND COLUMN_NAME = %s
                """, (field,))
                
                exists = cursor.fetchone()[0]
                
                if exists:
                    cursor.execute(f"ALTER TABLE OrganizerInfo DROP COLUMN {field}")
                    print(f"✓ Removed column: {field}")
                else:
                    print(f"⊘ Column '{field}' does not exist, skipping")
                    
            except Exception as e:
                print(f"✗ Error removing {field}: {e}")
                # Continue with other fields even if one fails
                continue
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Show remaining columns
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ticketbookingdb' 
            AND TABLE_NAME = 'OrganizerInfo'
            ORDER BY ORDINAL_POSITION
        """)
        
        print("\nRemaining columns in OrganizerInfo:")
        for row in cursor.fetchall():
            print(f"  - {row[0]} ({row[1]}) {'NULL' if row[2] == 'YES' else 'NOT NULL'}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    remove_organizer_info_fields()
