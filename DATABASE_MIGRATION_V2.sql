-- ============================================
-- TICKETBOOKING DATABASE OPTIMIZATION SCRIPT
-- Version: 2.0
-- Date: 2026-01-20
-- IMPORTANT: BACKUP DATABASE BEFORE RUNNING
-- ============================================

USE ticketbookingdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PART 1: ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Event table optimizations
ALTER TABLE Event 
ADD INDEX idx_event_name (event_name(100)) 
COMMENT 'For search by name';

ALTER TABLE Event 
ADD INDEX idx_status_start (status, start_datetime) 
COMMENT 'For filtering published/upcoming events';

ALTER TABLE Event 
ADD INDEX idx_published_featured (status, is_featured, start_datetime) 
COMMENT 'Covering index for homepage';

-- Order table optimizations
ALTER TABLE `Order` 
ADD INDEX idx_customer_email (customer_email) 
COMMENT 'For customer order lookup';

ALTER TABLE `Order` 
ADD INDEX idx_user_status_date (user_id, order_status, created_at DESC) 
COMMENT 'For user order history with sorting';

-- Ticket table optimizations
ALTER TABLE Ticket 
ADD INDEX idx_holder_email (holder_email) 
COMMENT 'For ticket holder lookup';

ALTER TABLE Ticket 
ADD INDEX idx_ticket_type_status (ticket_type_id, ticket_status) 
COMMENT 'For event ticket statistics';

-- Payment table optimizations
ALTER TABLE Payment 
ADD INDEX idx_transaction (transaction_id) 
COMMENT 'For payment reconciliation';

ALTER TABLE Payment 
ADD INDEX idx_payment_status_date (payment_status, paid_at) 
COMMENT 'For payment reports';

-- ============================================
-- PART 2: ADD SOFT DELETE SUPPORT
-- ============================================

-- Add deleted_at columns to critical tables
ALTER TABLE Event 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Soft delete timestamp';

ALTER TABLE `Order` 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Soft delete timestamp';

ALTER TABLE Ticket 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Soft delete timestamp';

-- Add indexes for soft delete queries
ALTER TABLE Event ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE `Order` ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE Ticket ADD INDEX idx_deleted_at (deleted_at);

-- ============================================
-- PART 3: ADD BUSINESS RULE CONSTRAINTS
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
    FOREIGN KEY (changed_by) REFERENCES `User`(user_id) ON DELETE SET NULL
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
-- PART 6: CREATE HELPER VIEWS
-- ============================================

-- View for active events with all details
CREATE OR REPLACE VIEW v_active_events AS
SELECT 
    e.*,
    c.category_name,
    v.venue_name,
    v.city,
    v.address,
    u.full_name as manager_name
FROM Event e
JOIN EventCategory c ON e.category_id = c.category_id
JOIN Venue v ON e.venue_id = v.venue_id
JOIN `User` u ON e.manager_id = u.user_id
WHERE e.deleted_at IS NULL
  AND e.status IN ('PUBLISHED', 'ONGOING');

-- View for order summary with aggregations
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
    o.order_id,
    o.order_code,
    o.user_id,
    o.order_status,
    o.total_amount,
    o.final_amount,
    o.created_at,
    o.paid_at,
    COUNT(t.ticket_id) as ticket_count,
    p.payment_status,
    p.payment_method,
    p.transaction_id
FROM `Order` o
LEFT JOIN Ticket t ON o.order_id = t.order_id
LEFT JOIN Payment p ON o.order_id = p.order_id
WHERE o.deleted_at IS NULL
GROUP BY o.order_id, p.payment_id;

-- View for event statistics
CREATE OR REPLACE VIEW v_event_statistics AS
SELECT 
    e.event_id,
    e.event_name,
    e.status,
    e.total_capacity,
    e.sold_tickets,
    (e.total_capacity - e.sold_tickets) as available_tickets,
    ROUND((e.sold_tickets / e.total_capacity * 100), 2) as occupancy_rate,
    COUNT(DISTINCT o.order_id) as order_count,
    COALESCE(SUM(o.final_amount), 0) as total_revenue
FROM Event e
LEFT JOIN TicketType tt ON e.event_id = tt.event_id
LEFT JOIN Ticket t ON tt.ticket_type_id = t.ticket_type_id
LEFT JOIN `Order` o ON t.order_id = o.order_id AND o.order_status = 'PAID'
WHERE e.deleted_at IS NULL
GROUP BY e.event_id;

