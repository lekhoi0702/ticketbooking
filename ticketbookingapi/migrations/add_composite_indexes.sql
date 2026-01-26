-- Migration: Add Composite Indexes for Common Query Patterns
-- Date: 2026-01-24
-- Purpose: Add composite indexes based on common query patterns identified in code analysis
-- These indexes will significantly improve query performance for frequently used queries

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Event table: Composite index for homepage queries
-- Pattern: status, start_datetime (for filtering published/upcoming events)
-- Note: deleted_at removed as Event table doesn't have soft delete
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Event' 
    AND INDEX_NAME = 'idx_status_start_datetime'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Event` ADD INDEX `idx_status_start_datetime` (`status` ASC, `start_datetime` ASC) USING BTREE COMMENT ''For homepage and upcoming events queries''',
    'SELECT "Index idx_status_start_datetime already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Event table: Composite index for category filtering
-- Pattern: category_id, status, start_datetime
-- Used in: CategoryEvents page, category filtering
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Event' 
    AND INDEX_NAME = 'idx_category_status_start'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Event` ADD INDEX `idx_category_status_start` (`category_id` ASC, `status` ASC, `start_datetime` ASC) USING BTREE COMMENT ''For category page filtering''',
    'SELECT "Index idx_category_status_start already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Order table: Composite index for user order history with sorting
-- Pattern: user_id, order_status, created_at DESC
-- Used in: User order history queries
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Order' 
    AND INDEX_NAME = 'idx_user_status_created_desc'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Order` ADD INDEX `idx_user_status_created_desc` (`user_id` ASC, `order_status` ASC, `created_at` DESC) USING BTREE COMMENT ''For user order history with status filtering and sorting''',
    'SELECT "Index idx_user_status_created_desc already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Order table: Composite index for admin order management
-- Pattern: order_status, created_at, deleted_at
-- Used in: Admin order listing and filtering
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Order' 
    AND INDEX_NAME = 'idx_status_created_deleted'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Order` ADD INDEX `idx_status_created_deleted` (`order_status` ASC, `created_at` ASC, `deleted_at` ASC) USING BTREE COMMENT ''For admin order management with soft delete filtering''',
    'SELECT "Index idx_status_created_deleted already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- TicketType table: Composite index for active ticket types per event
-- Pattern: event_id, is_active, price
-- Used in: Event ticket type queries with price filtering
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TicketType' 
    AND INDEX_NAME = 'idx_event_active_price'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `TicketType` ADD INDEX `idx_event_active_price` (`event_id` ASC, `is_active` ASC, `price` ASC) USING BTREE COMMENT ''For event ticket type queries with price range''',
    'SELECT "Index idx_event_active_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Payment table: Composite index for payment reports
-- Pattern: payment_status, paid_at, payment_method
-- Used in: Payment analytics and reporting
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Payment' 
    AND INDEX_NAME = 'idx_status_paid_method'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Payment` ADD INDEX `idx_status_paid_method` (`payment_status` ASC, `paid_at` ASC, `payment_method` ASC) USING BTREE COMMENT ''For payment reports and analytics''',
    'SELECT "Index idx_status_paid_method already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Ticket table: Composite index for order ticket lookup
-- Pattern: order_id, ticket_status
-- Used in: Order detail queries with ticket status filtering
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Ticket' 
    AND INDEX_NAME = 'idx_order_status'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Ticket` ADD INDEX `idx_order_status` (`order_id` ASC, `ticket_status` ASC) USING BTREE COMMENT ''For order ticket lookup with status filtering''',
    'SELECT "Index idx_order_status already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SHOW INDEXES FROM `Event` WHERE Index_name LIKE 'idx_%';
-- SHOW INDEXES FROM `Order` WHERE Index_name LIKE 'idx_%';
-- SHOW INDEXES FROM `TicketType` WHERE Index_name LIKE 'idx_%';
-- SHOW INDEXES FROM `Payment` WHERE Index_name LIKE 'idx_%';
-- SHOW INDEXES FROM `Ticket` WHERE Index_name LIKE 'idx_%';
