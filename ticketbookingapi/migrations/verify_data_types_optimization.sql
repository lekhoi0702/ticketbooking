-- Script: Verify Data Types Optimization
-- Date: 2026-01-24
-- Purpose: Verify that all data type optimizations have been applied correctly

SET @db = DATABASE();

-- ============================================
-- VERIFICATION REPORT
-- ============================================
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'DATA TYPES OPTIMIZATION VERIFICATION REPORT' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT '' AS '';

-- ============================================
-- 1. INTEGER TYPES VERIFICATION
-- ============================================
SELECT '1. INTEGER TYPES (UNSIGNED) VERIFICATION' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check capacity/quantity fields
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All capacity/quantity fields are UNSIGNED'
        ELSE CONCAT('  ❌ ', COUNT(*), ' fields still need UNSIGNED conversion')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
    AND (
        COLUMN_TYPE NOT LIKE '%UNSIGNED%'
        OR (COLUMN_NAME = 'max_per_order' AND COLUMN_TYPE NOT LIKE 'smallint%UNSIGNED%')
    );

-- List fields that need fixing
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (', COLUMN_TYPE, ')') AS needs_fix
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
    TABLE_NAME, COLUMN_NAME;

-- List correctly converted fields
SELECT 
    CONCAT('     ✅ ', TABLE_NAME, '.', COLUMN_NAME, ' (', COLUMN_TYPE, ')') AS correct
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
    AND (
        (COLUMN_TYPE LIKE '%UNSIGNED%' AND COLUMN_NAME != 'max_per_order')
        OR (COLUMN_NAME = 'max_per_order' AND COLUMN_TYPE LIKE 'smallint%UNSIGNED%')
    )
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 2. VARCHAR LENGTHS VERIFICATION
-- ============================================
SELECT '' AS '';
SELECT '2. VARCHAR LENGTHS VERIFICATION' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check URL fields (should be >= 1000)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All URL fields have length >= 1000'
        ELSE CONCAT('  ❌ ', COUNT(*), ' URL fields still need length increase')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%url%'
    AND CHARACTER_MAXIMUM_LENGTH < 1000;

-- List URL fields that need fixing
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (varchar(', CHARACTER_MAXIMUM_LENGTH, '))') AS needs_fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%url%'
    AND CHARACTER_MAXIMUM_LENGTH < 1000
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- Check phone fields (should be >= 30)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All phone fields have length >= 30'
        ELSE CONCAT('  ❌ ', COUNT(*), ' phone fields still need length increase')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%phone%'
    AND CHARACTER_MAXIMUM_LENGTH < 30;

-- List phone fields that need fixing
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (varchar(', CHARACTER_MAXIMUM_LENGTH, '))') AS needs_fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%phone%'
    AND CHARACTER_MAXIMUM_LENGTH < 30
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 3. DATETIME TYPES VERIFICATION
-- ============================================
SELECT '' AS '';
SELECT '3. DATETIME TYPES VERIFICATION' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check if any timestamp columns remain
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All datetime fields use DATETIME type'
        ELSE CONCAT('  ❌ ', COUNT(*), ' fields still use TIMESTAMP type')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'timestamp';

-- List remaining timestamp fields
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (', DATA_TYPE, ')') AS needs_fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'timestamp'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- List correctly converted datetime fields
SELECT 
    CONCAT('     ✅ ', TABLE_NAME, '.', COLUMN_NAME, ' (', DATA_TYPE, ')') AS correct
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'datetime'
    AND COLUMN_NAME LIKE '%_at'
ORDER BY 
    TABLE_NAME, COLUMN_NAME
LIMIT 10;

-- ============================================
-- 4. BOOLEAN TYPES VERIFICATION
-- ============================================
SELECT '' AS '';
SELECT '4. BOOLEAN TYPES VERIFICATION' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check if boolean-like fields still use tinyint(1)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All boolean fields use BOOLEAN type'
        ELSE CONCAT('  ⚠️ ', COUNT(*), ' boolean fields still use tinyint(1)')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'tinyint'
    AND COLUMN_TYPE LIKE 'tinyint(1)%'
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%');

