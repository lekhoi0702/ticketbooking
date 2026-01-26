-- Migration: Add Check Constraints for Business Logic Validation
-- Date: 2026-01-24
-- Purpose: Add check constraints to enforce business rules at database level
-- Note: MySQL 8.0+ and TiDB support CHECK constraints

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Event table: Ensure sold_tickets does not exceed total_capacity
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Event' 
    AND CONSTRAINT_NAME = 'chk_event_capacity'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Event` ADD CONSTRAINT `chk_event_capacity` CHECK (`sold_tickets` <= `total_capacity`)',
    'SELECT "Constraint chk_event_capacity already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- TicketType table: Ensure sold_quantity does not exceed quantity
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TicketType' 
    AND CONSTRAINT_NAME = 'chk_ticket_type_quantity'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `TicketType` ADD CONSTRAINT `chk_ticket_type_quantity` CHECK (`sold_quantity` <= `quantity`)',
    'SELECT "Constraint chk_ticket_type_quantity already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Discount table: Ensure start_date is before end_date
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Discount' 
    AND CONSTRAINT_NAME = 'chk_discount_dates'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Discount` ADD CONSTRAINT `chk_discount_dates` CHECK (`start_date` < `end_date`)',
    'SELECT "Constraint chk_discount_dates already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Discount table: Ensure discount_value is positive
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Discount' 
    AND CONSTRAINT_NAME = 'chk_discount_value_positive'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Discount` ADD CONSTRAINT `chk_discount_value_positive` CHECK (`discount_value` > 0)',
    'SELECT "Constraint chk_discount_value_positive already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Order table: Ensure final_amount does not exceed total_amount
-- (final_amount can be less due to discounts, but should not be more)
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Order' 
    AND CONSTRAINT_NAME = 'chk_order_amount'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Order` ADD CONSTRAINT `chk_order_amount` CHECK (`final_amount` <= `total_amount`)',
    'SELECT "Constraint chk_order_amount already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Advertisement table: Ensure start_date is before end_date (if both are not NULL)
-- Note: This constraint only applies when both dates are provided
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Advertisement' 
    AND CONSTRAINT_NAME = 'chk_advertisement_dates'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Advertisement` ADD CONSTRAINT `chk_advertisement_dates` CHECK (`start_date` IS NULL OR `end_date` IS NULL OR `start_date` < `end_date`)',
    'SELECT "Constraint chk_advertisement_dates already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Event table: Ensure end_datetime is after start_datetime
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Event' 
    AND CONSTRAINT_NAME = 'chk_event_datetime'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Event` ADD CONSTRAINT `chk_event_datetime` CHECK (`end_datetime` > `start_datetime`)',
    'SELECT "Constraint chk_event_datetime already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- TicketType table: Ensure price is positive
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TicketType' 
    AND CONSTRAINT_NAME = 'chk_ticket_type_price'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `TicketType` ADD CONSTRAINT `chk_ticket_type_price` CHECK (`price` >= 0)',
    'SELECT "Constraint chk_ticket_type_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------
-- Order table: Ensure amounts are non-negative
-- ----------------------------
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Order' 
    AND CONSTRAINT_NAME = 'chk_order_amounts_positive'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `Order` ADD CONSTRAINT `chk_order_amounts_positive` CHECK (`total_amount` >= 0 AND `final_amount` >= 0)',
    'SELECT "Constraint chk_order_amounts_positive already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SELECT 
--     TABLE_NAME,
--     CONSTRAINT_NAME,
--     CONSTRAINT_TYPE
-- FROM 
--     INFORMATION_SCHEMA.TABLE_CONSTRAINTS
-- WHERE 
--     TABLE_SCHEMA = DATABASE()
--     AND CONSTRAINT_TYPE = 'CHECK'
-- ORDER BY 
--     TABLE_NAME, CONSTRAINT_NAME;
