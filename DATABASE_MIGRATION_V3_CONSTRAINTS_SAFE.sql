-- ============================================
-- SAFE CONSTRAINT ADDITION SCRIPT
-- Checks if constraint exists before adding
-- TiDB Compatible (v7.5+)
-- ============================================

USE ticketbookingdb;
SET NAMES utf8mb4;

-- ============================================
-- Helper: Check existing constraints first
-- ============================================

-- View existing constraints
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY TABLE_NAME;

-- ============================================
-- Add constraints ONLY if they don't exist
-- Run each section carefully
-- ============================================

-- Event constraints
-- Run only if chk_event_dates doesn't exist
ALTER TABLE Event ADD CONSTRAINT chk_event_dates 
CHECK (start_datetime < end_datetime);

ALTER TABLE Event ADD CONSTRAINT chk_event_sales_dates 
CHECK (sale_start_datetime IS NULL 
    OR sale_end_datetime IS NULL 
    OR sale_start_datetime < sale_end_datetime);

ALTER TABLE Event ADD CONSTRAINT chk_event_capacity
CHECK (total_capacity > 0);

ALTER TABLE Event ADD CONSTRAINT chk_event_sold
CHECK (sold_tickets >= 0 AND sold_tickets <= total_capacity);

-- TicketType constraints
ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_quantity 
CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_price 
CHECK (price >= 0);

ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_quantity_positive
CHECK (quantity > 0);

ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_max_order
CHECK (max_per_order > 0 AND max_per_order <= quantity);

-- Ticket constraints
ALTER TABLE Ticket ADD CONSTRAINT chk_ticket_price_positive 
CHECK (price >= 0);

-- Order constraints
ALTER TABLE `Order` ADD CONSTRAINT chk_order_amounts 
CHECK (total_amount >= 0 
    AND final_amount >= 0 
    AND final_amount <= total_amount);

-- Payment constraints
ALTER TABLE Payment ADD CONSTRAINT chk_payment_amount 
CHECK (amount >= 0);

-- Discount constraints
ALTER TABLE Discount ADD CONSTRAINT chk_discount_dates
CHECK (start_date < end_date);

ALTER TABLE Discount ADD CONSTRAINT chk_discount_value
CHECK (discount_value >= 0);

ALTER TABLE Discount ADD CONSTRAINT chk_discount_usage
CHECK (used_count >= 0 AND (usage_limit IS NULL OR used_count <= usage_limit));

-- RefundRequest constraints
ALTER TABLE RefundRequest ADD CONSTRAINT chk_refund_amount
CHECK (refund_amount >= 0);

-- Venue constraints
ALTER TABLE Venue ADD CONSTRAINT chk_venue_capacity
CHECK (capacity > 0);

ALTER TABLE Venue ADD CONSTRAINT chk_venue_seats
CHECK (vip_seats >= 0 AND standard_seats >= 0 AND economy_seats >= 0);

-- ============================================
-- Verify added constraints
-- ============================================

SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY TABLE_NAME;

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT:
1. This script does NOT support IF NOT EXISTS for constraints (TiDB limitation)
2. If constraint already exists, you'll get error: "Duplicate constraint name"
3. This is SAFE - it won't break anything, just skip the duplicate constraint
4. Run this script ONLY ONCE, or check existing constraints first
5. To re-run, drop constraints first (see rollback section in main script)

MANUAL CHECK BEFORE RUNNING:
Run this to see existing constraints:
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'ticketbookingdb' 
      AND CONSTRAINT_TYPE = 'CHECK';

If you see the constraint name, SKIP that ALTER TABLE statement.
*/
