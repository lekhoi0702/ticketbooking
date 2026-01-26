-- Migration: Normalize boolean-like flags (TiDB-safe)
-- Date: 2026-01-24
-- Purpose:
-- - Make boolean-like columns consistent in type/defaults without relying on BOOLEAN keyword display.
-- - In MySQL/TiDB, BOOLEAN is an alias of tinyint(1); INFORMATION_SCHEMA often still shows tinyint(1).
-- Strategy:
-- - Use tinyint(1) explicitly (most compatible).
-- - Set defaults to match intended semantics.

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Advertisement
-- ============================================
ALTER TABLE `Advertisement`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1 COMMENT 'Active status';

-- ============================================
-- Banner
-- ============================================
-- Keep DEFAULT NULL if you still want tri-state. If you want strict boolean, run fix_nullable_fields_tidb_safe.sql.
ALTER TABLE `Banner`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT NULL;

-- ============================================
-- Discount
-- ============================================
ALTER TABLE `Discount`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1;

-- ============================================
-- Event
-- ============================================
ALTER TABLE `Event`
    MODIFY COLUMN `is_featured` tinyint(1) NULL DEFAULT 0;

-- ============================================
-- EventCategory
-- ============================================
ALTER TABLE `EventCategory`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1;

-- ============================================
-- Seat
-- ============================================
ALTER TABLE `Seat`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1;

-- ============================================
-- TicketType
-- ============================================
ALTER TABLE `TicketType`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1;

-- ============================================
-- User
-- ============================================
ALTER TABLE `User`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1,
    MODIFY COLUMN `must_change_password` tinyint(1) NOT NULL DEFAULT 0;

-- ============================================
-- Venue
-- ============================================
ALTER TABLE `Venue`
    MODIFY COLUMN `is_active` tinyint(1) NULL DEFAULT 1;

SET FOREIGN_KEY_CHECKS = 1;

