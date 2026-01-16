"""
Migration script to allow NULL for event_id in EventDeletionRequest table
This is necessary because when an event is deleted, the deletion request should still exist
with event_id set to NULL for historical tracking.
"""

import pymysql

def migrate():
    try:
        # Connect to database
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # User will need to provide password
            database='ticketbookingdb',
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Modify event_id column to allow NULL
        sql = """
        ALTER TABLE EventDeletionRequest 
        MODIFY COLUMN event_id INT NULL;
        """
        
        print("Executing migration...")
        cursor.execute(sql)
        connection.commit()
        
        print("✓ Migration successful! event_id column now allows NULL values.")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()
