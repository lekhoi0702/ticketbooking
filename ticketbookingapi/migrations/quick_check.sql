-- Quick Database Status Check
-- Run this to get a quick overview of database status

SET @db = DATABASE();

-- 1. Collation Issues
SELECT 'COLLATION ISSUES' AS check_type, 
       TABLE_NAME, 
       TABLE_COLLATION 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = @db 
  AND TABLE_TYPE = 'BASE TABLE' 
  AND TABLE_COLLATION != 'utf8mb4_unicode_ci';

-- 2. Duplicate Indexes on deleted_at
SELECT 'DUPLICATE INDEXES' AS check_type,
       TABLE_NAME,
       COUNT(*) AS index_count,
       GROUP_CONCAT(INDEX_NAME) AS index_names
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = @db
  AND COLUMN_NAME = 'deleted_at'
GROUP BY TABLE_NAME
HAVING COUNT(*) > 1;

-- 3. Missing Indexes
SELECT 'MISSING INDEXES' AS check_type,
       'Event.manager_id' AS missing_index,
       CASE WHEN COUNT(*) = 0 THEN 'MISSING' ELSE 'EXISTS' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Event' AND COLUMN_NAME = 'manager_id'
UNION ALL
SELECT 'MISSING INDEXES',
       'Discount.manager_id',
       CASE WHEN COUNT(*) = 0 THEN 'MISSING' ELSE 'EXISTS' END
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'manager_id'
UNION ALL
SELECT 'MISSING INDEXES',
       'Discount.event_id',
       CASE WHEN COUNT(*) = 0 THEN 'MISSING' ELSE 'EXISTS' END
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Discount' AND COLUMN_NAME = 'event_id';

-- 4. Row Format
SELECT 'ROW FORMAT' AS check_type,
       TABLE_NAME,
       ROW_FORMAT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = @db
  AND TABLE_TYPE = 'BASE TABLE'
  AND ROW_FORMAT = 'Compact';

-- 5. Views with obsolete references
SELECT 'VIEW ISSUES' AS check_type,
       TABLE_NAME AS view_name,
       CASE 
         WHEN VIEW_DEFINITION LIKE '%deleted_at%' THEN 'HAS deleted_at'
         WHEN VIEW_DEFINITION LIKE '%sale_start_datetime%' THEN 'HAS sale_start_datetime'
         WHEN VIEW_DEFINITION LIKE '%sale_end_datetime%' THEN 'HAS sale_end_datetime'
         ELSE 'OK'
       END AS issue
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = @db
  AND (VIEW_DEFINITION LIKE '%deleted_at%' 
       OR VIEW_DEFINITION LIKE '%sale_start_datetime%'
       OR VIEW_DEFINITION LIKE '%sale_end_datetime%');

-- 6. Check Constraints Count
SELECT 'CHECK CONSTRAINTS' AS check_type,
       COUNT(*) AS constraint_count
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = @db
  AND CONSTRAINT_TYPE = 'CHECK';
