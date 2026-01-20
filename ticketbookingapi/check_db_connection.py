"""
Script to check database connection and tables
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("=" * 60)
print("DATABASE CONFIGURATION CHECK")
print("=" * 60)

# Print current configuration
db_host = os.getenv('DB_HOST', 'NOT SET')
db_port = os.getenv('DB_PORT', 'NOT SET')
db_user = os.getenv('DB_USER', 'NOT SET')
db_name = os.getenv('DB_NAME', 'NOT SET')

print(f"\nDB_HOST: {db_host}")
print(f"DB_PORT: {db_port}")
print(f"DB_USER: {db_user}")
print(f"DB_NAME: {db_name}")
print(f"DB_PASSWORD: {'***SET***' if os.getenv('DB_PASSWORD') else 'NOT SET'}")

if db_name == 'test':
    print("\n" + "!" * 60)
    print("WARNING: DB_NAME is 'test'!")
    print("   Please change to 'ticketbookingdb' in .env file")
    print("!" * 60)

# Try to connect
print("\n" + "-" * 60)
print("Checking database connection...")
print("-" * 60)

try:
    import pymysql
    
    ssl_ca_path = os.path.join(os.path.dirname(__file__), 'CA_cert.pem')
    
    connection = pymysql.connect(
        host=db_host,
        port=int(db_port) if db_port != 'NOT SET' else 3306,
        user=db_user,
        password=os.getenv('DB_PASSWORD', ''),
        database=db_name,
        ssl_ca=ssl_ca_path if os.path.exists(ssl_ca_path) else None,
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )
    
    print("[OK] Database connection successful!")
    
    # Check tables
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    print(f"\nTables found: {len(tables)}")
    
    if len(tables) == 0:
        print("\n[WARNING] No tables found in database!")
        print("   You may need to import ticketbookingdb.sql")
    else:
        print("\nTable list:")
        for table in tables:
            print(f"  - {table[0]}")
    
    # Check specific tables
    required_tables = ['Banner', 'EventCategory', 'Event', 'User', 'Venue']
    missing_tables = []
    
    table_names = [t[0] for t in tables]
    for table in required_tables:
        if table not in table_names:
            missing_tables.append(table)
    
    if missing_tables:
        print(f"\n[WARNING] Missing tables: {', '.join(missing_tables)}")
    else:
        print(f"\n[OK] All required tables exist!")
    
    cursor.close()
    connection.close()
    
except pymysql.err.OperationalError as e:
    print(f"[ERROR] Connection error: {e}")
    print("\nPlease check:")
    print("  1. DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env")
    print("  2. CA_cert.pem file exists")
    print("  3. Database server is running")
except Exception as e:
    print(f"[ERROR] Error: {e}")

print("\n" + "=" * 60)
