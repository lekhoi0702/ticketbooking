-- Migration: Change User.user_id from INT to BIGINT
-- Description: Convert primary key of User table and all foreign keys referencing it from INT to BIGINT
-- Date: 2026-01-24

-- Step 1: Find and drop all foreign key constraints referencing User.user_id
-- This script will drop all foreign keys, modify columns, then recreate foreign keys

-- Drop foreign keys from Order table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Order' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Order` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from EventDeletionRequest table (organizer_id)
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'EventDeletionRequest' 
                AND COLUMN_NAME = 'organizer_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `EventDeletionRequest` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from EventDeletionRequest table (reviewed_by)
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'EventDeletionRequest' 
                AND COLUMN_NAME = 'reviewed_by' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `EventDeletionRequest` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from OrganizerInfo table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'OrganizerInfo' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `OrganizerInfo` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from Venue table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Venue' 
                AND COLUMN_NAME = 'manager_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Venue` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from FavoriteEvent table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'FavoriteEvent' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `FavoriteEvent` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from OrganizerQRCode table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'OrganizerQRCode' 
                AND COLUMN_NAME = 'manager_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `OrganizerQRCode` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from SeatReservation table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'SeatReservation' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `SeatReservation` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from RefreshToken table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'RefreshToken' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `RefreshToken` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from Discount table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Discount' 
                AND COLUMN_NAME = 'manager_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Discount` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from Advertisement table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Advertisement' 
                AND COLUMN_NAME = 'created_by' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Advertisement` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from PasswordResetToken table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'PasswordResetToken' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `PasswordResetToken` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from EventCategory table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'EventCategory' 
                AND COLUMN_NAME = 'created_by' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `EventCategory` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from Event table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Event' 
                AND COLUMN_NAME = 'manager_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Event` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from RefundRequest table (user_id)
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'RefundRequest' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `RefundRequest` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from RefundRequest table (reviewed_by)
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'RefundRequest' 
                AND COLUMN_NAME = 'reviewed_by' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `RefundRequest` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from Notification table
SET @fk_name = (SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Notification' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME = 'User' 
                AND REFERENCED_COLUMN_NAME = 'user_id' 
                LIMIT 1);
SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE `Notification` DROP FOREIGN KEY `', @fk_name, '`'), 
              'SELECT "FK not found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Modify all foreign key columns from INT to BIGINT
ALTER TABLE `Order` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `EventDeletionRequest` MODIFY COLUMN `organizer_id` BIGINT NOT NULL;
ALTER TABLE `EventDeletionRequest` MODIFY COLUMN `reviewed_by` BIGINT NULL;
ALTER TABLE `OrganizerInfo` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `Venue` MODIFY COLUMN `manager_id` BIGINT NOT NULL;
ALTER TABLE `FavoriteEvent` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `OrganizerQRCode` MODIFY COLUMN `manager_id` BIGINT NOT NULL;
ALTER TABLE `SeatReservation` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `RefreshToken` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `Discount` MODIFY COLUMN `manager_id` BIGINT NULL;
ALTER TABLE `Advertisement` MODIFY COLUMN `created_by` BIGINT NULL;
ALTER TABLE `PasswordResetToken` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `EventCategory` MODIFY COLUMN `created_by` BIGINT NULL;
ALTER TABLE `Event` MODIFY COLUMN `manager_id` BIGINT NOT NULL;

-- Modify RefundRequest and Notification tables if they exist (using IF EXISTS would require MySQL 8.0.19+)
-- These will fail gracefully if tables don't exist
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'RefundRequest');
SET @sql = IF(@table_exists > 0, 
              'ALTER TABLE `RefundRequest` MODIFY COLUMN `user_id` BIGINT NOT NULL; 
               ALTER TABLE `RefundRequest` MODIFY COLUMN `reviewed_by` BIGINT NULL;', 
              'SELECT "RefundRequest table does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification');
SET @sql = IF(@table_exists > 0, 
              'ALTER TABLE `Notification` MODIFY COLUMN `user_id` BIGINT NOT NULL;', 
              'SELECT "Notification table does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Modify User.user_id from INT to BIGINT (must be last)
ALTER TABLE `User` MODIFY COLUMN `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY;

-- Step 4: Recreate all foreign key constraints
ALTER TABLE `Order` 
ADD CONSTRAINT `fk_order_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `EventDeletionRequest` 
ADD CONSTRAINT `fk_event_deletion_organizer` 
FOREIGN KEY (`organizer_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `EventDeletionRequest` 
ADD CONSTRAINT `fk_event_deletion_reviewer` 
FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `OrganizerInfo` 
ADD CONSTRAINT `fk_organizer_info_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `Venue` 
ADD CONSTRAINT `fk_venue_manager` 
FOREIGN KEY (`manager_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `FavoriteEvent` 
ADD CONSTRAINT `fk_favorite_event_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

ALTER TABLE `OrganizerQRCode` 
ADD CONSTRAINT `fk_organizer_qr_manager` 
FOREIGN KEY (`manager_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

ALTER TABLE `SeatReservation` 
ADD CONSTRAINT `fk_seat_reservation_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

ALTER TABLE `RefreshToken` 
ADD CONSTRAINT `fk_refresh_token_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `Discount` 
ADD CONSTRAINT `fk_discount_manager` 
FOREIGN KEY (`manager_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `Advertisement` 
ADD CONSTRAINT `fk_advertisement_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `PasswordResetToken` 
ADD CONSTRAINT `fk_password_reset_token_user` 
FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `EventCategory` 
ADD CONSTRAINT `fk_event_category_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `Event` 
ADD CONSTRAINT `fk_event_manager` 
FOREIGN KEY (`manager_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Recreate foreign keys for RefundRequest if table exists
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'RefundRequest');
SET @sql = IF(@table_exists > 0, 
              'ALTER TABLE `RefundRequest` 
               ADD CONSTRAINT `fk_refund_user` 
               FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
               ALTER TABLE `RefundRequest` 
               ADD CONSTRAINT `fk_refund_reviewer` 
               FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;', 
              'SELECT "RefundRequest table does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recreate foreign keys for Notification if table exists
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification');
SET @sql = IF(@table_exists > 0, 
              'ALTER TABLE `Notification` 
               ADD CONSTRAINT `fk_notification_user` 
               FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;', 
              'SELECT "Notification table does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
