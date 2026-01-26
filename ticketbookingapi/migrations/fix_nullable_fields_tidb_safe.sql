-- Migration: Fix Nullable Fields (TiDB-safe, no PREPARE)
-- Date: 2026-01-24
-- Purpose: Make key flags/orders NOT NULL with sane DEFAULTs.
-- Notes:
-- - This script intentionally avoids dynamic SQL / PREPARE (some clients/TiDB setups reject it).
-- - We UPDATE NULLs first to prevent ALTER TABLE failures.

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Banner
-- ============================================
UPDATE `Banner` SET `is_active` = 1 WHERE `is_active` IS NULL;
UPDATE `Banner` SET `display_order` = 0 WHERE `display_order` IS NULL;

ALTER TABLE `Banner`
    MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1,
    MODIFY COLUMN `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0;

-- ============================================
-- Advertisement
-- ============================================
UPDATE `Advertisement` SET `is_active` = 1 WHERE `is_active` IS NULL;
UPDATE `Advertisement` SET `display_order` = 0 WHERE `display_order` IS NULL;

ALTER TABLE `Advertisement`
    MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Active status',
    MODIFY COLUMN `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0;

-- ============================================
-- Common boolean-like flags: enforce NOT NULL + DEFAULT 1
-- (Optional tightening: safe for most apps; remove any table/column you still want nullable)
-- ============================================
UPDATE `EventCategory` SET `is_active` = 1 WHERE `is_active` IS NULL;
ALTER TABLE `EventCategory` MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `Seat` SET `is_active` = 1 WHERE `is_active` IS NULL;
ALTER TABLE `Seat` MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `TicketType` SET `is_active` = 1 WHERE `is_active` IS NULL;
ALTER TABLE `TicketType` MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `User` SET `is_active` = 1 WHERE `is_active` IS NULL;
ALTER TABLE `User` MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `Venue` SET `is_active` = 1 WHERE `is_active` IS NULL;
ALTER TABLE `Venue` MODIFY COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1;

SET FOREIGN_KEY_CHECKS = 1;

