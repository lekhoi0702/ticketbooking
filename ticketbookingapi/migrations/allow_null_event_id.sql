-- Migration: Allow NULL for event_id in EventDeletionRequest
-- Purpose: When an event is deleted, the deletion request should still exist
--          with event_id set to NULL for historical tracking purposes.
-- Date: 2026-01-16

USE ticketbookingdb;

-- Modify event_id column to allow NULL values
ALTER TABLE EventDeletionRequest 
MODIFY COLUMN event_id INT NULL;

-- Verify the change
DESCRIBE EventDeletionRequest;
