-- Migration: Update EventDeletionRequest foreign key to SET NULL
-- Date: 2026-01-16
-- Purpose: Preserve deletion requests after event is deleted for audit trail

-- Drop existing foreign key
ALTER TABLE `EventDeletionRequest` 
DROP FOREIGN KEY `EventDeletionRequest_ibfk_1`;

-- Make event_id nullable
ALTER TABLE `EventDeletionRequest` 
MODIFY COLUMN `event_id` INT NULL;

-- Add new foreign key with ON DELETE SET NULL
ALTER TABLE `EventDeletionRequest` 
ADD CONSTRAINT `fk_deletion_request_event` 
FOREIGN KEY (`event_id`) 
REFERENCES `Event`(`event_id`) 
ON DELETE SET NULL;