-- List fields that could be converted to BOOLEAN
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (', COLUMN_TYPE, ')') AS could_convert
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'tinyint'
    AND COLUMN_TYPE LIKE 'tinyint(1)%'
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- Note: BOOLEAN is an alias for tinyint(1), so checking actual type is tricky
-- We'll check if the column type shows BOOLEAN or if it's still tinyint(1)
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('  ✅ ', COUNT(*), ' fields show as BOOLEAN type')
        ELSE '  ⚠️ No fields explicitly show BOOLEAN (may still be tinyint(1) alias)'
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND (COLUMN_TYPE LIKE '%BOOLEAN%' OR DATA_TYPE = 'tinyint')
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%');

-- ============================================
-- 5. NULLABLE FIELDS VERIFICATION
-- ============================================
SELECT '' AS '';
SELECT '5. NULLABLE FIELDS VERIFICATION' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check important fields that should be NOT NULL
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '  ✅ All important fields are NOT NULL with DEFAULT'
        ELSE CONCAT('  ⚠️ ', COUNT(*), ' important fields are still nullable')
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND IS_NULLABLE = 'YES'
    AND COLUMN_NAME IN ('is_active', 'display_order')
    AND TABLE_NAME IN ('Banner', 'Advertisement');

-- List nullable fields that should be NOT NULL
SELECT 
    CONCAT('     - ', TABLE_NAME, '.', COLUMN_NAME, ' (', IS_NULLABLE, ', DEFAULT: ', IFNULL(COLUMN_DEFAULT, 'NULL'), ')') AS needs_fix
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND IS_NULLABLE = 'YES'
    AND COLUMN_NAME IN ('is_active', 'display_order')
    AND TABLE_NAME IN ('Banner', 'Advertisement')
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 6. SUMMARY
-- ============================================
SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'SUMMARY' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';

-- Count issues
SELECT 
    'Integer UNSIGNED issues' AS check_type,
    COUNT(*) AS count,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ NEED FIX' END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
    AND (
        COLUMN_TYPE NOT LIKE '%UNSIGNED%'
        OR (COLUMN_NAME = 'max_per_order' AND COLUMN_TYPE NOT LIKE 'smallint%UNSIGNED%')
    )

UNION ALL

SELECT 
    'VARCHAR length issues (URL)',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ NEED FIX' END
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%url%'
    AND CHARACTER_MAXIMUM_LENGTH < 1000

UNION ALL

SELECT 
    'VARCHAR length issues (Phone)',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ NEED FIX' END
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND COLUMN_NAME LIKE '%phone%'
    AND CHARACTER_MAXIMUM_LENGTH < 30

UNION ALL

SELECT 
    'TIMESTAMP type issues',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ NEED FIX' END
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'timestamp'

UNION ALL

SELECT 
    'Nullable fields issues',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '⚠️ OPTIONAL' END
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND IS_NULLABLE = 'YES'
    AND COLUMN_NAME IN ('is_active', 'display_order')
    AND TABLE_NAME IN ('Banner', 'Advertisement');

-- ============================================
-- 7. RECOMMENDATIONS
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
        ) THEN '  ⚠️  Run: optimize_integer_types.sql'
        ELSE '  ✅ Integer types are optimized'
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
        ) THEN '  ⚠️  Run: increase_varchar_lengths.sql'
        ELSE '  ✅ VARCHAR lengths are optimized'
    END

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @db
            AND DATA_TYPE = 'timestamp'
        ) THEN '  ⚠️  Run: standardize_datetime_types.sql'
        ELSE '  ✅ DateTime types are standardized'
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
        ) THEN '  ⚠️  Run: convert_tinyint_to_boolean.sql (Optional)'
        ELSE '  ✅ Boolean types are converted (or using tinyint(1) alias)'
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
        ) THEN '  ⚠️  Run: fix_nullable_fields.sql (Optional)'
        ELSE '  ✅ Nullable fields are fixed'
    END;

SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
