-- Add order column for category display ordering
ALTER TABLE `EventCategory`
ADD COLUMN `display_order` INT NOT NULL DEFAULT 1;

-- Initialize existing rows with current ID-based order
UPDATE `EventCategory`
SET `display_order` = `category_id`
WHERE `display_order` < 1;

-- Optional but recommended for sorting performance
CREATE INDEX `idx_event_category_display_order`
ON `EventCategory` (`display_order`);
