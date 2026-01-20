-- ============================================
-- TICKETBOOKING DATABASE OPTIMIZATION SCRIPT
-- Version: 2.0 - TiDB Compatible
-- Date: 2026-01-20
-- IMPORTANT: BACKUP DATABASE BEFORE RUNNING
-- 
-- TiDB Limitations:
-- - No Stored Procedures
-- - No Triggers
-- - Limited VIEW support
-- - Only essential optimizations
-- ============================================

USE ticketbookingdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PART 1: ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Event table optimizations
ALTER TABLE Event 
ADD INDEX idx_event_name (event_name(100));

ALTER TABLE Event 
ADD INDEX idx_status_start (status, start_datetime);

ALTER TABLE Event 
ADD INDEX idx_published_featured (status, is_featured, start_datetime);

-- Order table optimizations
ALTER TABLE `Order` 
ADD INDEX idx_customer_email (customer_email);

ALTER TABLE `Order` 
ADD INDEX idx_user_status_date (user_id, order_status, created_at DESC);

-- Ticket table optimizations
ALTER TABLE Ticket 
ADD INDEX idx_holder_email (holder_email);

ALTER TABLE Ticket 
ADD INDEX idx_ticket_type_status (ticket_type_id, ticket_status);

-- Payment table optimizations
ALTER TABLE Payment 
ADD INDEX idx_transaction (transaction_id);

ALTER TABLE Payment 
ADD INDEX idx_payment_status_date (payment_status, paid_at);

-- Venue table optimization
ALTER TABLE Venue
ADD INDEX idx_city_active (city, is_active);

-- TicketType table optimization
ALTER TABLE TicketType
ADD INDEX idx_event_active (event_id, is_active);

-- ============================================
-- PART 2: ADD SOFT DELETE SUPPORT
-- ============================================

-- Check if columns already exist before adding
-- Add deleted_at columns to critical tables
ALTER TABLE Event 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE `Order` 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE Ticket 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Add indexes for soft delete queries
ALTER TABLE Event ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);
ALTER TABLE `Order` ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

-- ============================================
-- PART 3: ADD BUSINESS RULE CONSTRAINTS
-- TiDB supports CHECK constraints from v5.0+
-- ============================================

-- Event date validation
ALTER TABLE Event 
ADD CONSTRAINT chk_event_dates 
CHECK (start_datetime < end_datetime);

ALTER TABLE Event 
ADD CONSTRAINT chk_event_sales_dates 
CHECK (sale_start_datetime IS NULL 
    OR sale_end_datetime IS NULL 
    OR sale_start_datetime < sale_end_datetime);

-- Ticket quantity validation
ALTER TABLE TicketType 
ADD CONSTRAINT chk_ticket_quantity 
CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

-- Price validation
ALTER TABLE TicketType 
ADD CONSTRAINT chk_ticket_price 
CHECK (price >= 0);

ALTER TABLE Ticket 
ADD CONSTRAINT chk_ticket_price_positive 
CHECK (price >= 0);

-- Order amount validation
ALTER TABLE `Order` 
ADD CONSTRAINT chk_order_amounts 
CHECK (total_amount >= 0 
    AND final_amount >= 0 
    AND final_amount <= total_amount);

ALTER TABLE Payment 
ADD CONSTRAINT chk_payment_amount 
CHECK (amount >= 0);

-- Discount validation
ALTER TABLE Discount
ADD CONSTRAINT chk_discount_dates
CHECK (start_date < end_date);

ALTER TABLE Discount
ADD CONSTRAINT chk_discount_value
CHECK (discount_value >= 0);

-- ============================================
-- PART 4: CREATE AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS AuditLog (
    audit_id BIGINT NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL COMMENT 'Audited table name',
    record_id INT NOT NULL COMMENT 'ID of affected record',
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON COMMENT 'Old values before change',
    new_values JSON COMMENT 'New values after change',
    changed_by INT COMMENT 'User ID who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) COMMENT 'IP address of requester',
    user_agent TEXT COMMENT 'Browser user agent',
    PRIMARY KEY (audit_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by),
    CONSTRAINT fk_audit_changed_by 
        FOREIGN KEY (changed_by) 
        REFERENCES `User`(user_id) 
        ON DELETE SET NULL
) ENGINE=InnoDB 
  CHARACTER SET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Audit trail for critical operations';

