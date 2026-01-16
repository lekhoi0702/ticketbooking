-- Migration: Add CANCELLATION_PENDING to Order status enum
-- Date: 2026-01-16

-- Modify the order_status ENUM to include CANCELLATION_PENDING
ALTER TABLE `Order` 
MODIFY COLUMN `order_status` 
ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'COMPLETED', 'CANCELLATION_PENDING') 
DEFAULT 'PENDING';

-- Add index if not exists
CREATE INDEX IF NOT EXISTS idx_order_status ON `Order`(order_status);
