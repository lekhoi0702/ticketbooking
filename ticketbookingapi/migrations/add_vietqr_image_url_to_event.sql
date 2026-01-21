-- Script: Add vietqr_image_url column to Event table
-- Date: 2026-01-XX
-- Purpose: Add column to store VietQR QR code image URL uploaded by organizer

-- Add vietqr_image_url column to Event table
ALTER TABLE Event 
ADD COLUMN vietqr_image_url VARCHAR(500) NULL AFTER banner_image_url;

-- Add comment to column
ALTER TABLE Event 
MODIFY COLUMN vietqr_image_url VARCHAR(500) NULL COMMENT 'URL to VietQR QR code image uploaded by organizer';
