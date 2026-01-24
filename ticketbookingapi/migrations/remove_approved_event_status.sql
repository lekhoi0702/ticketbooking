-- Migration: Remove APPROVED event status
-- Trạng thái sự kiện còn: Nháp, Chờ duyệt, Công khai, Từ chối duyệt, Hủy (bỏ Đã phê duyệt/APPROVED).
-- Khi admin duyệt: PENDING_APPROVAL -> PUBLISHED trực tiếp.

-- 1. Chuyển mọi sự kiện đang APPROVED sang PUBLISHED
UPDATE `Event` SET `status` = 'PUBLISHED' WHERE `status` = 'APPROVED';

-- 2. Sửa cột status: bỏ APPROVED khỏi ENUM
ALTER TABLE `Event`
MODIFY COLUMN `status`
ENUM('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING_DELETION', 'DELETED')
DEFAULT 'PENDING_APPROVAL';

-- 3. Kiểm tra
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Event' AND COLUMN_NAME = 'status';
