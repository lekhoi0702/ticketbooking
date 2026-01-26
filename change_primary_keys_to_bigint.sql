-- Script MySQL để đổi toàn bộ khóa chính và khóa ngoại từ int(11) sang bigint
-- Thực hiện theo thứ tự: Change column types -> Recreate foreign keys (nếu cần)

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- BƯỚC 1: ĐỔI TẤT CẢ PRIMARY KEY COLUMNS SANG BIGINT
-- Lưu ý: Vì đã tắt FOREIGN_KEY_CHECKS, không cần drop foreign key trước khi modify
-- ============================================

-- Advertisement table
ALTER TABLE `Advertisement` MODIFY COLUMN `ad_id` BIGINT NOT NULL AUTO_INCREMENT;

-- Banner table
ALTER TABLE `Banner` MODIFY COLUMN `banner_id` BIGINT NOT NULL AUTO_INCREMENT;

-- Discount table
ALTER TABLE `Discount` MODIFY COLUMN `discount_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Discount` MODIFY COLUMN `manager_id` BIGINT NULL DEFAULT NULL;
ALTER TABLE `Discount` MODIFY COLUMN `event_id` BIGINT NULL DEFAULT NULL;

-- Event table
ALTER TABLE `Event` MODIFY COLUMN `event_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Event` MODIFY COLUMN `category_id` BIGINT NULL DEFAULT NULL;
ALTER TABLE `Event` MODIFY COLUMN `venue_id` BIGINT NOT NULL;
ALTER TABLE `Event` MODIFY COLUMN `manager_id` BIGINT NOT NULL;

-- EventCategory table
ALTER TABLE `EventCategory` MODIFY COLUMN `category_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `EventCategory` MODIFY COLUMN `created_by` BIGINT NULL DEFAULT NULL;

-- FavoriteEvent table (composite primary key)
ALTER TABLE `FavoriteEvent` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `FavoriteEvent` MODIFY COLUMN `event_id` BIGINT NOT NULL;

-- Order table
ALTER TABLE `Order` MODIFY COLUMN `order_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Order` MODIFY COLUMN `user_id` BIGINT NOT NULL;

-- OrganizerInfo table
ALTER TABLE `OrganizerInfo` MODIFY COLUMN `organizer_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `OrganizerInfo` MODIFY COLUMN `user_id` BIGINT NOT NULL;

-- OrganizerQRCode table
ALTER TABLE `OrganizerQRCode` MODIFY COLUMN `qr_code_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `OrganizerQRCode` MODIFY COLUMN `manager_id` BIGINT NOT NULL;

-- PasswordResetToken table
ALTER TABLE `PasswordResetToken` MODIFY COLUMN `token_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `PasswordResetToken` MODIFY COLUMN `user_id` BIGINT NOT NULL;

-- Payment table
ALTER TABLE `Payment` MODIFY COLUMN `payment_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Payment` MODIFY COLUMN `order_id` BIGINT NOT NULL;

-- RefundRequest table
ALTER TABLE `RefundRequest` MODIFY COLUMN `refund_request_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `RefundRequest` MODIFY COLUMN `order_id` BIGINT NOT NULL;
ALTER TABLE `RefundRequest` MODIFY COLUMN `user_id` BIGINT NOT NULL;
ALTER TABLE `RefundRequest` MODIFY COLUMN `reviewed_by` BIGINT NULL DEFAULT NULL;

-- Role table
ALTER TABLE `Role` MODIFY COLUMN `role_id` BIGINT NOT NULL AUTO_INCREMENT;

-- Seat table
ALTER TABLE `Seat` MODIFY COLUMN `seat_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Seat` MODIFY COLUMN `ticket_type_id` BIGINT NOT NULL;

-- Ticket table
ALTER TABLE `Ticket` MODIFY COLUMN `ticket_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Ticket` MODIFY COLUMN `order_id` BIGINT NOT NULL;
ALTER TABLE `Ticket` MODIFY COLUMN `ticket_type_id` BIGINT NOT NULL;
ALTER TABLE `Ticket` MODIFY COLUMN `seat_id` BIGINT NULL DEFAULT NULL;

-- TicketType table
ALTER TABLE `TicketType` MODIFY COLUMN `ticket_type_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `TicketType` MODIFY COLUMN `event_id` BIGINT NOT NULL;

-- User table
ALTER TABLE `User` MODIFY COLUMN `user_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `User` MODIFY COLUMN `role_id` BIGINT NOT NULL;

-- Venue table
ALTER TABLE `Venue` MODIFY COLUMN `venue_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `Venue` MODIFY COLUMN `organizer_id` BIGINT NOT NULL DEFAULT 1;

-- ============================================
-- BƯỚC 2: RECREATE TẤT CẢ FOREIGN KEY CONSTRAINTS
-- Lưu ý: Phần này đã được comment lại vì foreign key constraints đã tồn tại
-- Khi modify column type, foreign key sẽ tự động được cập nhật theo kiểu dữ liệu mới
-- Chỉ uncomment phần này nếu bạn cần recreate foreign key constraints
-- ============================================

/*
-- Recreate foreign keys for Event table
ALTER TABLE `Event` 
  ADD CONSTRAINT `Event_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `EventCategory` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Event_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `Venue` (`venue_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Event_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_event_category` FOREIGN KEY (`category_id`) REFERENCES `EventCategory` (`category_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- Recreate foreign keys for EventCategory table
ALTER TABLE `EventCategory`
  ADD CONSTRAINT `fk_event_category_created_by` FOREIGN KEY (`created_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- Recreate foreign keys for FavoriteEvent table
ALTER TABLE `FavoriteEvent`
  ADD CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_2` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for Order table
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Recreate foreign keys for OrganizerInfo table
ALTER TABLE `OrganizerInfo`
  ADD CONSTRAINT `OrganizerInfo_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Recreate foreign keys for OrganizerQRCode table
ALTER TABLE `OrganizerQRCode`
  ADD CONSTRAINT `fk_qr_code_manager` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for PasswordResetToken table
ALTER TABLE `PasswordResetToken`
  ADD CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for Payment table
ALTER TABLE `Payment`
  ADD CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for RefundRequest table
ALTER TABLE `RefundRequest`
  ADD CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_refund_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_refund_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for Seat table
ALTER TABLE `Seat`
  ADD CONSTRAINT `Seat_ibfk_1` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for Ticket table
ALTER TABLE `Ticket`
  ADD CONSTRAINT `fk_ticket_seat` FOREIGN KEY (`seat_id`) REFERENCES `Seat` (`seat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Ticket_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `Ticket_ibfk_2` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Recreate foreign keys for TicketType table
ALTER TABLE `TicketType`
  ADD CONSTRAINT `TicketType_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Recreate foreign keys for User table
ALTER TABLE `User`
  ADD CONSTRAINT `User_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Recreate foreign keys for Venue table
ALTER TABLE `Venue`
  ADD CONSTRAINT `fk_venue_user` FOREIGN KEY (`organizer_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
*/

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- HOÀN TẤT
-- ============================================
-- Tất cả khóa chính và khóa ngoại đã được đổi từ int(11) sang bigint
-- Kiểm tra lại bằng lệnh: SHOW CREATE TABLE [table_name];
