-- ============================================
-- SCRIPT XÓA TOÀN BỘ DỮ LIỆU TRỪ BẢNG USER VÀ ROLE
-- ============================================
-- Script này sẽ xóa tất cả dữ liệu trong database
-- nhưng giữ lại dữ liệu trong bảng User và Role
-- 
-- Script được tạo dựa trên cấu trúc database thực tế từ ticketbookingdb.sql
-- ============================================

USE ticketbookingdb;

-- Tắt kiểm tra foreign key để có thể xóa dữ liệu tự do
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- XÓA DỮ LIỆU TỪ CÁC BẢNG CON (CÓ FOREIGN KEY)
-- Thứ tự xóa: từ bảng con đến bảng cha
-- ============================================

-- 1. Xóa dữ liệu từ bảng Ticket (tham chiếu Order, TicketType, Seat)
DELETE FROM Ticket;

-- 2. Xóa dữ liệu từ bảng Payment (tham chiếu Order)
DELETE FROM Payment;

-- 3. Xóa dữ liệu từ bảng RefundRequest (tham chiếu Order, User)
DELETE FROM RefundRequest;

-- 4. Xóa dữ liệu từ bảng Seat (tham chiếu TicketType)
DELETE FROM Seat;

-- 5. Xóa dữ liệu từ bảng SeatReservation (tham chiếu Event, Seat, User)
DELETE FROM SeatReservation;

-- 6. Xóa dữ liệu từ bảng TicketType (tham chiếu Event)
DELETE FROM TicketType;

-- 7. Xóa dữ liệu từ bảng Order (tham chiếu User)
DELETE FROM `Order`;

-- 8. Xóa dữ liệu từ bảng FavoriteEvent (tham chiếu Event, User)
-- Lưu ý: Bảng này có composite primary key (user_id, event_id), không có AUTO_INCREMENT
DELETE FROM FavoriteEvent;

-- 9. Xóa dữ liệu từ bảng OrganizerQRCode (tham chiếu User/manager_id)
DELETE FROM OrganizerQRCode;

-- 10. Xóa dữ liệu từ bảng AuditLog (tham chiếu User/changed_by)
DELETE FROM AuditLog;

-- ============================================
-- XÓA DỮ LIỆU TỪ CÁC BẢNG CHÍNH
-- ============================================

-- 11. Xóa dữ liệu từ bảng Event (tham chiếu EventCategory, Venue, User)
DELETE FROM Event;

-- 12. Xóa dữ liệu từ bảng EventCategory
DELETE FROM EventCategory;

-- 13. Xóa dữ liệu từ bảng Venue (tham chiếu User/manager_id)
DELETE FROM Venue;

-- ============================================
-- XÓA DỮ LIỆU TỪ CÁC BẢNG KHÁC
-- ============================================

-- 14. Xóa dữ liệu từ bảng Discount (có thể tham chiếu manager_id, event_id)
DELETE FROM Discount;

-- 15. Xóa dữ liệu từ bảng Banner
DELETE FROM Banner;

-- 16. Xóa dữ liệu từ bảng OrganizerInfo (tham chiếu User)
DELETE FROM OrganizerInfo;

-- ============================================
-- RESET AUTO_INCREMENT
-- ============================================
-- Reset AUTO_INCREMENT về 1 cho tất cả các bảng đã xóa dữ liệu
-- Lưu ý: FavoriteEvent không có AUTO_INCREMENT vì dùng composite primary key

ALTER TABLE Ticket AUTO_INCREMENT = 1;
ALTER TABLE Payment AUTO_INCREMENT = 1;
ALTER TABLE RefundRequest AUTO_INCREMENT = 1;
ALTER TABLE Seat AUTO_INCREMENT = 1;
ALTER TABLE SeatReservation AUTO_INCREMENT = 1;
ALTER TABLE TicketType AUTO_INCREMENT = 1;
ALTER TABLE `Order` AUTO_INCREMENT = 1;
ALTER TABLE OrganizerQRCode AUTO_INCREMENT = 1;
ALTER TABLE AuditLog AUTO_INCREMENT = 1;
ALTER TABLE Event AUTO_INCREMENT = 1;
ALTER TABLE EventCategory AUTO_INCREMENT = 1;
ALTER TABLE Venue AUTO_INCREMENT = 1;
ALTER TABLE Discount AUTO_INCREMENT = 1;
ALTER TABLE Banner AUTO_INCREMENT = 1;
ALTER TABLE OrganizerInfo AUTO_INCREMENT = 1;

-- Bật lại kiểm tra foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- HOÀN TẤT
-- ============================================
-- Đã xóa toàn bộ dữ liệu trừ bảng User và Role
-- Tất cả AUTO_INCREMENT đã được reset về 1
-- 
-- Các bảng được giữ lại:
-- - User
-- - Role
--
-- Các bảng đã xóa dữ liệu:
-- - Ticket, Payment, RefundRequest
-- - Seat, SeatReservation
-- - TicketType, Order
-- - FavoriteEvent
-- - OrganizerQRCode, AuditLog
-- - Event, EventCategory, Venue
-- - Discount, Banner, OrganizerInfo

SELECT 'Database cleaned successfully! User and Role tables preserved.' AS message;
