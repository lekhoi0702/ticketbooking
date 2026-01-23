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

 Date: 23/01/2026 15:01:28
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
) ENGINE = InnoDB AUTO_INCREMENT = 120002 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Audit trail for critical operations' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of AuditLog
-- ----------------------------
INSERT INTO `AuditLog` VALUES (1, 'Event', 1, 'INSERT', NULL, '{\"event_name\": \"Event 1\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (2, 'Event', 1, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (3, 'Event', 1, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (4, 'Event', 2, 'INSERT', NULL, '{\"event_name\": \"Event 2\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (5, 'Event', 2, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (6, 'Event', 2, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (7, 'Event', 3, 'INSERT', NULL, '{\"event_name\": \"Event 3\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (8, 'Event', 3, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (9, 'Event', 3, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (10, 'Event', 4, 'INSERT', NULL, '{\"event_name\": \"Event 4\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (11, 'Event', 4, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (12, 'Event', 4, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (13, 'Event', 5, 'INSERT', NULL, '{\"event_name\": \"Event 5\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (14, 'Event', 5, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (15, 'Event', 5, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (16, 'Event', 6, 'INSERT', NULL, '{\"event_name\": \"Event 6\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (17, 'Event', 6, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (18, 'Event', 6, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (19, 'Event', 7, 'INSERT', NULL, '{\"event_name\": \"Event 7\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (20, 'Event', 7, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (21, 'Event', 7, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (22, 'Event', 8, 'INSERT', NULL, '{\"event_name\": \"Event 8\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (23, 'Event', 8, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (24, 'Event', 8, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (25, 'Event', 9, 'INSERT', NULL, '{\"event_name\": \"Event 9\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (26, 'Event', 9, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:30:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (27, 'Event', 9, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (28, 'Event', 10, 'INSERT', NULL, '{\"event_name\": \"Event 10\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (29, 'Event', 10, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (30, 'Event', 10, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (31, 'Event', 11, 'INSERT', NULL, '{\"event_name\": \"Event 11\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:31', NULL, NULL);
INSERT INTO `AuditLog` VALUES (32, 'Event', 11, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:01', NULL, NULL);
INSERT INTO `AuditLog` VALUES (33, 'Event', 11, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:31', NULL, NULL);
INSERT INTO `AuditLog` VALUES (34, 'Event', 12, 'INSERT', NULL, '{\"event_name\": \"Event 12\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:32', NULL, NULL);
INSERT INTO `AuditLog` VALUES (35, 'Event', 12, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:02', NULL, NULL);
INSERT INTO `AuditLog` VALUES (36, 'Event', 12, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:32', NULL, NULL);
INSERT INTO `AuditLog` VALUES (37, 'Event', 13, 'INSERT', NULL, '{\"event_name\": \"Event 13\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:33', NULL, NULL);
INSERT INTO `AuditLog` VALUES (38, 'Event', 13, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:03', NULL, NULL);
INSERT INTO `AuditLog` VALUES (39, 'Event', 13, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:33', NULL, NULL);
INSERT INTO `AuditLog` VALUES (40, 'Event', 14, 'INSERT', NULL, '{\"event_name\": \"Event 14\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:34', NULL, NULL);
INSERT INTO `AuditLog` VALUES (41, 'Event', 14, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:04', NULL, NULL);
INSERT INTO `AuditLog` VALUES (42, 'Event', 14, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:34', NULL, NULL);
INSERT INTO `AuditLog` VALUES (43, 'Event', 15, 'INSERT', NULL, '{\"event_name\": \"Event 15\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:35', NULL, NULL);
INSERT INTO `AuditLog` VALUES (44, 'Event', 15, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:05', NULL, NULL);
INSERT INTO `AuditLog` VALUES (45, 'Event', 15, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:35', NULL, NULL);
INSERT INTO `AuditLog` VALUES (46, 'Event', 16, 'INSERT', NULL, '{\"event_name\": \"Event 16\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:36', NULL, NULL);
INSERT INTO `AuditLog` VALUES (47, 'Event', 16, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:06', NULL, NULL);
INSERT INTO `AuditLog` VALUES (48, 'Event', 16, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:36', NULL, NULL);
INSERT INTO `AuditLog` VALUES (49, 'Event', 17, 'INSERT', NULL, '{\"event_name\": \"Event 17\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:37', NULL, NULL);
INSERT INTO `AuditLog` VALUES (50, 'Event', 17, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:07', NULL, NULL);
INSERT INTO `AuditLog` VALUES (51, 'Event', 17, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:37', NULL, NULL);
INSERT INTO `AuditLog` VALUES (52, 'Event', 18, 'INSERT', NULL, '{\"event_name\": \"Event 18\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:38', NULL, NULL);
INSERT INTO `AuditLog` VALUES (53, 'Event', 18, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:08', NULL, NULL);
INSERT INTO `AuditLog` VALUES (54, 'Event', 18, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:38', NULL, NULL);
INSERT INTO `AuditLog` VALUES (55, 'Event', 19, 'INSERT', NULL, '{\"event_name\": \"Event 19\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:39', NULL, NULL);
INSERT INTO `AuditLog` VALUES (56, 'Event', 19, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:09', NULL, NULL);
INSERT INTO `AuditLog` VALUES (57, 'Event', 19, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:39', NULL, NULL);
INSERT INTO `AuditLog` VALUES (58, 'Event', 20, 'INSERT', NULL, '{\"event_name\": \"Event 20\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:40', NULL, NULL);
INSERT INTO `AuditLog` VALUES (59, 'Event', 20, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:10', NULL, NULL);
INSERT INTO `AuditLog` VALUES (60, 'Event', 20, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:40', NULL, NULL);
INSERT INTO `AuditLog` VALUES (61, 'Event', 21, 'INSERT', NULL, '{\"event_name\": \"Event 21\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:41', NULL, NULL);
INSERT INTO `AuditLog` VALUES (62, 'Event', 21, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:11', NULL, NULL);
INSERT INTO `AuditLog` VALUES (63, 'Event', 21, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:41', NULL, NULL);
INSERT INTO `AuditLog` VALUES (64, 'Event', 22, 'INSERT', NULL, '{\"event_name\": \"Event 22\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:42', NULL, NULL);
INSERT INTO `AuditLog` VALUES (65, 'Event', 22, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:12', NULL, NULL);
INSERT INTO `AuditLog` VALUES (66, 'Event', 22, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:42', NULL, NULL);
INSERT INTO `AuditLog` VALUES (67, 'Event', 23, 'INSERT', NULL, '{\"event_name\": \"Event 23\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:43', NULL, NULL);
INSERT INTO `AuditLog` VALUES (68, 'Event', 23, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:13', NULL, NULL);
INSERT INTO `AuditLog` VALUES (69, 'Event', 23, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:43', NULL, NULL);
INSERT INTO `AuditLog` VALUES (70, 'Event', 24, 'INSERT', NULL, '{\"event_name\": \"Event 24\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:44', NULL, NULL);
INSERT INTO `AuditLog` VALUES (71, 'Event', 24, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:14', NULL, NULL);
INSERT INTO `AuditLog` VALUES (72, 'Event', 24, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:44', NULL, NULL);
INSERT INTO `AuditLog` VALUES (73, 'Event', 25, 'INSERT', NULL, '{\"event_name\": \"Event 25\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:45', NULL, NULL);
INSERT INTO `AuditLog` VALUES (74, 'Event', 25, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:15', NULL, NULL);
INSERT INTO `AuditLog` VALUES (75, 'Event', 25, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:45', NULL, NULL);
INSERT INTO `AuditLog` VALUES (76, 'Event', 26, 'INSERT', NULL, '{\"event_name\": \"Event 26\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:46', NULL, NULL);
INSERT INTO `AuditLog` VALUES (77, 'Event', 26, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:16', NULL, NULL);
INSERT INTO `AuditLog` VALUES (78, 'Event', 26, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:46', NULL, NULL);
INSERT INTO `AuditLog` VALUES (79, 'Event', 27, 'INSERT', NULL, '{\"event_name\": \"Event 27\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:47', NULL, NULL);
INSERT INTO `AuditLog` VALUES (80, 'Event', 27, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:17', NULL, NULL);
INSERT INTO `AuditLog` VALUES (81, 'Event', 27, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:47', NULL, NULL);
INSERT INTO `AuditLog` VALUES (82, 'Event', 28, 'INSERT', NULL, '{\"event_name\": \"Event 28\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:48', NULL, NULL);
INSERT INTO `AuditLog` VALUES (83, 'Event', 28, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:18', NULL, NULL);
INSERT INTO `AuditLog` VALUES (84, 'Event', 28, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:48', NULL, NULL);
INSERT INTO `AuditLog` VALUES (85, 'Event', 29, 'INSERT', NULL, '{\"event_name\": \"Event 29\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:49', NULL, NULL);
INSERT INTO `AuditLog` VALUES (86, 'Event', 29, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:19', NULL, NULL);
INSERT INTO `AuditLog` VALUES (87, 'Event', 29, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:49', NULL, NULL);
INSERT INTO `AuditLog` VALUES (88, 'Event', 30, 'INSERT', NULL, '{\"event_name\": \"Event 30\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:50', NULL, NULL);
INSERT INTO `AuditLog` VALUES (89, 'Event', 30, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:20', NULL, NULL);
INSERT INTO `AuditLog` VALUES (90, 'Event', 30, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:50', NULL, NULL);
INSERT INTO `AuditLog` VALUES (91, 'Event', 31, 'INSERT', NULL, '{\"event_name\": \"Event 31\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (92, 'Event', 31, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (93, 'Event', 31, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (94, 'Event', 32, 'INSERT', NULL, '{\"event_name\": \"Event 32\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (95, 'Event', 32, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (96, 'Event', 32, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (97, 'Event', 33, 'INSERT', NULL, '{\"event_name\": \"Event 33\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (98, 'Event', 33, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (99, 'Event', 33, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (100, 'Event', 34, 'INSERT', NULL, '{\"event_name\": \"Event 34\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (101, 'Event', 34, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (102, 'Event', 34, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (103, 'Event', 35, 'INSERT', NULL, '{\"event_name\": \"Event 35\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:30:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (104, 'Event', 35, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (105, 'Event', 35, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:31:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (106, 'Event', 36, 'INSERT', NULL, '{\"event_name\": \"Event 36\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:30:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (107, 'Event', 36, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (108, 'Event', 36, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:31:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (109, 'Event', 37, 'INSERT', NULL, '{\"event_name\": \"Event 37\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:30:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (110, 'Event', 37, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (111, 'Event', 37, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:31:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (112, 'Event', 38, 'INSERT', NULL, '{\"event_name\": \"Event 38\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:30:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (113, 'Event', 38, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (114, 'Event', 38, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:31:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (115, 'Event', 39, 'INSERT', NULL, '{\"event_name\": \"Event 39\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:30:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (116, 'Event', 39, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (117, 'Event', 39, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:31:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (118, 'Event', 40, 'INSERT', NULL, '{\"event_name\": \"Event 40\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (119, 'Event', 40, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (120, 'Event', 40, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (121, 'Event', 41, 'INSERT', NULL, '{\"event_name\": \"Event 41\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:01', NULL, NULL);
INSERT INTO `AuditLog` VALUES (122, 'Event', 41, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:31', NULL, NULL);
INSERT INTO `AuditLog` VALUES (123, 'Event', 41, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:01', NULL, NULL);
INSERT INTO `AuditLog` VALUES (124, 'Event', 42, 'INSERT', NULL, '{\"event_name\": \"Event 42\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:02', NULL, NULL);
INSERT INTO `AuditLog` VALUES (125, 'Event', 42, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:32', NULL, NULL);
INSERT INTO `AuditLog` VALUES (126, 'Event', 42, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:02', NULL, NULL);
INSERT INTO `AuditLog` VALUES (127, 'Event', 43, 'INSERT', NULL, '{\"event_name\": \"Event 43\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:03', NULL, NULL);
INSERT INTO `AuditLog` VALUES (128, 'Event', 43, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:33', NULL, NULL);
INSERT INTO `AuditLog` VALUES (129, 'Event', 43, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:03', NULL, NULL);
INSERT INTO `AuditLog` VALUES (130, 'Event', 44, 'INSERT', NULL, '{\"event_name\": \"Event 44\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:04', NULL, NULL);
INSERT INTO `AuditLog` VALUES (131, 'Event', 44, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:34', NULL, NULL);
INSERT INTO `AuditLog` VALUES (132, 'Event', 44, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:04', NULL, NULL);
INSERT INTO `AuditLog` VALUES (133, 'Event', 45, 'INSERT', NULL, '{\"event_name\": \"Event 45\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:05', NULL, NULL);
INSERT INTO `AuditLog` VALUES (134, 'Event', 45, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:35', NULL, NULL);
INSERT INTO `AuditLog` VALUES (135, 'Event', 45, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:05', NULL, NULL);
INSERT INTO `AuditLog` VALUES (136, 'Event', 46, 'INSERT', NULL, '{\"event_name\": \"Event 46\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:06', NULL, NULL);
INSERT INTO `AuditLog` VALUES (137, 'Event', 46, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:36', NULL, NULL);
INSERT INTO `AuditLog` VALUES (138, 'Event', 46, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:06', NULL, NULL);
INSERT INTO `AuditLog` VALUES (139, 'Event', 47, 'INSERT', NULL, '{\"event_name\": \"Event 47\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:07', NULL, NULL);
INSERT INTO `AuditLog` VALUES (140, 'Event', 47, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:37', NULL, NULL);
INSERT INTO `AuditLog` VALUES (141, 'Event', 47, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:07', NULL, NULL);
INSERT INTO `AuditLog` VALUES (142, 'Event', 48, 'INSERT', NULL, '{\"event_name\": \"Event 48\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:08', NULL, NULL);
INSERT INTO `AuditLog` VALUES (143, 'Event', 48, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:38', NULL, NULL);
INSERT INTO `AuditLog` VALUES (144, 'Event', 48, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:08', NULL, NULL);
INSERT INTO `AuditLog` VALUES (145, 'Event', 49, 'INSERT', NULL, '{\"event_name\": \"Event 49\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:09', NULL, NULL);
INSERT INTO `AuditLog` VALUES (146, 'Event', 49, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:39', NULL, NULL);
INSERT INTO `AuditLog` VALUES (147, 'Event', 49, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:09', NULL, NULL);
INSERT INTO `AuditLog` VALUES (148, 'Event', 50, 'INSERT', NULL, '{\"event_name\": \"Event 50\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:10', NULL, NULL);
INSERT INTO `AuditLog` VALUES (149, 'Event', 50, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:40', NULL, NULL);
INSERT INTO `AuditLog` VALUES (150, 'Event', 50, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:10', NULL, NULL);
INSERT INTO `AuditLog` VALUES (151, 'Event', 51, 'INSERT', NULL, '{\"event_name\": \"Event 51\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:11', NULL, NULL);
INSERT INTO `AuditLog` VALUES (152, 'Event', 51, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:41', NULL, NULL);
INSERT INTO `AuditLog` VALUES (153, 'Event', 51, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:11', NULL, NULL);
INSERT INTO `AuditLog` VALUES (154, 'Event', 52, 'INSERT', NULL, '{\"event_name\": \"Event 52\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:12', NULL, NULL);
INSERT INTO `AuditLog` VALUES (155, 'Event', 52, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:42', NULL, NULL);
INSERT INTO `AuditLog` VALUES (156, 'Event', 52, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:12', NULL, NULL);
INSERT INTO `AuditLog` VALUES (157, 'Event', 53, 'INSERT', NULL, '{\"event_name\": \"Event 53\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:13', NULL, NULL);
INSERT INTO `AuditLog` VALUES (158, 'Event', 53, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:43', NULL, NULL);
INSERT INTO `AuditLog` VALUES (159, 'Event', 53, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:13', NULL, NULL);
INSERT INTO `AuditLog` VALUES (160, 'Event', 54, 'INSERT', NULL, '{\"event_name\": \"Event 54\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:14', NULL, NULL);
INSERT INTO `AuditLog` VALUES (161, 'Event', 54, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:44', NULL, NULL);
INSERT INTO `AuditLog` VALUES (162, 'Event', 54, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:14', NULL, NULL);
INSERT INTO `AuditLog` VALUES (163, 'Event', 55, 'INSERT', NULL, '{\"event_name\": \"Event 55\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:15', NULL, NULL);
INSERT INTO `AuditLog` VALUES (164, 'Event', 55, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:45', NULL, NULL);
INSERT INTO `AuditLog` VALUES (165, 'Event', 55, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:15', NULL, NULL);
INSERT INTO `AuditLog` VALUES (166, 'Event', 56, 'INSERT', NULL, '{\"event_name\": \"Event 56\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:16', NULL, NULL);
INSERT INTO `AuditLog` VALUES (167, 'Event', 56, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:46', NULL, NULL);
INSERT INTO `AuditLog` VALUES (168, 'Event', 56, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:16', NULL, NULL);
INSERT INTO `AuditLog` VALUES (169, 'Event', 57, 'INSERT', NULL, '{\"event_name\": \"Event 57\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:17', NULL, NULL);
INSERT INTO `AuditLog` VALUES (170, 'Event', 57, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:47', NULL, NULL);
INSERT INTO `AuditLog` VALUES (171, 'Event', 57, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:17', NULL, NULL);
INSERT INTO `AuditLog` VALUES (172, 'Event', 58, 'INSERT', NULL, '{\"event_name\": \"Event 58\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:18', NULL, NULL);
INSERT INTO `AuditLog` VALUES (173, 'Event', 58, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:48', NULL, NULL);
INSERT INTO `AuditLog` VALUES (174, 'Event', 58, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:18', NULL, NULL);
INSERT INTO `AuditLog` VALUES (175, 'Event', 59, 'INSERT', NULL, '{\"event_name\": \"Event 59\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:19', NULL, NULL);
INSERT INTO `AuditLog` VALUES (176, 'Event', 59, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:49', NULL, NULL);
INSERT INTO `AuditLog` VALUES (177, 'Event', 59, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:19', NULL, NULL);
INSERT INTO `AuditLog` VALUES (178, 'Event', 60, 'INSERT', NULL, '{\"event_name\": \"Event 60\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:20', NULL, NULL);
INSERT INTO `AuditLog` VALUES (179, 'Event', 60, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:50', NULL, NULL);
INSERT INTO `AuditLog` VALUES (180, 'Event', 60, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:20', NULL, NULL);
INSERT INTO `AuditLog` VALUES (181, 'Event', 61, 'INSERT', NULL, '{\"event_name\": \"Event 61\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (182, 'Event', 61, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (183, 'Event', 61, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (184, 'Event', 62, 'INSERT', NULL, '{\"event_name\": \"Event 62\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (185, 'Event', 62, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (186, 'Event', 62, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (187, 'Event', 63, 'INSERT', NULL, '{\"event_name\": \"Event 63\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (188, 'Event', 63, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (189, 'Event', 63, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (190, 'Event', 64, 'INSERT', NULL, '{\"event_name\": \"Event 64\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (191, 'Event', 64, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (192, 'Event', 64, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (193, 'Event', 65, 'INSERT', NULL, '{\"event_name\": \"Event 65\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (194, 'Event', 65, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (195, 'Event', 65, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (196, 'Event', 66, 'INSERT', NULL, '{\"event_name\": \"Event 66\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (197, 'Event', 66, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (198, 'Event', 66, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (199, 'Event', 67, 'INSERT', NULL, '{\"event_name\": \"Event 67\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (200, 'Event', 67, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (201, 'Event', 67, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (202, 'Event', 68, 'INSERT', NULL, '{\"event_name\": \"Event 68\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (203, 'Event', 68, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (204, 'Event', 68, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (205, 'Event', 69, 'INSERT', NULL, '{\"event_name\": \"Event 69\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (206, 'Event', 69, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:31:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (207, 'Event', 69, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (208, 'Event', 70, 'INSERT', NULL, '{\"event_name\": \"Event 70\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (209, 'Event', 70, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (210, 'Event', 70, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (211, 'Event', 71, 'INSERT', NULL, '{\"event_name\": \"Event 71\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:31', NULL, NULL);
INSERT INTO `AuditLog` VALUES (212, 'Event', 71, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:01', NULL, NULL);
INSERT INTO `AuditLog` VALUES (213, 'Event', 71, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:31', NULL, NULL);
INSERT INTO `AuditLog` VALUES (214, 'Event', 72, 'INSERT', NULL, '{\"event_name\": \"Event 72\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:32', NULL, NULL);
INSERT INTO `AuditLog` VALUES (215, 'Event', 72, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:02', NULL, NULL);
INSERT INTO `AuditLog` VALUES (216, 'Event', 72, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:32', NULL, NULL);
INSERT INTO `AuditLog` VALUES (217, 'Event', 73, 'INSERT', NULL, '{\"event_name\": \"Event 73\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:33', NULL, NULL);
INSERT INTO `AuditLog` VALUES (218, 'Event', 73, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:03', NULL, NULL);
INSERT INTO `AuditLog` VALUES (219, 'Event', 73, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:33', NULL, NULL);
INSERT INTO `AuditLog` VALUES (220, 'Event', 74, 'INSERT', NULL, '{\"event_name\": \"Event 74\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:34', NULL, NULL);
INSERT INTO `AuditLog` VALUES (221, 'Event', 74, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:04', NULL, NULL);
INSERT INTO `AuditLog` VALUES (222, 'Event', 74, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:34', NULL, NULL);
INSERT INTO `AuditLog` VALUES (223, 'Event', 75, 'INSERT', NULL, '{\"event_name\": \"Event 75\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:35', NULL, NULL);
INSERT INTO `AuditLog` VALUES (224, 'Event', 75, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:05', NULL, NULL);
INSERT INTO `AuditLog` VALUES (225, 'Event', 75, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:35', NULL, NULL);
INSERT INTO `AuditLog` VALUES (226, 'Event', 76, 'INSERT', NULL, '{\"event_name\": \"Event 76\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:36', NULL, NULL);
INSERT INTO `AuditLog` VALUES (227, 'Event', 76, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:06', NULL, NULL);
INSERT INTO `AuditLog` VALUES (228, 'Event', 76, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:36', NULL, NULL);
INSERT INTO `AuditLog` VALUES (229, 'Event', 77, 'INSERT', NULL, '{\"event_name\": \"Event 77\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:37', NULL, NULL);
INSERT INTO `AuditLog` VALUES (230, 'Event', 77, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:07', NULL, NULL);
INSERT INTO `AuditLog` VALUES (231, 'Event', 77, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:37', NULL, NULL);
INSERT INTO `AuditLog` VALUES (232, 'Event', 78, 'INSERT', NULL, '{\"event_name\": \"Event 78\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:38', NULL, NULL);
INSERT INTO `AuditLog` VALUES (233, 'Event', 78, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:08', NULL, NULL);
INSERT INTO `AuditLog` VALUES (234, 'Event', 78, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:38', NULL, NULL);
INSERT INTO `AuditLog` VALUES (235, 'Event', 79, 'INSERT', NULL, '{\"event_name\": \"Event 79\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:39', NULL, NULL);
INSERT INTO `AuditLog` VALUES (236, 'Event', 79, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:09', NULL, NULL);
INSERT INTO `AuditLog` VALUES (237, 'Event', 79, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:39', NULL, NULL);
INSERT INTO `AuditLog` VALUES (238, 'Event', 80, 'INSERT', NULL, '{\"event_name\": \"Event 80\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:40', NULL, NULL);
INSERT INTO `AuditLog` VALUES (239, 'Event', 80, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:10', NULL, NULL);
INSERT INTO `AuditLog` VALUES (240, 'Event', 80, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:40', NULL, NULL);
INSERT INTO `AuditLog` VALUES (241, 'Event', 81, 'INSERT', NULL, '{\"event_name\": \"Event 81\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:41', NULL, NULL);
INSERT INTO `AuditLog` VALUES (242, 'Event', 81, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:11', NULL, NULL);
INSERT INTO `AuditLog` VALUES (243, 'Event', 81, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:41', NULL, NULL);
INSERT INTO `AuditLog` VALUES (244, 'Event', 82, 'INSERT', NULL, '{\"event_name\": \"Event 82\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:42', NULL, NULL);
INSERT INTO `AuditLog` VALUES (245, 'Event', 82, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:12', NULL, NULL);
INSERT INTO `AuditLog` VALUES (246, 'Event', 82, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:42', NULL, NULL);
INSERT INTO `AuditLog` VALUES (247, 'Event', 83, 'INSERT', NULL, '{\"event_name\": \"Event 83\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:43', NULL, NULL);
INSERT INTO `AuditLog` VALUES (248, 'Event', 83, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:13', NULL, NULL);
INSERT INTO `AuditLog` VALUES (249, 'Event', 83, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:43', NULL, NULL);
INSERT INTO `AuditLog` VALUES (250, 'Event', 84, 'INSERT', NULL, '{\"event_name\": \"Event 84\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:44', NULL, NULL);
INSERT INTO `AuditLog` VALUES (251, 'Event', 84, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:14', NULL, NULL);
INSERT INTO `AuditLog` VALUES (252, 'Event', 84, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:44', NULL, NULL);
INSERT INTO `AuditLog` VALUES (253, 'Event', 85, 'INSERT', NULL, '{\"event_name\": \"Event 85\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:45', NULL, NULL);
INSERT INTO `AuditLog` VALUES (254, 'Event', 85, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:15', NULL, NULL);
INSERT INTO `AuditLog` VALUES (255, 'Event', 85, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:45', NULL, NULL);
INSERT INTO `AuditLog` VALUES (256, 'Event', 86, 'INSERT', NULL, '{\"event_name\": \"Event 86\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:46', NULL, NULL);
INSERT INTO `AuditLog` VALUES (257, 'Event', 86, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:16', NULL, NULL);
INSERT INTO `AuditLog` VALUES (258, 'Event', 86, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:46', NULL, NULL);
INSERT INTO `AuditLog` VALUES (259, 'Event', 87, 'INSERT', NULL, '{\"event_name\": \"Event 87\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:47', NULL, NULL);
INSERT INTO `AuditLog` VALUES (260, 'Event', 87, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:17', NULL, NULL);
INSERT INTO `AuditLog` VALUES (261, 'Event', 87, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:47', NULL, NULL);
INSERT INTO `AuditLog` VALUES (262, 'Event', 88, 'INSERT', NULL, '{\"event_name\": \"Event 88\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:48', NULL, NULL);
INSERT INTO `AuditLog` VALUES (263, 'Event', 88, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:18', NULL, NULL);
INSERT INTO `AuditLog` VALUES (264, 'Event', 88, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:48', NULL, NULL);
INSERT INTO `AuditLog` VALUES (265, 'Event', 89, 'INSERT', NULL, '{\"event_name\": \"Event 89\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:49', NULL, NULL);
INSERT INTO `AuditLog` VALUES (266, 'Event', 89, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:19', NULL, NULL);
INSERT INTO `AuditLog` VALUES (267, 'Event', 89, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:49', NULL, NULL);
INSERT INTO `AuditLog` VALUES (268, 'Event', 90, 'INSERT', NULL, '{\"event_name\": \"Event 90\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:50', NULL, NULL);
INSERT INTO `AuditLog` VALUES (269, 'Event', 90, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:20', NULL, NULL);
INSERT INTO `AuditLog` VALUES (270, 'Event', 90, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:50', NULL, NULL);
INSERT INTO `AuditLog` VALUES (271, 'Event', 91, 'INSERT', NULL, '{\"event_name\": \"Event 91\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (272, 'Event', 91, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:21', NULL, NULL);
INSERT INTO `AuditLog` VALUES (273, 'Event', 91, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:51', NULL, NULL);
INSERT INTO `AuditLog` VALUES (274, 'Event', 92, 'INSERT', NULL, '{\"event_name\": \"Event 92\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (275, 'Event', 92, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:22', NULL, NULL);
INSERT INTO `AuditLog` VALUES (276, 'Event', 92, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:52', NULL, NULL);
INSERT INTO `AuditLog` VALUES (277, 'Event', 93, 'INSERT', NULL, '{\"event_name\": \"Event 93\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (278, 'Event', 93, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:23', NULL, NULL);
INSERT INTO `AuditLog` VALUES (279, 'Event', 93, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:53', NULL, NULL);
INSERT INTO `AuditLog` VALUES (280, 'Event', 94, 'INSERT', NULL, '{\"event_name\": \"Event 94\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (281, 'Event', 94, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:24', NULL, NULL);
INSERT INTO `AuditLog` VALUES (282, 'Event', 94, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:54', NULL, NULL);
INSERT INTO `AuditLog` VALUES (283, 'Event', 95, 'INSERT', NULL, '{\"event_name\": \"Event 95\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:31:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (284, 'Event', 95, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:25', NULL, NULL);
INSERT INTO `AuditLog` VALUES (285, 'Event', 95, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:32:55', NULL, NULL);
INSERT INTO `AuditLog` VALUES (286, 'Event', 96, 'INSERT', NULL, '{\"event_name\": \"Event 96\", \"status\": \"PENDING_APPROVAL\"}', 86, '2026-01-23 03:31:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (287, 'Event', 96, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:26', NULL, NULL);
INSERT INTO `AuditLog` VALUES (288, 'Event', 96, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 86, '2026-01-23 03:32:56', NULL, NULL);
INSERT INTO `AuditLog` VALUES (289, 'Event', 97, 'INSERT', NULL, '{\"event_name\": \"Event 97\", \"status\": \"PENDING_APPROVAL\"}', 87, '2026-01-23 03:31:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (290, 'Event', 97, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:27', NULL, NULL);
INSERT INTO `AuditLog` VALUES (291, 'Event', 97, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 87, '2026-01-23 03:32:57', NULL, NULL);
INSERT INTO `AuditLog` VALUES (292, 'Event', 98, 'INSERT', NULL, '{\"event_name\": \"Event 98\", \"status\": \"PENDING_APPROVAL\"}', 88, '2026-01-23 03:31:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (293, 'Event', 98, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:28', NULL, NULL);
INSERT INTO `AuditLog` VALUES (294, 'Event', 98, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 88, '2026-01-23 03:32:58', NULL, NULL);
INSERT INTO `AuditLog` VALUES (295, 'Event', 99, 'INSERT', NULL, '{\"event_name\": \"Event 99\", \"status\": \"PENDING_APPROVAL\"}', 89, '2026-01-23 03:31:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (296, 'Event', 99, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:29', NULL, NULL);
INSERT INTO `AuditLog` VALUES (297, 'Event', 99, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 89, '2026-01-23 03:32:59', NULL, NULL);
INSERT INTO `AuditLog` VALUES (298, 'Event', 100, 'INSERT', NULL, '{\"event_name\": \"Event 100\", \"status\": \"PENDING_APPROVAL\"}', 85, '2026-01-23 03:32:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (299, 'Event', 100, 'UPDATE', '{\"status\": \"PENDING_APPROVAL\"}', '{\"status\": \"APPROVED\"}', 1, '2026-01-23 03:32:30', NULL, NULL);
INSERT INTO `AuditLog` VALUES (300, 'Event', 100, 'UPDATE', '{\"status\": \"APPROVED\"}', '{\"status\": \"PUBLISHED\"}', 85, '2026-01-23 03:33:00', NULL, NULL);
INSERT INTO `AuditLog` VALUES (90001, 'Venue', 120018, 'INSERT', 'null', '{\"address\": \"Aeon Bình tân\", \"capacity\": 0, \"city\": \"Hà Nội\", \"contact_phone\": null, \"venue_name\": \"Test\"}', 85, '2026-01-23 06:58:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0');
INSERT INTO `AuditLog` VALUES (120001, 'Event', 59, 'UPDATE', '{\"category_id\": 9, \"event_name\": \"Fashion Show Mùa Xuân\", \"status\": \"PENDING_APPROVAL\", \"venue_id\": 6}', '{\"category_id\": 9, \"event_name\": \"Fashion Show Mùa Xuân\", \"status\": \"PENDING_APPROVAL\", \"venue_id\": 6}', 85, '2026-01-23 07:59:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

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
INSERT INTO `Event` VALUES (43, 3, 16, 85, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-04-04 10:18:35', '2026-04-04 18:18:35', '2026-02-24 10:18:35', '2026-04-03 10:18:35', '/uploads/organizers/85/events/event_43_hội_thảo.jpg', NULL, 3000, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (44, 4, 9, 85, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-05-18 10:18:35', '2026-05-18 16:18:35', '2026-04-04 10:18:35', '2026-05-17 10:18:35', '/uploads/organizers/85/events/event_44_triển_lãm.jpg', NULL, 150, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (45, 5, 7, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-03-28 10:18:35', '2026-03-28 16:18:35', '2026-02-08 10:18:35', '2026-03-27 10:18:35', '/uploads/organizers/89/events/event_45_sân_khấu.jpg', NULL, 3500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (46, 6, 3, 87, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-07-02 10:18:35', '2026-07-02 17:18:35', '2026-05-30 10:18:35', '2026-07-01 10:18:35', '/uploads/organizers/87/events/event_46_ẩm_thực.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (47, 7, 21, 87, 'Workshop Digital Marketing', 'Workshop chuyên sâu về Digital Marketing', '2026-06-28 10:18:35', '2026-06-28 17:18:35', '2026-05-10 10:18:35', '2026-06-27 10:18:35', '/uploads/organizers/87/events/event_47_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (48, 8, 11, 87, 'Comedy Night with Trường Giang', 'Đêm hài kịch cùng danh hài Trường Giang', '2026-04-13 10:18:35', '2026-04-13 15:18:35', '2026-02-27 10:18:35', '2026-04-12 10:18:35', '/uploads/organizers/87/events/event_48_hài_kịch.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (49, 9, 23, 87, 'Fashion Show Mùa Đông', 'Tuần lễ thời trang Mùa Đông - Bộ sưu tập mới nhất', '2026-05-02 10:18:35', '2026-05-02 15:18:35', '2026-03-13 10:18:35', '2026-05-01 10:18:35', '/uploads/organizers/87/events/event_49_thời_trang.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (50, 10, 19, 88, 'Fun Run 42km', 'Chạy bộ vui vẻ cự ly 42km', '2026-03-24 10:18:35', '2026-03-24 15:18:35', '2026-01-30 10:18:35', '2026-03-23 10:18:35', '/uploads/organizers/88/events/event_50_marathon.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (51, 1, 7, 87, 'Music Festival Mùa Hè', 'Lễ hội âm nhạc Mùa Hè - Quy tụ các nghệ sĩ hàng đầu', '2026-06-14 10:18:35', '2026-06-14 16:18:35', '2026-04-26 10:18:35', '2026-06-13 10:18:35', '/uploads/organizers/87/events/event_51_âm_nhạc.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (52, 2, 24, 86, 'Giải Bóng rổ Miền Bắc', 'Giải đấu Bóng rổ chuyên nghiệp khu vực Miền Bắc', '2026-03-06 10:18:35', '2026-03-06 14:18:35', '2026-01-16 10:18:35', '2026-03-05 10:18:35', '/uploads/organizers/86/events/event_52_thể_thao.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (53, 3, 6, 85, 'Business Conference', 'Hội nghị kinh doanh và khởi nghiệp', '2026-02-18 10:18:35', '2026-02-18 17:18:35', '2026-01-10 10:18:35', '2026-02-17 10:18:35', '/uploads/organizers/85/events/event_53_hội_thảo.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (54, 4, 3, 87, 'Art Exhibition: Đen Vâu', 'Triển lãm tranh của họa sĩ Đen Vâu', '2026-04-28 10:18:35', '2026-04-28 14:18:35', '2026-03-08 10:18:35', '2026-04-27 10:18:35', '/uploads/organizers/87/events/event_54_triển_lãm.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (55, 5, 23, 86, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-06-21 10:18:35', '2026-06-21 13:18:35', '2026-05-11 10:18:35', '2026-06-20 10:18:35', '/uploads/organizers/86/events/event_55_sân_khấu.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (56, 6, 18, 88, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-03-19 10:18:35', '2026-03-19 17:18:35', '2026-02-09 10:18:35', '2026-03-18 10:18:35', '/uploads/organizers/88/events/event_56_ẩm_thực.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (57, 7, 12, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-04-21 10:18:35', '2026-04-21 13:18:35', '2026-03-04 10:18:35', '2026-04-20 10:18:35', '/uploads/organizers/88/events/event_57_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (58, 8, 20, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-05-04 10:18:35', '2026-05-04 15:18:35', '2026-03-25 10:18:35', '2026-05-03 10:18:35', '/uploads/organizers/85/events/event_58_hài_kịch.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (59, 9, 6, 85, 'Fashion Show Mùa Xuân', 'Tuần lễ thời trang Mùa Xuân - Bộ sưu tập mới nhất', '2026-05-23 10:18:00', '2026-05-23 16:18:00', '2026-04-18 10:18:00', '2026-05-22 10:18:00', '/uploads/organizers/85/events/event_59_thời_trang.jpg', 'https://qr.sepay.vn/img?acc=123456789&bank=MB&template=compact', 160, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 08:00:18', NULL, NULL);
INSERT INTO `Event` VALUES (60, 10, 23, 86, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-05-15 10:18:35', '2026-05-15 15:18:35', '2026-03-25 10:18:35', '2026-05-14 10:18:35', '/uploads/organizers/86/events/event_60_marathon.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (61, 1, 15, 86, 'Live Concert: Hòa Minzy', 'Đêm nhạc sống với Hòa Minzy - Trải nghiệm âm nhạc đỉnh cao', '2026-02-05 10:18:35', '2026-02-05 12:18:35', '2025-12-23 10:18:35', '2026-02-04 10:18:35', '/uploads/organizers/86/events/event_61_âm_nhạc.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (62, 2, 4, 87, 'Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Hà Nội FC và TP.HCM FC', '2026-02-24 10:18:35', '2026-02-24 18:18:35', '2026-01-06 10:18:35', '2026-02-23 10:18:35', '/uploads/organizers/87/events/event_62_thể_thao.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (63, 3, 20, 85, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-06-05 10:18:35', '2026-06-05 12:18:35', '2026-04-24 10:18:35', '2026-06-04 10:18:35', '/uploads/organizers/85/events/event_63_hội_thảo.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (64, 4, 15, 85, 'Triển lãm nghệ thuật Hiện Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Hiện Đại', '2026-03-12 10:18:35', '2026-03-12 17:18:35', '2026-01-20 10:18:35', '2026-03-11 10:18:35', '/uploads/organizers/85/events/event_64_triển_lãm.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (65, 5, 21, 85, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-04-08 10:18:35', '2026-04-08 14:18:35', '2026-02-18 10:18:35', '2026-04-07 10:18:35', '/uploads/organizers/85/events/event_65_sân_khấu.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (66, 6, 10, 89, 'Food Festival Mùa Hè', 'Lễ hội ẩm thực Mùa Hè - Hơn 100 gian hàng', '2026-05-08 10:18:35', '2026-05-08 14:18:35', '2026-03-30 10:18:35', '2026-05-07 10:18:35', '/uploads/organizers/89/events/event_66_ẩm_thực.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (67, 7, 15, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-06-11 10:18:35', '2026-06-11 13:18:35', '2026-04-25 10:18:35', '2026-06-10 10:18:35', '/uploads/organizers/88/events/event_67_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (68, 8, 14, 86, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-07-18 10:18:35', '2026-07-18 13:18:35', '2026-05-31 10:18:35', '2026-07-17 10:18:35', '/uploads/organizers/86/events/event_68_hài_kịch.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (69, 9, 15, 86, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-02-14 10:18:35', '2026-02-14 18:18:35', '2025-12-26 10:18:35', '2026-02-13 10:18:35', '/uploads/organizers/86/events/event_69_thời_trang.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (70, 10, 12, 88, 'Fun Run 5km', 'Chạy bộ vui vẻ cự ly 5km', '2026-06-25 10:18:35', '2026-06-25 13:18:35', '2026-05-14 10:18:35', '2026-06-24 10:18:35', '/uploads/organizers/88/events/event_70_marathon.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (71, 1, 10, 87, 'Music Festival Mùa Đông', 'Lễ hội âm nhạc Mùa Đông - Quy tụ các nghệ sĩ hàng đầu', '2026-05-06 10:18:35', '2026-05-06 17:18:35', '2026-03-17 10:18:35', '2026-05-05 10:18:35', '/uploads/organizers/87/events/event_71_âm_nhạc.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (72, 2, 1, 87, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-04-25 10:18:35', '2026-04-25 14:18:35', '2026-03-09 10:18:35', '2026-04-24 10:18:35', '/uploads/organizers/87/events/event_72_thể_thao.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (73, 3, 24, 86, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-06-26 10:18:35', '2026-06-26 17:18:35', '2026-05-07 10:18:35', '2026-06-25 10:18:35', '/uploads/organizers/86/events/event_73_hội_thảo.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (74, 4, 6, 87, 'Art Exhibition: Đen Vâu', 'Triển lãm tranh của họa sĩ Đen Vâu', '2026-02-10 10:18:35', '2026-02-10 15:18:35', '2025-12-30 10:18:35', '2026-02-09 10:18:35', '/uploads/organizers/87/events/event_74_triển_lãm.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (75, 5, 3, 88, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-02-12 10:18:35', '2026-02-12 15:18:35', '2025-12-24 10:18:35', '2026-02-11 10:18:35', '/uploads/organizers/88/events/event_75_sân_khấu.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (76, 6, 18, 88, 'Food Festival Mùa Đông', 'Lễ hội ẩm thực Mùa Đông - Hơn 100 gian hàng', '2026-07-13 10:18:35', '2026-07-13 13:18:35', '2026-05-29 10:18:35', '2026-07-12 10:18:35', '/uploads/organizers/88/events/event_76_ẩm_thực.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (77, 7, 6, 88, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-03-13 10:18:35', '2026-03-13 17:18:35', '2026-02-01 10:18:35', '2026-03-12 10:18:35', '/uploads/organizers/88/events/event_77_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (78, 8, 15, 86, 'Comedy Night with Trường Giang', 'Đêm hài kịch cùng danh hài Trường Giang', '2026-07-11 10:18:35', '2026-07-11 17:18:35', '2026-05-29 10:18:35', '2026-07-10 10:18:35', '/uploads/organizers/86/events/event_78_hài_kịch.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (79, 9, 21, 85, 'Runway Show: Đỗ Mạnh Cường', 'Show diễn thời trang của nhà thiết kế Đỗ Mạnh Cường', '2026-07-17 10:18:35', '2026-07-17 14:18:35', '2026-06-01 10:18:35', '2026-07-16 10:18:35', '/uploads/organizers/85/events/event_79_thời_trang.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (80, 10, 13, 86, 'Marathon Cần Thơ 2026', 'Giải marathon quốc tế Cần Thơ 2026', '2026-03-01 10:18:35', '2026-03-01 16:18:35', '2026-01-01 10:18:35', '2026-02-28 10:18:35', '/uploads/organizers/86/events/event_80_marathon.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (81, 1, 9, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-04-11 10:18:35', '2026-04-11 16:18:35', '2026-02-19 10:18:35', '2026-04-10 10:18:35', '/uploads/organizers/86/events/event_81_âm_nhạc.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (82, 2, 7, 89, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-06-03 10:18:35', '2026-06-03 17:18:35', '2026-04-23 10:18:35', '2026-06-02 10:18:35', '/uploads/organizers/89/events/event_82_thể_thao.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (83, 3, 12, 88, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-02-26 10:18:35', '2026-02-26 12:18:35', '2026-01-07 10:18:35', '2026-02-25 10:18:35', '/uploads/organizers/88/events/event_83_hội_thảo.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (84, 4, 21, 85, 'Art Exhibition: Hòa Minzy', 'Triển lãm tranh của họa sĩ Hòa Minzy', '2026-06-30 10:18:35', '2026-06-30 16:18:35', '2026-05-18 10:18:35', '2026-06-29 10:18:35', '/uploads/organizers/85/events/event_84_triển_lãm.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (85, 5, 16, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-05-30 10:18:35', '2026-05-30 13:18:35', '2026-04-15 10:18:35', '2026-05-29 10:18:35', '/uploads/organizers/89/events/event_85_sân_khấu.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (86, 6, 3, 88, 'Food Festival Mùa Đông', 'Lễ hội ẩm thực Mùa Đông - Hơn 100 gian hàng', '2026-04-16 10:18:35', '2026-04-16 14:18:35', '2026-02-24 10:18:35', '2026-04-15 10:18:35', '/uploads/organizers/88/events/event_86_ẩm_thực.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (87, 7, 9, 87, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-07-05 10:18:35', '2026-07-05 14:18:35', '2026-05-21 10:18:35', '2026-07-04 10:18:35', '/uploads/organizers/87/events/event_87_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (88, 8, 6, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-06-19 10:18:35', '2026-06-19 15:18:35', '2026-05-06 10:18:35', '2026-06-18 10:18:35', '/uploads/organizers/85/events/event_88_hài_kịch.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (89, 9, 20, 85, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-03-15 10:18:35', '2026-03-15 13:18:35', '2026-01-26 10:18:35', '2026-03-14 10:18:35', '/uploads/organizers/85/events/event_89_thời_trang.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (90, 10, 7, 89, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-04-30 10:18:35', '2026-04-30 17:18:35', '2026-03-15 10:18:35', '2026-04-29 10:18:35', '/uploads/organizers/89/events/event_90_marathon.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (91, 1, 12, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-05-21 10:18:35', '2026-05-21 14:18:35', '2026-04-01 10:18:35', '2026-05-20 10:18:35', '/uploads/organizers/86/events/event_91_âm_nhạc.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (92, 2, 22, 85, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-05-19 10:18:35', '2026-05-19 14:18:35', '2026-04-01 10:18:35', '2026-05-18 10:18:35', '/uploads/organizers/85/events/event_92_thể_thao.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (93, 3, 21, 85, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-03-03 10:18:35', '2026-03-03 13:18:35', '2026-01-14 10:18:35', '2026-03-02 10:18:35', '/uploads/organizers/85/events/event_93_hội_thảo.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (94, 4, 9, 87, 'Art Exhibition: Sơn Tùng MTP', 'Triển lãm tranh của họa sĩ Sơn Tùng MTP', '2026-06-07 10:18:35', '2026-06-07 18:18:35', '2026-04-28 10:18:35', '2026-06-06 10:18:35', '/uploads/organizers/87/events/event_94_triển_lãm.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (95, 5, 18, 88, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-06-23 10:18:35', '2026-06-23 16:18:35', '2026-05-12 10:18:35', '2026-06-22 10:18:35', '/uploads/organizers/88/events/event_95_sân_khấu.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (96, 6, 4, 89, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-02-20 10:18:35', '2026-02-20 15:18:35', '2026-01-04 10:18:35', '2026-02-19 10:18:35', '/uploads/organizers/89/events/event_96_ẩm_thực.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (97, 7, 3, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-05-25 10:18:35', '2026-05-25 14:18:35', '2026-04-11 10:18:35', '2026-05-24 10:18:35', '/uploads/organizers/88/events/event_97_workshop.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (98, 8, 1, 87, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-04-06 10:18:35', '2026-04-06 17:18:35', '2026-02-14 10:18:35', '2026-04-05 10:18:35', '/uploads/organizers/87/events/event_98_hài_kịch.jpg', NULL, 4500, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (99, 9, 2, 87, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-02-15 10:18:35', '2026-02-15 16:18:35', '2025-12-28 10:18:35', '2026-02-14 10:18:35', '/uploads/organizers/87/events/event_99_thời_trang.jpg', NULL, 900, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);
INSERT INTO `Event` VALUES (100, 10, 24, 86, 'Fun Run 21km', 'Chạy bộ vui vẻ cự ly 21km', '2026-07-14 10:18:35', '2026-07-14 15:18:35', '2026-05-24 10:18:35', '2026-07-13 10:18:35', '/uploads/organizers/86/events/event_100_marathon.jpg', NULL, 180, 0, 'PUBLISHED', 0, '2026-01-23 03:30:25', '2026-01-23 03:30:25', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of OrganizerInfo
-- ----------------------------
INSERT INTO `OrganizerInfo` VALUES (60006, 86, 'Công ty Tổ chức Sự kiện Sao Việt', 'Chuyên tổ chức các sự kiện âm nhạc, giải trí quy mô lớn tại Việt Nam', NULL, '2026-01-23 03:30:21', '2026-01-23 03:30:21', NULL);
INSERT INTO `OrganizerInfo` VALUES (60007, 87, 'Trung tâm Hội nghị và Triển lãm Quốc tế', 'Đơn vị hàng đầu về tổ chức hội thảo, triển lãm và sự kiện doanh nghiệp', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);
INSERT INTO `OrganizerInfo` VALUES (60008, 88, 'Công ty Sự kiện Thể thao Việt Nam', 'Chuyên tổ chức các giải đấu thể thao chuyên nghiệp và phong trào', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);
INSERT INTO `OrganizerInfo` VALUES (60009, 89, 'Trung tâm Văn hóa Nghệ thuật', 'Tổ chức các sự kiện văn hóa, nghệ thuật, triển lãm và biểu diễn', NULL, '2026-01-23 03:30:22', '2026-01-23 03:30:22', NULL);
INSERT INTO `OrganizerInfo` VALUES (60010, 85, 'Công ty TNHH Sự kiện Việt Nam', 'Tổ chức sự kiện chuyên nghiệp hàng đầu Việt Nam', NULL, '2026-01-23 03:30:21', '2026-01-23 03:30:21', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 122161 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Seat
-- ----------------------------
INSERT INTO `Seat` VALUES (122001, 146, 'A', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122002, 146, 'A', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122003, 146, 'A', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122004, 146, 'A', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122005, 146, 'B', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122006, 146, 'B', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122007, 146, 'B', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122008, 146, 'B', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122009, 146, 'C', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122010, 146, 'C', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122011, 146, 'C', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122012, 146, 'C', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122013, 146, 'D', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122014, 146, 'D', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122015, 146, 'D', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122016, 146, 'D', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122017, 146, 'E', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122018, 146, 'E', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122019, 146, 'E', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122020, 146, 'E', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122021, 146, 'F', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122022, 146, 'F', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122023, 146, 'F', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122024, 146, 'F', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122025, 146, 'G', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122026, 146, 'G', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122027, 146, 'G', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122028, 146, 'G', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122029, 146, 'H', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122030, 146, 'H', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122031, 146, 'H', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122032, 146, 'H', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122033, 146, 'I', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122034, 146, 'I', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122035, 146, 'I', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122036, 146, 'I', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122037, 146, 'J', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122038, 146, 'J', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122039, 146, 'J', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122040, 146, 'J', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122041, 146, 'K', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122042, 146, 'K', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122043, 146, 'K', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122044, 146, 'K', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122045, 146, 'L', '1', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122046, 146, 'L', '2', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122047, 146, 'L', '3', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122048, 146, 'L', '4', 'AVAILABLE', 1, 'Booth Seating', NULL, NULL);
INSERT INTO `Seat` VALUES (122049, 146, 'A', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122050, 146, 'A', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122051, 146, 'A', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122052, 146, 'A', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122053, 146, 'B', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122054, 146, 'B', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122055, 146, 'B', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122056, 146, 'B', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122057, 146, 'C', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122058, 146, 'C', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122059, 146, 'C', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122060, 146, 'C', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122061, 146, 'D', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122062, 146, 'D', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122063, 146, 'D', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122064, 146, 'D', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122065, 146, 'E', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122066, 146, 'E', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122067, 146, 'E', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122068, 146, 'E', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122069, 146, 'F', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122070, 146, 'F', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122071, 146, 'F', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122072, 146, 'F', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122073, 146, 'G', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122074, 146, 'G', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122075, 146, 'G', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122076, 146, 'G', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122077, 146, 'H', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122078, 146, 'H', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122079, 146, 'H', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122080, 146, 'H', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122081, 146, 'I', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122082, 146, 'I', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122083, 146, 'I', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122084, 146, 'I', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122085, 146, 'J', '1', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122086, 146, 'J', '2', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122087, 146, 'J', '3', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122088, 146, 'J', '4', 'AVAILABLE', 1, 'Window Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122089, 147, 'A', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122090, 147, 'A', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122091, 147, 'A', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122092, 147, 'A', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122093, 147, 'B', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122094, 147, 'B', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122095, 147, 'B', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122096, 147, 'B', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122097, 147, 'C', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122098, 147, 'C', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122099, 147, 'C', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122100, 147, 'C', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122101, 147, 'D', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122102, 147, 'D', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122103, 147, 'D', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122104, 147, 'D', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122105, 147, 'E', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122106, 147, 'E', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122107, 147, 'E', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122108, 147, 'E', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122109, 147, 'F', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122110, 147, 'F', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122111, 147, 'F', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122112, 147, 'F', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122113, 147, 'G', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122114, 147, 'G', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122115, 147, 'G', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122116, 147, 'G', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122117, 147, 'H', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122118, 147, 'H', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122119, 147, 'H', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122120, 147, 'H', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122121, 147, 'I', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122122, 147, 'I', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122123, 147, 'I', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122124, 147, 'I', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122125, 147, 'J', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122126, 147, 'J', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122127, 147, 'J', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122128, 147, 'J', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122129, 147, 'K', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122130, 147, 'K', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122131, 147, 'K', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122132, 147, 'K', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122133, 147, 'L', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122134, 147, 'L', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122135, 147, 'L', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122136, 147, 'L', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122137, 147, 'M', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122138, 147, 'M', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122139, 147, 'M', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122140, 147, 'M', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122141, 147, 'N', '1', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122142, 147, 'N', '2', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122143, 147, 'N', '3', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122144, 147, 'N', '4', 'AVAILABLE', 1, 'Center Tables', NULL, NULL);
INSERT INTO `Seat` VALUES (122145, 148, 'A', '1', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122146, 148, 'A', '2', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122147, 148, 'A', '3', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122148, 148, 'A', '4', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122149, 148, 'A', '5', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122150, 148, 'A', '6', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122151, 148, 'A', '7', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122152, 148, 'A', '8', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122153, 148, 'A', '9', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122154, 148, 'A', '10', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122155, 148, 'A', '11', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122156, 148, 'A', '12', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122157, 148, 'A', '13', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122158, 148, 'A', '14', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122159, 148, 'A', '15', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);
INSERT INTO `Seat` VALUES (122160, 148, 'A', '16', 'AVAILABLE', 1, 'Counter Seats', NULL, NULL);

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
INSERT INTO `TicketType` VALUES (1, 1, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 163, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (2, 1, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 466, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (3, 1, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 717, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (4, 2, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 71, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (5, 2, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 230, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (6, 2, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 497, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (7, 3, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 57, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (8, 3, 'Standard', 'Vé tiêu chuẩn', 350000.00, 516, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (9, 4, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 187, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (10, 4, 'Standard', 'Vé tiêu chuẩn', 100000.00, 409, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (11, 5, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 186, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (12, 5, 'Standard', 'Vé tiêu chuẩn', 350000.00, 402, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (13, 6, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 192, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (14, 6, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 279, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (15, 6, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 814, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (16, 7, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 87, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (17, 7, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 342, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (18, 7, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 798, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (19, 8, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 75, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (20, 8, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 371, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (21, 8, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 493, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (22, 9, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 750000.00, 58, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (23, 9, 'Standard', 'Vé tiêu chuẩn', 500000.00, 288, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (24, 10, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 189, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (25, 10, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 189, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (26, 10, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 410, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (27, 11, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 101, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (28, 11, 'Standard', 'Vé tiêu chuẩn', 400000.00, 280, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (29, 12, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 195, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (30, 12, 'Standard', 'Vé tiêu chuẩn', 400000.00, 214, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (31, 13, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 73, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (32, 13, 'Standard', 'Vé tiêu chuẩn', 200000.00, 642, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (33, 14, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 109, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (34, 14, 'Standard', 'Vé tiêu chuẩn', 350000.00, 428, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (35, 15, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 79, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (36, 15, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 117, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (37, 15, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 987, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (38, 16, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 128, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (39, 16, 'Standard', 'Vé tiêu chuẩn', 400000.00, 603, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (40, 17, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 132, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (41, 17, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 349, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (42, 17, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 863, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (43, 18, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 200000.00, 189, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (44, 18, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 100000.00, 199, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (45, 18, 'Economy', 'Vé phổ thông - Giá tốt nhất', 60000.00, 571, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (46, 19, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 130, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (47, 19, 'Standard', 'Vé tiêu chuẩn', 250000.00, 678, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (48, 20, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 109, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (49, 20, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 438, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (50, 20, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 362, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (51, 21, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 500000.00, 149, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (52, 21, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 250000.00, 197, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (53, 21, 'Economy', 'Vé phổ thông - Giá tốt nhất', 150000.00, 741, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (54, 22, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 133, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (55, 22, 'Standard', 'Vé tiêu chuẩn', 350000.00, 552, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (56, 23, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 200000.00, 90, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (57, 23, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 100000.00, 295, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (58, 23, 'Economy', 'Vé phổ thông - Giá tốt nhất', 60000.00, 618, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (59, 24, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 189, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (60, 24, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 111, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (61, 24, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 729, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (62, 25, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 117, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (63, 25, 'Standard', 'Vé tiêu chuẩn', 400000.00, 220, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (64, 26, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 152, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (65, 26, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 432, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (66, 26, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 922, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (67, 27, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 153, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (68, 27, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 249, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (69, 27, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 527, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (70, 28, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 131, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (71, 28, 'Standard', 'Vé tiêu chuẩn', 200000.00, 760, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (72, 29, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 175, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (73, 29, 'Standard', 'Vé tiêu chuẩn', 200000.00, 747, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (74, 30, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 176, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (75, 30, 'Standard', 'Vé tiêu chuẩn', 400000.00, 463, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (76, 31, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 76, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (77, 31, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 267, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (78, 31, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 362, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (79, 32, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 172, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (80, 32, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 333, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (81, 32, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 749, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (82, 33, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 500000.00, 130, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (83, 33, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 250000.00, 192, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (84, 33, 'Economy', 'Vé phổ thông - Giá tốt nhất', 150000.00, 503, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (85, 34, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 183, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (86, 34, 'Standard', 'Vé tiêu chuẩn', 200000.00, 212, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (87, 35, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 188, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (88, 35, 'Standard', 'Vé tiêu chuẩn', 100000.00, 513, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (89, 36, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 84, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (90, 36, 'Standard', 'Vé tiêu chuẩn', 250000.00, 488, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (91, 37, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 190, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (92, 37, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 359, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (93, 37, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 762, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (94, 38, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 150, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (95, 38, 'Standard', 'Vé tiêu chuẩn', 200000.00, 696, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (96, 39, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 131, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (97, 39, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 163, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (98, 39, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 847, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (99, 40, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 51, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (100, 40, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 399, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (101, 40, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 628, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (102, 41, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 225000.00, 196, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (103, 41, 'Standard', 'Vé tiêu chuẩn', 150000.00, 381, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (104, 42, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 197, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (105, 42, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 174, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (106, 42, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 239, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (107, 43, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 150, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (108, 43, 'Standard', 'Vé tiêu chuẩn', 250000.00, 286, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (109, 44, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 63, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (110, 44, 'Standard', 'Vé tiêu chuẩn', 350000.00, 498, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (111, 45, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 102, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (112, 45, 'Standard', 'Vé tiêu chuẩn', 350000.00, 753, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (113, 46, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 80, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (114, 46, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 203, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (115, 46, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 855, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (116, 47, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 200000.00, 62, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (117, 47, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 100000.00, 184, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (118, 47, 'Economy', 'Vé phổ thông - Giá tốt nhất', 60000.00, 787, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (119, 48, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 197, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (120, 48, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 148, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (121, 48, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 665, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (122, 49, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 98, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (123, 49, 'Standard', 'Vé tiêu chuẩn', 350000.00, 752, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (124, 50, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 450000.00, 163, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (125, 50, 'Standard', 'Vé tiêu chuẩn', 300000.00, 589, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (126, 51, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 136, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (127, 51, 'Standard', 'Vé tiêu chuẩn', 100000.00, 687, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (128, 52, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 450000.00, 191, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (129, 52, 'Standard', 'Vé tiêu chuẩn', 300000.00, 407, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (130, 53, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 83, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (131, 53, 'Standard', 'Vé tiêu chuẩn', 100000.00, 376, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (132, 54, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 88, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (133, 54, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 120, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (134, 54, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 652, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (135, 55, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 187, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (136, 55, 'Standard', 'Vé tiêu chuẩn', 100000.00, 696, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (137, 56, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 200000.00, 198, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (138, 56, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 100000.00, 149, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (139, 56, 'Economy', 'Vé phổ thông - Giá tốt nhất', 60000.00, 956, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (140, 57, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 500000.00, 84, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (141, 57, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 250000.00, 377, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (142, 57, 'Economy', 'Vé phổ thông - Giá tốt nhất', 150000.00, 588, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (143, 58, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 143, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (144, 58, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 399, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (145, 58, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 652, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (146, 59, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 500000.00, 88, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (147, 59, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 250000.00, 56, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (148, 59, 'Economy', 'Vé phổ thông - Giá tốt nhất', 150000.00, 16, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (149, 60, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 750000.00, 175, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (150, 60, 'Standard', 'Vé tiêu chuẩn', 500000.00, 326, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (151, 61, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 138, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (152, 61, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 453, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (153, 61, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 233, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (154, 62, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 57, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (155, 62, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 360, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (156, 62, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 932, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (157, 63, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 155, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (158, 63, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 387, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (159, 63, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 821, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (160, 64, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 132, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (161, 64, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 463, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (162, 64, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 266, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (163, 65, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 150, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (164, 65, 'Standard', 'Vé tiêu chuẩn', 250000.00, 766, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (165, 66, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 94, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (166, 66, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 390, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (167, 66, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 354, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (168, 67, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 167, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (169, 67, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 394, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (170, 67, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 762, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (171, 68, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 61, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (172, 68, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 161, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (173, 68, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 271, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (174, 69, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 750000.00, 55, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (175, 69, 'Standard', 'Vé tiêu chuẩn', 500000.00, 461, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (176, 70, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 51, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (177, 70, 'Standard', 'Vé tiêu chuẩn', 400000.00, 675, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (178, 71, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 225000.00, 96, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (179, 71, 'Standard', 'Vé tiêu chuẩn', 150000.00, 756, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (180, 72, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 63, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (181, 72, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 143, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (182, 72, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 322, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (183, 73, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 225000.00, 84, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (184, 73, 'Standard', 'Vé tiêu chuẩn', 150000.00, 373, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (185, 74, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 160, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (186, 74, 'Standard', 'Vé tiêu chuẩn', 250000.00, 727, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (187, 75, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 139, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (188, 75, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 234, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (189, 75, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 350, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (190, 76, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 146, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (191, 76, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 486, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (192, 76, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 504, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (193, 77, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 64, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (194, 77, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 400, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (195, 77, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 505, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (196, 78, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 70, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (197, 78, 'Standard', 'Vé tiêu chuẩn', 350000.00, 327, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (198, 79, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 800000.00, 149, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (199, 79, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 400000.00, 276, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (200, 79, 'Economy', 'Vé phổ thông - Giá tốt nhất', 240000.00, 542, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (201, 80, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 177, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (202, 80, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 326, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (203, 80, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 224, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (204, 81, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 94, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (205, 81, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 264, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (206, 81, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 826, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (207, 82, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 400000.00, 166, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (208, 82, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 200000.00, 391, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (209, 82, 'Economy', 'Vé phổ thông - Giá tốt nhất', 120000.00, 479, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (210, 83, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 186, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (211, 83, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 235, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (212, 83, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 672, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (213, 84, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 128, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (214, 84, 'Standard', 'Vé tiêu chuẩn', 400000.00, 601, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (215, 85, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 76, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (216, 85, 'Standard', 'Vé tiêu chuẩn', 100000.00, 460, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (217, 86, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 150000.00, 194, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (218, 86, 'Standard', 'Vé tiêu chuẩn', 100000.00, 707, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (219, 87, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 62, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (220, 87, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 379, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (221, 87, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 367, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (222, 88, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 139, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (223, 88, 'Standard', 'Vé tiêu chuẩn', 350000.00, 674, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (224, 89, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 195, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (225, 89, 'Standard', 'Vé tiêu chuẩn', 400000.00, 646, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (226, 90, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 375000.00, 109, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (227, 90, 'Standard', 'Vé tiêu chuẩn', 250000.00, 628, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (228, 91, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 700000.00, 191, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (229, 91, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 350000.00, 109, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (230, 91, 'Economy', 'Vé phổ thông - Giá tốt nhất', 210000.00, 235, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (231, 92, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 300000.00, 145, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (232, 92, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 150000.00, 500, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (233, 92, 'Economy', 'Vé phổ thông - Giá tốt nhất', 90000.00, 440, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (234, 93, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 88, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (235, 93, 'Standard', 'Vé tiêu chuẩn', 350000.00, 262, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (236, 94, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 225000.00, 135, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (237, 94, 'Standard', 'Vé tiêu chuẩn', 150000.00, 708, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (238, 95, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 525000.00, 145, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (239, 95, 'Standard', 'Vé tiêu chuẩn', 350000.00, 229, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (240, 96, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 57, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (241, 96, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 105, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (242, 96, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 570, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (243, 97, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 750000.00, 179, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (244, 97, 'Standard', 'Vé tiêu chuẩn', 500000.00, 569, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (245, 98, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 1000000.00, 196, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (246, 98, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 500000.00, 481, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (247, 98, 'Economy', 'Vé phổ thông - Giá tốt nhất', 300000.00, 502, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (248, 99, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 200000.00, 115, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (249, 99, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 100000.00, 221, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (250, 99, 'Economy', 'Vé phổ thông - Giá tốt nhất', 60000.00, 620, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (251, 100, 'VIP', 'Vé VIP - Chỗ ngồi tốt nhất', 600000.00, 183, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (252, 100, 'Standard', 'Vé tiêu chuẩn - Chỗ ngồi tốt', 300000.00, 267, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');
INSERT INTO `TicketType` VALUES (253, 100, 'Economy', 'Vé phổ thông - Giá tốt nhất', 180000.00, 907, 0, NULL, NULL, 10, 1, '2026-01-23 03:30:25');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of User
-- ----------------------------
INSERT INTO `User` VALUES (1, 1, 'admin', 'scrypt:32768:8:1$HKXKeeedAYqrtvX5$3c7b7ceeec68ba168c61c389405b495e7321a513311f7c492532231a3626ef987f192ec737ed0dd766ebb2b38e6176499cab0d3b1bc193b406872b15882ccd92', 'admin', '0901234567', '2026-01-12 16:37:37', '2026-01-16 01:30:34', 1);
INSERT INTO `User` VALUES (85, 2, 'organizer@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 1', '0987654321', '2026-01-17 06:39:29', '2026-01-23 02:56:33', 1);
INSERT INTO `User` VALUES (86, 2, 'organizer2@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 2', '0987654322', '2026-01-23 03:29:04', '2026-01-23 03:29:04', 1);
INSERT INTO `User` VALUES (87, 2, 'organizer3@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 3', '0987654323', '2026-01-23 03:29:04', '2026-01-23 03:29:04', 1);
INSERT INTO `User` VALUES (88, 2, 'organizer4@gmail.com', 'scrypt:32768:8:1$MYjySHjBI1Hhr5CL$f4f3274a6f28cb0a78ef6d328e58fb8c059afc30fe1f7ba1ebb29a3a98fd48969cc9d3638b78408236096cf1715e8a233bdd1cd2fd683c67f08312bf2b7e43f7', 'Organizer 4', '0123456789', '2026-01-17 06:39:30', '2026-01-23 04:13:33', 1);
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of Venue
-- ----------------------------
INSERT INTO `Venue` VALUES (1, 'Trung tâm Hội nghị Hồ Chí Minh', '123 Đường Lê Lợi, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 5000, '{\"areas\": [{\"cols\": 20, \"locked_seats\": [], \"name\": \"VIP - Hàng Đầu\", \"rows\": 10}, {\"cols\": 25, \"locked_seats\": [], \"name\": \"Standard - Giữa\", \"rows\": 20}, {\"cols\": 30, \"locked_seats\": [], \"name\": \"Economy - Sau\", \"rows\": 30}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 200, 500, 900, 85, NULL);
INSERT INTO `Venue` VALUES (2, 'Nhà hát Hồ Chí Minh', '456 Đường Trần Hưng Đạo, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 1000, '{\"areas\": [{\"cols\": 18, \"locked_seats\": [], \"name\": \"Stalls VIP\", \"rows\": 8}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Stalls Standard\", \"rows\": 12}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Dress Circle\", \"rows\": 6}, {\"cols\": 24, \"locked_seats\": [], \"name\": \"Upper Circle\", \"rows\": 10}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 276, 240, 240, 89, NULL);
INSERT INTO `Venue` VALUES (3, 'Cafe & Event Space Hồ Chí Minh', '789 Đường Nguyễn Huệ, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 200, '{\"areas\": [{\"cols\": 4, \"locked_seats\": [], \"name\": \"Sofa Lounge\", \"rows\": 10}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"High Tables\", \"rows\": 15}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Regular Tables\", \"rows\": 12}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 40, 108, 52, 88, NULL);
INSERT INTO `Venue` VALUES (4, 'Trung tâm Hội nghị Hà Nội', '123 Đường Lê Lợi, Quận 1, Hà Nội', 'Hà Nội', 5000, '{\"areas\": [{\"cols\": 22, \"locked_seats\": [], \"name\": \"Orchestra VIP\", \"rows\": 12}, {\"cols\": 28, \"locked_seats\": [], \"name\": \"Mezzanine\", \"rows\": 18}, {\"cols\": 32, \"locked_seats\": [], \"name\": \"Upper Circle\", \"rows\": 25}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 264, 504, 800, 88, NULL);
INSERT INTO `Venue` VALUES (5, 'Nhà hát Hà Nội', '456 Đường Trần Hưng Đạo, Quận 1, Hà Nội', 'Hà Nội', 1000, '{\"areas\": [{\"cols\": 16, \"locked_seats\": [], \"name\": \"Parterre VIP\", \"rows\": 10}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Grand Tier\", \"rows\": 5}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Balcony Tier\", \"rows\": 8}, {\"cols\": 24, \"locked_seats\": [], \"name\": \"Gallery\", \"rows\": 12}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 260, 176, 288, 89, NULL);
INSERT INTO `Venue` VALUES (6, 'Cafe & Event Space Hà Nội', '789 Đường Nguyễn Huệ, Quận 1, Hà Nội', 'Hà Nội', 200, '{\"areas\": [{\"cols\": 4, \"locked_seats\": [], \"name\": \"Booth Seating\", \"rows\": 12}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Window Tables\", \"rows\": 10}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Center Tables\", \"rows\": 14}, {\"cols\": 16, \"locked_seats\": [], \"name\": \"Counter Seats\", \"rows\": 1}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 48, 96, 16, 85, NULL);
INSERT INTO `Venue` VALUES (7, 'Trung tâm Hội nghị Đà Nẵng', '123 Đường Lê Lợi, Quận 1, Đà Nẵng', 'Đà Nẵng', 5000, '{\"areas\": [{\"cols\": 18, \"locked_seats\": [], \"name\": \"Floor VIP\", \"rows\": 15}, {\"cols\": 30, \"locked_seats\": [], \"name\": \"Lower Bowl\", \"rows\": 20}, {\"cols\": 35, \"locked_seats\": [], \"name\": \"Upper Bowl\", \"rows\": 30}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 270, 600, 1050, 89, NULL);
INSERT INTO `Venue` VALUES (8, 'Nhà hát Đà Nẵng', '456 Đường Trần Hưng Đạo, Quận 1, Đà Nẵng', 'Đà Nẵng', 1000, '{\"areas\": [{\"cols\": 20, \"locked_seats\": [], \"name\": \"Premium Orchestra\", \"rows\": 7}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Orchestra\", \"rows\": 15}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Mezzanine\", \"rows\": 8}, {\"cols\": 18, \"locked_seats\": [], \"name\": \"Balcony\", \"rows\": 10}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 140, 490, 180, 89, NULL);
INSERT INTO `Venue` VALUES (9, 'Cafe & Event Space Đà Nẵng', '789 Đường Nguyễn Huệ, Quận 1, Đà Nẵng', 'Đà Nẵng', 200, '{\"areas\": [{\"cols\": 6, \"locked_seats\": [], \"name\": \"Skyline VIP\", \"rows\": 8}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Lounge Pods\", \"rows\": 10}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Standard Seating\", \"rows\": 12}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 88, 48, 60, 87, NULL);
INSERT INTO `Venue` VALUES (10, 'Trung tâm Hội nghị Cần Thơ', '123 Đường Lê Lợi, Quận 1, Cần Thơ', 'Cần Thơ', 5000, '{\"areas\": [{\"cols\": 10, \"locked_seats\": [], \"name\": \"Premium Tables\", \"rows\": 40}, {\"cols\": 10, \"locked_seats\": [], \"name\": \"Standard Tables\", \"rows\": 80}, {\"cols\": 25, \"locked_seats\": [], \"name\": \"General Seating\", \"rows\": 40}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 400, 800, 1000, 88, NULL);
INSERT INTO `Venue` VALUES (11, 'Nhà hát Cần Thơ', '456 Đường Trần Hưng Đạo, Quận 1, Cần Thơ', 'Cần Thơ', 1000, '{\"areas\": [{\"cols\": 16, \"locked_seats\": [], \"name\": \"Front Center\", \"rows\": 8}, {\"cols\": 12, \"locked_seats\": [], \"name\": \"Side Left\", \"rows\": 15}, {\"cols\": 12, \"locked_seats\": [], \"name\": \"Side Right\", \"rows\": 15}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Rear Risers\", \"rows\": 12}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:22', 128, 360, 240, 88, NULL);
INSERT INTO `Venue` VALUES (12, 'Cafe & Event Space Cần Thơ', '789 Đường Nguyễn Huệ, Quận 1, Cần Thơ', 'Cần Thơ', 200, '{\"areas\": [{\"cols\": 8, \"locked_seats\": [], \"name\": \"Gazebo Seating\", \"rows\": 6}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Garden Tables\", \"rows\": 18}, {\"cols\": 6, \"locked_seats\": [], \"name\": \"Picnic Area\", \"rows\": 10}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 48, 72, 60, 88, NULL);
INSERT INTO `Venue` VALUES (13, 'Trung tâm Hội nghị Nha Trang', '123 Đường Lê Lợi, Quận 1, Nha Trang', 'Nha Trang', 5000, '{\"areas\": [{\"cols\": 25, \"locked_seats\": [], \"name\": \"Executive Front\", \"rows\": 8}, {\"cols\": 30, \"locked_seats\": [], \"name\": \"Business Class\", \"rows\": 25}, {\"cols\": 32, \"locked_seats\": [], \"name\": \"General Admission\", \"rows\": 35}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 200, 750, 1120, 86, NULL);
INSERT INTO `Venue` VALUES (14, 'Nhà hát Nha Trang', '456 Đường Trần Hưng Đạo, Quận 1, Nha Trang', 'Nha Trang', 1000, '{\"areas\": [{\"cols\": 18, \"locked_seats\": [], \"name\": \"Main Floor VIP\", \"rows\": 9}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Main Floor Standard\", \"rows\": 14}, {\"cols\": 16, \"locked_seats\": [], \"name\": \"Loge Level\", \"rows\": 6}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Terrace\", \"rows\": 11}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 258, 280, 242, 86, NULL);
INSERT INTO `Venue` VALUES (15, 'Cafe & Event Space Nha Trang', '789 Đường Nguyễn Huệ, Quận 1, Nha Trang', 'Nha Trang', 200, '{\"areas\": [{\"cols\": 6, \"locked_seats\": [], \"name\": \"Cabana VIP\", \"rows\": 8}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Deck Seating\", \"rows\": 16}, {\"cols\": 8, \"locked_seats\": [], \"name\": \"Beach Chairs\", \"rows\": 6}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 48, 112, 40, 86, NULL);
INSERT INTO `Venue` VALUES (16, 'Trung tâm Hội nghị Vũng Tàu', '123 Đường Lê Lợi, Quận 1, Vũng Tàu', 'Vũng Tàu', 5000, '{\"areas\": [{\"cols\": 20, \"locked_seats\": [], \"name\": \"Orchestra Pit\", \"rows\": 10}, {\"cols\": 28, \"locked_seats\": [], \"name\": \"Terrace Level\", \"rows\": 22}, {\"cols\": 35, \"locked_seats\": [], \"name\": \"Gallery\", \"rows\": 30}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 200, 616, 1050, 89, NULL);
INSERT INTO `Venue` VALUES (17, 'Nhà hát Vũng Tàu', '456 Đường Trần Hưng Đạo, Quận 1, Vũng Tàu', 'Vũng Tàu', 1000, '{\"areas\": [{\"cols\": 6, \"locked_seats\": [], \"name\": \"Premium Tables\", \"rows\": 20}, {\"cols\": 6, \"locked_seats\": [], \"name\": \"Standard Tables\", \"rows\": 35}, {\"cols\": 30, \"locked_seats\": [], \"name\": \"Bar Seating\", \"rows\": 3}, {\"cols\": 25, \"locked_seats\": [], \"name\": \"General Seating\", \"rows\": 10}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 120, 300, 340, 87, NULL);
INSERT INTO `Venue` VALUES (18, 'Cafe & Event Space Vũng Tàu', '789 Đường Nguyễn Huệ, Quận 1, Vũng Tàu', 'Vũng Tàu', 200, '{\"areas\": [{\"cols\": 5, \"locked_seats\": [], \"name\": \"Gallery Lounge\", \"rows\": 8}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Exhibition Tables\", \"rows\": 14}, {\"cols\": 6, \"locked_seats\": [], \"name\": \"Workshop Area\", \"rows\": 10}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 40, 116, 44, 88, NULL);
INSERT INTO `Venue` VALUES (19, 'Trung tâm Hội nghị Huế', '123 Đường Lê Lợi, Quận 1, Huế', 'Huế', 5000, '{\"areas\": [{\"cols\": 24, \"locked_seats\": [], \"name\": \"Field Level VIP\", \"rows\": 12}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Club Seats\", \"rows\": 8}, {\"cols\": 32, \"locked_seats\": [], \"name\": \"Lower Deck\", \"rows\": 25}, {\"cols\": 36, \"locked_seats\": [], \"name\": \"Upper Deck\", \"rows\": 30}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 448, 800, 1080, 89, NULL);
INSERT INTO `Venue` VALUES (20, 'Nhà hát Huế', '456 Đường Trần Hưng Đạo, Quận 1, Huế', 'Huế', 1000, '{\"areas\": [{\"cols\": 20, \"locked_seats\": [], \"name\": \"Imperial Stalls\", \"rows\": 8}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Mandarin Circle\", \"rows\": 12}, {\"cols\": 24, \"locked_seats\": [], \"name\": \"Upper Gallery\", \"rows\": 15}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 160, 264, 360, 85, NULL);
INSERT INTO `Venue` VALUES (21, 'Cafe & Event Space Huế', '789 Đường Nguyễn Huệ, Quận 1, Huế', 'Huế', 200, '{\"areas\": [{\"cols\": 8, \"locked_seats\": [], \"name\": \"Pavilion Seating\", \"rows\": 5}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Courtyard Tables\", \"rows\": 16}, {\"cols\": 8, \"locked_seats\": [], \"name\": \"Veranda\", \"rows\": 8}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Garden Benches\", \"rows\": 8}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 40, 128, 32, 85, NULL);
INSERT INTO `Venue` VALUES (22, 'Trung tâm Hội nghị Hải Phòng', '123 Đường Lê Lợi, Quận 1, Hải Phòng', 'Hải Phòng', 5000, '{\"areas\": [{\"cols\": 22, \"locked_seats\": [], \"name\": \"Platinum Zone\", \"rows\": 10}, {\"cols\": 24, \"locked_seats\": [], \"name\": \"Gold Zone\", \"rows\": 12}, {\"cols\": 30, \"locked_seats\": [], \"name\": \"Silver Zone\", \"rows\": 20}, {\"cols\": 34, \"locked_seats\": [], \"name\": \"Bronze Zone\", \"rows\": 28}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 508, 600, 952, 89, NULL);
INSERT INTO `Venue` VALUES (23, 'Nhà hát Hải Phòng', '456 Đường Trần Hưng Đạo, Quận 1, Hải Phòng', 'Hải Phòng', 1000, '{\"areas\": [{\"cols\": 12, \"locked_seats\": [], \"name\": \"Recliner VIP\", \"rows\": 6}, {\"cols\": 18, \"locked_seats\": [], \"name\": \"Premium Standard\", \"rows\": 10}, {\"cols\": 20, \"locked_seats\": [], \"name\": \"Standard\", \"rows\": 15}, {\"cols\": 22, \"locked_seats\": [], \"name\": \"Economy\", \"rows\": 12}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 72, 480, 264, 87, NULL);
INSERT INTO `Venue` VALUES (24, 'Cafe & Event Space Hải Phòng', '789 Đường Nguyễn Huệ, Quận 1, Hải Phòng', 'Hải Phòng', 200, '{\"areas\": [{\"cols\": 6, \"locked_seats\": [], \"name\": \"Mezzanine VIP\", \"rows\": 6}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Loft Lounge\", \"rows\": 8}, {\"cols\": 4, \"locked_seats\": [], \"name\": \"Main Floor\", \"rows\": 18}, {\"cols\": 16, \"locked_seats\": [], \"name\": \"Communal Table\", \"rows\": 2}]}', NULL, 1, 'ACTIVE', '2026-01-23 03:30:23', 68, 72, 32, 86, NULL);
INSERT INTO `Venue` VALUES (120018, 'Test', 'Aeon Bình tân', 'Hà Nội', 50, '{\"areas\": [{\"cols\": 10, \"locked_seats\": [], \"name\": \"Khu vực 1\", \"rows\": 5}]}', NULL, 1, 'ACTIVE', '2026-01-23 06:57:06', 0, 0, 0, 85, '<iframe width=\"100%\" height=\"450\" style=\"border:0\" loading=\"lazy\" allowfullscreen src=\"https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Aeon%20B%C3%ACnh%20t%C3%A2n%2C%20H%C3%A0%20N%E1%BB%99i\"></iframe>');

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
