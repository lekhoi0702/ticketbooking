-- Script: Add VIETQR to payment_method ENUM
-- Date: 2026-01-XX
-- Purpose: Add VIETQR payment method to Payment table

-- Check if VIETQR already exists in the ENUM
-- If not, add it to the payment_method ENUM

-- Method 1: Simple ALTER TABLE (may fail if enum values don't match exactly)
-- ALTER TABLE Payment MODIFY COLUMN payment_method ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'MOMO', 'VNPAY', 'PAYPAL', 'VIETQR', 'CASH') NOT NULL;

-- Method 2: Safe stored procedure approach
DELIMITER $$

DROP PROCEDURE IF EXISTS AddVietQRToPaymentMethodEnum$$

CREATE PROCEDURE AddVietQRToPaymentMethodEnum()
BEGIN
    DECLARE enum_exists INT DEFAULT 0;
    
    -- Check if VIETQR exists in the ENUM
    SELECT COUNT(*) INTO enum_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Payment'
      AND COLUMN_NAME = 'payment_method'
      AND FIND_IN_SET('VIETQR', REPLACE(REPLACE(COLUMN_TYPE, 'enum(', ''), ')', '')) > 0;
    
    -- If VIETQR doesn't exist, add it
    IF enum_exists = 0 THEN
        ALTER TABLE Payment 
        MODIFY COLUMN payment_method ENUM(
            'CREDIT_CARD', 
            'BANK_TRANSFER', 
            'E_WALLET', 
            'MOMO', 
            'VNPAY', 
            'PAYPAL', 
            'VIETQR', 
            'CASH'
        ) NOT NULL;
        
        SELECT 'VIETQR added to payment_method ENUM successfully' AS result;
    ELSE
        SELECT 'VIETQR already exists in payment_method ENUM' AS result;
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddVietQRToPaymentMethodEnum();

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS AddVietQRToPaymentMethodEnum;
