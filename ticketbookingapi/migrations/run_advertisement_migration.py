"""
Script to run Advertisement table migration
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
    'port': int(os.getenv('DB_PORT', 4000)),
    'user': os.getenv('DB_USER', '2f4MYMpnUPnmEAe.root'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME', 'ticketbookingdb'),
    'ssl': {'ssl_mode': 'REQUIRED'} if os.getenv('DB_SSL', 'true').lower() == 'true' else None
}

# SQL migration script
MIGRATION_SQL = """
-- Drop table if exists
DROP TABLE IF EXISTS `Advertisement`;

-- Create Advertisement table
CREATE TABLE `Advertisement` (
  `ad_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Advertisement title',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Image URL',
  `link_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Click destination URL',
  `position` enum('HOME_BETWEEN_SECTIONS','EVENT_DETAIL_SIDEBAR','HOME_TOP','HOME_BOTTOM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display position',
  `display_order` int(11) NULL DEFAULT 0 COMMENT 'Display order (lower number = higher priority)',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT 'Active status',
  `start_date` datetime NULL DEFAULT NULL COMMENT 'Start display date',
  `end_date` datetime NULL DEFAULT NULL COMMENT 'End display date',
  `click_count` int(11) NULL DEFAULT 0 COMMENT 'Number of clicks',
  `view_count` int(11) NULL DEFAULT 0 COMMENT 'Number of views',
  `created_by` int(11) NULL DEFAULT NULL COMMENT 'Creator user ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ad_id`) USING BTREE,
  INDEX `idx_position_active`(`position` ASC, `is_active` ASC, `display_order` ASC) USING BTREE COMMENT 'For fetching active ads by position',
  INDEX `idx_active_dates`(`is_active` ASC, `start_date` ASC, `end_date` ASC) USING BTREE COMMENT 'For date-based filtering',
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_ad_creator` FOREIGN KEY (`created_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Advertisement management table' ROW_FORMAT = Compact;

-- Insert sample advertisements
INSERT INTO `Advertisement` (`title`, `image_url`, `link_url`, `position`, `display_order`, `is_active`, `start_date`, `end_date`, `created_by`) VALUES
('Quảng cáo Shopee - Giảm 40k', '/uploads/misc/quangcaoshopee.png', 'https://shopee.vn', 'EVENT_DETAIL_SIDEBAR', 1, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('Quảng cáo trang chủ', '/uploads/misc/quangcao.webp', '#', 'HOME_BETWEEN_SECTIONS', 1, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);
"""

def run_migration():
    """Run the migration script"""
    try:
        print("Connecting to database...")
        connection = pymysql.connect(**DB_CONFIG)
        
        print("Connected successfully!")
        print("Running migration...")
        
        with connection.cursor() as cursor:
            # Execute migration SQL
            for statement in MIGRATION_SQL.split(';'):
                statement = statement.strip()
                if statement:
                    print(f"Executing: {statement[:50]}...")
                    cursor.execute(statement)
            
            connection.commit()
            print("\n✅ Migration completed successfully!")
            print("✅ Advertisement table created")
            print("✅ Sample data inserted")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise
    finally:
        if 'connection' in locals():
            connection.close()
            print("\nDatabase connection closed.")

if __name__ == '__main__':
    print("=" * 60)
    print("Advertisement Table Migration")
    print("=" * 60)
    run_migration()
