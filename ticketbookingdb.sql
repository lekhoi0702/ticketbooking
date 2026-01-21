/*
 Navicat Premium Dump SQL

 Source Server         : ticketdb_2
 Source Server Type    : MySQL
 Source Server Version : 80011 (8.0.11-TiDB-v7.5.2-serverless)
 Source Host           : gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
 Source Schema         : ticketbookingdb

 Target Server Type    : MySQL
 Target Server Version : 80011 (8.0.11-TiDB-v7.5.2-serverless)
 File Encoding         : 65001

 Date: 21/01/2026 21:37:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for AuditLog
-- ----------------------------
DROP TABLE IF EXISTS `AuditLog`;
CREATE TABLE `AuditLog`  (
  `audit_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Audited table name',
  `record_id` int(11) NOT NULL COMMENT 'ID of affected record',
  `action` enum('INSERT','UPDATE','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json NULL COMMENT 'Old values before change',
  `new_values` json NULL COMMENT 'New values after change',
  `changed_by` int(11) NULL DEFAULT NULL COMMENT 'User ID who made the change',
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP address of requester',
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Browser user agent',
  PRIMARY KEY (`audit_id`) USING BTREE,
  INDEX `idx_table_record`(`table_name` ASC, `record_id` ASC) USING BTREE,
  INDEX `idx_changed_at`(`changed_at` ASC) USING BTREE,
  INDEX `idx_changed_by`(`changed_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`changed_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 60001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Audit trail for critical operations' ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Banner
-- ----------------------------
DROP TABLE IF EXISTS `Banner`;
CREATE TABLE `Banner`  (
  `banner_id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT NULL,
  `order` int(11) NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`banner_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30011 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Discount
-- ----------------------------
DROP TABLE IF EXISTS `Discount`;
CREATE TABLE `Discount`  (
  `discount_id` int(11) NOT NULL AUTO_INCREMENT,
  `discount_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(15, 2) NOT NULL,
  `max_discount_amount` decimal(15, 2) NULL DEFAULT NULL,
  `min_order_amount` decimal(15, 2) NULL DEFAULT 0.00,
  `usage_limit` int(11) NULL DEFAULT NULL,
  `used_count` int(11) NULL DEFAULT 0,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `manager_id` int(11) NULL DEFAULT NULL,
  `event_id` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`discount_id`) USING BTREE,
  UNIQUE INDEX `discount_code`(`discount_code` ASC) USING BTREE,
  INDEX `idx_code`(`discount_code` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_dates`(`start_date` ASC, `end_date` ASC, `is_active` ASC) USING BTREE COMMENT 'For active discount lookup',
  INDEX `idx_manager`(`manager_id` ASC, `is_active` ASC) USING BTREE COMMENT 'For organizer discount management',
  INDEX `idx_event`(`event_id` ASC, `is_active` ASC) USING BTREE COMMENT 'For event-specific discounts'
) ENGINE = InnoDB AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Event
-- ----------------------------
DROP TABLE IF EXISTS `Event`;
CREATE TABLE `Event`  (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `venue_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `event_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `sale_start_datetime` datetime NULL DEFAULT NULL,
  `sale_end_datetime` datetime NULL DEFAULT NULL,
  `banner_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `vietqr_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_capacity` int(11) NOT NULL,
  `sold_tickets` int(11) NULL DEFAULT 0,
  `status` enum('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','PUBLISHED','ONGOING','COMPLETED','CANCELLED','PENDING_DELETION','DELETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING_APPROVAL',
  `is_featured` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `group_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`event_id`) USING BTREE,
  INDEX `manager_id`(`manager_id` ASC) USING BTREE,
  INDEX `idx_category`(`category_id` ASC) USING BTREE,
  INDEX `idx_venue`(`venue_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_start_date`(`start_datetime` ASC) USING BTREE,
  INDEX `idx_featured`(`is_featured` ASC) USING BTREE,
  INDEX `ix_Event_group_id`(`group_id` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX(`deleted_at` ASC) USING BTREE,
  INDEX `idx_event_name`(`event_name`(100) ASC) USING BTREE COMMENT 'For event name search',
  INDEX `idx_status_start`(`status` ASC, `start_datetime` ASC) USING BTREE COMMENT 'For filtering published/upcoming events',
  INDEX `idx_published_featured`(`status` ASC, `is_featured` ASC, `start_datetime` ASC) USING BTREE COMMENT 'Covering index for homepage featured events',
  INDEX `idx_category_status`(`category_id` ASC, `status` ASC, `start_datetime` ASC) USING BTREE COMMENT 'For category page filtering',
  CONSTRAINT `Event_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `EventCategory` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Event_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `Venue` (`venue_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Event_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 150053 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for EventCategory
-- ----------------------------
DROP TABLE IF EXISTS `EventCategory`;
CREATE TABLE `EventCategory`  (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`) USING BTREE,
  UNIQUE INDEX `category_name`(`category_name` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 60006 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for FavoriteEvent
-- ----------------------------
DROP TABLE IF EXISTS `FavoriteEvent`;
CREATE TABLE `FavoriteEvent`  (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`, `event_id`) USING BTREE,
  INDEX `fk_2`(`event_id` ASC) USING BTREE,
  INDEX `idx_user_created`(`user_id` ASC, `created_at` ASC) USING BTREE COMMENT 'For user favorites sorting',
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Order
-- ----------------------------
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order`  (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15, 2) NOT NULL,
  `final_amount` decimal(15, 2) NOT NULL,
  `order_status` enum('PENDING','PAID','CANCELLED','REFUNDED','COMPLETED','CANCELLATION_PENDING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `customer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paid_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`order_id`) USING BTREE,
  UNIQUE INDEX `order_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_order_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_status`(`order_status` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX(`deleted_at` ASC) USING BTREE,
  INDEX `idx_customer_email`(`customer_email` ASC) USING BTREE COMMENT 'For customer order lookup',
  INDEX `idx_user_status_created`(`user_id` ASC, `order_status` ASC, `created_at` ASC) USING BTREE COMMENT 'For user order history with sorting',
  INDEX `idx_status_created`(`order_status` ASC, `created_at` ASC) USING BTREE COMMENT 'For admin order management',
  CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 180051 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for OrganizerInfo
-- ----------------------------
DROP TABLE IF EXISTS `OrganizerInfo`;
CREATE TABLE `OrganizerInfo`  (
  `organizer_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `organization_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`organizer_id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `OrganizerInfo_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 60006 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for OrganizerQRCode
-- ----------------------------
DROP TABLE IF EXISTS `OrganizerQRCode`;
CREATE TABLE `OrganizerQRCode`  (
  `qr_code_id` int(11) NOT NULL AUTO_INCREMENT,
  `manager_id` int(11) NOT NULL,
  `qr_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `account_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`qr_code_id`) USING BTREE,
  INDEX `idx_manager_id`(`manager_id` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `fk_qr_code_manager` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Payment
-- ----------------------------
DROP TABLE IF EXISTS `Payment`;
CREATE TABLE `Payment`  (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `payment_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `payment_method` enum('CREDIT_CARD','BANK_TRANSFER','E_WALLET','MOMO','VNPAY','CASH','PAYPAL','VIETQR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `amount` decimal(15, 2) NOT NULL,
  `payment_status` enum('PENDING','SUCCESS','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `paid_at` datetime NULL DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`) USING BTREE,
  UNIQUE INDEX `order_id`(`order_id` ASC) USING BTREE,
  UNIQUE INDEX `payment_code`(`payment_code` ASC) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_status`(`payment_status` ASC) USING BTREE,
  INDEX `idx_transaction`(`transaction_id` ASC) USING BTREE COMMENT 'For payment reconciliation with gateway',
  INDEX `idx_payment_status_date`(`payment_status` ASC, `paid_at` ASC) USING BTREE COMMENT 'For payment reports and analytics',
  INDEX `idx_method_status`(`payment_method` ASC, `payment_status` ASC) USING BTREE COMMENT 'For payment method statistics',
  CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 120051 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for RefundRequest
-- ----------------------------
DROP TABLE IF EXISTS `RefundRequest`;
CREATE TABLE `RefundRequest`  (
  `refund_request_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `refund_amount` decimal(15, 2) NOT NULL,
  `request_status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `organizer_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `reviewed_by` int(11) NULL DEFAULT NULL,
  `refunded_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`refund_request_id`) USING BTREE,
  INDEX `fk_refund_reviewer`(`reviewed_by` ASC) USING BTREE,
  INDEX `idx_refund_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_refund_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_refund_status`(`request_status` ASC) USING BTREE,
  INDEX `idx_refund_created`(`created_at` ASC) USING BTREE,
  CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_refund_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_refund_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Stores customer refund requests for orders' ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Role
-- ----------------------------
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role`  (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`) USING BTREE,
  UNIQUE INDEX `role_name`(`role_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30004 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Seat
-- ----------------------------
DROP TABLE IF EXISTS `Seat`;
CREATE TABLE `Seat`  (
  `seat_id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_type_id` int(11) NOT NULL,
  `row_name` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `seat_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('AVAILABLE','LOCKED','BOOKED','RESERVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'AVAILABLE',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `area_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `x_pos` int(11) NULL DEFAULT NULL,
  `y_pos` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`seat_id`) USING BTREE,
  INDEX `ticket_type_id`(`ticket_type_id` ASC) USING BTREE,
  INDEX `status`(`status` ASC) USING BTREE,
  INDEX `idx_type_status_area`(`ticket_type_id` ASC, `status` ASC, `area_name` ASC) USING BTREE COMMENT 'For seat map display',
  CONSTRAINT `Seat_ibfk_1` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 122001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for SeatReservation
-- ----------------------------
DROP TABLE IF EXISTS `SeatReservation`;
CREATE TABLE `SeatReservation`  (
  `reservation_id` int(11) NOT NULL AUTO_INCREMENT,
  `seat_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `reserved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`reservation_id`) USING BTREE,
  INDEX `idx_seat_id`(`seat_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_event_id`(`event_id` ASC) USING BTREE,
  INDEX `idx_expires_at`(`expires_at` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_seat_user_active`(`seat_id` ASC, `user_id` ASC, `is_active` ASC) USING BTREE,
  INDEX `idx_active_expires`(`is_active` ASC, `expires_at` ASC) USING BTREE,
  CONSTRAINT `fk_seat_reservation_seat` FOREIGN KEY (`seat_id`) REFERENCES `Seat` (`seat_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_seat_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_seat_reservation_event` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Ticket
-- ----------------------------
DROP TABLE IF EXISTS `Ticket`;
CREATE TABLE `Ticket`  (
  `ticket_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `ticket_type_id` int(11) NOT NULL,
  `ticket_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_status` enum('ACTIVE','USED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `seat_id` int(11) NULL DEFAULT NULL,
  `price` decimal(15, 2) NOT NULL,
  `qr_code_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `holder_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `holder_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`ticket_id`) USING BTREE,
  UNIQUE INDEX `ticket_code`(`ticket_code` ASC) USING BTREE,
  INDEX `ticket_type_id`(`ticket_type_id` ASC) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_ticket_code`(`ticket_code` ASC) USING BTREE,
  INDEX `idx_status`(`ticket_status` ASC) USING BTREE,
  INDEX `idx_ticket_seat`(`seat_id` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX(`deleted_at` ASC) USING BTREE,
  INDEX `idx_holder_email`(`holder_email` ASC) USING BTREE COMMENT 'For ticket holder lookup',
  INDEX `idx_ticket_type_status`(`ticket_type_id` ASC, `ticket_status` ASC) USING BTREE COMMENT 'For event ticket statistics',
  INDEX `idx_order_status`(`order_id` ASC, `ticket_status` ASC) USING BTREE COMMENT 'For order ticket lookup',
  CONSTRAINT `fk_ticket_seat` FOREIGN KEY (`seat_id`) REFERENCES `Seat` (`seat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Ticket_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `Ticket_ibfk_2` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 180111 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for TicketType
-- ----------------------------
DROP TABLE IF EXISTS `TicketType`;
CREATE TABLE `TicketType`  (
  `ticket_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `price` decimal(15, 2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sold_quantity` int(11) NULL DEFAULT 0,
  `sale_start` datetime NULL DEFAULT NULL,
  `sale_end` datetime NULL DEFAULT NULL,
  `max_per_order` int(11) NULL DEFAULT 10,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_type_id`) USING BTREE,
  INDEX `idx_event`(`event_id` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_event_active`(`event_id` ASC, `is_active` ASC) USING BTREE COMMENT 'For active ticket types per event',
  INDEX `idx_event_price`(`event_id` ASC, `price` ASC) USING BTREE COMMENT 'For price range queries',
  CONSTRAINT `TicketType_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 150101 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User`  (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `User_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 120105 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for Venue
-- ----------------------------
DROP TABLE IF EXISTS `Venue`;
CREATE TABLE `Venue`  (
  `venue_id` int(11) NOT NULL AUTO_INCREMENT,
  `venue_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int(11) NOT NULL,
  `seat_map_template` json NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vip_seats` int(11) NULL DEFAULT 0,
  `standard_seats` int(11) NULL DEFAULT 0,
  `economy_seats` int(11) NULL DEFAULT 0,
  `manager_id` int(11) NOT NULL DEFAULT 1,
  `map_embed_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`venue_id`) USING BTREE,
  INDEX `idx_city`(`city` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  INDEX `ix_venue_status`(`status` ASC) USING BTREE,
  INDEX `fk_venue_user`(`manager_id` ASC) USING BTREE,
  INDEX `idx_city_active`(`city` ASC, `is_active` ASC, `status` ASC) USING BTREE COMMENT 'For venue search by city',
  CONSTRAINT `fk_venue_user` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 120018 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- View structure for v_active_events
-- ----------------------------
DROP VIEW IF EXISTS `v_active_events`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_active_events` AS SELECT `ticketbookingdb`.`e`.`event_id` AS `event_id`,`ticketbookingdb`.`e`.`category_id` AS `category_id`,`ticketbookingdb`.`e`.`venue_id` AS `venue_id`,`ticketbookingdb`.`e`.`manager_id` AS `manager_id`,`ticketbookingdb`.`e`.`event_name` AS `event_name`,`ticketbookingdb`.`e`.`description` AS `description`,`ticketbookingdb`.`e`.`start_datetime` AS `start_datetime`,`ticketbookingdb`.`e`.`end_datetime` AS `end_datetime`,`ticketbookingdb`.`e`.`sale_start_datetime` AS `sale_start_datetime`,`ticketbookingdb`.`e`.`sale_end_datetime` AS `sale_end_datetime`,`ticketbookingdb`.`e`.`banner_image_url` AS `banner_image_url`,`ticketbookingdb`.`e`.`total_capacity` AS `total_capacity`,`ticketbookingdb`.`e`.`sold_tickets` AS `sold_tickets`,`ticketbookingdb`.`e`.`status` AS `status`,`ticketbookingdb`.`e`.`is_featured` AS `is_featured`,`ticketbookingdb`.`e`.`created_at` AS `created_at`,`ticketbookingdb`.`e`.`updated_at` AS `updated_at`,`ticketbookingdb`.`e`.`group_id` AS `group_id`,`ticketbookingdb`.`e`.`deleted_at` AS `deleted_at`,`c`.`category_name` AS `category_name`,`v`.`venue_name` AS `venue_name`,`v`.`city` AS `city`,`v`.`address` AS `address`,`u`.`full_name` AS `manager_name` FROM ((`ticketbookingdb`.`Event` AS `e` JOIN `ticketbookingdb`.`EventCategory` AS `c` ON `e`.`category_id`=`c`.`category_id`) JOIN `ticketbookingdb`.`Venue` AS `v` ON `e`.`venue_id`=`v`.`venue_id`) JOIN `ticketbookingdb`.`User` AS `u` ON `e`.`manager_id`=`u`.`user_id` WHERE `e`.`deleted_at` IS NULL AND `e`.`status` IN (_UTF8MB4'PUBLISHED',_UTF8MB4'ONGOING') WITH CASCADED CHECK OPTION;

-- ----------------------------
-- View structure for v_event_statistics
-- ----------------------------
DROP VIEW IF EXISTS `v_event_statistics`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_event_statistics` AS SELECT `e`.`event_id` AS `event_id`,`e`.`event_name` AS `event_name`,`e`.`status` AS `status`,`e`.`total_capacity` AS `total_capacity`,`e`.`sold_tickets` AS `sold_tickets`,(`e`.`total_capacity`-`e`.`sold_tickets`) AS `available_tickets`,ROUND((`e`.`sold_tickets`/`e`.`total_capacity`*100), 2) AS `occupancy_rate`,COUNT(DISTINCT `o`.`order_id`) AS `order_count`,COALESCE(SUM(`o`.`final_amount`), 0) AS `total_revenue` FROM ((`ticketbookingdb`.`Event` AS `e` LEFT JOIN `ticketbookingdb`.`TicketType` AS `tt` ON `e`.`event_id`=`tt`.`event_id`) LEFT JOIN `ticketbookingdb`.`Ticket` AS `t` ON `tt`.`ticket_type_id`=`t`.`ticket_type_id`) LEFT JOIN `ticketbookingdb`.`Order` AS `o` ON `t`.`order_id`=`o`.`order_id` AND `o`.`order_status`=_UTF8MB4'PAID' WHERE `e`.`deleted_at` IS NULL GROUP BY `e`.`event_id` WITH CASCADED CHECK OPTION;

-- ----------------------------
-- View structure for v_order_list
-- ----------------------------
DROP VIEW IF EXISTS `v_order_list`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_order_list` AS SELECT `o`.`order_id` AS `order_id`,`o`.`order_code` AS `order_code`,`o`.`user_id` AS `user_id`,`o`.`order_status` AS `order_status`,`o`.`total_amount` AS `total_amount`,`o`.`final_amount` AS `final_amount`,`o`.`created_at` AS `created_at`,`o`.`paid_at` AS `paid_at`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email` FROM `ticketbookingdb`.`Order` AS `o` JOIN `ticketbookingdb`.`User` AS `u` ON `o`.`user_id`=`u`.`user_id` WHERE `o`.`deleted_at` IS NULL WITH CASCADED CHECK OPTION;

-- ----------------------------
-- View structure for v_order_summary
-- ----------------------------
DROP VIEW IF EXISTS `v_order_summary`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_order_summary` AS SELECT `o`.`order_id` AS `order_id`,`o`.`order_code` AS `order_code`,`o`.`user_id` AS `user_id`,`o`.`order_status` AS `order_status`,`o`.`total_amount` AS `total_amount`,`o`.`final_amount` AS `final_amount`,`o`.`created_at` AS `created_at`,`o`.`paid_at` AS `paid_at`,COUNT(`t`.`ticket_id`) AS `ticket_count`,`p`.`payment_status` AS `payment_status`,`p`.`payment_method` AS `payment_method`,`p`.`transaction_id` AS `transaction_id` FROM (`ticketbookingdb`.`Order` AS `o` LEFT JOIN `ticketbookingdb`.`Ticket` AS `t` ON `o`.`order_id`=`t`.`order_id`) LEFT JOIN `ticketbookingdb`.`Payment` AS `p` ON `o`.`order_id`=`p`.`order_id` WHERE `o`.`deleted_at` IS NULL GROUP BY `o`.`order_id`,`p`.`payment_id` WITH CASCADED CHECK OPTION;

-- ----------------------------
-- View structure for v_published_events
-- ----------------------------
DROP VIEW IF EXISTS `v_published_events`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_published_events` AS SELECT `e`.`event_id` AS `event_id`,`e`.`event_name` AS `event_name`,`e`.`description` AS `description`,`e`.`start_datetime` AS `start_datetime`,`e`.`end_datetime` AS `end_datetime`,`e`.`banner_image_url` AS `banner_image_url`,`e`.`total_capacity` AS `total_capacity`,`e`.`sold_tickets` AS `sold_tickets`,`e`.`is_featured` AS `is_featured`,`e`.`status` AS `status`,`c`.`category_name` AS `category_name`,`v`.`venue_name` AS `venue_name`,`v`.`city` AS `city` FROM (`ticketbookingdb`.`Event` AS `e` JOIN `ticketbookingdb`.`EventCategory` AS `c` ON `e`.`category_id`=`c`.`category_id`) JOIN `ticketbookingdb`.`Venue` AS `v` ON `e`.`venue_id`=`v`.`venue_id` WHERE `e`.`deleted_at` IS NULL AND `e`.`status`=_UTF8MB4'PUBLISHED' WITH CASCADED CHECK OPTION;

SET FOREIGN_KEY_CHECKS = 1;
