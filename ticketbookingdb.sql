/*
 Navicat Premium Data Transfer

 Source Server         : ticketbooking_2
 Source Server Type    : MySQL
 Source Server Version : 80011
 Source Host           : gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
 Source Schema         : ticketbookingdb

 Target Server Type    : MySQL
 Target Server Version : 80011
 File Encoding         : 65001

 Date: 23/01/2026 10:53:30
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Audit trail for critical operations' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of AuditLog
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Banner
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Discount
-- ----------------------------

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
-- Records of Event
-- ----------------------------
INSERT INTO `Event` VALUES (1, 1, 17, 88, 'Music Festival Mùa Đông', 'Lễ hội âm nhạc Mùa Đông - Quy tụ các nghệ sĩ hàng đầu', '2026-05-27 10:18:35', '2026-05-27 14:18:35', '2026-04-19 10:18:35', '2026-05-26 10:18:35', '/uploads/organizers/88/events/event_1_âm_nhạc.jpg', NULL, 1000, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (2, 2, 10, 89, 'Giải Bóng đá Miền Trung', 'Giải đấu Bóng đá chuyên nghiệp khu vực Miền Trung', '2026-07-02 10:18:35', '2026-07-02 15:18:35', '2026-05-13 10:18:35', '2026-07-01 10:18:35', '/uploads/organizers/89/events/event_2_thể_thao.jpg', NULL, 2237, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (3, 3, 21, 87, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-04-15 10:18:35', '2026-04-15 15:18:35', '2026-03-04 10:18:35', '2026-04-14 10:18:35', '/uploads/organizers/87/events/event_3_hội_thảo.jpg', NULL, 123, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (4, 4, 5, 87, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-02-27 10:18:35', '2026-02-27 15:18:35', '2026-01-24 10:18:35', '2026-02-26 10:18:35', '/uploads/organizers/87/events/event_4_triển_lãm.jpg', NULL, 644, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (5, 5, 8, 87, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-07-09 10:18:35', '2026-07-09 16:18:35', '2026-05-20 10:18:35', '2026-07-08 10:18:35', '/uploads/organizers/87/events/event_5_sân_khấu.jpg', NULL, 491, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (6, 6, 11, 88, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-03-07 10:18:35', '2026-03-07 12:18:35', '2026-01-06 10:18:35', '2026-03-06 10:18:35', '/uploads/organizers/88/events/event_6_ẩm_thực.jpg', NULL, 766, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (7, 7, 17, 87, 'Khóa học Lập trình Python', 'Khóa học thực hành Lập trình Python từ cơ bản đến nâng cao', '2026-01-31 10:18:35', '2026-01-31 17:18:35', '2025-12-02 10:18:35', '2026-01-30 10:18:35', '/uploads/organizers/87/events/event_7_workshop.jpg', NULL, 57, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (8, 8, 16, 86, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-02-23 10:18:35', '2026-02-23 16:18:35', '2026-01-15 10:18:35', '2026-02-22 10:18:35', '/uploads/organizers/86/events/event_8_hài_kịch.jpg', NULL, 469, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (9, 9, 14, 86, 'Fashion Show Mùa Hè', 'Tuần lễ thời trang Mùa Hè - Bộ sưu tập mới nhất', '2026-06-18 10:18:35', '2026-06-18 16:18:35', '2026-05-15 10:18:35', '2026-06-17 10:18:35', '/uploads/organizers/86/events/event_9_thời_trang.jpg', NULL, 624, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (10, 10, 22, 85, 'Marathon Vũng Tàu 2026', 'Giải marathon quốc tế Vũng Tàu 2026', '2026-02-07 10:18:35', '2026-02-07 18:18:35', '2025-12-30 10:18:35', '2026-02-06 10:18:35', '/uploads/organizers/85/events/event_10_marathon.jpg', NULL, 2942, 0, 'PUBLISHED', 1, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (11, 1, 17, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-03-27 10:18:35', '2026-03-27 17:18:35', '2026-02-11 10:18:35', '2026-03-26 10:18:35', '/uploads/organizers/86/events/event_11_âm_nhạc.jpg', NULL, 380, 0, 'PUBLISHED', 0, '2026-01-23 03:30:23', '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `Event` VALUES (12, 2, 16, 88, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-07-16 10:18:35', '2026-07-16 18:18:35', '2026-05-20 10:18:35', '2026-07-15 10:18:35', '/uploads/organizers/88/events/event_12_thể_thao.jpg', NULL, 5000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (13, 3, 2, 87, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-07-18 10:18:35', '2026-07-18 12:18:35', '2026-06-09 10:18:35', '2026-07-17 10:18:35', '/uploads/organizers/87/events/event_13_hội_thảo.jpg', NULL, 175, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (14, 4, 20, 87, 'Art Exhibition: Mỹ Tâm', 'Triển lãm tranh của họa sĩ Mỹ Tâm', '2026-03-22 10:18:35', '2026-03-22 16:18:35', '2026-02-09 10:18:35', '2026-03-21 10:18:35', '/uploads/organizers/87/events/event_14_triển_lãm.jpg', NULL, 539, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (15, 5, 5, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-04-02 10:18:35', '2026-04-02 17:18:35', '2026-03-03 10:18:35', '2026-04-01 10:18:35', '/uploads/organizers/89/events/event_15_sân_khấu.jpg', NULL, 991, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (16, 6, 16, 87, 'Food Festival Mùa Hè', 'Lễ hội ẩm thực Mùa Hè - Hơn 100 gian hàng', '2026-04-02 10:18:35', '2026-04-02 16:18:35', '2026-02-19 10:18:35', '2026-04-01 10:18:35', '/uploads/organizers/87/events/event_16_ẩm_thực.jpg', NULL, 4127, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (17, 7, 14, 89, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-05-26 10:18:35', '2026-05-26 12:18:35', '2026-04-19 10:18:35', '2026-05-25 10:18:35', '/uploads/organizers/89/events/event_17_workshop.jpg', NULL, 59, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (18, 8, 17, 85, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-03-20 10:18:35', '2026-03-20 12:18:35', '2026-02-12 10:18:35', '2026-03-19 10:18:35', '/uploads/organizers/85/events/event_18_hài_kịch.jpg', NULL, 621, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (19, 9, 2, 85, 'Fashion Show Mùa Hè', 'Tuần lễ thời trang Mùa Hè - Bộ sưu tập mới nhất', '2026-03-26 10:18:35', '2026-03-26 12:18:35', '2026-02-05 10:18:35', '2026-03-25 10:18:35', '/uploads/organizers/85/events/event_19_thời_trang.jpg', NULL, 352, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (20, 10, 1, 87, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-02-01 10:18:35', '2026-02-01 15:18:35', '2025-12-03 10:18:35', '2026-01-31 10:18:35', '/uploads/organizers/87/events/event_20_marathon.jpg', NULL, 2647, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (21, 1, 19, 89, 'Live Concert: Noo Phước Thịnh', 'Đêm nhạc sống với Noo Phước Thịnh - Trải nghiệm âm nhạc đỉnh cao', '2026-06-18 10:18:35', '2026-06-18 13:18:35', '2026-04-24 10:18:35', '2026-06-17 10:18:35', '/uploads/organizers/89/events/event_21_âm_nhạc.jpg', NULL, 1261, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (22, 2, 19, 89, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-07-08 10:18:35', '2026-07-08 18:18:35', '2026-06-07 10:18:35', '2026-07-07 10:18:35', '/uploads/organizers/89/events/event_22_thể_thao.jpg', NULL, 5000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (23, 3, 9, 86, 'Business Conference', 'Hội nghị kinh doanh và khởi nghiệp', '2026-03-19 10:18:35', '2026-03-19 17:18:35', '2026-01-31 10:18:35', '2026-03-18 10:18:35', '/uploads/organizers/86/events/event_23_hội_thảo.jpg', NULL, 200, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (24, 4, 1, 87, 'Art Exhibition: Sơn Tùng MTP', 'Triển lãm tranh của họa sĩ Sơn Tùng MTP', '2026-05-27 10:18:35', '2026-05-27 16:18:35', '2026-04-02 10:18:35', '2026-05-26 10:18:35', '/uploads/organizers/87/events/event_24_triển_lãm.jpg', NULL, 493, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (25, 5, 2, 86, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-04-19 10:18:35', '2026-04-19 16:18:35', '2026-03-03 10:18:35', '2026-04-18 10:18:35', '/uploads/organizers/86/events/event_25_sân_khấu.jpg', NULL, 598, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (26, 6, 22, 89, 'Food Festival Mùa Thu', 'Lễ hội ẩm thực Mùa Thu - Hơn 100 gian hàng', '2026-03-26 10:18:35', '2026-03-26 17:18:35', '2026-02-10 10:18:35', '2026-03-25 10:18:35', '/uploads/organizers/89/events/event_26_ẩm_thực.jpg', NULL, 2697, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (27, 7, 13, 88, 'Workshop Photography', 'Workshop chuyên sâu về Photography', '2026-03-17 10:18:35', '2026-03-17 14:18:35', '2026-01-30 10:18:35', '2026-03-16 10:18:35', '/uploads/organizers/88/events/event_27_workshop.jpg', NULL, 53, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (28, 8, 8, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-05-29 10:18:35', '2026-05-29 14:18:35', '2026-04-26 10:18:35', '2026-05-28 10:18:35', '/uploads/organizers/85/events/event_28_hài_kịch.jpg', NULL, 395, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (29, 9, 24, 89, 'Runway Show: Công Trí', 'Show diễn thời trang của nhà thiết kế Công Trí', '2026-02-04 10:18:35', '2026-02-04 15:18:35', '2025-12-25 10:18:35', '2026-02-03 10:18:35', '/uploads/organizers/89/events/event_29_thời_trang.jpg', NULL, 200, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (30, 10, 4, 87, 'Marathon Hồ Chí Minh 2026', 'Giải marathon quốc tế Hồ Chí Minh 2026', '2026-05-13 10:18:35', '2026-05-13 14:18:35', '2026-03-23 10:18:35', '2026-05-12 10:18:35', '/uploads/organizers/87/events/event_30_marathon.jpg', NULL, 3235, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (31, 1, 17, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-07-06 10:18:35', '2026-07-06 14:18:35', '2026-05-31 10:18:35', '2026-07-05 10:18:35', '/uploads/organizers/86/events/event_31_âm_nhạc.jpg', NULL, 211, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (32, 2, 13, 86, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-01-30 10:18:35', '2026-01-30 14:18:35', '2025-12-13 10:18:35', '2026-01-29 10:18:35', '/uploads/organizers/86/events/event_32_thể_thao.jpg', NULL, 5000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (33, 3, 22, 87, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-05-12 10:18:35', '2026-05-12 14:18:35', '2026-04-10 10:18:35', '2026-05-11 10:18:35', '/uploads/organizers/87/events/event_33_hội_thảo.jpg', NULL, 817, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (34, 4, 14, 87, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-07-09 10:18:35', '2026-07-09 12:18:35', '2026-05-25 10:18:35', '2026-07-08 10:18:35', '/uploads/organizers/87/events/event_34_triển_lãm.jpg', NULL, 812, 0, 'PUBLISHED', 0, '2026-01-23 03:30:24', '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `Event` VALUES (35, 5, 16, 85, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-03-08 10:18:35', '2026-03-08 13:18:35', '2026-01-08 10:18:35', '2026-03-07 10:18:35', '/uploads/organizers/85/events/event_35_sân_khấu.jpg', NULL, 1480, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (36, 6, 11, 87, 'Food Festival Mùa Thu', 'Lễ hội ẩm thực Mùa Thu - Hơn 100 gian hàng', '2026-06-08 10:18:35', '2026-06-08 16:18:35', '2026-04-30 10:18:35', '2026-06-07 10:18:35', '/uploads/organizers/87/events/event_36_ẩm_thực.jpg', NULL, 1000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (37, 7, 13, 86, 'Khóa học Nhiếp ảnh', 'Khóa học thực hành Nhiếp ảnh từ cơ bản đến nâng cao', '2026-03-20 10:18:35', '2026-03-20 12:18:35', '2026-01-19 10:18:35', '2026-03-19 10:18:35', '/uploads/organizers/86/events/event_37_workshop.jpg', NULL, 61, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (38, 8, 22, 87, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-05-08 10:18:35', '2026-05-08 15:18:35', '2026-03-27 10:18:35', '2026-05-07 10:18:35', '/uploads/organizers/87/events/event_38_hài_kịch.jpg', NULL, 716, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (39, 9, 18, 85, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-04-20 10:18:35', '2026-04-20 17:18:35', '2026-03-13 10:18:35', '2026-04-19 10:18:35', '/uploads/organizers/85/events/event_39_thời_trang.jpg', NULL, 200, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (40, 10, 11, 89, 'Fun Run 21km', 'Chạy bộ vui vẻ cự ly 21km', '2026-02-28 10:18:35', '2026-02-28 13:18:35', '2026-01-02 10:18:35', '2026-02-27 10:18:35', '/uploads/organizers/89/events/event_40_marathon.jpg', NULL, 931, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (41, 1, 16, 87, 'Music Festival Mùa Xuân', 'Lễ hội âm nhạc Mùa Xuân - Quy tụ các nghệ sĩ hàng đầu', '2026-06-13 10:18:35', '2026-06-13 14:18:35', '2026-05-09 10:18:35', '2026-06-12 10:18:35', '/uploads/organizers/87/events/event_41_âm_nhạc.jpg', NULL, 4099, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (42, 2, 22, 89, 'Trận cầu đỉnh cao: HAGL vs Thanh Hóa', 'Trận đấu kịch tính giữa HAGL và Thanh Hóa', '2026-06-09 10:18:35', '2026-06-09 12:18:35', '2026-04-21 10:18:35', '2026-06-08 10:18:35', '/uploads/organizers/89/events/event_42_thể_thao.jpg', NULL, 5000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);

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
-- Records of EventCategory
-- ----------------------------
INSERT INTO `EventCategory` VALUES (1, 'Âm nhạc', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (2, 'Thể thao', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (3, 'Hội thảo', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (4, 'Triển lãm', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (5, 'Sân khấu', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (6, 'Ẩm thực', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (7, 'Workshop', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (8, 'Hài kịch', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (9, 'Thời trang', 1, '2026-01-23 03:30:22');
INSERT INTO `EventCategory` VALUES (10, 'Marathon', 1, '2026-01-23 03:30:22');

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
-- Records of FavoriteEvent
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Order
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 60010 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of OrganizerInfo
-- ----------------------------
INSERT INTO `OrganizerInfo` VALUES (60006, 86, 'Công ty Tổ chức Sự kiện Sao Việt', 'Chuyên tổ chức các sự kiện âm nhạc, giải trí quy mô lớn tại Việt Nam', NULL, '2026-01-23 03:30:21', '2026-01-23 03:30:21', NULL);
INSERT INTO `OrganizerInfo` VALUES (60007, 87, 'Trung tâm Hội nghị và Triển lãm Quốc tế', 'Đơn vị hàng đầu về tổ chức hội thảo, triển lãm và sự kiện doanh nghiệp', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);
INSERT INTO `OrganizerInfo` VALUES (60008, 88, 'Công ty Sự kiện Thể thao Việt Nam', 'Chuyên tổ chức các giải đấu thể thao chuyên nghiệp và phong trào', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);
INSERT INTO `OrganizerInfo` VALUES (60009, 89, 'Trung tâm Văn hóa Nghệ thuật', 'Tổ chức các sự kiện văn hóa, nghệ thuật, triển lãm và biểu diễn', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);

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
-- Records of OrganizerQRCode
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Payment
-- ----------------------------

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
-- Records of RefundRequest
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Role
-- ----------------------------
INSERT INTO `Role` VALUES (1, 'admin', '2026-01-17 06:29:10');
INSERT INTO `Role` VALUES (2, 'organizer', '2026-01-17 06:30:06');
INSERT INTO `Role` VALUES (3, 'user', '2026-01-17 06:30:19');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Seat
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of SeatReservation
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Ticket
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of TicketType
-- ----------------------------

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
-- Records of User
-- ----------------------------
INSERT INTO `User` VALUES (1, 1, 'admin', 'scrypt:32768:8:1$HKXKeeedAYqrtvX5$3c7b7ceeec68ba168c61c389405b495e7321a513311f7c492532231a3626ef987f192ec737ed0dd766ebb2b38e6176499cab0d3b1bc193b406872b15882ccd92', 'admin', '0901234567', '2026-01-12 16:37:37', '2026-01-16 01:30:34', 1);
INSERT INTO `User` VALUES (85, 2, 'organizer@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 1', '0987654321', '2026-01-17 06:39:29', '2026-01-23 02:56:33', 1);
INSERT INTO `User` VALUES (86, 2, 'organizer2@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 2', '0987654322', '2026-01-23 03:29:04', '2026-01-23 03:29:04', 1);
INSERT INTO `User` VALUES (87, 2, 'organizer3@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 3', '0987654323', '2026-01-23 03:29:04', '2026-01-23 03:29:04', 1);
INSERT INTO `User` VALUES (88, 3, 'user@gmail.com', 'scrypt:32768:8:1$MYjySHjBI1Hhr5CL$f4f3274a6f28cb0a78ef6d328e58fb8c059afc30fe1f7ba1ebb29a3a98fd48969cc9d3638b78408236096cf1715e8a233bdd1cd2fd683c67f08312bf2b7e43f7', 'Customer 1', '0123456789', '2026-01-17 06:39:30', '2026-01-23 02:56:27', 1);
INSERT INTO `User` VALUES (89, 2, 'organizer5@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 5', '0987654325', '2026-01-23 03:30:21', '2026-01-23 03:30:21', 1);

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
-- Records of Venue
-- ----------------------------
INSERT INTO `Venue` VALUES (1, 'Trung tâm Hội nghị Hồ Chí Minh', '123 Đường Lê Lợi, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 85, NULL);
INSERT INTO `Venue` VALUES (2, 'Nhà hát Hồ Chí Minh', '456 Đường Trần Hưng Đạo, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (3, 'Cafe & Event Space Hồ Chí Minh', '789 Đường Nguyễn Huệ, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (4, 'Trung tâm Hội nghị Hà Nội', '123 Đường Lê Lợi, Quận 1, Hà Nội', 'Hà Nội', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (5, 'Nhà hát Hà Nội', '456 Đường Trần Hưng Đạo, Quận 1, Hà Nội', 'Hà Nội', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (6, 'Cafe & Event Space Hà Nội', '789 Đường Nguyễn Huệ, Quận 1, Hà Nội', 'Hà Nội', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 85, NULL);
INSERT INTO `Venue` VALUES (7, 'Trung tâm Hội nghị Đà Nẵng', '123 Đường Lê Lợi, Quận 1, Đà Nẵng', 'Đà Nẵng', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (8, 'Nhà hát Đà Nẵng', '456 Đường Trần Hưng Đạo, Quận 1, Đà Nẵng', 'Đà Nẵng', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (9, 'Cafe & Event Space Đà Nẵng', '789 Đường Nguyễn Huệ, Quận 1, Đà Nẵng', 'Đà Nẵng', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 87, NULL);
INSERT INTO `Venue` VALUES (10, 'Trung tâm Hội nghị Cần Thơ', '123 Đường Lê Lợi, Quận 1, Cần Thơ', 'Cần Thơ', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (11, 'Nhà hát Cần Thơ', '456 Đường Trần Hưng Đạo, Quận 1, Cần Thơ', 'Cần Thơ', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (12, 'Cafe & Event Space Cần Thơ', '789 Đường Nguyễn Huệ, Quận 1, Cần Thơ', 'Cần Thơ', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (13, 'Trung tâm Hội nghị Nha Trang', '123 Đường Lê Lợi, Quận 1, Nha Trang', 'Nha Trang', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 86, NULL);
INSERT INTO `Venue` VALUES (14, 'Nhà hát Nha Trang', '456 Đường Trần Hưng Đạo, Quận 1, Nha Trang', 'Nha Trang', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 86, NULL);
INSERT INTO `Venue` VALUES (15, 'Cafe & Event Space Nha Trang', '789 Đường Nguyễn Huệ, Quận 1, Nha Trang', 'Nha Trang', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 86, NULL);
INSERT INTO `Venue` VALUES (16, 'Trung tâm Hội nghị Vũng Tàu', '123 Đường Lê Lợi, Quận 1, Vũng Tàu', 'Vũng Tàu', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (17, 'Nhà hát Vũng Tàu', '456 Đường Trần Hưng Đạo, Quận 1, Vũng Tàu', 'Vũng Tàu', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 87, NULL);
INSERT INTO `Venue` VALUES (18, 'Cafe & Event Space Vũng Tàu', '789 Đường Nguyễn Huệ, Quận 1, Vũng Tàu', 'Vũng Tàu', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 88, NULL);
INSERT INTO `Venue` VALUES (19, 'Trung tâm Hội nghị Huế', '123 Đường Lê Lợi, Quận 1, Huế', 'Huế', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (20, 'Nhà hát Huế', '456 Đường Trần Hưng Đạo, Quận 1, Huế', 'Huế', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 85, NULL);
INSERT INTO `Venue` VALUES (21, 'Cafe & Event Space Huế', '789 Đường Nguyễn Huệ, Quận 1, Huế', 'Huế', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 85, NULL);
INSERT INTO `Venue` VALUES (22, 'Trung tâm Hội nghị Hải Phòng', '123 Đường Lê Lợi, Quận 1, Hải Phòng', 'Hải Phòng', 5000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 89, NULL);
INSERT INTO `Venue` VALUES (23, 'Nhà hát Hải Phòng', '456 Đường Trần Hưng Đạo, Quận 1, Hải Phòng', 'Hải Phòng', 1000, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 87, NULL);
INSERT INTO `Venue` VALUES (24, 'Cafe & Event Space Hải Phòng', '789 Đường Nguyễn Huệ, Quận 1, Hải Phòng', 'Hải Phòng', 200, NULL, NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 0, 0, 0, 86, NULL);

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