-- ============================================
-- PART 7: CREATE STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure to safely soft delete event
DROP PROCEDURE IF EXISTS sp_soft_delete_event$$
CREATE PROCEDURE sp_soft_delete_event(
    IN p_event_id INT,
    IN p_deleted_by INT
)
BEGIN
    DECLARE v_now TIMESTAMP;
    DECLARE v_event_name VARCHAR(500);
    
    SET v_now = CURRENT_TIMESTAMP;
    
    -- Get event name for audit
    SELECT event_name INTO v_event_name
    FROM Event
    WHERE event_id = p_event_id;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Soft delete event
    UPDATE Event 
    SET deleted_at = v_now 
    WHERE event_id = p_event_id;
    
    -- Log to audit
    INSERT INTO AuditLog (
        table_name, 
        record_id, 
        action, 
        changed_by,
        new_values
    )
    VALUES (
        'Event', 
        p_event_id, 
        'DELETE', 
        p_deleted_by,
        JSON_OBJECT('event_name', v_event_name, 'deleted_at', v_now)
    );
    
    COMMIT;
END$$

-- Procedure to calculate event revenue
DROP PROCEDURE IF EXISTS sp_calculate_event_revenue$$
CREATE PROCEDURE sp_calculate_event_revenue(
    IN p_event_id INT,
    OUT p_total_revenue DECIMAL(15,2),
    OUT p_paid_orders INT,
    OUT p_ticket_count INT
)
BEGIN
    SELECT 
        COALESCE(SUM(o.final_amount), 0),
        COUNT(DISTINCT o.order_id),
        COUNT(t.ticket_id)
    INTO p_total_revenue, p_paid_orders, p_ticket_count
    FROM Ticket t
    JOIN `Order` o ON t.order_id = o.order_id
    JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
    WHERE tt.event_id = p_event_id
      AND o.order_status = 'PAID'
      AND t.ticket_status != 'CANCELLED'
      AND o.deleted_at IS NULL;
END$$

-- Procedure to get user order summary
DROP PROCEDURE IF EXISTS sp_get_user_order_summary$$
CREATE PROCEDURE sp_get_user_order_summary(
    IN p_user_id INT,
    OUT p_total_orders INT,
    OUT p_total_spent DECIMAL(15,2),
    OUT p_total_tickets INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT o.order_id),
        COALESCE(SUM(o.final_amount), 0),
        COUNT(t.ticket_id)
    INTO p_total_orders, p_total_spent, p_total_tickets
    FROM `Order` o
    LEFT JOIN Ticket t ON o.order_id = t.order_id
    WHERE o.user_id = p_user_id
      AND o.order_status = 'PAID'
      AND o.deleted_at IS NULL;
END$$

DELIMITER ;

-- ============================================
-- PART 8: VERIFICATION QUERIES
-- ============================================

-- Show all indexes on main tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND TABLE_NAME IN ('Event', 'Order', 'Ticket', 'Payment', 'TicketType')
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE
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
SHOW FULL TABLES IN ticketbookingdb WHERE TABLE_TYPE = 'VIEW';

-- Verify procedures created
SELECT ROUTINE_NAME, ROUTINE_TYPE
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'ticketbookingdb'
  AND ROUTINE_TYPE = 'PROCEDURE';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- END OF MIGRATION SCRIPT
-- ============================================

-- ROLLBACK INSTRUCTIONS (if needed):
-- 1. Drop added indexes:
--    DROP INDEX idx_event_name ON Event;
--    (repeat for all added indexes)
--
-- 2. Drop added columns:
--    ALTER TABLE Event DROP COLUMN deleted_at;
--    (repeat for all tables)
--
-- 3. Drop constraints:
--    ALTER TABLE Event DROP CONSTRAINT chk_event_dates;
--    (repeat for all constraints)
--
-- 4. Drop audit table:
--    DROP TABLE AuditLog;
--
-- 5. Drop views:
--    DROP VIEW v_active_events;
--    DROP VIEW v_order_summary;
--    DROP VIEW v_event_statistics;
--
-- 6. Drop procedures:
--    DROP PROCEDURE sp_soft_delete_event;
--    DROP PROCEDURE sp_calculate_event_revenue;
--    DROP PROCEDURE sp_get_user_order_summary;
