-- Migration: Create SeatReservation table for tracking seat reservations with expiry time
-- Date: 2026-01-20

CREATE TABLE IF NOT EXISTS `SeatReservation` (
  `reservation_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `seat_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `reserved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`reservation_id`),
  KEY `idx_seat_id` (`seat_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_seat_user_active` (`seat_id`, `user_id`, `is_active`),
  CONSTRAINT `fk_seat_reservation_seat` FOREIGN KEY (`seat_id`) REFERENCES `Seat` (`seat_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seat_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seat_reservation_event` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for efficient cleanup queries
CREATE INDEX `idx_active_expires` ON `SeatReservation` (`is_active`, `expires_at`);
