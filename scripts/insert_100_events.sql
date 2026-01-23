-- =====================================================
-- Script to populate 100 events with full workflow
-- Generated: 2026-01-23 10:18:35
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. CREATE ADDITIONAL ORGANIZERS
-- =====================================================

-- Organizer 2
INSERT INTO `User` (`user_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `created_at`, `is_active`) VALUES
(86, 2, 'organizer2@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 2', '0987654322', NOW(), 1);

-- Organizer 3
INSERT INTO `User` (`user_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `created_at`, `is_active`) VALUES
(87, 2, 'organizer3@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 3', '0987654323', NOW(), 1);

-- Organizer 4
INSERT INTO `User` (`user_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `created_at`, `is_active`) VALUES
(88, 2, 'organizer4@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 4', '0987654324', NOW(), 1);

-- Organizer 5
INSERT INTO `User` (`user_id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `created_at`, `is_active`) VALUES
(89, 2, 'organizer5@gmail.com', 'scrypt:32768:8:1$BrKFbo5bbGR9tLgG$9be73a7a979c059177cfab2b05cbf880fc850873d206655dc9f181345e0da28ac096759a4fa17d08cba5e11931057e3a4e9a8d82dcab217a58a23d24695a4a69', 'Organizer 5', '0987654325', NOW(), 1);

-- Organizer Information
INSERT INTO `OrganizerInfo` (`user_id`, `organization_name`, `description`, `created_at`, `updated_at`) VALUES
(86, 'Công ty Tổ chức Sự kiện Sao Việt', 'Chuyên tổ chức các sự kiện âm nhạc, giải trí quy mô lớn tại Việt Nam', NOW(), NOW());

INSERT INTO `OrganizerInfo` (`user_id`, `organization_name`, `description`, `created_at`, `updated_at`) VALUES
(87, 'Trung tâm Hội nghị và Triển lãm Quốc tế', 'Đơn vị hàng đầu về tổ chức hội thảo, triển lãm và sự kiện doanh nghiệp', NOW(), NOW());

INSERT INTO `OrganizerInfo` (`user_id`, `organization_name`, `description`, `created_at`, `updated_at`) VALUES
(88, 'Công ty Sự kiện Thể thao Việt Nam', 'Chuyên tổ chức các giải đấu thể thao chuyên nghiệp và phong trào', NOW(), NOW());

INSERT INTO `OrganizerInfo` (`user_id`, `organization_name`, `description`, `created_at`, `updated_at`) VALUES
(89, 'Trung tâm Văn hóa Nghệ thuật', 'Tổ chức các sự kiện văn hóa, nghệ thuật, triển lãm và biểu diễn', NOW(), NOW());

-- =====================================================
-- 2. CREATE EVENT CATEGORIES
-- =====================================================

INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(1, 'Âm nhạc', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(2, 'Thể thao', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(3, 'Hội thảo', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(4, 'Triển lãm', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(5, 'Sân khấu', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(6, 'Ẩm thực', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(7, 'Workshop', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(8, 'Hài kịch', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(9, 'Thời trang', 1, NOW());
INSERT INTO `EventCategory` (`category_id`, `category_name`, `is_active`, `created_at`) VALUES
(10, 'Marathon', 1, NOW());

-- =====================================================
-- 3. CREATE VENUES
-- =====================================================

INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(1, 'Trung tâm Hội nghị Hồ Chí Minh', '123 Đường Lê Lợi, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 5000, 85, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(2, 'Nhà hát Hồ Chí Minh', '456 Đường Trần Hưng Đạo, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 1000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(3, 'Cafe & Event Space Hồ Chí Minh', '789 Đường Nguyễn Huệ, Quận 1, Hồ Chí Minh', 'Hồ Chí Minh', 200, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(4, 'Trung tâm Hội nghị Hà Nội', '123 Đường Lê Lợi, Quận 1, Hà Nội', 'Hà Nội', 5000, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(5, 'Nhà hát Hà Nội', '456 Đường Trần Hưng Đạo, Quận 1, Hà Nội', 'Hà Nội', 1000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(6, 'Cafe & Event Space Hà Nội', '789 Đường Nguyễn Huệ, Quận 1, Hà Nội', 'Hà Nội', 200, 85, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(7, 'Trung tâm Hội nghị Đà Nẵng', '123 Đường Lê Lợi, Quận 1, Đà Nẵng', 'Đà Nẵng', 5000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(8, 'Nhà hát Đà Nẵng', '456 Đường Trần Hưng Đạo, Quận 1, Đà Nẵng', 'Đà Nẵng', 1000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(9, 'Cafe & Event Space Đà Nẵng', '789 Đường Nguyễn Huệ, Quận 1, Đà Nẵng', 'Đà Nẵng', 200, 87, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(10, 'Trung tâm Hội nghị Cần Thơ', '123 Đường Lê Lợi, Quận 1, Cần Thơ', 'Cần Thơ', 5000, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(11, 'Nhà hát Cần Thơ', '456 Đường Trần Hưng Đạo, Quận 1, Cần Thơ', 'Cần Thơ', 1000, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(12, 'Cafe & Event Space Cần Thơ', '789 Đường Nguyễn Huệ, Quận 1, Cần Thơ', 'Cần Thơ', 200, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(13, 'Trung tâm Hội nghị Nha Trang', '123 Đường Lê Lợi, Quận 1, Nha Trang', 'Nha Trang', 5000, 86, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(14, 'Nhà hát Nha Trang', '456 Đường Trần Hưng Đạo, Quận 1, Nha Trang', 'Nha Trang', 1000, 86, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(15, 'Cafe & Event Space Nha Trang', '789 Đường Nguyễn Huệ, Quận 1, Nha Trang', 'Nha Trang', 200, 86, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(16, 'Trung tâm Hội nghị Vũng Tàu', '123 Đường Lê Lợi, Quận 1, Vũng Tàu', 'Vũng Tàu', 5000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(17, 'Nhà hát Vũng Tàu', '456 Đường Trần Hưng Đạo, Quận 1, Vũng Tàu', 'Vũng Tàu', 1000, 87, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(18, 'Cafe & Event Space Vũng Tàu', '789 Đường Nguyễn Huệ, Quận 1, Vũng Tàu', 'Vũng Tàu', 200, 88, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(19, 'Trung tâm Hội nghị Huế', '123 Đường Lê Lợi, Quận 1, Huế', 'Huế', 5000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(20, 'Nhà hát Huế', '456 Đường Trần Hưng Đạo, Quận 1, Huế', 'Huế', 1000, 85, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(21, 'Cafe & Event Space Huế', '789 Đường Nguyễn Huệ, Quận 1, Huế', 'Huế', 200, 85, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(22, 'Trung tâm Hội nghị Hải Phòng', '123 Đường Lê Lợi, Quận 1, Hải Phòng', 'Hải Phòng', 5000, 89, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(23, 'Nhà hát Hải Phòng', '456 Đường Trần Hưng Đạo, Quận 1, Hải Phòng', 'Hải Phòng', 1000, 87, 1, 'ACTIVE', NOW());
INSERT INTO `Venue` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `manager_id`, `is_active`, `status`, `created_at`) VALUES
(24, 'Cafe & Event Space Hải Phòng', '789 Đường Nguyễn Huệ, Quận 1, Hải Phòng', 'Hải Phòng', 200, 86, 1, 'ACTIVE', NOW());

-- =====================================================
-- 4. CREATE 100 EVENTS
-- =====================================================

-- Event 1: Music Festival Mùa Đông
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 1, 17, 88, 'Music Festival Mùa Đông', 'Lễ hội âm nhạc Mùa Đông - Quy tụ các nghệ sĩ hàng đầu', '2026-05-27 10:18:35', '2026-05-27 14:18:35', '2026-04-19 10:18:35', '2026-05-26 10:18:35', '/uploads/organizers/88/events/event_1_âm_nhạc.jpg', 1000, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 2: Giải Bóng đá Miền Trung
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(2, 2, 10, 89, 'Giải Bóng đá Miền Trung', 'Giải đấu Bóng đá chuyên nghiệp khu vực Miền Trung', '2026-07-02 10:18:35', '2026-07-02 15:18:35', '2026-05-13 10:18:35', '2026-07-01 10:18:35', '/uploads/organizers/89/events/event_2_thể_thao.jpg', 2237, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 3: Digital Marketing Workshop
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(3, 3, 21, 87, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-04-15 10:18:35', '2026-04-15 15:18:35', '2026-03-04 10:18:35', '2026-04-14 10:18:35', '/uploads/organizers/87/events/event_3_hội_thảo.jpg', 123, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 4: Triển lãm nghệ thuật Đương Đại
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(4, 4, 5, 87, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-02-27 10:18:35', '2026-02-27 15:18:35', '2026-01-24 10:18:35', '2026-02-26 10:18:35', '/uploads/organizers/87/events/event_4_triển_lãm.jpg', 644, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 5: Kịch: Số Đỏ
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(5, 5, 8, 87, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-07-09 10:18:35', '2026-07-09 16:18:35', '2026-05-20 10:18:35', '2026-07-08 10:18:35', '/uploads/organizers/87/events/event_5_sân_khấu.jpg', 491, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 6: Street Food Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(6, 6, 11, 88, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-03-07 10:18:35', '2026-03-07 12:18:35', '2026-01-06 10:18:35', '2026-03-06 10:18:35', '/uploads/organizers/88/events/event_6_ẩm_thực.jpg', 766, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 7: Khóa học Lập trình Python
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(7, 7, 17, 87, 'Khóa học Lập trình Python', 'Khóa học thực hành Lập trình Python từ cơ bản đến nâng cao', '2026-01-31 10:18:35', '2026-01-31 17:18:35', '2025-12-02 10:18:35', '2026-01-30 10:18:35', '/uploads/organizers/87/events/event_7_workshop.jpg', 57, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 8: Stand-up Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(8, 8, 16, 86, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-02-23 10:18:35', '2026-02-23 16:18:35', '2026-01-15 10:18:35', '2026-02-22 10:18:35', '/uploads/organizers/86/events/event_8_hài_kịch.jpg', 469, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 9: Fashion Show Mùa Hè
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(9, 9, 14, 86, 'Fashion Show Mùa Hè', 'Tuần lễ thời trang Mùa Hè - Bộ sưu tập mới nhất', '2026-06-18 10:18:35', '2026-06-18 16:18:35', '2026-05-15 10:18:35', '2026-06-17 10:18:35', '/uploads/organizers/86/events/event_9_thời_trang.jpg', 624, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 10: Marathon Vũng Tàu 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(10, 10, 22, 85, 'Marathon Vũng Tàu 2026', 'Giải marathon quốc tế Vũng Tàu 2026', '2026-02-07 10:18:35', '2026-02-07 18:18:35', '2025-12-30 10:18:35', '2026-02-06 10:18:35', '/uploads/organizers/85/events/event_10_marathon.jpg', 2942, 0, 'PUBLISHED', 1, NOW(), NOW());

-- Event 11: Acoustic Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(11, 1, 17, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-03-27 10:18:35', '2026-03-27 17:18:35', '2026-02-11 10:18:35', '2026-03-26 10:18:35', '/uploads/organizers/86/events/event_11_âm_nhạc.jpg', 380, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 12: Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(12, 2, 16, 88, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-07-16 10:18:35', '2026-07-16 18:18:35', '2026-05-20 10:18:35', '2026-07-15 10:18:35', '/uploads/organizers/88/events/event_12_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 13: Digital Marketing Workshop
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(13, 3, 2, 87, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-07-18 10:18:35', '2026-07-18 12:18:35', '2026-06-09 10:18:35', '2026-07-17 10:18:35', '/uploads/organizers/87/events/event_13_hội_thảo.jpg', 175, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 14: Art Exhibition: Mỹ Tâm
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(14, 4, 20, 87, 'Art Exhibition: Mỹ Tâm', 'Triển lãm tranh của họa sĩ Mỹ Tâm', '2026-03-22 10:18:35', '2026-03-22 16:18:35', '2026-02-09 10:18:35', '2026-03-21 10:18:35', '/uploads/organizers/87/events/event_14_triển_lãm.jpg', 539, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 15: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(15, 5, 5, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-04-02 10:18:35', '2026-04-02 17:18:35', '2026-03-03 10:18:35', '2026-04-01 10:18:35', '/uploads/organizers/89/events/event_15_sân_khấu.jpg', 991, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 16: Food Festival Mùa Hè
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(16, 6, 16, 87, 'Food Festival Mùa Hè', 'Lễ hội ẩm thực Mùa Hè - Hơn 100 gian hàng', '2026-04-02 10:18:35', '2026-04-02 16:18:35', '2026-02-19 10:18:35', '2026-04-01 10:18:35', '/uploads/organizers/87/events/event_16_ẩm_thực.jpg', 4127, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 17: Khóa học Thiết kế đồ họa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(17, 7, 14, 89, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-05-26 10:18:35', '2026-05-26 12:18:35', '2026-04-19 10:18:35', '2026-05-25 10:18:35', '/uploads/organizers/89/events/event_17_workshop.jpg', 59, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 18: Comedy Night with Trấn Thành
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(18, 8, 17, 85, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-03-20 10:18:35', '2026-03-20 12:18:35', '2026-02-12 10:18:35', '2026-03-19 10:18:35', '/uploads/organizers/85/events/event_18_hài_kịch.jpg', 621, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 19: Fashion Show Mùa Hè
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(19, 9, 2, 85, 'Fashion Show Mùa Hè', 'Tuần lễ thời trang Mùa Hè - Bộ sưu tập mới nhất', '2026-03-26 10:18:35', '2026-03-26 12:18:35', '2026-02-05 10:18:35', '2026-03-25 10:18:35', '/uploads/organizers/85/events/event_19_thời_trang.jpg', 352, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 20: Marathon Hải Phòng 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(20, 10, 1, 87, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-02-01 10:18:35', '2026-02-01 15:18:35', '2025-12-03 10:18:35', '2026-01-31 10:18:35', '/uploads/organizers/87/events/event_20_marathon.jpg', 2647, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 21: Live Concert: Noo Phước Thịnh
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(21, 1, 19, 89, 'Live Concert: Noo Phước Thịnh', 'Đêm nhạc sống với Noo Phước Thịnh - Trải nghiệm âm nhạc đỉnh cao', '2026-06-18 10:18:35', '2026-06-18 13:18:35', '2026-04-24 10:18:35', '2026-06-17 10:18:35', '/uploads/organizers/89/events/event_21_âm_nhạc.jpg', 1261, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 22: Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(22, 2, 19, 89, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-07-08 10:18:35', '2026-07-08 18:18:35', '2026-06-07 10:18:35', '2026-07-07 10:18:35', '/uploads/organizers/89/events/event_22_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 23: Business Conference
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(23, 3, 9, 86, 'Business Conference', 'Hội nghị kinh doanh và khởi nghiệp', '2026-03-19 10:18:35', '2026-03-19 17:18:35', '2026-01-31 10:18:35', '2026-03-18 10:18:35', '/uploads/organizers/86/events/event_23_hội_thảo.jpg', 200, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 24: Art Exhibition: Sơn Tùng MTP
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(24, 4, 1, 87, 'Art Exhibition: Sơn Tùng MTP', 'Triển lãm tranh của họa sĩ Sơn Tùng MTP', '2026-05-27 10:18:35', '2026-05-27 16:18:35', '2026-04-02 10:18:35', '2026-05-26 10:18:35', '/uploads/organizers/87/events/event_24_triển_lãm.jpg', 493, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 25: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(25, 5, 2, 86, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-04-19 10:18:35', '2026-04-19 16:18:35', '2026-03-03 10:18:35', '2026-04-18 10:18:35', '/uploads/organizers/86/events/event_25_sân_khấu.jpg', 598, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 26: Food Festival Mùa Thu
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(26, 6, 22, 89, 'Food Festival Mùa Thu', 'Lễ hội ẩm thực Mùa Thu - Hơn 100 gian hàng', '2026-03-26 10:18:35', '2026-03-26 17:18:35', '2026-02-10 10:18:35', '2026-03-25 10:18:35', '/uploads/organizers/89/events/event_26_ẩm_thực.jpg', 2697, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 27: Workshop Photography
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(27, 7, 13, 88, 'Workshop Photography', 'Workshop chuyên sâu về Photography', '2026-03-17 10:18:35', '2026-03-17 14:18:35', '2026-01-30 10:18:35', '2026-03-16 10:18:35', '/uploads/organizers/88/events/event_27_workshop.jpg', 53, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 28: Stand-up Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(28, 8, 8, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-05-29 10:18:35', '2026-05-29 14:18:35', '2026-04-26 10:18:35', '2026-05-28 10:18:35', '/uploads/organizers/85/events/event_28_hài_kịch.jpg', 395, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 29: Runway Show: Công Trí
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(29, 9, 24, 89, 'Runway Show: Công Trí', 'Show diễn thời trang của nhà thiết kế Công Trí', '2026-02-04 10:18:35', '2026-02-04 15:18:35', '2025-12-25 10:18:35', '2026-02-03 10:18:35', '/uploads/organizers/89/events/event_29_thời_trang.jpg', 200, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 30: Marathon Hồ Chí Minh 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(30, 10, 4, 87, 'Marathon Hồ Chí Minh 2026', 'Giải marathon quốc tế Hồ Chí Minh 2026', '2026-05-13 10:18:35', '2026-05-13 14:18:35', '2026-03-23 10:18:35', '2026-05-12 10:18:35', '/uploads/organizers/87/events/event_30_marathon.jpg', 3235, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 31: Acoustic Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(31, 1, 17, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-07-06 10:18:35', '2026-07-06 14:18:35', '2026-05-31 10:18:35', '2026-07-05 10:18:35', '/uploads/organizers/86/events/event_31_âm_nhạc.jpg', 211, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 32: Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(32, 2, 13, 86, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-01-30 10:18:35', '2026-01-30 14:18:35', '2025-12-13 10:18:35', '2026-01-29 10:18:35', '/uploads/organizers/86/events/event_32_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 33: Tech Summit 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(33, 3, 22, 87, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-05-12 10:18:35', '2026-05-12 14:18:35', '2026-04-10 10:18:35', '2026-05-11 10:18:35', '/uploads/organizers/87/events/event_33_hội_thảo.jpg', 817, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 34: Triển lãm nghệ thuật Đương Đại
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(34, 4, 14, 87, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-07-09 10:18:35', '2026-07-09 12:18:35', '2026-05-25 10:18:35', '2026-07-08 10:18:35', '/uploads/organizers/87/events/event_34_triển_lãm.jpg', 812, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 35: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(35, 5, 16, 85, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-03-08 10:18:35', '2026-03-08 13:18:35', '2026-01-08 10:18:35', '2026-03-07 10:18:35', '/uploads/organizers/85/events/event_35_sân_khấu.jpg', 1480, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 36: Food Festival Mùa Thu
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(36, 6, 11, 87, 'Food Festival Mùa Thu', 'Lễ hội ẩm thực Mùa Thu - Hơn 100 gian hàng', '2026-06-08 10:18:35', '2026-06-08 16:18:35', '2026-04-30 10:18:35', '2026-06-07 10:18:35', '/uploads/organizers/87/events/event_36_ẩm_thực.jpg', 1000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 37: Khóa học Nhiếp ảnh
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(37, 7, 13, 86, 'Khóa học Nhiếp ảnh', 'Khóa học thực hành Nhiếp ảnh từ cơ bản đến nâng cao', '2026-03-20 10:18:35', '2026-03-20 12:18:35', '2026-01-19 10:18:35', '2026-03-19 10:18:35', '/uploads/organizers/86/events/event_37_workshop.jpg', 61, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 38: Comedy Night with Trấn Thành
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(38, 8, 22, 87, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-05-08 10:18:35', '2026-05-08 15:18:35', '2026-03-27 10:18:35', '2026-05-07 10:18:35', '/uploads/organizers/87/events/event_38_hài_kịch.jpg', 716, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 39: Runway Show: Lê Thanh Hòa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(39, 9, 18, 85, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-04-20 10:18:35', '2026-04-20 17:18:35', '2026-03-13 10:18:35', '2026-04-19 10:18:35', '/uploads/organizers/85/events/event_39_thời_trang.jpg', 200, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 40: Fun Run 21km
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(40, 10, 11, 89, 'Fun Run 21km', 'Chạy bộ vui vẻ cự ly 21km', '2026-02-28 10:18:35', '2026-02-28 13:18:35', '2026-01-02 10:18:35', '2026-02-27 10:18:35', '/uploads/organizers/89/events/event_40_marathon.jpg', 931, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 41: Music Festival Mùa Xuân
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(41, 1, 16, 87, 'Music Festival Mùa Xuân', 'Lễ hội âm nhạc Mùa Xuân - Quy tụ các nghệ sĩ hàng đầu', '2026-06-13 10:18:35', '2026-06-13 14:18:35', '2026-05-09 10:18:35', '2026-06-12 10:18:35', '/uploads/organizers/87/events/event_41_âm_nhạc.jpg', 4099, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 42: Trận cầu đỉnh cao: HAGL vs Thanh Hóa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(42, 2, 22, 89, 'Trận cầu đỉnh cao: HAGL vs Thanh Hóa', 'Trận đấu kịch tính giữa HAGL và Thanh Hóa', '2026-06-09 10:18:35', '2026-06-09 12:18:35', '2026-04-21 10:18:35', '2026-06-08 10:18:35', '/uploads/organizers/89/events/event_42_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 43: Tech Summit 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(43, 3, 1, 85, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-01-30 10:18:35', '2026-01-30 14:18:35', '2025-12-02 10:18:35', '2026-01-29 10:18:35', '/uploads/organizers/85/events/event_43_hội_thảo.jpg', 373, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 44: Triển lãm nghệ thuật Đương Đại
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(44, 4, 4, 85, 'Triển lãm nghệ thuật Đương Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Đương Đại', '2026-07-19 10:18:35', '2026-07-19 14:18:35', '2026-06-09 10:18:35', '2026-07-18 10:18:35', '/uploads/organizers/85/events/event_44_triển_lãm.jpg', 822, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 45: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(45, 5, 11, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-04-23 10:18:35', '2026-04-23 15:18:35', '2026-02-26 10:18:35', '2026-04-22 10:18:35', '/uploads/organizers/89/events/event_45_sân_khấu.jpg', 539, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 46: Street Food Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(46, 6, 22, 87, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-06-30 10:18:35', '2026-06-30 16:18:35', '2026-05-23 10:18:35', '2026-06-29 10:18:35', '/uploads/organizers/87/events/event_46_ẩm_thực.jpg', 633, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 47: Workshop Digital Marketing
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(47, 7, 17, 87, 'Workshop Digital Marketing', 'Workshop chuyên sâu về Digital Marketing', '2026-07-07 10:18:35', '2026-07-07 16:18:35', '2026-05-20 10:18:35', '2026-07-06 10:18:35', '/uploads/organizers/87/events/event_47_workshop.jpg', 184, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 48: Comedy Night with Trường Giang
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(48, 8, 16, 87, 'Comedy Night with Trường Giang', 'Đêm hài kịch cùng danh hài Trường Giang', '2026-07-11 10:18:35', '2026-07-11 14:18:35', '2026-05-25 10:18:35', '2026-07-10 10:18:35', '/uploads/organizers/87/events/event_48_hài_kịch.jpg', 848, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 49: Fashion Show Mùa Đông
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(49, 9, 17, 87, 'Fashion Show Mùa Đông', 'Tuần lễ thời trang Mùa Đông - Bộ sưu tập mới nhất', '2026-05-02 10:18:35', '2026-05-02 15:18:35', '2026-03-22 10:18:35', '2026-05-01 10:18:35', '/uploads/organizers/87/events/event_49_thời_trang.jpg', 353, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 50: Fun Run 42km
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(50, 10, 8, 88, 'Fun Run 42km', 'Chạy bộ vui vẻ cự ly 42km', '2026-05-18 10:18:35', '2026-05-18 18:18:35', '2026-04-11 10:18:35', '2026-05-17 10:18:35', '/uploads/organizers/88/events/event_50_marathon.jpg', 705, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 51: Music Festival Mùa Hè
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(51, 1, 16, 87, 'Music Festival Mùa Hè', 'Lễ hội âm nhạc Mùa Hè - Quy tụ các nghệ sĩ hàng đầu', '2026-04-01 10:18:35', '2026-04-01 14:18:35', '2026-02-27 10:18:35', '2026-03-31 10:18:35', '/uploads/organizers/87/events/event_51_âm_nhạc.jpg', 2521, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 52: Giải Bóng rổ Miền Bắc
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(52, 2, 13, 86, 'Giải Bóng rổ Miền Bắc', 'Giải đấu Bóng rổ chuyên nghiệp khu vực Miền Bắc', '2026-02-25 10:18:35', '2026-02-25 17:18:35', '2026-01-10 10:18:35', '2026-02-24 10:18:35', '/uploads/organizers/86/events/event_52_thể_thao.jpg', 3256, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 53: Business Conference
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(53, 3, 16, 85, 'Business Conference', 'Hội nghị kinh doanh và khởi nghiệp', '2026-07-14 10:18:35', '2026-07-14 17:18:35', '2026-05-16 10:18:35', '2026-07-13 10:18:35', '/uploads/organizers/85/events/event_53_hội_thảo.jpg', 337, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 54: Art Exhibition: Đen Vâu
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(54, 4, 16, 87, 'Art Exhibition: Đen Vâu', 'Triển lãm tranh của họa sĩ Đen Vâu', '2026-05-25 10:18:35', '2026-05-25 14:18:35', '2026-04-08 10:18:35', '2026-05-24 10:18:35', '/uploads/organizers/87/events/event_54_triển_lãm.jpg', 780, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 55: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(55, 5, 8, 86, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-03-23 10:18:35', '2026-03-23 17:18:35', '2026-02-06 10:18:35', '2026-03-22 10:18:35', '/uploads/organizers/86/events/event_55_sân_khấu.jpg', 704, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 56: Street Food Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(56, 6, 17, 88, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-05-18 10:18:35', '2026-05-18 13:18:35', '2026-03-21 10:18:35', '2026-05-17 10:18:35', '/uploads/organizers/88/events/event_56_ẩm_thực.jpg', 757, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 57: Workshop AI & Machine Learning
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(57, 7, 20, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-03-17 10:18:35', '2026-03-17 13:18:35', '2026-02-04 10:18:35', '2026-03-16 10:18:35', '/uploads/organizers/88/events/event_57_workshop.jpg', 65, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 58: Stand-up Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(58, 8, 22, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-02-01 10:18:35', '2026-02-01 18:18:35', '2025-12-18 10:18:35', '2026-01-31 10:18:35', '/uploads/organizers/85/events/event_58_hài_kịch.jpg', 421, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 59: Fashion Show Mùa Xuân
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(59, 9, 11, 85, 'Fashion Show Mùa Xuân', 'Tuần lễ thời trang Mùa Xuân - Bộ sưu tập mới nhất', '2026-05-31 10:18:35', '2026-05-31 16:18:35', '2026-04-19 10:18:35', '2026-05-30 10:18:35', '/uploads/organizers/85/events/event_59_thời_trang.jpg', 597, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 60: Marathon Hải Phòng 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(60, 10, 17, 86, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-03-05 10:18:35', '2026-03-05 15:18:35', '2026-01-10 10:18:35', '2026-03-04 10:18:35', '/uploads/organizers/86/events/event_60_marathon.jpg', 1000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 61: Live Concert: Hòa Minzy
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(61, 1, 5, 86, 'Live Concert: Hòa Minzy', 'Đêm nhạc sống với Hòa Minzy - Trải nghiệm âm nhạc đỉnh cao', '2026-07-05 10:18:35', '2026-07-05 15:18:35', '2026-05-24 10:18:35', '2026-07-04 10:18:35', '/uploads/organizers/86/events/event_61_âm_nhạc.jpg', 527, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 62: Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(62, 2, 13, 87, 'Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Hà Nội FC và TP.HCM FC', '2026-06-02 10:18:35', '2026-06-02 16:18:35', '2026-04-16 10:18:35', '2026-06-01 10:18:35', '/uploads/organizers/87/events/event_62_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 63: Digital Marketing Workshop
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(63, 3, 1, 85, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-02-12 10:18:35', '2026-02-12 13:18:35', '2025-12-30 10:18:35', '2026-02-11 10:18:35', '/uploads/organizers/85/events/event_63_hội_thảo.jpg', 114, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 64: Triển lãm nghệ thuật Hiện Đại
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(64, 4, 8, 85, 'Triển lãm nghệ thuật Hiện Đại', 'Triển lãm nghệ thuật đương đại với chủ đề Hiện Đại', '2026-05-12 10:18:35', '2026-05-12 16:18:35', '2026-03-13 10:18:35', '2026-05-11 10:18:35', '/uploads/organizers/85/events/event_64_triển_lãm.jpg', 770, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 65: Kịch: Số Đỏ
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(65, 5, 2, 85, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-02-10 10:18:35', '2026-02-10 12:18:35', '2025-12-27 10:18:35', '2026-02-09 10:18:35', '/uploads/organizers/85/events/event_65_sân_khấu.jpg', 756, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 66: Food Festival Mùa Hè
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(66, 6, 16, 89, 'Food Festival Mùa Hè', 'Lễ hội ẩm thực Mùa Hè - Hơn 100 gian hàng', '2026-03-28 10:18:35', '2026-03-28 18:18:35', '2026-02-13 10:18:35', '2026-03-27 10:18:35', '/uploads/organizers/89/events/event_66_ẩm_thực.jpg', 2901, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 67: Workshop AI & Machine Learning
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(67, 7, 9, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-03-23 10:18:35', '2026-03-23 15:18:35', '2026-02-04 10:18:35', '2026-03-22 10:18:35', '/uploads/organizers/88/events/event_67_workshop.jpg', 85, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 68: Stand-up Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(68, 8, 15, 86, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-06-07 10:18:35', '2026-06-07 16:18:35', '2026-04-26 10:18:35', '2026-06-06 10:18:35', '/uploads/organizers/86/events/event_68_hài_kịch.jpg', 200, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 69: Runway Show: Lê Thanh Hòa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(69, 9, 1, 86, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-02-13 10:18:35', '2026-02-13 13:18:35', '2026-01-14 10:18:35', '2026-02-12 10:18:35', '/uploads/organizers/86/events/event_69_thời_trang.jpg', 371, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 70: Fun Run 5km
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(70, 10, 7, 88, 'Fun Run 5km', 'Chạy bộ vui vẻ cự ly 5km', '2026-02-22 10:18:35', '2026-02-22 16:18:35', '2026-01-21 10:18:35', '2026-02-21 10:18:35', '/uploads/organizers/88/events/event_70_marathon.jpg', 1979, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 71: Music Festival Mùa Đông
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(71, 1, 4, 87, 'Music Festival Mùa Đông', 'Lễ hội âm nhạc Mùa Đông - Quy tụ các nghệ sĩ hàng đầu', '2026-04-30 10:18:35', '2026-04-30 18:18:35', '2026-03-19 10:18:35', '2026-04-29 10:18:35', '/uploads/organizers/87/events/event_71_âm_nhạc.jpg', 1005, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 72: Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(72, 2, 7, 87, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-06-26 10:18:35', '2026-06-26 14:18:35', '2026-05-26 10:18:35', '2026-06-25 10:18:35', '/uploads/organizers/87/events/event_72_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 73: Tech Summit 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(73, 3, 7, 86, 'Tech Summit 2026', 'Hội thảo công nghệ lớn nhất năm 2026', '2026-06-19 10:18:35', '2026-06-19 17:18:35', '2026-04-28 10:18:35', '2026-06-18 10:18:35', '/uploads/organizers/86/events/event_73_hội_thảo.jpg', 655, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 74: Art Exhibition: Đen Vâu
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(74, 4, 7, 87, 'Art Exhibition: Đen Vâu', 'Triển lãm tranh của họa sĩ Đen Vâu', '2026-03-04 10:18:35', '2026-03-04 12:18:35', '2026-01-04 10:18:35', '2026-03-03 10:18:35', '/uploads/organizers/87/events/event_74_triển_lãm.jpg', 687, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 75: Kịch: Số Đỏ
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(75, 5, 7, 88, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-03-29 10:18:35', '2026-03-29 16:18:35', '2026-02-12 10:18:35', '2026-03-28 10:18:35', '/uploads/organizers/88/events/event_75_sân_khấu.jpg', 631, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 76: Food Festival Mùa Đông
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(76, 6, 2, 88, 'Food Festival Mùa Đông', 'Lễ hội ẩm thực Mùa Đông - Hơn 100 gian hàng', '2026-07-08 10:18:35', '2026-07-08 18:18:35', '2026-05-11 10:18:35', '2026-07-07 10:18:35', '/uploads/organizers/88/events/event_76_ẩm_thực.jpg', 1000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 77: Khóa học Thiết kế đồ họa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(77, 7, 10, 88, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-05-03 10:18:35', '2026-05-03 18:18:35', '2026-03-13 10:18:35', '2026-05-02 10:18:35', '/uploads/organizers/88/events/event_77_workshop.jpg', 54, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 78: Comedy Night with Trường Giang
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(78, 8, 20, 86, 'Comedy Night with Trường Giang', 'Đêm hài kịch cùng danh hài Trường Giang', '2026-04-14 10:18:35', '2026-04-14 14:18:35', '2026-02-25 10:18:35', '2026-04-13 10:18:35', '/uploads/organizers/86/events/event_78_hài_kịch.jpg', 846, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 79: Runway Show: Đỗ Mạnh Cường
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(79, 9, 2, 85, 'Runway Show: Đỗ Mạnh Cường', 'Show diễn thời trang của nhà thiết kế Đỗ Mạnh Cường', '2026-04-01 10:18:35', '2026-04-01 17:18:35', '2026-02-18 10:18:35', '2026-03-31 10:18:35', '/uploads/organizers/85/events/event_79_thời_trang.jpg', 222, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 80: Marathon Cần Thơ 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(80, 10, 14, 86, 'Marathon Cần Thơ 2026', 'Giải marathon quốc tế Cần Thơ 2026', '2026-05-30 10:18:35', '2026-05-30 18:18:35', '2026-04-23 10:18:35', '2026-05-29 10:18:35', '/uploads/organizers/86/events/event_80_marathon.jpg', 1000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 81: Acoustic Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(81, 1, 10, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-03-17 10:18:35', '2026-03-17 15:18:35', '2026-02-05 10:18:35', '2026-03-16 10:18:35', '/uploads/organizers/86/events/event_81_âm_nhạc.jpg', 367, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 82: Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(82, 2, 7, 89, 'Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 'Trận đấu kịch tính giữa Viettel FC và TP.HCM FC', '2026-03-06 10:18:35', '2026-03-06 14:18:35', '2026-02-01 10:18:35', '2026-03-05 10:18:35', '/uploads/organizers/89/events/event_82_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 83: Digital Marketing Workshop
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(83, 3, 5, 88, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-05-11 10:18:35', '2026-05-11 15:18:35', '2026-03-29 10:18:35', '2026-05-10 10:18:35', '/uploads/organizers/88/events/event_83_hội_thảo.jpg', 179, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 84: Art Exhibition: Hòa Minzy
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(84, 4, 14, 85, 'Art Exhibition: Hòa Minzy', 'Triển lãm tranh của họa sĩ Hòa Minzy', '2026-01-30 10:18:35', '2026-01-30 14:18:35', '2025-12-14 10:18:35', '2026-01-29 10:18:35', '/uploads/organizers/85/events/event_84_triển_lãm.jpg', 718, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 85: Musical Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(85, 5, 8, 89, 'Musical Show', 'Chương trình ca nhạc kịch đặc sắc', '2026-06-29 10:18:35', '2026-06-29 12:18:35', '2026-05-14 10:18:35', '2026-06-28 10:18:35', '/uploads/organizers/89/events/event_85_sân_khấu.jpg', 852, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 86: Food Festival Mùa Đông
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(86, 6, 23, 88, 'Food Festival Mùa Đông', 'Lễ hội ẩm thực Mùa Đông - Hơn 100 gian hàng', '2026-04-24 10:18:35', '2026-04-24 15:18:35', '2026-03-14 10:18:35', '2026-04-23 10:18:35', '/uploads/organizers/88/events/event_86_ẩm_thực.jpg', 1000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 87: Khóa học Thiết kế đồ họa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(87, 7, 24, 87, 'Khóa học Thiết kế đồ họa', 'Khóa học thực hành Thiết kế đồ họa từ cơ bản đến nâng cao', '2026-04-08 10:18:35', '2026-04-08 12:18:35', '2026-02-28 10:18:35', '2026-04-07 10:18:35', '/uploads/organizers/87/events/event_87_workshop.jpg', 44, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 88: Stand-up Show
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(88, 8, 5, 85, 'Stand-up Show', 'Chương trình stand-up comedy đặc sắc', '2026-04-17 10:18:35', '2026-04-17 13:18:35', '2026-02-27 10:18:35', '2026-04-16 10:18:35', '/uploads/organizers/85/events/event_88_hài_kịch.jpg', 285, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 89: Runway Show: Lê Thanh Hòa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(89, 9, 22, 85, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-07-08 10:18:35', '2026-07-08 12:18:35', '2026-06-04 10:18:35', '2026-07-07 10:18:35', '/uploads/organizers/85/events/event_89_thời_trang.jpg', 405, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 90: Marathon Hải Phòng 2026
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(90, 10, 4, 89, 'Marathon Hải Phòng 2026', 'Giải marathon quốc tế Hải Phòng 2026', '2026-07-08 10:18:35', '2026-07-08 13:18:35', '2026-05-14 10:18:35', '2026-07-07 10:18:35', '/uploads/organizers/89/events/event_90_marathon.jpg', 2163, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 91: Acoustic Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(91, 1, 21, 86, 'Acoustic Night', 'Đêm nhạc acoustic ấm cúng và gần gũi', '2026-03-24 10:18:35', '2026-03-24 12:18:35', '2026-01-23 10:18:35', '2026-03-23 10:18:35', '/uploads/organizers/86/events/event_91_âm_nhạc.jpg', 200, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 92: Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(92, 2, 10, 85, 'Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 'Trận đấu kịch tính giữa Hà Nội FC và Thanh Hóa', '2026-07-12 10:18:35', '2026-07-12 14:18:35', '2026-05-17 10:18:35', '2026-07-11 10:18:35', '/uploads/organizers/85/events/event_92_thể_thao.jpg', 5000, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 93: Digital Marketing Workshop
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(93, 3, 21, 85, 'Digital Marketing Workshop', 'Workshop Marketing số cho doanh nghiệp', '2026-03-21 10:18:35', '2026-03-21 18:18:35', '2026-02-06 10:18:35', '2026-03-20 10:18:35', '/uploads/organizers/85/events/event_93_hội_thảo.jpg', 185, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 94: Art Exhibition: Sơn Tùng MTP
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(94, 4, 7, 87, 'Art Exhibition: Sơn Tùng MTP', 'Triển lãm tranh của họa sĩ Sơn Tùng MTP', '2026-06-07 10:18:35', '2026-06-07 14:18:35', '2026-04-22 10:18:35', '2026-06-06 10:18:35', '/uploads/organizers/87/events/event_94_triển_lãm.jpg', 715, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 95: Kịch: Số Đỏ
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(95, 5, 8, 88, 'Kịch: Số Đỏ', 'Vở kịch kinh điển Số Đỏ', '2026-07-03 10:18:35', '2026-07-03 18:18:35', '2026-05-21 10:18:35', '2026-07-02 10:18:35', '/uploads/organizers/88/events/event_95_sân_khấu.jpg', 528, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 96: Street Food Night
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(96, 6, 8, 89, 'Street Food Night', 'Đêm hội ẩm thực đường phố', '2026-03-11 10:18:35', '2026-03-11 14:18:35', '2026-01-31 10:18:35', '2026-03-10 10:18:35', '/uploads/organizers/89/events/event_96_ẩm_thực.jpg', 736, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 97: Workshop AI & Machine Learning
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(97, 7, 8, 88, 'Workshop AI & Machine Learning', 'Workshop chuyên sâu về AI & Machine Learning', '2026-03-11 10:18:35', '2026-03-11 17:18:35', '2026-01-11 10:18:35', '2026-03-10 10:18:35', '/uploads/organizers/88/events/event_97_workshop.jpg', 157, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 98: Comedy Night with Trấn Thành
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(98, 8, 19, 87, 'Comedy Night with Trấn Thành', 'Đêm hài kịch cùng danh hài Trấn Thành', '2026-02-23 10:18:35', '2026-02-23 12:18:35', '2025-12-30 10:18:35', '2026-02-22 10:18:35', '/uploads/organizers/87/events/event_98_hài_kịch.jpg', 778, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 99: Runway Show: Lê Thanh Hòa
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(99, 9, 20, 87, 'Runway Show: Lê Thanh Hòa', 'Show diễn thời trang của nhà thiết kế Lê Thanh Hòa', '2026-04-28 10:18:35', '2026-04-28 14:18:35', '2026-03-01 10:18:35', '2026-04-27 10:18:35', '/uploads/organizers/87/events/event_99_thời_trang.jpg', 340, 0, 'PUBLISHED', 0, NOW(), NOW());

-- Event 100: Fun Run 21km
INSERT INTO `Event` (`event_id`, `category_id`, `venue_id`, `manager_id`, `event_name`, `description`, `start_datetime`, `end_datetime`, `sale_start_datetime`, `sale_end_datetime`, `banner_image_url`, `total_capacity`, `sold_tickets`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(100, 10, 16, 86, 'Fun Run 21km', 'Chạy bộ vui vẻ cự ly 21km', '2026-04-21 10:18:35', '2026-04-21 16:18:35', '2026-02-22 10:18:35', '2026-04-20 10:18:35', '/uploads/organizers/86/events/event_100_marathon.jpg', 956, 0, 'PUBLISHED', 0, NOW(), NOW());

-- =====================================================
-- 5. CREATE TICKET TYPES
-- =====================================================

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(1, 1, 'VIP', 'Vé VIP - Music Festival Mùa Đông', 1337283, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(2, 1, 'Standard', 'Vé Standard - Music Festival Mùa Đông', 519746, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(3, 1, 'Economy', 'Vé Economy - Music Festival Mùa Đông', 105895, 333, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(4, 2, 'VIP', 'Vé VIP - Giải Bóng đá Miền Trung', 889698, 1118, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(5, 2, 'Standard', 'Vé Standard - Giải Bóng đá Miền Trung', 863900, 1118, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(6, 3, 'VIP', 'Vé VIP - Digital Marketing Workshop', 929688, 61, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(7, 3, 'Standard', 'Vé Standard - Digital Marketing Workshop', 911848, 61, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(8, 4, 'VIP', 'Vé VIP - Triển lãm nghệ thuật Đương Đại', 1161522, 322, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(9, 4, 'Standard', 'Vé Standard - Triển lãm nghệ thuật Đương Đại', 664738, 322, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(10, 5, 'VIP', 'Vé VIP - Kịch: Số Đỏ', 1025901, 245, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(11, 5, 'Standard', 'Vé Standard - Kịch: Số Đỏ', 976678, 245, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(12, 6, 'VIP', 'Vé VIP - Street Food Night', 706941, 255, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(13, 6, 'Standard', 'Vé Standard - Street Food Night', 560338, 255, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(14, 6, 'Economy', 'Vé Economy - Street Food Night', 119343, 255, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(15, 7, 'VIP', 'Vé VIP - Khóa học Lập trình Python', 800676, 28, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(16, 7, 'Standard', 'Vé Standard - Khóa học Lập trình Python', 961436, 28, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(17, 8, 'VIP', 'Vé VIP - Stand-up Show', 697581, 156, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(18, 8, 'Standard', 'Vé Standard - Stand-up Show', 888406, 156, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(19, 8, 'Economy', 'Vé Economy - Stand-up Show', 433942, 156, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(20, 9, 'VIP', 'Vé VIP - Fashion Show Mùa Hè', 1353936, 208, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(21, 9, 'Standard', 'Vé Standard - Fashion Show Mùa Hè', 409816, 208, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(22, 9, 'Economy', 'Vé Economy - Fashion Show Mùa Hè', 279970, 208, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(23, 10, 'VIP', 'Vé VIP - Marathon Vũng Tàu 2026', 676458, 1471, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(24, 10, 'Standard', 'Vé Standard - Marathon Vũng Tàu 2026', 258826, 1471, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(25, 11, 'VIP', 'Vé VIP - Acoustic Night', 1334985, 190, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(26, 11, 'Standard', 'Vé Standard - Acoustic Night', 943158, 190, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(27, 12, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 1220724, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(28, 12, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 858092, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(29, 12, 'Economy', 'Vé Economy - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 142922, 1666, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(30, 13, 'VIP', 'Vé VIP - Digital Marketing Workshop', 1475145, 58, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(31, 13, 'Standard', 'Vé Standard - Digital Marketing Workshop', 211892, 58, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(32, 13, 'Economy', 'Vé Economy - Digital Marketing Workshop', 155564, 58, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(33, 14, 'VIP', 'Vé VIP - Art Exhibition: Mỹ Tâm', 1105026, 179, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(34, 14, 'Standard', 'Vé Standard - Art Exhibition: Mỹ Tâm', 957380, 179, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(35, 14, 'Economy', 'Vé Economy - Art Exhibition: Mỹ Tâm', 411868, 179, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(36, 15, 'VIP', 'Vé VIP - Musical Show', 1421742, 495, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(37, 15, 'Standard', 'Vé Standard - Musical Show', 250942, 495, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(38, 16, 'VIP', 'Vé VIP - Food Festival Mùa Hè', 1227666, 2063, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(39, 16, 'Standard', 'Vé Standard - Food Festival Mùa Hè', 228042, 2063, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(40, 17, 'VIP', 'Vé VIP - Khóa học Thiết kế đồ họa', 1244184, 19, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(41, 17, 'Standard', 'Vé Standard - Khóa học Thiết kế đồ họa', 467186, 19, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(42, 17, 'Economy', 'Vé Economy - Khóa học Thiết kế đồ họa', 237491, 19, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(43, 18, 'VIP', 'Vé VIP - Comedy Night with Trấn Thành', 1054914, 310, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(44, 18, 'Standard', 'Vé Standard - Comedy Night with Trấn Thành', 825770, 310, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(45, 19, 'VIP', 'Vé VIP - Fashion Show Mùa Hè', 754662, 117, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(46, 19, 'Standard', 'Vé Standard - Fashion Show Mùa Hè', 884318, 117, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(47, 19, 'Economy', 'Vé Economy - Fashion Show Mùa Hè', 287281, 117, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(48, 20, 'VIP', 'Vé VIP - Marathon Hải Phòng 2026', 1022133, 882, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(49, 20, 'Standard', 'Vé Standard - Marathon Hải Phòng 2026', 422832, 882, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(50, 20, 'Economy', 'Vé Economy - Marathon Hải Phòng 2026', 230422, 882, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(51, 21, 'VIP', 'Vé VIP - Live Concert: Noo Phước Thịnh', 913950, 420, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(52, 21, 'Standard', 'Vé Standard - Live Concert: Noo Phước Thịnh', 701970, 420, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(53, 21, 'Economy', 'Vé Economy - Live Concert: Noo Phước Thịnh', 413262, 420, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(54, 22, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 420798, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(55, 22, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 958036, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(56, 22, 'Economy', 'Vé Economy - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 401499, 1666, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(57, 23, 'VIP', 'Vé VIP - Business Conference', 1164222, 100, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(58, 23, 'Standard', 'Vé Standard - Business Conference', 679220, 100, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(59, 24, 'VIP', 'Vé VIP - Art Exhibition: Sơn Tùng MTP', 1429620, 246, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(60, 24, 'Standard', 'Vé Standard - Art Exhibition: Sơn Tùng MTP', 572408, 246, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(61, 25, 'VIP', 'Vé VIP - Musical Show', 976101, 299, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(62, 25, 'Standard', 'Vé Standard - Musical Show', 217836, 299, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(63, 26, 'VIP', 'Vé VIP - Food Festival Mùa Thu', 532527, 899, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(64, 26, 'Standard', 'Vé Standard - Food Festival Mùa Thu', 685184, 899, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(65, 26, 'Economy', 'Vé Economy - Food Festival Mùa Thu', 181202, 899, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(66, 27, 'VIP', 'Vé VIP - Workshop Photography', 1263855, 26, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(67, 27, 'Standard', 'Vé Standard - Workshop Photography', 246844, 26, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(68, 28, 'VIP', 'Vé VIP - Stand-up Show', 592173, 197, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(69, 28, 'Standard', 'Vé Standard - Stand-up Show', 768358, 197, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(70, 29, 'VIP', 'Vé VIP - Runway Show: Công Trí', 1446165, 66, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(71, 29, 'Standard', 'Vé Standard - Runway Show: Công Trí', 385722, 66, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(72, 29, 'Economy', 'Vé Economy - Runway Show: Công Trí', 103750, 66, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(73, 30, 'VIP', 'Vé VIP - Marathon Hồ Chí Minh 2026', 1330284, 1078, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(74, 30, 'Standard', 'Vé Standard - Marathon Hồ Chí Minh 2026', 434158, 1078, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(75, 30, 'Economy', 'Vé Economy - Marathon Hồ Chí Minh 2026', 438482, 1078, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(76, 31, 'VIP', 'Vé VIP - Acoustic Night', 1397154, 70, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(77, 31, 'Standard', 'Vé Standard - Acoustic Night', 548490, 70, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(78, 31, 'Economy', 'Vé Economy - Acoustic Night', 373027, 70, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(79, 32, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 1416078, 2500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(80, 32, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 795906, 2500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(81, 33, 'VIP', 'Vé VIP - Tech Summit 2026', 750714, 408, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(82, 33, 'Standard', 'Vé Standard - Tech Summit 2026', 257168, 408, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(83, 34, 'VIP', 'Vé VIP - Triển lãm nghệ thuật Đương Đại', 979443, 406, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(84, 34, 'Standard', 'Vé Standard - Triển lãm nghệ thuật Đương Đại', 728544, 406, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(85, 35, 'VIP', 'Vé VIP - Musical Show', 387285, 740, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(86, 35, 'Standard', 'Vé Standard - Musical Show', 244670, 740, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(87, 36, 'VIP', 'Vé VIP - Food Festival Mùa Thu', 1009935, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(88, 36, 'Standard', 'Vé Standard - Food Festival Mùa Thu', 261552, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(89, 36, 'Economy', 'Vé Economy - Food Festival Mùa Thu', 332266, 333, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(90, 37, 'VIP', 'Vé VIP - Khóa học Nhiếp ảnh', 442479, 20, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(91, 37, 'Standard', 'Vé Standard - Khóa học Nhiếp ảnh', 453256, 20, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(92, 37, 'Economy', 'Vé Economy - Khóa học Nhiếp ảnh', 426493, 20, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(93, 38, 'VIP', 'Vé VIP - Comedy Night with Trấn Thành', 755622, 238, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(94, 38, 'Standard', 'Vé Standard - Comedy Night with Trấn Thành', 450088, 238, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(95, 38, 'Economy', 'Vé Economy - Comedy Night with Trấn Thành', 355641, 238, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(96, 39, 'VIP', 'Vé VIP - Runway Show: Lê Thanh Hòa', 1210554, 66, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(97, 39, 'Standard', 'Vé Standard - Runway Show: Lê Thanh Hòa', 301916, 66, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(98, 39, 'Economy', 'Vé Economy - Runway Show: Lê Thanh Hòa', 146679, 66, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(99, 40, 'VIP', 'Vé VIP - Fun Run 21km', 374073, 310, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(100, 40, 'Standard', 'Vé Standard - Fun Run 21km', 225572, 310, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(101, 40, 'Economy', 'Vé Economy - Fun Run 21km', 142468, 310, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(102, 41, 'VIP', 'Vé VIP - Music Festival Mùa Xuân', 820416, 2049, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(103, 41, 'Standard', 'Vé Standard - Music Festival Mùa Xuân', 470266, 2049, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(104, 42, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: HAGL vs Thanh Hóa', 354897, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(105, 42, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: HAGL vs Thanh Hóa', 470648, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(106, 42, 'Economy', 'Vé Economy - Trận cầu đỉnh cao: HAGL vs Thanh Hóa', 395201, 1666, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(107, 43, 'VIP', 'Vé VIP - Tech Summit 2026', 828318, 124, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(108, 43, 'Standard', 'Vé Standard - Tech Summit 2026', 295602, 124, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(109, 43, 'Economy', 'Vé Economy - Tech Summit 2026', 261497, 124, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(110, 44, 'VIP', 'Vé VIP - Triển lãm nghệ thuật Đương Đại', 616344, 274, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(111, 44, 'Standard', 'Vé Standard - Triển lãm nghệ thuật Đương Đại', 238320, 274, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(112, 44, 'Economy', 'Vé Economy - Triển lãm nghệ thuật Đương Đại', 420974, 274, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(113, 45, 'VIP', 'Vé VIP - Musical Show', 817839, 269, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(114, 45, 'Standard', 'Vé Standard - Musical Show', 972954, 269, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(115, 46, 'VIP', 'Vé VIP - Street Food Night', 546264, 316, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(116, 46, 'Standard', 'Vé Standard - Street Food Night', 722994, 316, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(117, 47, 'VIP', 'Vé VIP - Workshop Digital Marketing', 458109, 92, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(118, 47, 'Standard', 'Vé Standard - Workshop Digital Marketing', 796728, 92, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(119, 48, 'VIP', 'Vé VIP - Comedy Night with Trường Giang', 1453245, 424, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(120, 48, 'Standard', 'Vé Standard - Comedy Night with Trường Giang', 525084, 424, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(121, 49, 'VIP', 'Vé VIP - Fashion Show Mùa Đông', 437664, 176, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(122, 49, 'Standard', 'Vé Standard - Fashion Show Mùa Đông', 372450, 176, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(123, 50, 'VIP', 'Vé VIP - Fun Run 42km', 1132464, 235, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(124, 50, 'Standard', 'Vé Standard - Fun Run 42km', 931602, 235, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(125, 50, 'Economy', 'Vé Economy - Fun Run 42km', 430555, 235, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(126, 51, 'VIP', 'Vé VIP - Music Festival Mùa Hè', 579429, 1260, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(127, 51, 'Standard', 'Vé Standard - Music Festival Mùa Hè', 566256, 1260, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(128, 52, 'VIP', 'Vé VIP - Giải Bóng rổ Miền Bắc', 1122426, 1628, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(129, 52, 'Standard', 'Vé Standard - Giải Bóng rổ Miền Bắc', 928660, 1628, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(130, 53, 'VIP', 'Vé VIP - Business Conference', 987582, 168, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(131, 53, 'Standard', 'Vé Standard - Business Conference', 927168, 168, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(132, 54, 'VIP', 'Vé VIP - Art Exhibition: Đen Vâu', 849783, 390, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(133, 54, 'Standard', 'Vé Standard - Art Exhibition: Đen Vâu', 958432, 390, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(134, 55, 'VIP', 'Vé VIP - Musical Show', 1036041, 234, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(135, 55, 'Standard', 'Vé Standard - Musical Show', 833324, 234, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(136, 55, 'Economy', 'Vé Economy - Musical Show', 180517, 234, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(137, 56, 'VIP', 'Vé VIP - Street Food Night', 951948, 252, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(138, 56, 'Standard', 'Vé Standard - Street Food Night', 736490, 252, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(139, 56, 'Economy', 'Vé Economy - Street Food Night', 490192, 252, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(140, 57, 'VIP', 'Vé VIP - Workshop AI & Machine Learning', 679716, 21, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(141, 57, 'Standard', 'Vé Standard - Workshop AI & Machine Learning', 938484, 21, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(142, 57, 'Economy', 'Vé Economy - Workshop AI & Machine Learning', 393181, 21, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(143, 58, 'VIP', 'Vé VIP - Stand-up Show', 308703, 210, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(144, 58, 'Standard', 'Vé Standard - Stand-up Show', 468542, 210, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(145, 59, 'VIP', 'Vé VIP - Fashion Show Mùa Xuân', 1040742, 298, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(146, 59, 'Standard', 'Vé Standard - Fashion Show Mùa Xuân', 844762, 298, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(147, 60, 'VIP', 'Vé VIP - Marathon Hải Phòng 2026', 759348, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(148, 60, 'Standard', 'Vé Standard - Marathon Hải Phòng 2026', 951010, 333, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(149, 60, 'Economy', 'Vé Economy - Marathon Hải Phòng 2026', 474029, 333, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(150, 61, 'VIP', 'Vé VIP - Live Concert: Hòa Minzy', 464106, 263, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(151, 61, 'Standard', 'Vé Standard - Live Concert: Hòa Minzy', 937230, 263, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(152, 62, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC', 638337, 2500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(153, 62, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC', 603146, 2500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(154, 63, 'VIP', 'Vé VIP - Digital Marketing Workshop', 1153284, 57, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(155, 63, 'Standard', 'Vé Standard - Digital Marketing Workshop', 570454, 57, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(156, 64, 'VIP', 'Vé VIP - Triển lãm nghệ thuật Hiện Đại', 688185, 385, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(157, 64, 'Standard', 'Vé Standard - Triển lãm nghệ thuật Hiện Đại', 437698, 385, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(158, 65, 'VIP', 'Vé VIP - Kịch: Số Đỏ', 1078050, 252, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(159, 65, 'Standard', 'Vé Standard - Kịch: Số Đỏ', 232040, 252, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(160, 65, 'Economy', 'Vé Economy - Kịch: Số Đỏ', 204937, 252, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(161, 66, 'VIP', 'Vé VIP - Food Festival Mùa Hè', 1193805, 967, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(162, 66, 'Standard', 'Vé Standard - Food Festival Mùa Hè', 667276, 967, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(163, 66, 'Economy', 'Vé Economy - Food Festival Mùa Hè', 205329, 967, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(164, 67, 'VIP', 'Vé VIP - Workshop AI & Machine Learning', 810831, 42, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(165, 67, 'Standard', 'Vé Standard - Workshop AI & Machine Learning', 291716, 42, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(166, 68, 'VIP', 'Vé VIP - Stand-up Show', 1367934, 100, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(167, 68, 'Standard', 'Vé Standard - Stand-up Show', 999126, 100, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(168, 69, 'VIP', 'Vé VIP - Runway Show: Lê Thanh Hòa', 983127, 123, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(169, 69, 'Standard', 'Vé Standard - Runway Show: Lê Thanh Hòa', 726954, 123, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(170, 69, 'Economy', 'Vé Economy - Runway Show: Lê Thanh Hòa', 138719, 123, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(171, 70, 'VIP', 'Vé VIP - Fun Run 5km', 1452987, 659, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(172, 70, 'Standard', 'Vé Standard - Fun Run 5km', 709604, 659, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(173, 70, 'Economy', 'Vé Economy - Fun Run 5km', 324904, 659, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(174, 71, 'VIP', 'Vé VIP - Music Festival Mùa Đông', 719991, 502, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(175, 71, 'Standard', 'Vé Standard - Music Festival Mùa Đông', 771762, 502, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(176, 72, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 733272, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(177, 72, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 778232, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(178, 72, 'Economy', 'Vé Economy - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 344898, 1666, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(179, 73, 'VIP', 'Vé VIP - Tech Summit 2026', 831522, 327, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(180, 73, 'Standard', 'Vé Standard - Tech Summit 2026', 366110, 327, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(181, 74, 'VIP', 'Vé VIP - Art Exhibition: Đen Vâu', 1147806, 343, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(182, 74, 'Standard', 'Vé Standard - Art Exhibition: Đen Vâu', 983096, 343, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(183, 75, 'VIP', 'Vé VIP - Kịch: Số Đỏ', 947790, 315, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(184, 75, 'Standard', 'Vé Standard - Kịch: Số Đỏ', 736996, 315, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(185, 76, 'VIP', 'Vé VIP - Food Festival Mùa Đông', 670122, 500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(186, 76, 'Standard', 'Vé Standard - Food Festival Mùa Đông', 724776, 500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(187, 77, 'VIP', 'Vé VIP - Khóa học Thiết kế đồ họa', 824565, 18, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(188, 77, 'Standard', 'Vé Standard - Khóa học Thiết kế đồ họa', 439542, 18, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(189, 77, 'Economy', 'Vé Economy - Khóa học Thiết kế đồ họa', 269866, 18, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(190, 78, 'VIP', 'Vé VIP - Comedy Night with Trường Giang', 404907, 423, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(191, 78, 'Standard', 'Vé Standard - Comedy Night with Trường Giang', 537092, 423, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(192, 79, 'VIP', 'Vé VIP - Runway Show: Đỗ Mạnh Cường', 1414236, 111, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(193, 79, 'Standard', 'Vé Standard - Runway Show: Đỗ Mạnh Cường', 419092, 111, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(194, 80, 'VIP', 'Vé VIP - Marathon Cần Thơ 2026', 367422, 500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(195, 80, 'Standard', 'Vé Standard - Marathon Cần Thơ 2026', 385078, 500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(196, 81, 'VIP', 'Vé VIP - Acoustic Night', 1101348, 122, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(197, 81, 'Standard', 'Vé Standard - Acoustic Night', 540918, 122, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(198, 81, 'Economy', 'Vé Economy - Acoustic Night', 246125, 122, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(199, 82, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 585747, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(200, 82, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 665414, 1666, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(201, 82, 'Economy', 'Vé Economy - Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC', 300788, 1666, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(202, 83, 'VIP', 'Vé VIP - Digital Marketing Workshop', 985200, 59, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(203, 83, 'Standard', 'Vé Standard - Digital Marketing Workshop', 615010, 59, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(204, 83, 'Economy', 'Vé Economy - Digital Marketing Workshop', 471543, 59, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(205, 84, 'VIP', 'Vé VIP - Art Exhibition: Hòa Minzy', 1074504, 239, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(206, 84, 'Standard', 'Vé Standard - Art Exhibition: Hòa Minzy', 277318, 239, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(207, 84, 'Economy', 'Vé Economy - Art Exhibition: Hòa Minzy', 145892, 239, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(208, 85, 'VIP', 'Vé VIP - Musical Show', 731748, 426, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(209, 85, 'Standard', 'Vé Standard - Musical Show', 969076, 426, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(210, 86, 'VIP', 'Vé VIP - Food Festival Mùa Đông', 782541, 500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(211, 86, 'Standard', 'Vé Standard - Food Festival Mùa Đông', 241444, 500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(212, 87, 'VIP', 'Vé VIP - Khóa học Thiết kế đồ họa', 999342, 14, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(213, 87, 'Standard', 'Vé Standard - Khóa học Thiết kế đồ họa', 388304, 14, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(214, 87, 'Economy', 'Vé Economy - Khóa học Thiết kế đồ họa', 139436, 14, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(215, 88, 'VIP', 'Vé VIP - Stand-up Show', 1014960, 95, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(216, 88, 'Standard', 'Vé Standard - Stand-up Show', 231476, 95, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(217, 88, 'Economy', 'Vé Economy - Stand-up Show', 463832, 95, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(218, 89, 'VIP', 'Vé VIP - Runway Show: Lê Thanh Hòa', 480468, 202, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(219, 89, 'Standard', 'Vé Standard - Runway Show: Lê Thanh Hòa', 934758, 202, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(220, 90, 'VIP', 'Vé VIP - Marathon Hải Phòng 2026', 1298280, 1081, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(221, 90, 'Standard', 'Vé Standard - Marathon Hải Phòng 2026', 696814, 1081, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(222, 91, 'VIP', 'Vé VIP - Acoustic Night', 343293, 100, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(223, 91, 'Standard', 'Vé Standard - Acoustic Night', 500298, 100, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(224, 92, 'VIP', 'Vé VIP - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 1295913, 2500, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(225, 92, 'Standard', 'Vé Standard - Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa', 568586, 2500, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(226, 93, 'VIP', 'Vé VIP - Digital Marketing Workshop', 649017, 61, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(227, 93, 'Standard', 'Vé Standard - Digital Marketing Workshop', 757316, 61, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(228, 93, 'Economy', 'Vé Economy - Digital Marketing Workshop', 490968, 61, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(229, 94, 'VIP', 'Vé VIP - Art Exhibition: Sơn Tùng MTP', 1051413, 357, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(230, 94, 'Standard', 'Vé Standard - Art Exhibition: Sơn Tùng MTP', 450886, 357, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(231, 95, 'VIP', 'Vé VIP - Kịch: Số Đỏ', 734331, 176, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(232, 95, 'Standard', 'Vé Standard - Kịch: Số Đỏ', 715648, 176, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(233, 95, 'Economy', 'Vé Economy - Kịch: Số Đỏ', 153257, 176, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(234, 96, 'VIP', 'Vé VIP - Street Food Night', 1196064, 245, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(235, 96, 'Standard', 'Vé Standard - Street Food Night', 954712, 245, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(236, 96, 'Economy', 'Vé Economy - Street Food Night', 107370, 245, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(237, 97, 'VIP', 'Vé VIP - Workshop AI & Machine Learning', 722949, 52, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(238, 97, 'Standard', 'Vé Standard - Workshop AI & Machine Learning', 263736, 52, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(239, 97, 'Economy', 'Vé Economy - Workshop AI & Machine Learning', 208348, 52, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(240, 98, 'VIP', 'Vé VIP - Comedy Night with Trấn Thành', 995157, 259, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(241, 98, 'Standard', 'Vé Standard - Comedy Night with Trấn Thành', 656318, 259, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(242, 98, 'Economy', 'Vé Economy - Comedy Night with Trấn Thành', 315472, 259, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(243, 99, 'VIP', 'Vé VIP - Runway Show: Lê Thanh Hòa', 1414482, 113, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(244, 99, 'Standard', 'Vé Standard - Runway Show: Lê Thanh Hòa', 540040, 113, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(245, 99, 'Economy', 'Vé Economy - Runway Show: Lê Thanh Hòa', 100447, 113, 0, 1, NOW());

INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(246, 100, 'VIP', 'Vé VIP - Fun Run 21km', 1101600, 478, 0, 1, NOW());
INSERT INTO `TicketType` (`ticket_type_id`, `event_id`, `type_name`, `description`, `price`, `quantity`, `sold_quantity`, `is_active`, `created_at`) VALUES
(247, 100, 'Standard', 'Vé Standard - Fun Run 21km', 775264, 478, 0, 1, NOW());

-- =====================================================
-- 6. CREATE AUDIT LOGS
-- =====================================================

-- Audit log for Event 1
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(1, 'Event', 1, 'INSERT', NULL, '{"event_name": "Music Festival M\u00f9a \u0110\u00f4ng", "venue_id": 17, "category_id": 1, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(2, 'Event', 1, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(3, 'Event', 1, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 2
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(4, 'Event', 2, 'INSERT', NULL, '{"event_name": "Gi\u1ea3i B\u00f3ng \u0111\u00e1 Mi\u1ec1n Trung", "venue_id": 10, "category_id": 2, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(5, 'Event', 2, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(6, 'Event', 2, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 3
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(7, 'Event', 3, 'INSERT', NULL, '{"event_name": "Digital Marketing Workshop", "venue_id": 21, "category_id": 3, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(8, 'Event', 3, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(9, 'Event', 3, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 4
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(10, 'Event', 4, 'INSERT', NULL, '{"event_name": "Tri\u1ec3n l\u00e3m ngh\u1ec7 thu\u1eadt \u0110\u01b0\u01a1ng \u0110\u1ea1i", "venue_id": 5, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(11, 'Event', 4, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(12, 'Event', 4, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 5
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(13, 'Event', 5, 'INSERT', NULL, '{"event_name": "K\u1ecbch: S\u1ed1 \u0110\u1ecf", "venue_id": 8, "category_id": 5, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(14, 'Event', 5, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(15, 'Event', 5, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 6
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(16, 'Event', 6, 'INSERT', NULL, '{"event_name": "Street Food Night", "venue_id": 11, "category_id": 6, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(17, 'Event', 6, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(18, 'Event', 6, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 7
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(19, 'Event', 7, 'INSERT', NULL, '{"event_name": "Kh\u00f3a h\u1ecdc L\u1eadp tr\u00ecnh Python", "venue_id": 17, "category_id": 7, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(20, 'Event', 7, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(21, 'Event', 7, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 8
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(22, 'Event', 8, 'INSERT', NULL, '{"event_name": "Stand-up Show", "venue_id": 16, "category_id": 8, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(23, 'Event', 8, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(24, 'Event', 8, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 9
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(25, 'Event', 9, 'INSERT', NULL, '{"event_name": "Fashion Show M\u00f9a H\u00e8", "venue_id": 14, "category_id": 9, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(26, 'Event', 9, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(27, 'Event', 9, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 10
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(28, 'Event', 10, 'INSERT', NULL, '{"event_name": "Marathon V\u0169ng T\u00e0u 2026", "venue_id": 22, "category_id": 10, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(29, 'Event', 10, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(30, 'Event', 10, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 11
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(31, 'Event', 11, 'INSERT', NULL, '{"event_name": "Acoustic Night", "venue_id": 17, "category_id": 1, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(32, 'Event', 11, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(33, 'Event', 11, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 12
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(34, 'Event', 12, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: H\u00e0 N\u1ed9i FC vs Thanh H\u00f3a", "venue_id": 16, "category_id": 2, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(35, 'Event', 12, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(36, 'Event', 12, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 13
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(37, 'Event', 13, 'INSERT', NULL, '{"event_name": "Digital Marketing Workshop", "venue_id": 2, "category_id": 3, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(38, 'Event', 13, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(39, 'Event', 13, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 14
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(40, 'Event', 14, 'INSERT', NULL, '{"event_name": "Art Exhibition: M\u1ef9 T\u00e2m", "venue_id": 20, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(41, 'Event', 14, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(42, 'Event', 14, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 15
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(43, 'Event', 15, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 5, "category_id": 5, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(44, 'Event', 15, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(45, 'Event', 15, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 16
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(46, 'Event', 16, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a H\u00e8", "venue_id": 16, "category_id": 6, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(47, 'Event', 16, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(48, 'Event', 16, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 17
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(49, 'Event', 17, 'INSERT', NULL, '{"event_name": "Kh\u00f3a h\u1ecdc Thi\u1ebft k\u1ebf \u0111\u1ed3 h\u1ecda", "venue_id": 14, "category_id": 7, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(50, 'Event', 17, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(51, 'Event', 17, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 18
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(52, 'Event', 18, 'INSERT', NULL, '{"event_name": "Comedy Night with Tr\u1ea5n Th\u00e0nh", "venue_id": 17, "category_id": 8, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(53, 'Event', 18, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(54, 'Event', 18, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 19
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(55, 'Event', 19, 'INSERT', NULL, '{"event_name": "Fashion Show M\u00f9a H\u00e8", "venue_id": 2, "category_id": 9, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(56, 'Event', 19, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(57, 'Event', 19, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 20
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(58, 'Event', 20, 'INSERT', NULL, '{"event_name": "Marathon H\u1ea3i Ph\u00f2ng 2026", "venue_id": 1, "category_id": 10, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(59, 'Event', 20, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(60, 'Event', 20, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 21
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(61, 'Event', 21, 'INSERT', NULL, '{"event_name": "Live Concert: Noo Ph\u01b0\u1edbc Th\u1ecbnh", "venue_id": 19, "category_id": 1, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(62, 'Event', 21, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(63, 'Event', 21, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 22
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(64, 'Event', 22, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: Viettel FC vs TP.HCM FC", "venue_id": 19, "category_id": 2, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(65, 'Event', 22, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(66, 'Event', 22, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 23
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(67, 'Event', 23, 'INSERT', NULL, '{"event_name": "Business Conference", "venue_id": 9, "category_id": 3, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(68, 'Event', 23, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(69, 'Event', 23, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 24
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(70, 'Event', 24, 'INSERT', NULL, '{"event_name": "Art Exhibition: S\u01a1n T\u00f9ng MTP", "venue_id": 1, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(71, 'Event', 24, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(72, 'Event', 24, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 25
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(73, 'Event', 25, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 2, "category_id": 5, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(74, 'Event', 25, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(75, 'Event', 25, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 26
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(76, 'Event', 26, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a Thu", "venue_id": 22, "category_id": 6, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(77, 'Event', 26, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(78, 'Event', 26, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 27
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(79, 'Event', 27, 'INSERT', NULL, '{"event_name": "Workshop Photography", "venue_id": 13, "category_id": 7, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(80, 'Event', 27, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(81, 'Event', 27, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 28
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(82, 'Event', 28, 'INSERT', NULL, '{"event_name": "Stand-up Show", "venue_id": 8, "category_id": 8, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(83, 'Event', 28, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(84, 'Event', 28, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 29
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(85, 'Event', 29, 'INSERT', NULL, '{"event_name": "Runway Show: C\u00f4ng Tr\u00ed", "venue_id": 24, "category_id": 9, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(86, 'Event', 29, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(87, 'Event', 29, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 30
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(88, 'Event', 30, 'INSERT', NULL, '{"event_name": "Marathon H\u1ed3 Ch\u00ed Minh 2026", "venue_id": 4, "category_id": 10, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(89, 'Event', 30, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(90, 'Event', 30, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 31
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(91, 'Event', 31, 'INSERT', NULL, '{"event_name": "Acoustic Night", "venue_id": 17, "category_id": 1, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(92, 'Event', 31, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(93, 'Event', 31, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 32
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(94, 'Event', 32, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: Viettel FC vs TP.HCM FC", "venue_id": 13, "category_id": 2, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(95, 'Event', 32, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(96, 'Event', 32, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 33
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(97, 'Event', 33, 'INSERT', NULL, '{"event_name": "Tech Summit 2026", "venue_id": 22, "category_id": 3, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(98, 'Event', 33, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(99, 'Event', 33, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 34
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(100, 'Event', 34, 'INSERT', NULL, '{"event_name": "Tri\u1ec3n l\u00e3m ngh\u1ec7 thu\u1eadt \u0110\u01b0\u01a1ng \u0110\u1ea1i", "venue_id": 14, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(101, 'Event', 34, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(102, 'Event', 34, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 35
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(103, 'Event', 35, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 16, "category_id": 5, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(104, 'Event', 35, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(105, 'Event', 35, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 36
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(106, 'Event', 36, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a Thu", "venue_id": 11, "category_id": 6, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(107, 'Event', 36, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(108, 'Event', 36, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 37
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(109, 'Event', 37, 'INSERT', NULL, '{"event_name": "Kh\u00f3a h\u1ecdc Nhi\u1ebfp \u1ea3nh", "venue_id": 13, "category_id": 7, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(110, 'Event', 37, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(111, 'Event', 37, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 38
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(112, 'Event', 38, 'INSERT', NULL, '{"event_name": "Comedy Night with Tr\u1ea5n Th\u00e0nh", "venue_id": 22, "category_id": 8, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(113, 'Event', 38, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(114, 'Event', 38, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 39
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(115, 'Event', 39, 'INSERT', NULL, '{"event_name": "Runway Show: L\u00ea Thanh H\u00f2a", "venue_id": 18, "category_id": 9, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(116, 'Event', 39, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(117, 'Event', 39, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 40
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(118, 'Event', 40, 'INSERT', NULL, '{"event_name": "Fun Run 21km", "venue_id": 11, "category_id": 10, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(119, 'Event', 40, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(120, 'Event', 40, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 41
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(121, 'Event', 41, 'INSERT', NULL, '{"event_name": "Music Festival M\u00f9a Xu\u00e2n", "venue_id": 16, "category_id": 1, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(122, 'Event', 41, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(123, 'Event', 41, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 42
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(124, 'Event', 42, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: HAGL vs Thanh H\u00f3a", "venue_id": 22, "category_id": 2, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(125, 'Event', 42, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(126, 'Event', 42, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 43
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(127, 'Event', 43, 'INSERT', NULL, '{"event_name": "Tech Summit 2026", "venue_id": 1, "category_id": 3, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(128, 'Event', 43, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(129, 'Event', 43, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 44
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(130, 'Event', 44, 'INSERT', NULL, '{"event_name": "Tri\u1ec3n l\u00e3m ngh\u1ec7 thu\u1eadt \u0110\u01b0\u01a1ng \u0110\u1ea1i", "venue_id": 4, "category_id": 4, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(131, 'Event', 44, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(132, 'Event', 44, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 45
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(133, 'Event', 45, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 11, "category_id": 5, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(134, 'Event', 45, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(135, 'Event', 45, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 46
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(136, 'Event', 46, 'INSERT', NULL, '{"event_name": "Street Food Night", "venue_id": 22, "category_id": 6, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(137, 'Event', 46, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(138, 'Event', 46, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 47
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(139, 'Event', 47, 'INSERT', NULL, '{"event_name": "Workshop Digital Marketing", "venue_id": 17, "category_id": 7, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(140, 'Event', 47, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(141, 'Event', 47, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 48
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(142, 'Event', 48, 'INSERT', NULL, '{"event_name": "Comedy Night with Tr\u01b0\u1eddng Giang", "venue_id": 16, "category_id": 8, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(143, 'Event', 48, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(144, 'Event', 48, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 49
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(145, 'Event', 49, 'INSERT', NULL, '{"event_name": "Fashion Show M\u00f9a \u0110\u00f4ng", "venue_id": 17, "category_id": 9, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(146, 'Event', 49, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(147, 'Event', 49, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 50
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(148, 'Event', 50, 'INSERT', NULL, '{"event_name": "Fun Run 42km", "venue_id": 8, "category_id": 10, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(149, 'Event', 50, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(150, 'Event', 50, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 51
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(151, 'Event', 51, 'INSERT', NULL, '{"event_name": "Music Festival M\u00f9a H\u00e8", "venue_id": 16, "category_id": 1, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(152, 'Event', 51, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(153, 'Event', 51, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 52
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(154, 'Event', 52, 'INSERT', NULL, '{"event_name": "Gi\u1ea3i B\u00f3ng r\u1ed5 Mi\u1ec1n B\u1eafc", "venue_id": 13, "category_id": 2, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(155, 'Event', 52, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(156, 'Event', 52, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 53
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(157, 'Event', 53, 'INSERT', NULL, '{"event_name": "Business Conference", "venue_id": 16, "category_id": 3, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(158, 'Event', 53, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(159, 'Event', 53, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 54
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(160, 'Event', 54, 'INSERT', NULL, '{"event_name": "Art Exhibition: \u0110en V\u00e2u", "venue_id": 16, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(161, 'Event', 54, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(162, 'Event', 54, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 55
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(163, 'Event', 55, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 8, "category_id": 5, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(164, 'Event', 55, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(165, 'Event', 55, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 56
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(166, 'Event', 56, 'INSERT', NULL, '{"event_name": "Street Food Night", "venue_id": 17, "category_id": 6, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(167, 'Event', 56, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(168, 'Event', 56, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 57
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(169, 'Event', 57, 'INSERT', NULL, '{"event_name": "Workshop AI & Machine Learning", "venue_id": 20, "category_id": 7, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(170, 'Event', 57, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(171, 'Event', 57, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 58
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(172, 'Event', 58, 'INSERT', NULL, '{"event_name": "Stand-up Show", "venue_id": 22, "category_id": 8, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(173, 'Event', 58, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(174, 'Event', 58, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 59
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(175, 'Event', 59, 'INSERT', NULL, '{"event_name": "Fashion Show M\u00f9a Xu\u00e2n", "venue_id": 11, "category_id": 9, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(176, 'Event', 59, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(177, 'Event', 59, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 60
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(178, 'Event', 60, 'INSERT', NULL, '{"event_name": "Marathon H\u1ea3i Ph\u00f2ng 2026", "venue_id": 17, "category_id": 10, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(179, 'Event', 60, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(180, 'Event', 60, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 61
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(181, 'Event', 61, 'INSERT', NULL, '{"event_name": "Live Concert: H\u00f2a Minzy", "venue_id": 5, "category_id": 1, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(182, 'Event', 61, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(183, 'Event', 61, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 62
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(184, 'Event', 62, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: H\u00e0 N\u1ed9i FC vs TP.HCM FC", "venue_id": 13, "category_id": 2, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(185, 'Event', 62, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(186, 'Event', 62, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 63
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(187, 'Event', 63, 'INSERT', NULL, '{"event_name": "Digital Marketing Workshop", "venue_id": 1, "category_id": 3, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(188, 'Event', 63, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(189, 'Event', 63, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 64
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(190, 'Event', 64, 'INSERT', NULL, '{"event_name": "Tri\u1ec3n l\u00e3m ngh\u1ec7 thu\u1eadt Hi\u1ec7n \u0110\u1ea1i", "venue_id": 8, "category_id": 4, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(191, 'Event', 64, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(192, 'Event', 64, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 65
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(193, 'Event', 65, 'INSERT', NULL, '{"event_name": "K\u1ecbch: S\u1ed1 \u0110\u1ecf", "venue_id": 2, "category_id": 5, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(194, 'Event', 65, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(195, 'Event', 65, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 66
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(196, 'Event', 66, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a H\u00e8", "venue_id": 16, "category_id": 6, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(197, 'Event', 66, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(198, 'Event', 66, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 67
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(199, 'Event', 67, 'INSERT', NULL, '{"event_name": "Workshop AI & Machine Learning", "venue_id": 9, "category_id": 7, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(200, 'Event', 67, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(201, 'Event', 67, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 68
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(202, 'Event', 68, 'INSERT', NULL, '{"event_name": "Stand-up Show", "venue_id": 15, "category_id": 8, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(203, 'Event', 68, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(204, 'Event', 68, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 69
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(205, 'Event', 69, 'INSERT', NULL, '{"event_name": "Runway Show: L\u00ea Thanh H\u00f2a", "venue_id": 1, "category_id": 9, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(206, 'Event', 69, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(207, 'Event', 69, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 70
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(208, 'Event', 70, 'INSERT', NULL, '{"event_name": "Fun Run 5km", "venue_id": 7, "category_id": 10, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(209, 'Event', 70, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(210, 'Event', 70, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 71
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(211, 'Event', 71, 'INSERT', NULL, '{"event_name": "Music Festival M\u00f9a \u0110\u00f4ng", "venue_id": 4, "category_id": 1, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(212, 'Event', 71, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(213, 'Event', 71, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 72
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(214, 'Event', 72, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: H\u00e0 N\u1ed9i FC vs Thanh H\u00f3a", "venue_id": 7, "category_id": 2, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(215, 'Event', 72, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(216, 'Event', 72, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 73
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(217, 'Event', 73, 'INSERT', NULL, '{"event_name": "Tech Summit 2026", "venue_id": 7, "category_id": 3, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(218, 'Event', 73, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(219, 'Event', 73, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 74
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(220, 'Event', 74, 'INSERT', NULL, '{"event_name": "Art Exhibition: \u0110en V\u00e2u", "venue_id": 7, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(221, 'Event', 74, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(222, 'Event', 74, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 75
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(223, 'Event', 75, 'INSERT', NULL, '{"event_name": "K\u1ecbch: S\u1ed1 \u0110\u1ecf", "venue_id": 7, "category_id": 5, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(224, 'Event', 75, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(225, 'Event', 75, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 76
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(226, 'Event', 76, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a \u0110\u00f4ng", "venue_id": 2, "category_id": 6, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(227, 'Event', 76, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(228, 'Event', 76, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 77
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(229, 'Event', 77, 'INSERT', NULL, '{"event_name": "Kh\u00f3a h\u1ecdc Thi\u1ebft k\u1ebf \u0111\u1ed3 h\u1ecda", "venue_id": 10, "category_id": 7, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(230, 'Event', 77, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(231, 'Event', 77, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 78
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(232, 'Event', 78, 'INSERT', NULL, '{"event_name": "Comedy Night with Tr\u01b0\u1eddng Giang", "venue_id": 20, "category_id": 8, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(233, 'Event', 78, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(234, 'Event', 78, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 79
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(235, 'Event', 79, 'INSERT', NULL, '{"event_name": "Runway Show: \u0110\u1ed7 M\u1ea1nh C\u01b0\u1eddng", "venue_id": 2, "category_id": 9, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(236, 'Event', 79, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(237, 'Event', 79, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 80
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(238, 'Event', 80, 'INSERT', NULL, '{"event_name": "Marathon C\u1ea7n Th\u01a1 2026", "venue_id": 14, "category_id": 10, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(239, 'Event', 80, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(240, 'Event', 80, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 81
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(241, 'Event', 81, 'INSERT', NULL, '{"event_name": "Acoustic Night", "venue_id": 10, "category_id": 1, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(242, 'Event', 81, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(243, 'Event', 81, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 82
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(244, 'Event', 82, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: Viettel FC vs TP.HCM FC", "venue_id": 7, "category_id": 2, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(245, 'Event', 82, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(246, 'Event', 82, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 83
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(247, 'Event', 83, 'INSERT', NULL, '{"event_name": "Digital Marketing Workshop", "venue_id": 5, "category_id": 3, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(248, 'Event', 83, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(249, 'Event', 83, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 84
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(250, 'Event', 84, 'INSERT', NULL, '{"event_name": "Art Exhibition: H\u00f2a Minzy", "venue_id": 14, "category_id": 4, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(251, 'Event', 84, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(252, 'Event', 84, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 85
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(253, 'Event', 85, 'INSERT', NULL, '{"event_name": "Musical Show", "venue_id": 8, "category_id": 5, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(254, 'Event', 85, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(255, 'Event', 85, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 86
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(256, 'Event', 86, 'INSERT', NULL, '{"event_name": "Food Festival M\u00f9a \u0110\u00f4ng", "venue_id": 23, "category_id": 6, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(257, 'Event', 86, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(258, 'Event', 86, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 87
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(259, 'Event', 87, 'INSERT', NULL, '{"event_name": "Kh\u00f3a h\u1ecdc Thi\u1ebft k\u1ebf \u0111\u1ed3 h\u1ecda", "venue_id": 24, "category_id": 7, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(260, 'Event', 87, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(261, 'Event', 87, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 88
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(262, 'Event', 88, 'INSERT', NULL, '{"event_name": "Stand-up Show", "venue_id": 5, "category_id": 8, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(263, 'Event', 88, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(264, 'Event', 88, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 89
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(265, 'Event', 89, 'INSERT', NULL, '{"event_name": "Runway Show: L\u00ea Thanh H\u00f2a", "venue_id": 22, "category_id": 9, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(266, 'Event', 89, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(267, 'Event', 89, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 90
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(268, 'Event', 90, 'INSERT', NULL, '{"event_name": "Marathon H\u1ea3i Ph\u00f2ng 2026", "venue_id": 4, "category_id": 10, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(269, 'Event', 90, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(270, 'Event', 90, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 91
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(271, 'Event', 91, 'INSERT', NULL, '{"event_name": "Acoustic Night", "venue_id": 21, "category_id": 1, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(272, 'Event', 91, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(273, 'Event', 91, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 92
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(274, 'Event', 92, 'INSERT', NULL, '{"event_name": "Tr\u1eadn c\u1ea7u \u0111\u1ec9nh cao: H\u00e0 N\u1ed9i FC vs Thanh H\u00f3a", "venue_id": 10, "category_id": 2, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(275, 'Event', 92, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(276, 'Event', 92, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 93
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(277, 'Event', 93, 'INSERT', NULL, '{"event_name": "Digital Marketing Workshop", "venue_id": 21, "category_id": 3, "status": "PENDING_APPROVAL"}', 85, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(278, 'Event', 93, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(279, 'Event', 93, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 94
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(280, 'Event', 94, 'INSERT', NULL, '{"event_name": "Art Exhibition: S\u01a1n T\u00f9ng MTP", "venue_id": 7, "category_id": 4, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(281, 'Event', 94, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(282, 'Event', 94, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 95
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(283, 'Event', 95, 'INSERT', NULL, '{"event_name": "K\u1ecbch: S\u1ed1 \u0110\u1ecf", "venue_id": 8, "category_id": 5, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(284, 'Event', 95, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(285, 'Event', 95, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 96
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(286, 'Event', 96, 'INSERT', NULL, '{"event_name": "Street Food Night", "venue_id": 8, "category_id": 6, "status": "PENDING_APPROVAL"}', 89, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(287, 'Event', 96, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(288, 'Event', 96, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 97
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(289, 'Event', 97, 'INSERT', NULL, '{"event_name": "Workshop AI & Machine Learning", "venue_id": 8, "category_id": 7, "status": "PENDING_APPROVAL"}', 88, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(290, 'Event', 97, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(291, 'Event', 97, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 98
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(292, 'Event', 98, 'INSERT', NULL, '{"event_name": "Comedy Night with Tr\u1ea5n Th\u00e0nh", "venue_id": 19, "category_id": 8, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(293, 'Event', 98, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(294, 'Event', 98, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 99
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(295, 'Event', 99, 'INSERT', NULL, '{"event_name": "Runway Show: L\u00ea Thanh H\u00f2a", "venue_id": 20, "category_id": 9, "status": "PENDING_APPROVAL"}', 87, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(296, 'Event', 99, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(297, 'Event', 99, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

-- Audit log for Event 100
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(298, 'Event', 100, 'INSERT', NULL, '{"event_name": "Fun Run 21km", "venue_id": 16, "category_id": 10, "status": "PENDING_APPROVAL"}', 86, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(299, 'Event', 100, 'UPDATE', '{"status": "PENDING_APPROVAL"}', '{"status": "APPROVED"}', 1, NOW());
INSERT INTO `AuditLog` (`audit_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `changed_by`, `changed_at`) VALUES
(300, 'Event', 100, 'UPDATE', '{"status": "APPROVED"}', '{"status": "PUBLISHED"}', 1, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- Script completed successfully!