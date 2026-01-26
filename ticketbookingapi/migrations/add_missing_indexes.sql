-- Migration: Add Missing Indexes
-- Date: 2026-01-24
-- Purpose: Add missing indexes for foreign keys and common query patterns to improve performance

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Verify and add index for Event.manager_id if missing
-- This is used frequently in organizer queries
-- ----------------------------
-- Check if index exists
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Event' 
    AND COLUMN_NAME = 'manager_id'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Event` ADD INDEX `idx_manager_id` (`manager_id` ASC) USING BTREE',
    'SELECT "Index on Event.manager_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Add index for Discount.manager_id if missing
-- Used for organizer discount management
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Discount' 
    AND COLUMN_NAME = 'manager_id'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Discount` ADD INDEX `idx_manager_id` (`manager_id` ASC) USING BTREE',
    'SELECT "Index on Discount.manager_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Add index for Discount.event_id if missing
-- Used for event-specific discount queries
-- ----------------------------
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Discount' 
    AND COLUMN_NAME = 'event_id'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `Discount` ADD INDEX `idx_event_id` (`event_id` ASC) USING BTREE',
    'SELECT "Index on Discount.event_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Note: SeatReservation table does not exist in current database schema
-- Skip adding index for SeatReservation
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SHOW INDEXES FROM `Event` WHERE Column_name = 'manager_id';
-- SHOW INDEXES FROM `Discount` WHERE Column_name IN ('manager_id', 'event_id');
-- SHOW INDEXES FROM `SeatReservation`;
