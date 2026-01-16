-- Script: Clean up tickets for cancelled orders
-- Date: 2026-01-16
-- Purpose: Delete tickets and release seats for orders with CANCELLED status

-- First, release all seats from cancelled orders
UPDATE `Seat` s
INNER JOIN `Ticket` t ON s.seat_id = t.seat_id
INNER JOIN `Order` o ON t.order_id = o.order_id
SET s.status = 'AVAILABLE'
WHERE o.order_status = 'CANCELLED' AND s.status = 'BOOKED';

-- Update sold_quantity for ticket types
UPDATE `TicketType` tt
SET tt.sold_quantity = (
    SELECT COUNT(*)
    FROM `Ticket` t
    INNER JOIN `Order` o ON t.order_id = o.order_id
    WHERE t.ticket_type_id = tt.ticket_type_id
    AND o.order_status IN ('PAID', 'PENDING', 'COMPLETED')
);

-- Update sold_tickets for events
UPDATE `Event` e
SET e.sold_tickets = (
    SELECT COUNT(*)
    FROM `Ticket` t
    INNER JOIN `TicketType` tt ON t.ticket_type_id = tt.ticket_type_id
    INNER JOIN `Order` o ON t.order_id = o.order_id
    WHERE tt.event_id = e.event_id
    AND o.order_status IN ('PAID', 'PENDING', 'COMPLETED')
);

-- Finally, DELETE all tickets from cancelled orders
DELETE t FROM `Ticket` t
INNER JOIN `Order` o ON t.order_id = o.order_id
WHERE o.order_status = 'CANCELLED';

-- Show results
SELECT 
    'Cleanup completed' as status,
    (SELECT COUNT(*) FROM `Order` WHERE order_status = 'CANCELLED') as cancelled_orders,
    (SELECT COUNT(*) FROM `Ticket` t INNER JOIN `Order` o ON t.order_id = o.order_id WHERE o.order_status = 'CANCELLED') as remaining_tickets_should_be_zero;
