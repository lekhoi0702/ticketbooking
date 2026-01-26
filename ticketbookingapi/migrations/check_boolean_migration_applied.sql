-- Quick Check: Verify Boolean Migration Was Applied
-- Date: 2026-01-24
-- Purpose: Check if boolean migration was applied by verifying DEFAULT values

SET @db = DATABASE();

-- ============================================
-- VERIFY BY CHECKING DEFAULT VALUES
-- ============================================
-- Migration set specific DEFAULT values, so we can verify by checking those

SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'BOOLEAN MIGRATION VERIFICATION (by DEFAULT values)' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';

-- Check if DEFAULT values match what migration set
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CASE 
        -- Advertisement.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'Advertisement' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- Banner.is_active should have DEFAULT NULL (as per migration)
        WHEN TABLE_NAME = 'Banner' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT IS NULL THEN '✅ Migration applied'
        -- Discount.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'Discount' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- Event.is_featured should have DEFAULT FALSE
        WHEN TABLE_NAME = 'Event' AND COLUMN_NAME = 'is_featured' AND COLUMN_DEFAULT = '0' THEN '✅ Migration applied'
        -- EventCategory.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'EventCategory' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- Seat.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'Seat' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- TicketType.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'TicketType' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- User.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'User' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        -- User.must_change_password should have DEFAULT FALSE and NOT NULL
        WHEN TABLE_NAME = 'User' AND COLUMN_NAME = 'must_change_password' AND COLUMN_DEFAULT = '0' AND IS_NULLABLE = 'NO' THEN '✅ Migration applied'
        -- Venue.is_active should have DEFAULT TRUE
        WHEN TABLE_NAME = 'Venue' AND COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Migration applied'
        ELSE '⚠️ Check manually'
    END AS migration_status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
    AND TABLE_NAME IN ('Advertisement', 'Banner', 'Discount', 'Event', 'EventCategory', 'Seat', 'TicketType', 'User', 'Venue')
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- SUMMARY
-- ============================================
SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'IMPORTANT NOTE' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';
SELECT 'BOOLEAN in MySQL/TiDB is an alias for tinyint(1)' AS note;
SELECT 'INFORMATION_SCHEMA may still show tinyint(1) - this is NORMAL' AS note;
SELECT '' AS '';
SELECT 'To see actual definition, run:' AS '';
SELECT 'SHOW CREATE TABLE [table_name];' AS '';
SELECT '' AS '';
SELECT 'If DEFAULT values match migration, conversion was successful!' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
