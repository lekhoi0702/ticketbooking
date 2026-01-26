-- Migration: Optimize Integer Types to UNSIGNED
-- Date: 2026-01-24
-- Purpose: Change integer types to UNSIGNED to prevent overflow and ensure non-negative values
-- UNSIGNED doubles the range: 0 to 4,294,967,295 (instead of -2,147,483,648 to 2,147,483,647)

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Event table: Capacity and sold tickets
-- ============================================
-- Check current max values before changing
-- Note: Verify no negative values exist before running

-- Event.total_capacity: int(11) → int UNSIGNED
ALTER TABLE `Event` 
    MODIFY COLUMN `total_capacity` int UNSIGNED NOT NULL;

-- Event.sold_tickets: int(11) → int UNSIGNED
ALTER TABLE `Event` 
    MODIFY COLUMN `sold_tickets` int UNSIGNED NULL DEFAULT 0;

-- ============================================
-- TicketType table: Quantity fields
-- ============================================
-- TicketType.quantity: int(11) → int UNSIGNED
ALTER TABLE `TicketType` 
    MODIFY COLUMN `quantity` int UNSIGNED NOT NULL;

-- TicketType.sold_quantity: int(11) → int UNSIGNED
ALTER TABLE `TicketType` 
    MODIFY COLUMN `sold_quantity` int UNSIGNED NULL DEFAULT 0;

-- TicketType.max_per_order: int(11) → smallint UNSIGNED (max 65535, sufficient for max_per_order)
ALTER TABLE `TicketType` 
    MODIFY COLUMN `max_per_order` smallint UNSIGNED NULL DEFAULT 10;

-- ============================================
-- Venue table: Capacity
-- ============================================
-- Venue.capacity: int(11) → int UNSIGNED
ALTER TABLE `Venue` 
    MODIFY COLUMN `capacity` int UNSIGNED NOT NULL;

-- ============================================
-- Discount table: Usage tracking
-- ============================================
-- Discount.usage_limit: int(11) → int UNSIGNED (if not NULL)
-- Note: Keep NULL for unlimited usage
ALTER TABLE `Discount` 
    MODIFY COLUMN `usage_limit` int UNSIGNED NULL DEFAULT NULL;

-- Discount.used_count: int(11) → int UNSIGNED
ALTER TABLE `Discount` 
    MODIFY COLUMN `used_count` int UNSIGNED NULL DEFAULT 0;

-- ============================================
-- Advertisement table: Display order
-- ============================================
-- Advertisement.display_order: int(11) → int UNSIGNED
ALTER TABLE `Advertisement` 
    MODIFY COLUMN `display_order` int UNSIGNED NULL DEFAULT 0;

-- ============================================
-- Banner table: Display order
-- ============================================
-- Banner.display_order: int(11) → int UNSIGNED
ALTER TABLE `Banner` 
    MODIFY COLUMN `display_order` int UNSIGNED NULL DEFAULT NULL;

-- ============================================
-- Seat table: Position coordinates
-- ============================================
-- Seat.x_pos: int(11) → int UNSIGNED (coordinates are non-negative)
ALTER TABLE `Seat` 
    MODIFY COLUMN `x_pos` int UNSIGNED NULL DEFAULT NULL;

-- Seat.y_pos: int(11) → int UNSIGNED (coordinates are non-negative)
ALTER TABLE `Seat` 
    MODIFY COLUMN `y_pos` int UNSIGNED NULL DEFAULT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification queries (optional - uncomment to check)
-- Verify no negative values exist
-- SELECT COUNT(*) as negative_capacity FROM `Event` WHERE `total_capacity` < 0;
-- SELECT COUNT(*) as negative_sold FROM `Event` WHERE `sold_tickets` < 0;
-- SELECT COUNT(*) as negative_quantity FROM `TicketType` WHERE `quantity` < 0 OR `sold_quantity` < 0;

-- Check new column types
-- SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND COLUMN_NAME IN ('total_capacity', 'sold_tickets', 'quantity', 'sold_quantity', 'capacity', 'usage_limit', 'used_count', 'max_per_order', 'display_order', 'x_pos', 'y_pos')
-- ORDER BY TABLE_NAME, COLUMN_NAME;
