"""
Script to check ticketbookingdb database
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

print("=" * 60)
print("CHECKING ticketbookingdb DATABASE")
print("=" * 60)

try:
    import pymysql
    
    ssl_ca_path = os.path.join(os.path.dirname(__file__), 'CA_cert.pem')
    
    # Connect to ticketbookingdb instead of test
    connection = pymysql.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT', 4000)),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD', ''),
        database='ticketbookingdb',  # Force ticketbookingdb
        ssl_ca=ssl_ca_path if os.path.exists(ssl_ca_path) else None,
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )
    
    print("\n[OK] Connected to ticketbookingdb!")
    
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    print(f"\nTables found in ticketbookingdb: {len(tables)}")
    
    if len(tables) > 0:
        print("\nTable list:")
        for table in tables:
            print(f"  - {table[0]}")
        
        print("\n" + "=" * 60)
        print("SOLUTION: Change DB_NAME=test to DB_NAME=ticketbookingdb")
        print("in your .env file, then restart the backend!")
        print("=" * 60)
    else:
        print("\n[WARNING] ticketbookingdb is also empty!")
        print("You need to import ticketbookingdb.sql first")
    
    cursor.close()
    connection.close()
    
except pymysql.err.OperationalError as e:
    if "Unknown database" in str(e):
        print("\n[ERROR] Database 'ticketbookingdb' does not exist!")
        print("\nYou need to:")
        print("  1. Create the database 'ticketbookingdb'")
        print("  2. Import ticketbookingdb.sql")
    else:
        print(f"\n[ERROR] Connection error: {e}")
except Exception as e:
    print(f"\n[ERROR] Error: {e}")
