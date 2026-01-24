"""
Run migration to add PasswordResetToken table
"""
import os
import sys
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', 3306))
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'ticketbookingdb')

    try:
        connection = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            sql = """
            CREATE TABLE IF NOT EXISTS `PasswordResetToken` (
                `token_id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `token` VARCHAR(255) NOT NULL UNIQUE,
                `expires_at` DATETIME NOT NULL,
                `used` TINYINT(1) NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
                INDEX `idx_user_id` (`user_id`),
                INDEX `idx_token` (`token`),
                INDEX `idx_expires_at` (`expires_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            cursor.execute(sql)
            connection.commit()
            print("✓ PasswordResetToken table created successfully")

    except pymysql.Error as e:
        if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
            print("✓ PasswordResetToken table already exists")
        else:
            print(f"✗ Error: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == '__main__':
    run_migration()
