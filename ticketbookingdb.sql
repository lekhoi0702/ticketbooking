/*
 Navicat Premium Data Transfer

 Source Server         : ticketbookingdb
 Source Server Type    : MySQL
 Source Server Version : 80035
 Source Host           : mysql-3b8d5202-dailyreport.i.aivencloud.com:20325
 Source Schema         : ticketbookingdb

 Target Server Type    : MySQL
 Target Server Version : 80035
 File Encoding         : 65001

 Date: 17/01/2026 13:20:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Banner
-- ----------------------------
DROP TABLE IF EXISTS `Banner`;
CREATE TABLE `Banner`  (
  `banner_id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT NULL,
  `order` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`banner_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Discount
-- ----------------------------
DROP TABLE IF EXISTS `Discount`;
CREATE TABLE `Discount`  (
  `discount_id` int NOT NULL AUTO_INCREMENT,
  `discount_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(15, 2) NOT NULL,
  `max_discount_amount` decimal(15, 2) NULL DEFAULT NULL,
  `min_order_amount` decimal(15, 2) NULL DEFAULT 0.00,
  `usage_limit` int NULL DEFAULT NULL,
  `used_count` int NULL DEFAULT 0,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `manager_id` int NULL DEFAULT NULL,
  `event_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`discount_id`) USING BTREE,
  UNIQUE INDEX `discount_code`(`discount_code` ASC) USING BTREE,
  INDEX `idx_code`(`discount_code` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Event
-- ----------------------------
DROP TABLE IF EXISTS `Event`;
CREATE TABLE `Event`  (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `manager_id` int NOT NULL,
  `event_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `sale_start_datetime` datetime NULL DEFAULT NULL,
  `sale_end_datetime` datetime NULL DEFAULT NULL,
  `banner_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_capacity` int NOT NULL,
  `sold_tickets` int NULL DEFAULT 0,
  `status` enum('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','PUBLISHED','ONGOING','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING_APPROVAL',
  `is_featured` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`) USING BTREE,
  INDEX `manager_id`(`manager_id` ASC) USING BTREE,
  INDEX `idx_category`(`category_id` ASC) USING BTREE,
  INDEX `idx_venue`(`venue_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_start_date`(`start_datetime` ASC) USING BTREE,
  INDEX `idx_featured`(`is_featured` ASC) USING BTREE,
  CONSTRAINT `Event_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `EventCategory` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Event_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `Venue` (`venue_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Event_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_event_datetime` CHECK (`end_datetime` > `start_datetime`)
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for EventCategory
-- ----------------------------
DROP TABLE IF EXISTS `EventCategory`;
CREATE TABLE `EventCategory`  (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`) USING BTREE,
  UNIQUE INDEX `category_name`(`category_name` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for EventDeletionRequest
-- ----------------------------
DROP TABLE IF EXISTS `EventDeletionRequest`;
CREATE TABLE `EventDeletionRequest`  (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NULL DEFAULT NULL,
  `organizer_id` int NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `request_status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `admin_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `reviewed_by` int NULL DEFAULT NULL,
  PRIMARY KEY (`request_id`) USING BTREE,
  INDEX `fk_deletion_reviewer`(`reviewed_by` ASC) USING BTREE,
  INDEX `idx_event_deletion_event`(`event_id` ASC) USING BTREE,
  INDEX `idx_event_deletion_status`(`request_status` ASC) USING BTREE,
  INDEX `idx_event_deletion_organizer`(`organizer_id` ASC) USING BTREE,
  CONSTRAINT `fk_deletion_event` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_deletion_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_deletion_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Order
-- ----------------------------
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order`  (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
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
  PRIMARY KEY (`order_id`) USING BTREE,
  UNIQUE INDEX `order_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_order_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_status`(`order_status` ASC) USING BTREE,
  CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_order_amount` CHECK (`final_amount` >= 0)
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for OrganizerInfo
-- ----------------------------
DROP TABLE IF EXISTS `OrganizerInfo`;
CREATE TABLE `OrganizerInfo`  (
  `organizer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `organization_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`organizer_id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `OrganizerInfo_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Payment
-- ----------------------------
DROP TABLE IF EXISTS `Payment`;
CREATE TABLE `Payment`  (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `payment_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `payment_method` enum('CREDIT_CARD','BANK_TRANSFER','E_WALLET','MOMO','VNPAY','CASH') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
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
  CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for RefundRequest
-- ----------------------------
DROP TABLE IF EXISTS `RefundRequest`;
CREATE TABLE `RefundRequest`  (
  `refund_request_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `refund_amount` decimal(15, 2) NOT NULL,
  `request_status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `organizer_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `reviewed_by` int NULL DEFAULT NULL,
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Stores customer refund requests for orders' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Role
-- ----------------------------
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role`  (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`) USING BTREE,
  UNIQUE INDEX `role_name`(`role_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Seat
-- ----------------------------
DROP TABLE IF EXISTS `Seat`;
CREATE TABLE `Seat`  (
  `seat_id` int NOT NULL AUTO_INCREMENT,
  `ticket_type_id` int NOT NULL,
  `row_name` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `seat_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('AVAILABLE','LOCKED','BOOKED','RESERVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'AVAILABLE',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `area_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `x_pos` int NULL DEFAULT NULL,
  `y_pos` int NULL DEFAULT NULL,
  PRIMARY KEY (`seat_id`) USING BTREE,
  INDEX `ticket_type_id`(`ticket_type_id` ASC) USING BTREE,
  INDEX `status`(`status` ASC) USING BTREE,
  CONSTRAINT `Seat_ibfk_1` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 883 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Ticket
-- ----------------------------
DROP TABLE IF EXISTS `Ticket`;
CREATE TABLE `Ticket`  (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `ticket_type_id` int NOT NULL,
  `ticket_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_status` enum('ACTIVE','USED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `seat_id` int NULL DEFAULT NULL,
  `price` decimal(15, 2) NOT NULL,
  `qr_code_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `holder_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `holder_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`) USING BTREE,
  UNIQUE INDEX `ticket_code`(`ticket_code` ASC) USING BTREE,
  INDEX `ticket_type_id`(`ticket_type_id` ASC) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_ticket_code`(`ticket_code` ASC) USING BTREE,
  INDEX `idx_status`(`ticket_status` ASC) USING BTREE,
  INDEX `idx_ticket_seat`(`seat_id` ASC) USING BTREE,
  CONSTRAINT `fk_ticket_seat` FOREIGN KEY (`seat_id`) REFERENCES `Seat` (`seat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Ticket_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `Ticket_ibfk_2` FOREIGN KEY (`ticket_type_id`) REFERENCES `TicketType` (`ticket_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for TicketType
-- ----------------------------
DROP TABLE IF EXISTS `TicketType`;
CREATE TABLE `TicketType`  (
  `ticket_type_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `price` decimal(15, 2) NOT NULL,
  `quantity` int NOT NULL,
  `sold_quantity` int NULL DEFAULT 0,
  `sale_start` datetime NULL DEFAULT NULL,
  `sale_end` datetime NULL DEFAULT NULL,
  `max_per_order` int NULL DEFAULT 10,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_type_id`) USING BTREE,
  INDEX `idx_event`(`event_id` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `TicketType_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_ticket_price` CHECK (`price` >= 0),
  CONSTRAINT `chk_ticket_quantity` CHECK (`sold_quantity` <= `quantity`)
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User`  (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
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
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for Venue
-- ----------------------------
DROP TABLE IF EXISTS `Venue`;
CREATE TABLE `Venue`  (
  `venue_id` int NOT NULL AUTO_INCREMENT,
  `venue_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `seat_map_template` json NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vip_seats` int NULL DEFAULT 0,
  `standard_seats` int NULL DEFAULT 0,
  `economy_seats` int NULL DEFAULT 0,
  `manager_id` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`venue_id`) USING BTREE,
  INDEX `idx_city`(`city` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  INDEX `ix_venue_status`(`status` ASC) USING BTREE,
  INDEX `fk_venue_user`(`manager_id` ASC) USING BTREE,
  CONSTRAINT `fk_venue_user` FOREIGN KEY (`manager_id`) REFERENCES `User` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
