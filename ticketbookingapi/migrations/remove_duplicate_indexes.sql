-- Migration: Remove Duplicate Indexes
-- Date: 2026-01-24
-- Purpose: Remove duplicate indexes on deleted_at columns in Order and Ticket tables
-- These tables already have idx_deleted_at, so the unnamed INDEX(deleted_at) is redundant

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Remove duplicate index on Order table
-- Table already has: INDEX idx_deleted_at(deleted_at)
-- Remove: INDEX(deleted_at) - unnamed index
-- ----------------------------
-- Find the actual index name for the duplicate index
SET @index_name = (
    SELECT INDEX_NAME 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Order' 
    AND COLUMN_NAME = 'deleted_at' 
    AND INDEX_NAME != 'idx_deleted_at'
    AND INDEX_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@index_name IS NOT NULL,
    CONCAT('ALTER TABLE `Order` DROP INDEX `', @index_name, '`'),
    'SELECT "Duplicate index on Order.deleted_at does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Remove duplicate index on Ticket table
-- Table already has: INDEX idx_deleted_at(deleted_at)
-- Remove: INDEX(deleted_at) - unnamed index
-- ----------------------------
SET @index_name = (
    SELECT INDEX_NAME 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Ticket' 
    AND COLUMN_NAME = 'deleted_at' 
    AND INDEX_NAME != 'idx_deleted_at'
    AND INDEX_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@index_name IS NOT NULL,
    CONCAT('ALTER TABLE `Ticket` DROP INDEX `', @index_name, '`'),
    'SELECT "Duplicate index on Ticket.deleted_at does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SHOW INDEXES FROM `Order` WHERE Column_name = 'deleted_at';
-- SHOW INDEXES FROM `Ticket` WHERE Column_name = 'deleted_at';
