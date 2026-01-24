"""
Run migration: add must_change_password to User table.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ticketbookingdb'),
    'ssl': {'ssl_mode': 'REQUIRED'} if os.getenv('DB_SSL', '').lower() == 'true' else None,
}
if DB_CONFIG['ssl'] and not DB_CONFIG['password']:
    DB_CONFIG['ssl'] = None

SQL = "ALTER TABLE `User` ADD COLUMN `must_change_password` TINYINT(1) NOT NULL DEFAULT 0;"

def run():
    try:
        conn = pymysql.connect(**{k: v for k, v in DB_CONFIG.items() if v is not None})
        with conn.cursor() as cur:
            cur.execute(SQL)
        conn.commit()
        print("✅ User.must_change_password added.")
    except pymysql.Error as e:
        if 'Duplicate column' in str(e):
            print("✅ Column must_change_password already exists, skipping.")
        else:
            raise
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    run()
