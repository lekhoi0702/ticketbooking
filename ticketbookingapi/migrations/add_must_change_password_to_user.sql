-- Add must_change_password to User (set when admin resets password; cleared when user changes password)
-- Run: mysql ... < add_must_change_password_to_user.sql
-- Or: python migrations/run_must_change_password_migration.py (from ticketbookingapi, with venv activated)
ALTER TABLE `User` ADD COLUMN `must_change_password` TINYINT(1) NOT NULL DEFAULT 0;