-- ============================================
-- PART 5: UPDATE TABLE STATISTICS
-- ============================================

ANALYZE TABLE Event;
ANALYZE TABLE EventCategory;
ANALYZE TABLE Venue;
ANALYZE TABLE `Order`;
ANALYZE TABLE Ticket;
ANALYZE TABLE TicketType;
ANALYZE TABLE Payment;
ANALYZE TABLE `User`;

-- ============================================
-- PART 6: CREATE HELPER VIEWS (SIMPLIFIED)
-- TiDB has limited VIEW support, keep simple
-- ============================================

-- View for active published events
CREATE OR REPLACE VIEW v_published_events AS
SELECT 
    e.event_id,
    e.event_name,
    e.description,
    e.start_datetime,
    e.end_datetime,
    e.banner_image_url,
    e.total_capacity,
    e.sold_tickets,
    e.is_featured,
    e.status,
    c.category_name,
    v.venue_name,
    v.city
FROM Event e
JOIN EventCategory c ON e.category_id = c.category_id
JOIN Venue v ON e.venue_id = v.venue_id
WHERE e.deleted_at IS NULL
  AND e.status = 'PUBLISHED';

-- View for order summary (simplified)
CREATE OR REPLACE VIEW v_order_list AS
SELECT 
    o.order_id,
    o.order_code,
    o.user_id,
    o.order_status,
    o.total_amount,
    o.final_amount,
    o.created_at,
    o.paid_at,
    u.full_name as customer_name,
    u.email as customer_email
FROM `Order` o
JOIN `User` u ON o.user_id = u.user_id
WHERE o.deleted_at IS NULL;

-- ============================================
-- PART 7: VERIFICATION QUERIES
-- ============================================

-- Show all indexes on main tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND TABLE_NAME IN ('Event', 'Order', 'Ticket', 'Payment', 'TicketType', 'Venue')
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

-- Show all constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND TABLE_NAME IN ('Event', 'Order', 'Ticket', 'Payment', 'TicketType')
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

-- Verify views created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND TABLE_TYPE = 'VIEW'
ORDER BY TABLE_NAME;

-- Check new columns added
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND COLUMN_NAME = 'deleted_at'
ORDER BY TABLE_NAME;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- POST-MIGRATION VALIDATION QUERIES
-- ============================================

-- 1. Count records in each main table
SELECT 
    'Event' as table_name, COUNT(*) as record_count FROM Event
UNION ALL
SELECT 'Order', COUNT(*) FROM `Order`
UNION ALL
SELECT 'Ticket', COUNT(*) FROM Ticket
UNION ALL
SELECT 'Payment', COUNT(*) FROM Payment
UNION ALL
SELECT 'User', COUNT(*) FROM `User`;

-- 2. Check for any NULL values in critical fields
SELECT 
    'Event with NULL dates' as issue,
    COUNT(*) as count
FROM Event
WHERE start_datetime IS NULL OR end_datetime IS NULL
UNION ALL
SELECT 
    'Order with NULL amounts',
    COUNT(*)
FROM `Order`
WHERE total_amount IS NULL OR final_amount IS NULL
UNION ALL
SELECT
    'Ticket with NULL price',
    COUNT(*)
FROM Ticket
WHERE price IS NULL;

-- 3. Verify indexes are created
SELECT 
    COUNT(*) as total_indexes
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND INDEX_NAME LIKE 'idx_%';

-- ============================================
-- PERFORMANCE TEST QUERIES
-- Run these to verify optimization works
-- ============================================

-- Test 1: Event search by name (should use idx_event_name)
EXPLAIN SELECT * FROM Event 
WHERE event_name LIKE '%concert%' 
  AND status = 'PUBLISHED'
LIMIT 10;

-- Test 2: User orders (should use idx_user_status_date)
EXPLAIN SELECT * FROM `Order` 
WHERE user_id = 1 
  AND order_status = 'PAID'
ORDER BY created_at DESC;

-- Test 3: Published events (should use idx_published_featured)
EXPLAIN SELECT * FROM Event 
WHERE status = 'PUBLISHED' 
  AND is_featured = 1
  AND start_datetime > NOW()
