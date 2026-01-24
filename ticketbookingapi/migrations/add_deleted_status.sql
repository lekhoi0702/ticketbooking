-- Migration: Add 'DELETED' status to Event table
-- This allows soft delete functionality where events are hidden from organizers but visible to admin

-- Modify the status ENUM to include DELETED
ALTER TABLE `Event` 
MODIFY COLUMN `status` 
ENUM('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING_DELETION', 'DELETED') 
DEFAULT 'PENDING_APPROVAL';

-- Verify the change
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Event' AND COLUMN_NAME = 'status';
