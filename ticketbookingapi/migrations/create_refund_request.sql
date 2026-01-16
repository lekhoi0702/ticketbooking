-- Migration: Create RefundRequest table
-- Date: 2026-01-16
-- Purpose: Track refund requests from customers with detailed information

CREATE TABLE IF NOT EXISTS `RefundRequest` (
    `refund_request_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `reason` TEXT,
    `refund_amount` DECIMAL(15, 2) NOT NULL,
    `request_status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    `organizer_note` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    `reviewed_by` INT NULL,
    `refunded_at` DATETIME NULL,
    
    -- Foreign Keys
    CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `Order`(`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_refund_user` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_refund_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`user_id`) ON DELETE SET NULL,
    
    -- Indexes
    INDEX `idx_refund_order` (`order_id`),
    INDEX `idx_refund_user` (`user_id`),
    INDEX `idx_refund_status` (`request_status`),
    INDEX `idx_refund_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `RefundRequest` COMMENT = 'Stores customer refund requests for orders';
