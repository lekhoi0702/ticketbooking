-- Script: Verify Boolean Conversion
-- Date: 2026-01-24
-- Purpose: Verify that tinyint(1) to BOOLEAN conversion was successful
-- Note: BOOLEAN is an alias for tinyint(1) in MySQL/TiDB, so INFORMATION_SCHEMA may still show tinyint

SET @db = DATABASE();

-- ============================================
-- VERIFICATION REPORT
-- ============================================
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'BOOLEAN CONVERSION VERIFICATION' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';

-- ============================================
-- Method 1: Check COLUMN_TYPE for BOOLEAN keyword
-- ============================================
SELECT 'Method 1: Check COLUMN_TYPE for BOOLEAN keyword' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE,
    CASE 
        WHEN COLUMN_TYPE LIKE '%BOOLEAN%' THEN '✅ Shows as BOOLEAN'
        WHEN DATA_TYPE = 'tinyint' AND COLUMN_TYPE LIKE 'tinyint(1)%' THEN '⚠️ Still shows as tinyint(1) (but BOOLEAN is alias)'
        ELSE '❓ Unknown'
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
    AND TABLE_NAME IN ('Advertisement', 'Banner', 'Discount', 'Event', 'EventCategory', 'Seat', 'TicketType', 'User', 'Venue')
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- Method 2: Check SHOW CREATE TABLE
-- ============================================
SELECT '' AS '';
SELECT 'Method 2: Check actual table definition' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';
SELECT 'Run these commands manually to see actual CREATE TABLE:' AS '';
SELECT '' AS '';

SELECT 
    CONCAT('SHOW CREATE TABLE `', TABLE_NAME, '`;') AS check_command
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @db
    AND TABLE_NAME IN ('Advertisement', 'Banner', 'Discount', 'Event', 'EventCategory', 'Seat', 'TicketType', 'User', 'Venue')
ORDER BY 
    TABLE_NAME;

-- ============================================
-- Method 3: Test actual data type behavior
-- ============================================
SELECT '' AS '';
SELECT 'Method 3: Test data type behavior' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';
SELECT 'If BOOLEAN conversion worked, these should work:' AS '';

-- Test if we can insert TRUE/FALSE values
SELECT 
    'Test: Try to understand column definition' AS test_type,
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    CASE 
        WHEN COLUMN_TYPE LIKE '%BOOLEAN%' THEN '✅ Explicitly BOOLEAN'
        WHEN DATA_TYPE = 'tinyint' AND COLUMN_TYPE LIKE 'tinyint(1)%' THEN '⚠️ tinyint(1) (BOOLEAN alias)'
        ELSE '❓ Other'
    END AS interpretation
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
    AND TABLE_NAME IN ('Advertisement', 'Banner', 'Discount', 'Event', 'EventCategory', 'Seat', 'TicketType', 'User', 'Venue')
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- Method 4: Check if migration actually ran
-- ============================================
SELECT '' AS '';
SELECT 'Method 4: Verify migration was applied' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check if columns have the expected DEFAULT values (from migration)
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_TYPE,
    CASE 
        WHEN COLUMN_NAME = 'is_active' AND COLUMN_DEFAULT = '1' THEN '✅ Has DEFAULT 1 (migration applied)'
        WHEN COLUMN_NAME = 'is_featured' AND COLUMN_DEFAULT = '0' THEN '✅ Has DEFAULT 0 (migration applied)'
        WHEN COLUMN_NAME = 'must_change_password' AND COLUMN_DEFAULT = '0' AND IS_NULLABLE = 'NO' THEN '✅ Has DEFAULT 0 NOT NULL (migration applied)'
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
SELECT 'SUMMARY' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';

SELECT 
    'Important Note' AS note_type,
    'BOOLEAN is an alias for tinyint(1) in MySQL/TiDB' AS message
UNION ALL
SELECT 
    'Verification',
    'If DEFAULT values match migration, conversion was successful'
UNION ALL
SELECT 
    'To verify',
    'Run: SHOW CREATE TABLE [table_name] to see actual definition';

SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
