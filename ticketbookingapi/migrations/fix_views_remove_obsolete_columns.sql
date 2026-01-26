-- Migration: Fix Views - Remove References to Obsolete Columns
-- Date: 2026-01-24
-- Purpose: Remove references to deleted_at, sale_start_datetime, sale_end_datetime from Event table in views
-- These columns were removed from Event table as they are no longer needed

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Fix v_active_events view
-- Remove: sale_start_datetime, sale_end_datetime, deleted_at from SELECT
-- Remove: e.deleted_at IS NULL from WHERE clause
-- ----------------------------
DROP VIEW IF EXISTS `v_active_events`;

CREATE VIEW `v_active_events` AS 
SELECT 
    `e`.`event_id` AS `event_id`,
    `e`.`category_id` AS `category_id`,
    `e`.`venue_id` AS `venue_id`,
    `e`.`manager_id` AS `manager_id`,
    `e`.`event_name` AS `event_name`,
    `e`.`description` AS `description`,
    `e`.`start_datetime` AS `start_datetime`,
    `e`.`end_datetime` AS `end_datetime`,
    `e`.`banner_image_url` AS `banner_image_url`,
    `e`.`total_capacity` AS `total_capacity`,
    `e`.`sold_tickets` AS `sold_tickets`,
    `e`.`status` AS `status`,
    `e`.`is_featured` AS `is_featured`,
    `e`.`created_at` AS `created_at`,
    `e`.`updated_at` AS `updated_at`,
    `e`.`group_id` AS `group_id`,
    `c`.`category_name` AS `category_name`,
    `v`.`venue_name` AS `venue_name`,
    `v`.`city` AS `city`,
    `v`.`address` AS `address`,
    `u`.`full_name` AS `manager_name`
FROM 
    ((`Event` AS `e` 
    JOIN `EventCategory` AS `c` ON `e`.`category_id` = `c`.`category_id`) 
    JOIN `Venue` AS `v` ON `e`.`venue_id` = `v`.`venue_id`) 
    JOIN `User` AS `u` ON `e`.`manager_id` = `u`.`user_id`
WHERE 
    `e`.`status` IN ('PUBLISHED', 'ONGOING');

-- ----------------------------
-- Fix v_event_statistics view
-- Remove: e.deleted_at IS NULL from WHERE clause
-- ----------------------------
DROP VIEW IF EXISTS `v_event_statistics`;

CREATE VIEW `v_event_statistics` AS 
SELECT 
    `e`.`event_id` AS `event_id`,
    `e`.`event_name` AS `event_name`,
    `e`.`status` AS `status`,
    `e`.`total_capacity` AS `total_capacity`,
    `e`.`sold_tickets` AS `sold_tickets`,
    (`e`.`total_capacity` - `e`.`sold_tickets`) AS `available_tickets`,
    ROUND((`e`.`sold_tickets` / `e`.`total_capacity` * 100), 2) AS `occupancy_rate`,
    COUNT(DISTINCT `o`.`order_id`) AS `order_count`,
    COALESCE(SUM(`o`.`final_amount`), 0) AS `total_revenue`
FROM 
    ((`Event` AS `e` 
    LEFT JOIN `TicketType` AS `tt` ON `e`.`event_id` = `tt`.`event_id`) 
    LEFT JOIN `Ticket` AS `t` ON `tt`.`ticket_type_id` = `t`.`ticket_type_id`) 
    LEFT JOIN `Order` AS `o` ON `t`.`order_id` = `o`.`order_id` AND `o`.`order_status` = 'PAID'
GROUP BY 
    `e`.`event_id`;

-- ----------------------------
-- Fix v_published_events view
-- Remove: e.deleted_at IS NULL from WHERE clause
-- ----------------------------
DROP VIEW IF EXISTS `v_published_events`;

CREATE VIEW `v_published_events` AS 
SELECT 
    `e`.`event_id` AS `event_id`,
    `e`.`event_name` AS `event_name`,
    `e`.`description` AS `description`,
    `e`.`start_datetime` AS `start_datetime`,
    `e`.`end_datetime` AS `end_datetime`,
    `e`.`banner_image_url` AS `banner_image_url`,
    `e`.`total_capacity` AS `total_capacity`,
    `e`.`sold_tickets` AS `sold_tickets`,
    `e`.`is_featured` AS `is_featured`,
    `e`.`status` AS `status`,
    `c`.`category_name` AS `category_name`,
    `v`.`venue_name` AS `venue_name`,
    `v`.`city` AS `city`
FROM 
    (`Event` AS `e` 
    JOIN `EventCategory` AS `c` ON `e`.`category_id` = `c`.`category_id`) 
    JOIN `Venue` AS `v` ON `e`.`venue_id` = `v`.`venue_id`
WHERE 
    `e`.`status` = 'PUBLISHED';

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- SELECT * FROM v_active_events LIMIT 5;
-- SELECT * FROM v_event_statistics LIMIT 5;
-- SELECT * FROM v_published_events LIMIT 5;
