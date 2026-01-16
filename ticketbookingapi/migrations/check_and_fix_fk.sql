-- Quick fix: Check and update EventDeletionRequest foreign key
-- Run this in MySQL Workbench or command line

USE ticketbookingdb;

-- Check current foreign keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'EventDeletionRequest'
AND CONSTRAINT_SCHEMA = 'ticketbookingdb';

-- If you see a foreign key on event_id, run these commands:

-- Step 1: Drop the old foreign key (replace 'constraint_name' with actual name from above)
-- ALTER TABLE EventDeletionRequest DROP FOREIGN KEY EventDeletionRequest_ibfk_1;

-- Step 2: Make event_id nullable
-- ALTER TABLE EventDeletionRequest MODIFY COLUMN event_id INT NULL;

-- Step 3: Add new foreign key with SET NULL
-- ALTER TABLE EventDeletionRequest 
-- ADD CONSTRAINT fk_deletion_request_event 
-- FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE SET NULL;
