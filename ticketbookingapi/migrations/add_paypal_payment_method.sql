-- ============================================
-- Script để thêm PAYPAL vào enum payment_method
-- ============================================
-- Mô tả: Thêm giá trị 'PAYPAL' vào enum payment_method của bảng Payment
-- Ngày tạo: 2024
-- ============================================

-- Kiểm tra và cập nhật enum payment_method để bao gồm PAYPAL
-- Lưu ý: Script này sẽ giữ nguyên tất cả các giá trị enum hiện có và thêm PAYPAL vào cuối

-- Bước 1: Kiểm tra cấu trúc hiện tại của cột payment_method
-- (Chạy lệnh này để xem enum hiện tại: SHOW COLUMNS FROM Payment LIKE 'payment_method';)

-- Bước 2: Cập nhật enum để bao gồm PAYPAL
-- Script này sẽ thêm PAYPAL vào danh sách enum hiện có
-- Nếu PAYPAL đã tồn tại, script sẽ không gây lỗi (MySQL sẽ bỏ qua giá trị trùng lặp)

ALTER TABLE Payment 
MODIFY COLUMN payment_method ENUM(
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'E_WALLET',
    'MOMO',
    'VNPAY',
    'PAYPAL',
    'CASH'
) NOT NULL;

-- ============================================
-- Kiểm tra kết quả:
-- ============================================
-- Chạy lệnh sau để xác nhận PAYPAL đã được thêm vào:
-- SHOW COLUMNS FROM Payment LIKE 'payment_method';

-- ============================================
-- Lưu ý:
-- ============================================
-- 1. Script này giả định rằng các giá trị enum hiện tại bao gồm:
--    CREDIT_CARD, BANK_TRANSFER, E_WALLET, MOMO, VNPAY, CASH
-- 
-- 2. Nếu database của bạn có enum khác (ví dụ: chưa có CASH), 
--    hãy điều chỉnh danh sách enum trong lệnh ALTER TABLE phía trên
--
-- 3. Script này an toàn và có thể chạy nhiều lần mà không gây lỗi
--
-- 4. Nếu có dữ liệu trong bảng Payment, script vẫn an toàn vì chỉ thêm giá trị mới
--    mà không xóa giá trị cũ
