-- Database Status Summary Report
-- Run this to get a clear summary of what needs to be fixed

SET @db = DATABASE();

-- ============================================
-- SUMMARY REPORT
-- ============================================

SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'DATABASE OPTIMIZATION STATUS REPORT' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';

-- 1. COLLATION STATUS
SELECT '' AS '';
SELECT '1. COLLATION STATUS' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CONCAT('  ❌ ', COUNT(*), ' tables need collation fix') AS status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = @db 
  AND TABLE_TYPE = 'BASE TABLE' 
  AND TABLE_COLLATION != 'utf8mb4_unicode_ci'
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    CONCAT('  ✅ All tables have correct collation') AS status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = @db 
  AND TABLE_TYPE = 'BASE TABLE' 
  AND TABLE_COLLATION != 'utf8mb4_unicode_ci'
HAVING COUNT(*) = 0;

-- List tables with wrong collation
SELECT 
    CONCAT('     - ', TABLE_NAME, ' (', TABLE_COLLATION, ')') AS details
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = @db 
  AND TABLE_TYPE = 'BASE TABLE' 
  AND TABLE_COLLATION != 'utf8mb4_unicode_ci'
ORDER BY TABLE_NAME;

-- 2. DUPLICATE INDEXES
SELECT '' AS '';
SELECT '2. DUPLICATE INDEXES ON deleted_at' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

-- Check for duplicates
SELECT 
    CONCAT('  ❌ ', TABLE_NAME, ' has ', COUNT(*), ' indexes on deleted_at') AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = @db
  AND COLUMN_NAME = 'deleted_at'
GROUP BY TABLE_NAME
HAVING COUNT(*) > 1

UNION ALL

-- Show OK if no duplicates
SELECT 
    '  ✅ No duplicate indexes found' AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND COLUMN_NAME = 'deleted_at'
    GROUP BY TABLE_NAME HAVING COUNT(*) > 1
);

-- 3. MISSING INDEXES
SELECT '' AS '';
SELECT '3. MISSING INDEXES' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CONCAT('  ❌ ', 'Event.manager_id - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND COLUMN_NAME = 'manager_id'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Event.manager_id - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND COLUMN_NAME = 'manager_id'
)
UNION ALL
SELECT 
    CONCAT('  ❌ ', 'Discount.manager_id - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'manager_id'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Discount.manager_id - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'manager_id'
)
UNION ALL
SELECT 
    CONCAT('  ❌ ', 'Discount.event_id - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'event_id'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Discount.event_id - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'event_id'
);

-- 4. COMPOSITE INDEXES
SELECT '' AS '';
SELECT '4. COMPOSITE INDEXES' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CONCAT('  ❌ ', 'Event.idx_status_start_datetime - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_status_start_datetime'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Event.idx_status_start_datetime - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_status_start_datetime'
)
UNION ALL
SELECT 
    CONCAT('  ❌ ', 'Event.idx_category_status_start - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_category_status_start'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Event.idx_category_status_start - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_category_status_start'
)
UNION ALL
SELECT 
    CONCAT('  ❌ ', 'Order.idx_user_status_created_desc - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Order' AND INDEX_NAME = 'idx_user_status_created_desc'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Order.idx_user_status_created_desc - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Order' AND INDEX_NAME = 'idx_user_status_created_desc'
)
UNION ALL
SELECT 
    CONCAT('  ❌ ', 'Order.idx_status_created_deleted - MISSING') AS status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Order' AND INDEX_NAME = 'idx_status_created_deleted'
)
UNION ALL
SELECT 
    CONCAT('  ✅ ', 'Order.idx_status_created_deleted - EXISTS') AS status
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Order' AND INDEX_NAME = 'idx_status_created_deleted'
);

-- 5. ROW FORMAT
SELECT '' AS '';
SELECT '5. ROW FORMAT' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_SCHEMA = @db AND TABLE_TYPE = 'BASE TABLE' AND ROW_FORMAT = 'Compact') > 0
        THEN CONCAT('  ⚠️ ', 
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = @db AND TABLE_TYPE = 'BASE TABLE' AND ROW_FORMAT = 'Compact'),
            ' tables use Compact format (can optimize)')
        ELSE '  ✅ All tables use Dynamic format'
    END AS status;

-- 6. CHECK CONSTRAINTS
SELECT '' AS '';
SELECT '6. CHECK CONSTRAINTS' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CASE 
        WHEN COUNT(*) >= 8 THEN CONCAT('  ✅ ', COUNT(*), ' check constraints (GOOD)')
        WHEN COUNT(*) > 0 THEN CONCAT('  ⚠️ ', COUNT(*), ' check constraints (PARTIAL)')
        ELSE '  ❌ No check constraints (MISSING)'
    END AS status
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = @db
  AND CONSTRAINT_TYPE = 'CHECK';

-- 7. VIEWS STATUS
SELECT '' AS '';
SELECT '7. VIEWS STATUS' AS '';
SELECT '───────────────────────────────────────────────────────────' AS '';

SELECT 
    CASE 
        WHEN VIEW_DEFINITION LIKE '%deleted_at%' OR 
             VIEW_DEFINITION LIKE '%sale_start_datetime%' OR 
             VIEW_DEFINITION LIKE '%sale_end_datetime%' 
        THEN CONCAT('  ❌ ', TABLE_NAME, ' - HAS OBSOLETE REFERENCES')
        ELSE CONCAT('  ✅ ', TABLE_NAME, ' - OK')
    END AS status
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = @db
ORDER BY TABLE_NAME;

-- 8. FINAL SUMMARY
SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
SELECT 'MIGRATION RECOMMENDATIONS' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS 
              WHERE TABLE_SCHEMA = @db 
              AND (VIEW_DEFINITION LIKE '%deleted_at%' 
                   OR VIEW_DEFINITION LIKE '%sale_start_datetime%'
                   OR VIEW_DEFINITION LIKE '%sale_end_datetime%')) > 0
        THEN '  ⚠️  Run: fix_views_remove_obsolete_columns.sql'
        ELSE '  ✅ Views are OK'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND COLUMN_NAME = 'deleted_at'
            GROUP BY TABLE_NAME HAVING COUNT(*) > 1
        )
        THEN '  ⚠️  Run: remove_duplicate_indexes.sql'
        ELSE '  ✅ No duplicate indexes'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
              WHERE TABLE_SCHEMA = @db 
              AND TABLE_TYPE = 'BASE TABLE' 
              AND TABLE_COLLATION != 'utf8mb4_unicode_ci') > 0
        THEN '  ⚠️  Run: standardize_collation.sql'
        ELSE '  ✅ Collation is standardized'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND COLUMN_NAME = 'manager_id'
        ) OR NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'manager_id'
        ) OR NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'event_id'
        )
        THEN '  ⚠️  Run: add_missing_indexes.sql'
        ELSE '  ✅ All required indexes exist'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_status_start_datetime'
        ) OR NOT EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND INDEX_NAME = 'idx_category_status_start'
        )
        THEN '  ⚠️  Run: add_composite_indexes.sql'
        ELSE '  ✅ Composite indexes are OK'
    END AS recommendation

UNION ALL

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
              WHERE TABLE_SCHEMA = @db AND CONSTRAINT_TYPE = 'CHECK') < 8
        THEN '  ⚠️  Run: add_check_constraints.sql'
        ELSE '  ✅ Check constraints are OK'
    END AS recommendation;

SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════' AS '';