ORDER BY start_datetime;

-- Test 4: Payment by transaction (should use idx_transaction)
EXPLAIN SELECT * FROM Payment 
WHERE transaction_id = 'TXN123456';

-- ============================================
-- END OF MIGRATION SCRIPT
-- ============================================

-- ROLLBACK INSTRUCTIONS (if needed):
-- 
-- 1. Drop added indexes:
DROP INDEX idx_event_name ON Event;
DROP INDEX idx_status_start ON Event;
DROP INDEX idx_published_featured ON Event;
DROP INDEX idx_customer_email ON `Order`;
DROP INDEX idx_user_status_date ON `Order`;
DROP INDEX idx_holder_email ON Ticket;
DROP INDEX idx_ticket_type_status ON Ticket;
DROP INDEX idx_transaction ON Payment;
DROP INDEX idx_payment_status_date ON Payment;
DROP INDEX idx_city_active ON Venue;
DROP INDEX idx_event_active ON TicketType;
--
-- 2. Drop added columns:
ALTER TABLE Event DROP COLUMN deleted_at;
ALTER TABLE `Order` DROP COLUMN deleted_at;
ALTER TABLE Ticket DROP COLUMN deleted_at;
--
-- 3. Drop constraints (if they cause issues):
ALTER TABLE Event DROP CONSTRAINT chk_event_dates;
ALTER TABLE Event DROP CONSTRAINT chk_event_sales_dates;
ALTER TABLE TicketType DROP CONSTRAINT chk_ticket_quantity;
ALTER TABLE TicketType DROP CONSTRAINT chk_ticket_price;
ALTER TABLE Ticket DROP CONSTRAINT chk_ticket_price_positive;
ALTER TABLE `Order` DROP CONSTRAINT chk_order_amounts;
ALTER TABLE Payment DROP CONSTRAINT chk_payment_amount;
ALTER TABLE Discount DROP CONSTRAINT chk_discount_dates;
ALTER TABLE Discount DROP CONSTRAINT chk_discount_value;
--
-- 4. Drop audit table:
DROP TABLE IF EXISTS AuditLog;
--
-- 5. Drop views:
DROP VIEW IF EXISTS v_published_events;
DROP VIEW IF EXISTS v_order_list;

-- ============================================
-- NOTES FOR TiDB USERS
-- ============================================

-- 1. STORED PROCEDURES NOT SUPPORTED
--    Instead, implement business logic in application layer:
--    - Soft delete event -> Implement in Python service
--    - Calculate revenue -> Implement in Python service
--    - Order summary -> Use application queries

-- 2. TRIGGERS NOT SUPPORTED  
--    Instead:
--    - Update sold_tickets counter in application code
--    - Validate ticket status transitions in service layer

-- 3. LIMITATIONS
--    - Some MySQL features may not work
--    - Test thoroughly in staging environment
--    - Monitor performance after migration

-- 4. ALTERNATIVES TO STORED PROCEDURES
--    Create Python utility functions:

/*
# Python equivalent of stored procedures

# app/utils/database_helpers.py

def soft_delete_event(event_id: int, deleted_by: int):
    """Soft delete an event and log to audit"""
    event = Event.query.get(event_id)
    if event:
        event.deleted_at = datetime.utcnow()
        
        # Log to audit
        audit = AuditLog(
            table_name='Event',
            record_id=event_id,
            action='DELETE',
            changed_by=deleted_by,
            new_values={'event_name': event.event_name}
        )
        db.session.add(audit)
        db.session.commit()

def calculate_event_revenue(event_id: int):
    """Calculate total revenue for an event"""
    result = db.session.query(
        func.sum(Order.final_amount),
        func.count(Order.order_id)
    ).join(Ticket).join(TicketType).filter(
        TicketType.event_id == event_id,
        Order.order_status == 'PAID'
    ).first()
    
    return {
        'total_revenue': float(result[0] or 0),
        'order_count': int(result[1] or 0)
    }
*/

-- ============================================
-- SUCCESS CONFIRMATION
-- ============================================
SELECT 
    'Migration completed successfully!' as status,
    NOW() as completed_at;
