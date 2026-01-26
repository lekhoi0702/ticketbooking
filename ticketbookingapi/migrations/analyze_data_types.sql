-- Script: Analyze Current Data Types
-- Date: 2026-01-24
-- Purpose: Analyze data types in database to identify potential issues and improvements

SET @db = DATABASE();

-- ============================================
-- 1. INTEGER TYPES ANALYSIS
-- ============================================
SELECT '=== INTEGER TYPES ANALYSIS ===' AS section;

-- Check for int(11) fields that might need bigger types
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    CASE 
        WHEN COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos') 
        THEN '⚠️ POTENTIAL OVERFLOW RISK'
        WHEN COLUMN_NAME LIKE '%_id' 
        THEN '✅ OK (ID field)'
        ELSE '✅ OK'
    END AS risk_assessment
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'int'
    AND COLUMN_TYPE LIKE 'int(11)%'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 2. VARCHAR LENGTH ANALYSIS
-- ============================================
SELECT '' AS '';
SELECT '=== VARCHAR LENGTH ANALYSIS ===' AS section;

-- Check VARCHAR fields that might be too short
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CHARACTER_MAXIMUM_LENGTH,
    DATA_TYPE,
    CASE 
        WHEN COLUMN_NAME LIKE '%url%' AND CHARACTER_MAXIMUM_LENGTH < 1000 
        THEN '⚠️ URL might be too short (max URL length ~2048)'
        WHEN COLUMN_NAME LIKE '%phone%' AND CHARACTER_MAXIMUM_LENGTH < 20 
        THEN '⚠️ Phone might be too short (E.164 format up to 15 digits + prefix)'
        WHEN COLUMN_NAME LIKE '%email%' AND CHARACTER_MAXIMUM_LENGTH < 255 
        THEN '⚠️ Email might be too short (RFC 5321 allows up to 320 chars)'
        WHEN COLUMN_NAME LIKE '%image%' AND CHARACTER_MAXIMUM_LENGTH < 500 
        THEN '⚠️ Image URL might be too short'
        ELSE '✅ OK'
    END AS risk_assessment
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND (
        (COLUMN_NAME LIKE '%url%' AND CHARACTER_MAXIMUM_LENGTH < 1000)
        OR (COLUMN_NAME LIKE '%phone%' AND CHARACTER_MAXIMUM_LENGTH < 20)
        OR (COLUMN_NAME LIKE '%image%' AND CHARACTER_MAXIMUM_LENGTH < 500)
    )
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 3. DATETIME vs TIMESTAMP ANALYSIS
-- ============================================
SELECT '' AS '';
SELECT '=== DATETIME vs TIMESTAMP INCONSISTENCY ===' AS section;

-- Check for inconsistency between datetime and timestamp
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CASE 
        WHEN DATA_TYPE = 'timestamp' THEN '⚠️ TIMESTAMP (has timezone issues)'
        WHEN DATA_TYPE = 'datetime' THEN '✅ DATETIME (no timezone issues)'
        ELSE '✅ OK'
    END AS type_assessment
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE IN ('datetime', 'timestamp')
ORDER BY 
    DATA_TYPE, TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 4. DECIMAL PRECISION ANALYSIS
-- ============================================
SELECT '' AS '';
SELECT '=== DECIMAL PRECISION ANALYSIS ===' AS section;

-- Check decimal fields
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    CASE 
        WHEN NUMERIC_PRECISION = 15 AND NUMERIC_SCALE = 2 
        THEN '✅ OK (Standard for currency)'
        ELSE '⚠️ REVIEW NEEDED'
    END AS assessment
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'decimal'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 5. BOOLEAN vs TINYINT ANALYSIS
-- ============================================
SELECT '' AS '';
SELECT '=== BOOLEAN vs TINYINT ANALYSIS ===' AS section;

-- Check tinyint(1) fields that could be boolean
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    CASE 
        WHEN COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%'
        THEN '⚠️ Could use BOOLEAN type for clarity'
        ELSE '✅ OK'
    END AS suggestion
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'tinyint'
    AND COLUMN_TYPE LIKE 'tinyint(1)%'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 6. NULLABLE vs NOT NULL ANALYSIS
-- ============================================
SELECT '' AS '';
SELECT '=== NULLABLE FIELDS THAT SHOULD BE NOT NULL ===' AS section;

-- Check important fields that are nullable but shouldn't be
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CASE 
        WHEN COLUMN_NAME IN ('is_active', 'display_order') AND IS_NULLABLE = 'YES'
        THEN '⚠️ Should be NOT NULL with DEFAULT'
        WHEN COLUMN_NAME LIKE '%_at' AND IS_NULLABLE = 'YES' AND COLUMN_NAME != 'deleted_at'
        THEN '⚠️ Review if should be NOT NULL'
        ELSE '✅ OK'
    END AS suggestion
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND IS_NULLABLE = 'YES'
    AND (
        COLUMN_NAME IN ('is_active', 'display_order')
        OR (COLUMN_NAME LIKE '%_at' AND COLUMN_NAME != 'deleted_at')
    )
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 7. SUMMARY OF RECOMMENDATIONS
-- ============================================
SELECT '' AS '';
SELECT '=== SUMMARY OF RECOMMENDATIONS ===' AS section;

-- Count potential issues
SELECT 
    'Integer overflow risks' AS issue_type,
    COUNT(*) AS count
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'int'
    AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity')

UNION ALL

SELECT 
    'VARCHAR length issues',
    COUNT(*)
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'varchar'
    AND (
        (COLUMN_NAME LIKE '%url%' AND CHARACTER_MAXIMUM_LENGTH < 1000)
        OR (COLUMN_NAME LIKE '%phone%' AND CHARACTER_MAXIMUM_LENGTH < 20)
    )

UNION ALL

SELECT 
    'Timestamp vs Datetime inconsistency',
    COUNT(*)
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE IN ('datetime', 'timestamp')

UNION ALL

SELECT 
    'Tinyint(1) that could be Boolean',
    COUNT(*)
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @db
    AND DATA_TYPE = 'tinyint'
    AND COLUMN_TYPE LIKE 'tinyint(1)%'
    AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%');
