-- Migration: Add created_by to EventCategory
-- Description: Track which admin user created each category.
-- Run against your MySQL/MariaDB database.

-- Add created_by column (nullable, FK to User)
ALTER TABLE `EventCategory`
    ADD COLUMN `created_by` INT NULL DEFAULT NULL COMMENT 'User ID of admin who created this category' AFTER `created_at`,
    ADD INDEX `idx_event_category_created_by` (`created_by`),
    ADD CONSTRAINT `fk_event_category_created_by`
        FOREIGN KEY (`created_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;
