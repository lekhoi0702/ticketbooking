-- Script: Check Database Current Status
-- Date: 2026-01-24
-- Purpose: Check current state of database to see what needs to be fixed/optimized

SET @database_name = DATABASE();

-- ============================================
-- 1. CHECK COLLATION STATUS
-- ============================================
SELECT 
    '=== COLLATION STATUS ===' AS section;

SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    CASE 
        WHEN TABLE_COLLATION = 'utf8mb4_unicode_ci' THEN '✅ OK'
        ELSE '❌ NEED FIX'
    END AS status
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    TABLE_COLLATION, TABLE_NAME;

-- ============================================
-- 2. CHECK DUPLICATE INDEXES ON deleted_at
-- ============================================
SELECT 
    '=== DUPLICATE INDEXES ON deleted_at ===' AS section;

-- Check Order table
SELECT 
    'Order' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CASE 
        WHEN COUNT(*) OVER (PARTITION BY TABLE_NAME, COLUMN_NAME) > 1 THEN '❌ DUPLICATE'
        ELSE '✅ OK'
    END AS status
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Order'
    AND COLUMN_NAME = 'deleted_at'
ORDER BY 
    INDEX_NAME;

-- Check Ticket table
SELECT 
    'Ticket' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CASE 
        WHEN COUNT(*) OVER (PARTITION BY TABLE_NAME, COLUMN_NAME) > 1 THEN '❌ DUPLICATE'
        ELSE '✅ OK'
    END AS status
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Ticket'
    AND COLUMN_NAME = 'deleted_at'
ORDER BY 
    INDEX_NAME;

-- ============================================
-- 3. CHECK MISSING INDEXES
-- ============================================
SELECT 
    '=== MISSING INDEXES CHECK ===' AS section;

-- Check Event.manager_id index
SELECT 
    'Event.manager_id' AS index_check,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    GROUP_CONCAT(INDEX_NAME) AS index_names
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Event'
    AND COLUMN_NAME = 'manager_id';

-- Check Discount.manager_id index
SELECT 
    'Discount.manager_id' AS index_check,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    GROUP_CONCAT(INDEX_NAME) AS index_names
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Discount'
    AND COLUMN_NAME = 'manager_id';

-- Check Discount.event_id index
SELECT 
    'Discount.event_id' AS index_check,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    GROUP_CONCAT(INDEX_NAME) AS index_names
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Discount'
    AND COLUMN_NAME = 'event_id';

-- ============================================
-- 4. CHECK COMPOSITE INDEXES
-- ============================================
SELECT 
    '=== COMPOSITE INDEXES STATUS ===' AS section;

-- Check Event indexes
SELECT 
    'Event' AS table_name,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns,
    CASE 
        WHEN INDEX_NAME IN ('idx_status_start_datetime', 'idx_category_status_start') THEN '✅ EXISTS'
        ELSE '⚠️ OTHER'
    END AS status
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Event'
    AND INDEX_NAME != 'PRIMARY'
GROUP BY 
    INDEX_NAME
ORDER BY 
    INDEX_NAME;

-- Check Order indexes
SELECT 
    'Order' AS table_name,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns,
    CASE 
        WHEN INDEX_NAME IN ('idx_user_status_created_desc', 'idx_status_created_deleted') THEN '✅ EXISTS'
        ELSE '⚠️ OTHER'
    END AS status
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'Order'
    AND INDEX_NAME != 'PRIMARY'
GROUP BY 
    INDEX_NAME
ORDER BY 
    INDEX_NAME;

-- ============================================
-- 5. CHECK ROW FORMAT
-- ============================================
SELECT 
    '=== ROW FORMAT STATUS ===' AS section;

SELECT 
    TABLE_NAME,
    ROW_FORMAT,
    CASE 
        WHEN ROW_FORMAT = 'Dynamic' THEN '✅ OK'
        WHEN ROW_FORMAT = 'Compact' THEN '⚠️ CAN OPTIMIZE'
        ELSE '❓ UNKNOWN'
    END AS status
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    ROW_FORMAT, TABLE_NAME;

