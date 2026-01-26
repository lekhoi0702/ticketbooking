-- Migration: Standardize Collation to utf8mb4_unicode_ci
-- Date: 2026-01-24
-- Purpose: Standardize all tables to use utf8mb4_unicode_ci collation for consistency
-- This ensures proper string comparison and avoids issues when joining tables with different collations
-- Note: TiDB requires dropping indexes on columns before converting collation

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Banner table: Change from utf8mb4_0900_ai_ci to utf8mb4_unicode_ci
-- ----------------------------
ALTER TABLE `Banner` 
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- OrganizerInfo table: Change from utf8mb4_0900_ai_ci to utf8mb4_unicode_ci
-- ----------------------------
ALTER TABLE `OrganizerInfo` 
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- Seat table: Change from utf8mb4_0900_ai_ci to utf8mb4_unicode_ci
-- Note: Need to drop index on 'status' column first, then recreate after conversion
-- ----------------------------
-- Drop index on status column
ALTER TABLE `Seat` DROP INDEX `status`;

-- Convert table collation
ALTER TABLE `Seat` 
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recreate index on status column
ALTER TABLE `Seat` 
    ADD INDEX `status` (`status` ASC) USING BTREE;

-- ----------------------------
-- FavoriteEvent table: Change from utf8mb4_bin to utf8mb4_unicode_ci
-- ----------------------------
ALTER TABLE `FavoriteEvent` 
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SELECT 
--     TABLE_NAME,
--     TABLE_COLLATION
-- FROM 
--     INFORMATION_SCHEMA.TABLES
-- WHERE 
--     TABLE_SCHEMA = DATABASE()
--     AND TABLE_COLLATION != 'utf8mb4_unicode_ci'
-- ORDER BY 
--     TABLE_NAME;
