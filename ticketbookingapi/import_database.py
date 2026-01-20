"""
Auto Import Database to TiDB Cloud
"""
import pymysql
import os
import sys
from dotenv import load_dotenv

# Load environment variables
basedir = os.path.dirname(__file__)
load_dotenv(os.path.join(basedir, '.env'))

print("=" * 70)
print("AUTO IMPORT DATABASE TO TIDB CLOUD")
print("=" * 70)

# Get database config
DB_HOST = os.getenv('DB_HOST')
DB_PORT = int(os.getenv('DB_PORT', 4000))
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'ticketbookingdb')
SSL_CA = os.path.join(basedir, os.getenv('DB_SSL_CA', 'CA_cert.pem'))

print(f"\n[CONFIG]")
print(f"  Host: {DB_HOST}")
print(f"  Port: {DB_PORT}")
print(f"  User: {DB_USER}")
print(f"  Target DB: {DB_NAME}")
print(f"  SSL CA: {SSL_CA}")

# Find SQL file
sql_file = os.path.join(os.path.dirname(basedir), 'ticketbookingdb.sql')
print(f"\n[SQL FILE]")
print(f"  Path: {sql_file}")

if not os.path.exists(sql_file):
    print(f"  [ERROR] File not found!")
    print(f"\n[SOLUTION] Make sure 'ticketbookingdb.sql' exists in project root")
    sys.exit(1)

print(f"  [OK] File found ({os.path.getsize(sql_file)} bytes)")

# Connect to TiDB
print(f"\n[STEP 1] Connecting to TiDB Cloud...")
try:
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        ssl_ca=SSL_CA,
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )
    print("  [OK] Connected successfully!")
except Exception as e:
    print(f"  [ERROR] Connection failed: {str(e)}")
    sys.exit(1)

# Create database if not exists
print(f"\n[STEP 2] Creating database '{DB_NAME}'...")
try:
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`")
    cursor.execute(f"USE `{DB_NAME}`")
    print(f"  [OK] Database '{DB_NAME}' ready!")
except Exception as e:
    print(f"  [ERROR] Failed to create database: {str(e)}")
    connection.close()
    sys.exit(1)

# Read SQL file
print(f"\n[STEP 3] Reading SQL file...")
try:
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    print(f"  [OK] Read {len(sql_content)} characters")
except Exception as e:
    print(f"  [ERROR] Failed to read file: {str(e)}")
    connection.close()
    sys.exit(1)

# Split into statements (simple split by semicolon)
print(f"\n[STEP 4] Parsing SQL statements...")
statements = []
current_statement = []

for line in sql_content.split('\n'):
    # Skip comments and empty lines
    line = line.strip()
    if not line or line.startswith('--') or line.startswith('/*'):
        continue
    
    current_statement.append(line)
    
    # If line ends with semicolon, it's end of statement
    if line.endswith(';'):
        stmt = ' '.join(current_statement)
        if stmt.strip():
            statements.append(stmt)
        current_statement = []

print(f"  [OK] Found {len(statements)} SQL statements")

# Execute statements
print(f"\n[STEP 5] Executing SQL statements...")
success_count = 0
error_count = 0

for i, statement in enumerate(statements, 1):
    try:
        # Show progress every 10 statements
        if i % 10 == 0:
            print(f"  Progress: {i}/{len(statements)} statements...")
        
        cursor.execute(statement)
        connection.commit()
        success_count += 1
        
    except Exception as e:
        error_count += 1
        error_msg = str(e)
        
        # Skip common non-critical errors
        if 'already exists' in error_msg.lower():
            success_count += 1
            continue
        
        if 'Duplicate entry' in error_msg:
            success_count += 1
            continue
            
        print(f"  [WARNING] Statement {i} failed: {error_msg[:100]}")

print(f"  [DONE] {success_count} succeeded, {error_count} errors")

# Verify tables
print(f"\n[STEP 6] Verifying tables...")
try:
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"  [OK] Found {len(tables)} tables:")
    for table in tables[:10]:  # Show first 10
        print(f"      - {table[0]}")
    if len(tables) > 10:
        print(f"      ... and {len(tables) - 10} more")
except Exception as e:
    print(f"  [ERROR] Failed to verify: {str(e)}")

# Close connection
cursor.close()
connection.close()

print("\n" + "=" * 70)
print("IMPORT COMPLETE!")
print("=" * 70)
print(f"\n[NEXT STEPS]")
print(f"1. Update .env file:")
print(f"   DB_NAME={DB_NAME}")
print(f"2. Restart backend:")
print(f"   python run_debug.py")
print(f"3. Test API:")
print(f"   http://localhost:5000/api/categories")
print("\n" + "=" * 70)
