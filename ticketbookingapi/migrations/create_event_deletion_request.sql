-- Migration: Create EventDeletionRequest table
-- Date: 2026-01-16

CREATE TABLE IF NOT EXISTS `EventDeletionRequest` (
    `request_id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `organizer_id` INT NOT NULL,
    `reason` TEXT,
    `request_status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    `admin_note` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    `reviewed_by` INT NULL,
    
    -- Foreign Keys
    CONSTRAINT `fk_deletion_event` FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_deletion_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_deletion_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL,
    
    -- Indexes
    INDEX `idx_event_deletion_event` (`event_id`),
    INDEX `idx_event_deletion_status` (`request_status`),
    INDEX `idx_event_deletion_organizer` (`organizer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
