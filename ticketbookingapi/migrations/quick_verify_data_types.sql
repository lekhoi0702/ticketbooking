-- Quick Verification: Data Types Optimization Status
-- Date: 2026-01-24
-- Purpose: Quick check of data types optimization status

SET @db = DATABASE();

-- ============================================
-- QUICK STATUS CHECK
-- ============================================
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'QUICK DATA TYPES OPTIMIZATION STATUS' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';

-- 1. Integer UNSIGNED Status
SELECT 
    '1. Integer UNSIGNED' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('❌ ', COUNT(*), ' fields need fix')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
    AND (
        COLUMN_TYPE NOT LIKE '%UNSIGNED%'
        OR (COLUMN_NAME = 'max_per_order' AND COLUMN_TYPE NOT LIKE 'smallint%UNSIGNED%')
    );

-- 2. VARCHAR Length Status
SELECT 
    '2. VARCHAR Lengths (URL)' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('❌ ', COUNT(*), ' fields need fix')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%url%'
    AND CHARACTER_MAXIMUM_LENGTH < 1000

UNION ALL

SELECT 
    '2. VARCHAR Lengths (Phone)' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('❌ ', COUNT(*), ' fields need fix')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%phone%'
    AND CHARACTER_MAXIMUM_LENGTH < 30;

-- 3. DateTime Status
SELECT 
    '3. DateTime Types' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('❌ ', COUNT(*), ' fields need fix')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'timestamp';

-- 4. Boolean Status
SELECT 
    '4. Boolean Types' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('⚠️ ', COUNT(*), ' fields could convert')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'tinyint'
    AND COLUMN_TYPE LIKE 'tinyint(1)%'
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%');

-- 5. Nullable Fields Status
SELECT 
    '5. Nullable Fields' AS check_item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE CONCAT('⚠️ ', COUNT(*), ' fields could fix')
    END AS status,
    COUNT(*) AS issue_count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND IS_NULLABLE = 'YES'
    AND COLUMN_NAME IN ('is_active', 'display_order')
    AND TABLE_NAME IN ('Banner', 'Advertisement');

-- ============================================
-- DETAILED ISSUES (if any)
-- ============================================
SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'DETAILED ISSUES (if any)' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';

-- Integer issues
SELECT 
    CONCAT('❌ ', TABLE_NAME, '.', COLUMN_NAME, ' → ', COLUMN_TYPE) AS issue,
    'Should be UNSIGNED' AS fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
    AND (
        COLUMN_TYPE NOT LIKE '%UNSIGNED%'
        OR (COLUMN_NAME = 'max_per_order' AND COLUMN_TYPE NOT LIKE 'smallint%UNSIGNED%')
    )
ORDER BY 
    TABLE_NAME, COLUMN_NAME

UNION ALL

-- VARCHAR URL issues
SELECT 
    CONCAT('❌ ', TABLE_NAME, '.', COLUMN_NAME, ' → varchar(', CHARACTER_MAXIMUM_LENGTH, ')') AS issue,
    'Should be >= 1000' AS fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%url%'
    AND CHARACTER_MAXIMUM_LENGTH < 1000
ORDER BY 
    TABLE_NAME, COLUMN_NAME

UNION ALL

-- VARCHAR Phone issues
SELECT 
    CONCAT('❌ ', TABLE_NAME, '.', COLUMN_NAME, ' → varchar(', CHARACTER_MAXIMUM_LENGTH, ')') AS issue,
    'Should be >= 30' AS fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%phone%'
    AND CHARACTER_MAXIMUM_LENGTH < 30
ORDER BY 
    TABLE_NAME, COLUMN_NAME

UNION ALL

-- TIMESTAMP issues
SELECT 
    CONCAT('❌ ', TABLE_NAME, '.', COLUMN_NAME, ' → ', DATA_TYPE) AS issue,
    'Should be DATETIME' AS fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'timestamp'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- RECOMMENDATIONS
-- ============================================
SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'RECOMMENDATIONS' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity')
            AND COLUMN_TYPE NOT LIKE '%UNSIGNED%'
        ) THEN '⚠️  Run: optimize_integer_types.sql'
        ELSE '✅ Integer types are optimized'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND DATA_TYPE = 'varchar'
            AND (COLUMN_NAME LIKE '%url%' AND CHARACTER_MAXIMUM_LENGTH < 1000)
        ) OR EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND DATA_TYPE = 'varchar'
            AND COLUMN_NAME LIKE '%phone%'
            AND CHARACTER_MAXIMUM_LENGTH < 30
        ) THEN '⚠️  Run: increase_varchar_lengths.sql'
        ELSE '✅ VARCHAR lengths are optimized'
    END

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND DATA_TYPE = 'timestamp'
        ) THEN '⚠️  Run: standardize_datetime_types.sql'
        ELSE '✅ DateTime types are standardized'
    END

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND DATA_TYPE = 'tinyint'
            AND COLUMN_TYPE LIKE 'tinyint(1)%'
            AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
        ) THEN '⚠️  Run: convert_tinyint_to_boolean.sql (Optional)'
        ELSE '✅ Boolean types are OK'
    END

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND IS_NULLABLE = 'YES'
            AND COLUMN_NAME IN ('is_active', 'display_order')
            AND TABLE_NAME IN ('Banner', 'Advertisement')
        ) THEN '⚠️  Run: fix_nullable_fields.sql (Optional)'
        ELSE '✅ Nullable fields are OK'
    END;

SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