-- ============================================
-- 6. CHECK CHECK CONSTRAINTS
-- ============================================
SELECT 
    '=== CHECK CONSTRAINTS STATUS ===' AS section;

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM 
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE 
    TABLE_SCHEMA = @database_name
    AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY 
    TABLE_NAME, CONSTRAINT_NAME;

-- ============================================
-- 7. CHECK VIEWS (for obsolete column references)
-- ============================================
SELECT 
    '=== VIEWS STATUS ===' AS section;

SELECT 
    TABLE_NAME AS view_name,
    VIEW_DEFINITION
FROM 
    INFORMATION_SCHEMA.VIEWS
WHERE 
    TABLE_SCHEMA = @database_name
ORDER BY 
    TABLE_NAME;

-- Check if views reference deleted_at, sale_start_datetime, sale_end_datetime
SELECT 
    'v_active_events' AS view_name,
    CASE 
        WHEN VIEW_DEFINITION LIKE '%deleted_at%' THEN '❌ REFERENCES deleted_at'
        WHEN VIEW_DEFINITION LIKE '%sale_start_datetime%' THEN '❌ REFERENCES sale_start_datetime'
        WHEN VIEW_DEFINITION LIKE '%sale_end_datetime%' THEN '❌ REFERENCES sale_end_datetime'
        ELSE '✅ OK'
    END AS status
FROM 
    INFORMATION_SCHEMA.VIEWS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'v_active_events';

SELECT 
    'v_event_statistics' AS view_name,
    CASE 
        WHEN VIEW_DEFINITION LIKE '%deleted_at%' THEN '❌ REFERENCES deleted_at'
        ELSE '✅ OK'
    END AS status
FROM 
    INFORMATION_SCHEMA.VIEWS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'v_event_statistics';

SELECT 
    'v_published_events' AS view_name,
    CASE 
        WHEN VIEW_DEFINITION LIKE '%deleted_at%' THEN '❌ REFERENCES deleted_at'
        ELSE '✅ OK'
    END AS status
FROM 
    INFORMATION_SCHEMA.VIEWS
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_NAME = 'v_published_events';

-- ============================================
-- 8. CHECK COLUMNS WITH DIFFERENT COLLATION
-- ============================================
SELECT 
    '=== COLUMNS WITH DIFFERENT COLLATION ===' AS section;

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLLATION_NAME,
    CASE 
        WHEN COLLATION_NAME = 'utf8mb4_unicode_ci' THEN '✅ OK'
        WHEN COLLATION_NAME IS NULL THEN '⚠️ NO COLLATION'
        ELSE '❌ NEED FIX'
    END AS status
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = @database_name
    AND COLLATION_NAME IS NOT NULL
    AND COLLATION_NAME != 'utf8mb4_unicode_ci'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- ============================================
-- 9. SUMMARY
-- ============================================
SELECT 
    '=== SUMMARY ===' AS section;

SELECT 
    'Tables with wrong collation' AS check_item,
    COUNT(*) AS count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ ALL OK'
        ELSE CONCAT('❌ ', COUNT(*), ' tables need fix')
    END AS status
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_TYPE = 'BASE TABLE'
    AND TABLE_COLLATION != 'utf8mb4_unicode_ci';

SELECT 
    'Tables with Compact row format' AS check_item,
    COUNT(*) AS count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ ALL OK'
        ELSE CONCAT('⚠️ ', COUNT(*), ' tables can optimize')
    END AS status
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @database_name
    AND TABLE_TYPE = 'BASE TABLE'
    AND ROW_FORMAT = 'Compact';

SELECT 
    'Check constraints' AS check_item,
    COUNT(*) AS count,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ GOOD'
        WHEN COUNT(*) > 0 THEN '⚠️ PARTIAL'
        ELSE '❌ MISSING'
    END AS status
FROM 
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE 
    TABLE_SCHEMA = @database_name
    AND CONSTRAINT_TYPE = 'CHECK';
