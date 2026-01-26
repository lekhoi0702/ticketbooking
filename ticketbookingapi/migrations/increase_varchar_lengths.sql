-- Migration: Increase VARCHAR Lengths for URLs and Phone Numbers
-- Date: 2026-01-24
-- Purpose: Increase VARCHAR lengths to accommodate longer URLs and international phone numbers
-- URLs can be up to 2048 characters, phone numbers in E.164 format can be up to 15 digits + prefix

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- URL Fields: varchar(500) → varchar(1000)
-- ============================================
-- Note: Using 1000 instead of 2048 to balance storage efficiency
-- If needed, can increase to 2048 later

-- Advertisement table
ALTER TABLE `Advertisement` 
    MODIFY COLUMN `image` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Image URL';

ALTER TABLE `Advertisement` 
    MODIFY COLUMN `url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Click destination URL';

-- Banner table
ALTER TABLE `Banner` 
    MODIFY COLUMN `image` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `Banner` 
    MODIFY COLUMN `url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- Event table
ALTER TABLE `Event` 
    MODIFY COLUMN `banner_image_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

ALTER TABLE `Event` 
    MODIFY COLUMN `qr_image_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- Ticket table
ALTER TABLE `Ticket` 
    MODIFY COLUMN `qr_code_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- OrganizerInfo table
ALTER TABLE `OrganizerInfo` 
    MODIFY COLUMN `logo_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- ============================================
-- Phone Fields: varchar(20) → varchar(30)
-- ============================================
-- E.164 format: up to 15 digits + country code prefix
-- Using 30 to accommodate extensions and formatting

-- User table
ALTER TABLE `User` 
    MODIFY COLUMN `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- Order table
ALTER TABLE `Order` 
    MODIFY COLUMN `customer_phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- Venue table
ALTER TABLE `Venue` 
    MODIFY COLUMN `contact_phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

-- OrganizerInfo table
ALTER TABLE `OrganizerInfo` 
    MODIFY COLUMN `contact_phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- Check new column lengths
-- SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH, DATA_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND (
--     (COLUMN_NAME LIKE '%url%' AND CHARACTER_MAXIMUM_LENGTH >= 1000)
--     OR (COLUMN_NAME LIKE '%phone%' AND CHARACTER_MAXIMUM_LENGTH >= 30)
-- )
-- ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check for any URLs that might be truncated (if data exists)
-- SELECT 'Advertisement' AS table_name, COUNT(*) as long_urls
-- FROM `Advertisement` 
-- WHERE LENGTH(`image`) > 500 OR LENGTH(`url`) > 500
-- UNION ALL
-- SELECT 'Banner', COUNT(*)
-- FROM `Banner` 
-- WHERE LENGTH(`image`) > 500 OR LENGTH(`url`) > 500
-- UNION ALL
-- SELECT 'Event', COUNT(*)
-- FROM `Event` 
-- WHERE LENGTH(`banner_image_url`) > 500 OR LENGTH(`qr_image_url`) > 500;
