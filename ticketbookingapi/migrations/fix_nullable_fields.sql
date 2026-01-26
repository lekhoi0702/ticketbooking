-- Migration: Fix Nullable Fields with Default Values
-- Date: 2026-01-24
-- Purpose: Change nullable fields to NOT NULL with appropriate DEFAULT values for data integrity
-- This ensures consistent data and prevents NULL-related issues in queries

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Banner table: Fix nullable fields
-- ============================================
-- Banner.is_active: NULL → NOT NULL DEFAULT TRUE
-- Check if there are NULL values first
SET @null_count = (SELECT COUNT(*) FROM `Banner` WHERE `is_active` IS NULL);

SET @sql = IF(@null_count > 0,
    CONCAT('UPDATE `Banner` SET `is_active` = 1 WHERE `is_active` IS NULL; ALTER TABLE `Banner` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;'),
    'ALTER TABLE `Banner` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Banner.display_order: NULL → NOT NULL DEFAULT 0
SET @null_count = (SELECT COUNT(*) FROM `Banner` WHERE `display_order` IS NULL);

SET @sql = IF(@null_count > 0,
    CONCAT('UPDATE `Banner` SET `display_order` = 0 WHERE `display_order` IS NULL; ALTER TABLE `Banner` MODIFY COLUMN `display_order` int UNSIGNED NOT NULL DEFAULT 0;'),
    'ALTER TABLE `Banner` MODIFY COLUMN `display_order` int UNSIGNED NOT NULL DEFAULT 0;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- EventCategory table: Fix nullable fields
-- ============================================
-- EventCategory.is_active: Already has DEFAULT, but ensure NOT NULL
-- Check current state
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'EventCategory' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `EventCategory` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "EventCategory.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Seat table: Fix nullable fields
-- ============================================
-- Seat.is_active: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Seat' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `Seat` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "Seat.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- TicketType table: Fix nullable fields
-- ============================================
-- TicketType.is_active: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TicketType' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `TicketType` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "TicketType.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- User table: Fix nullable fields
-- ============================================
-- User.is_active: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'User' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `User` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "User.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Venue table: Fix nullable fields
-- ============================================
-- Venue.is_active: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Venue' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `Venue` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "Venue.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Advertisement table: Fix nullable fields
-- ============================================
-- Advertisement.is_active: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Advertisement' 
    AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `Advertisement` MODIFY COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;',
    'SELECT "Advertisement.is_active already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Advertisement.display_order: Already has DEFAULT, but ensure NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Advertisement' 
    AND COLUMN_NAME = 'display_order'
);

SET @sql = IF(@is_nullable = 'YES',
    'ALTER TABLE `Advertisement` MODIFY COLUMN `display_order` int UNSIGNED NOT NULL DEFAULT 0;',
    'SELECT "Advertisement.display_order already NOT NULL" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- Check nullable status of important fields
-- SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND COLUMN_NAME IN ('is_active', 'display_order')
-- ORDER BY TABLE_NAME, COLUMN_NAME;
