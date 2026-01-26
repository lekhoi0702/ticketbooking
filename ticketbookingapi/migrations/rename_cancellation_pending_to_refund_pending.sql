-- Migration: Rename CANCELLATION_PENDING to REFUND_PENDING
-- Date: 2026-01-24
-- Purpose: Rename order status from CANCELLATION_PENDING to REFUND_PENDING for clarity

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Update all existing records with CANCELLATION_PENDING status
UPDATE `Order` 
SET `order_status` = 'REFUND_PENDING' 
WHERE `order_status` = 'CANCELLATION_PENDING';

-- Step 2: Modify the ENUM to replace CANCELLATION_PENDING with REFUND_PENDING
ALTER TABLE `Order` 
MODIFY COLUMN `order_status` 
ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'COMPLETED', 'REFUND_PENDING') 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci 
NULL DEFAULT 'PENDING';

SET FOREIGN_KEY_CHECKS = 1;

-- Verification query (optional - uncomment to check)
-- SELECT COUNT(*) as refund_pending_count FROM `Order` WHERE `order_status` = 'REFUND_PENDING';
-- SELECT COUNT(*) as cancellation_pending_count FROM `Order` WHERE `order_status` = 'CANCELLATION_PENDING';
