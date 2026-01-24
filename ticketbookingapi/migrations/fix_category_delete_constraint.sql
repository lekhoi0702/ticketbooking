-- Migration: Fix EventCategory deletion constraint
-- Description: Allow deletion of categories even if events reference them (set NULL)
-- This allows deleting categories that have no active events

-- First, check current foreign key constraint
-- SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE REFERENCED_TABLE_NAME = 'EventCategory' AND TABLE_NAME = 'Event';

-- Step 1: Make Event.category_id nullable (if not already)
ALTER TABLE `Event` 
MODIFY COLUMN `category_id` INT NULL;

-- Step 2: Drop existing foreign key constraint (adjust constraint name if different)
-- Find constraint name first:
-- SHOW CREATE TABLE Event;

-- Then drop it (replace 'Event_ibfk_1' with actual constraint name):
-- ALTER TABLE `Event` DROP FOREIGN KEY `Event_ibfk_1`;

-- Step 3: Add new foreign key with ON DELETE SET NULL
ALTER TABLE `Event`
ADD CONSTRAINT `fk_event_category`
FOREIGN KEY (`category_id`) 
REFERENCES `EventCategory`(`category_id`)
ON DELETE SET NULL
ON UPDATE RESTRICT;
