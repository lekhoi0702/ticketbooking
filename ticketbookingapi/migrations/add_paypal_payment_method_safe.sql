-- ============================================
-- Script SQL AN TOÀN để thêm PAYPAL vào enum payment_method
-- Script này tự động phát hiện enum hiện tại và thêm PAYPAL
-- ============================================

-- Bước 1: Kiểm tra enum hiện tại
-- Chạy lệnh này để xem enum hiện tại:
-- SHOW COLUMNS FROM Payment LIKE 'payment_method';

-- Bước 2: Tạo stored procedure để thêm PAYPAL an toàn
DELIMITER $$

DROP PROCEDURE IF EXISTS AddPayPalToPaymentMethodEnum$$

CREATE PROCEDURE AddPayPalToPaymentMethodEnum()
BEGIN
    DECLARE enum_exists INT DEFAULT 0;
    DECLARE current_enum TEXT;
    
    -- Kiểm tra xem PAYPAL đã có trong enum chưa
    SELECT COUNT(*) INTO enum_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Payment'
      AND COLUMN_NAME = 'payment_method'
      AND COLUMN_TYPE LIKE '%PAYPAL%';
    
    IF enum_exists = 0 THEN
        -- Lấy enum hiện tại
        SELECT COLUMN_TYPE INTO current_enum
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Payment'
          AND COLUMN_NAME = 'payment_method';
        
        -- Thêm PAYPAL vào enum
        -- Kiểm tra các giá trị hiện có và thêm PAYPAL vào đúng vị trí
        SET @sql = CONCAT(
            'ALTER TABLE Payment MODIFY COLUMN payment_method ENUM(',
            CASE 
                WHEN current_enum LIKE '%CASH%' THEN 
                    '''CREDIT_CARD'',''BANK_TRANSFER'',''E_WALLET'',''MOMO'',''VNPAY'',''PAYPAL'',''CASH'''
                ELSE 
                    '''CREDIT_CARD'',''BANK_TRANSFER'',''E_WALLET'',''MOMO'',''VNPAY'',''PAYPAL'',''CASH'''
            END,
            ') NOT NULL'
        );
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT 'PAYPAL đã được thêm vào enum payment_method thành công!' AS Result;
    ELSE
        SELECT 'PAYPAL đã tồn tại trong enum payment_method. Không cần cập nhật.' AS Result;
    END IF;
END$$

DELIMITER ;

-- Bước 3: Chạy stored procedure
CALL AddPayPalToPaymentMethodEnum();

-- Bước 4: Xóa stored procedure sau khi sử dụng (tùy chọn)
DROP PROCEDURE IF EXISTS AddPayPalToPaymentMethodEnum;

-- Bước 5: Kiểm tra kết quả
SHOW COLUMNS FROM Payment LIKE 'payment_method';
