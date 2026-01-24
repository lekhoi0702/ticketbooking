-- Add PasswordResetToken table for password reset functionality
-- Run: mysql ... < add_password_reset_token_table.sql
-- Or: python migrations/run_password_reset_token_migration.py (from ticketbookingapi, with venv activated)

CREATE TABLE IF NOT EXISTS `PasswordResetToken` (
    `token_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `used` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_token` (`token`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
