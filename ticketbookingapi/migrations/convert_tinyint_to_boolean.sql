-- Migration: Convert Tinyint(1) to BOOLEAN Type
-- Date: 2026-01-24
-- Purpose: Convert tinyint(1) fields to BOOLEAN type for better semantic clarity
-- Note: BOOLEAN is an alias for tinyint(1) in MySQL/TiDB, so this is safe and improves code readability

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Advertisement table
-- ============================================
-- Advertisement.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `Advertisement` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE COMMENT 'Active status';

-- ============================================
-- Banner table
-- ============================================
-- Banner.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `Banner` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT NULL;

-- ============================================
-- Discount table
-- ============================================
-- Discount.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `Discount` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

-- ============================================
-- Event table
-- ============================================
-- Event.is_featured: tinyint(1) → BOOLEAN
ALTER TABLE `Event` 
    MODIFY COLUMN `is_featured` BOOLEAN NULL DEFAULT FALSE;

-- ============================================
-- EventCategory table
-- ============================================
-- EventCategory.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `EventCategory` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

-- ============================================
-- Seat table
-- ============================================
-- Seat.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `Seat` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

-- ============================================
-- TicketType table
-- ============================================
-- TicketType.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `TicketType` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

-- ============================================
-- User table
-- ============================================
-- User.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `User` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

-- User.must_change_password: tinyint(1) → BOOLEAN
ALTER TABLE `User` 
    MODIFY COLUMN `must_change_password` BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================
-- Venue table
-- ============================================
-- Venue.is_active: tinyint(1) → BOOLEAN
ALTER TABLE `Venue` 
    MODIFY COLUMN `is_active` BOOLEAN NULL DEFAULT TRUE;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- Check all boolean columns
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND DATA_TYPE = 'tinyint'
-- AND COLUMN_TYPE LIKE 'tinyint(1)%'
-- ORDER BY TABLE_NAME, COLUMN_NAME;

-- Verify boolean type columns
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND (DATA_TYPE = 'tinyint' OR COLUMN_TYPE LIKE '%BOOLEAN%')
-- AND (COLUMN_NAME LIKE 'is_%' OR COLUMN_NAME LIKE '%_active' OR COLUMN_NAME LIKE 'must_%')
-- ORDER BY TABLE_NAME, COLUMN_NAME;
