-- Migration: Drop AuditLog table
-- Description: Remove audit log feature and AuditLog table from database.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `AuditLog`;
SET FOREIGN_KEY_CHECKS = 1;
