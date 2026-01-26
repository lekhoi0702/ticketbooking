-- Migration: Standardize DateTime Types to DATETIME
-- Date: 2026-01-24
-- Purpose: Convert all TIMESTAMP columns to DATETIME for consistency and to avoid timezone issues
-- DATETIME is recommended because:
-- 1. Application already handles timezone separately (now_gmt7)
-- 2. No automatic timezone conversion (less confusion)
-- 3. Easier to debug and maintain

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Event table: Convert timestamps to datetime
-- ============================================
-- Event.created_at: timestamp → datetime
ALTER TABLE `Event` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- Event.updated_at: timestamp → datetime
ALTER TABLE `Event` 
    MODIFY COLUMN `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================
-- EventCategory table: Convert timestamps to datetime
-- ============================================
-- EventCategory.created_at: timestamp → datetime
ALTER TABLE `EventCategory` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- Order table: Convert timestamps to datetime
-- ============================================
-- Order.created_at: timestamp → datetime
ALTER TABLE `Order` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- Order.updated_at: timestamp → datetime
ALTER TABLE `Order` 
    MODIFY COLUMN `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Order.paid_at: timestamp → datetime
ALTER TABLE `Order` 
    MODIFY COLUMN `paid_at` datetime NULL DEFAULT NULL;

-- Order.deleted_at: timestamp → datetime (soft delete)
ALTER TABLE `Order` 
    MODIFY COLUMN `deleted_at` datetime NULL DEFAULT NULL COMMENT 'Soft delete timestamp';

-- ============================================
-- Payment table: Convert timestamps to datetime
-- ============================================
-- Payment.payment_date: timestamp → datetime
ALTER TABLE `Payment` 
    MODIFY COLUMN `payment_date` datetime NULL DEFAULT NULL;

-- Payment.created_at: timestamp → datetime
ALTER TABLE `Payment` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- Ticket table: Convert timestamps to datetime
-- ============================================
-- Ticket.checked_in_at: timestamp → datetime
ALTER TABLE `Ticket` 
    MODIFY COLUMN `checked_in_at` datetime NULL DEFAULT NULL;

-- Ticket.created_at: timestamp → datetime
ALTER TABLE `Ticket` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- Ticket.deleted_at: timestamp → datetime (soft delete)
ALTER TABLE `Ticket` 
    MODIFY COLUMN `deleted_at` datetime NULL DEFAULT NULL COMMENT 'Soft delete timestamp';

-- ============================================
-- TicketType table: Convert timestamps to datetime
-- ============================================
-- TicketType.created_at: timestamp → datetime
ALTER TABLE `TicketType` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- User table: Convert timestamps to datetime
-- ============================================
-- User.created_at: timestamp → datetime
ALTER TABLE `User` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

-- User.updated_at: timestamp → datetime
ALTER TABLE `User` 
    MODIFY COLUMN `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================
-- Venue table: Convert timestamps to datetime
-- ============================================
-- Venue.created_at: timestamp → datetime
ALTER TABLE `Venue` 
    MODIFY COLUMN `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- Check all datetime/timestamp columns
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND DATA_TYPE IN ('datetime', 'timestamp')
-- ORDER BY TABLE_NAME, COLUMN_NAME;

-- Verify no timestamp columns remain (except if intentionally kept)
-- SELECT COUNT(*) as remaining_timestamps
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND DATA_TYPE = 'timestamp';
