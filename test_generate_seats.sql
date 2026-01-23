-- =====================================================
-- QUICK TEST: Generate seats cho 3 events đầu tiên
-- Dùng để test trước khi chạy full script
-- =====================================================

USE ticketbookingdb;

SET FOREIGN_KEY_CHECKS = 0;

-- Xóa test seats cũ (chỉ cho 3 events đầu)
DELETE FROM Seat WHERE ticket_type_id IN (
    SELECT ticket_type_id FROM TicketType WHERE event_id IN (1, 2, 3)
);

DELIMITER $$

-- =====================================================
-- Procedure: Generate seats (copy từ main script)
-- =====================================================
DROP PROCEDURE IF EXISTS sp_test_generate_seats$$

CREATE PROCEDURE sp_test_generate_seats(
    IN p_ticket_type_id INT,
    IN p_quantity INT,
    IN p_area_name VARCHAR(100)
)
BEGIN
    DECLARE v_rows INT;
    DECLARE v_cols INT;
    DECLARE v_row_index INT DEFAULT 1;
    DECLARE v_col_index INT;
    DECLARE v_row_letter VARCHAR(10);
    DECLARE v_seats_created INT DEFAULT 0;
    
    -- Tính layout
    SET v_cols = CEIL(SQRT(p_quantity));
    SET v_rows = CEIL(p_quantity / v_cols);
    
    -- Generate seats
    WHILE v_row_index <= v_rows AND v_seats_created < p_quantity DO
        IF v_row_index <= 26 THEN
            SET v_row_letter = SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ', v_row_index, 1);
        ELSEIF v_row_index <= 52 THEN
            SET v_row_letter = CONCAT('A', SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ', v_row_index - 26, 1));
        ELSE
            SET v_row_letter = CONCAT('B', SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ', v_row_index - 52, 1));
        END IF;
        
        SET v_col_index = 1;
        WHILE v_col_index <= v_cols AND v_seats_created < p_quantity DO
            INSERT INTO Seat (
                ticket_type_id, row_name, seat_number, status, is_active,
                area_name, x_pos, y_pos
            ) VALUES (
                p_ticket_type_id, v_row_letter, CAST(v_col_index AS CHAR),
                'AVAILABLE', 1, p_area_name, v_col_index, v_row_index
            );
            
            SET v_col_index = v_col_index + 1;
            SET v_seats_created = v_seats_created + 1;
        END WHILE;
        
        SET v_row_index = v_row_index + 1;
    END WHILE;
END$$

DELIMITER ;

-- =====================================================
-- Generate seats cho Event 1: Music Festival Mùa Đông
-- =====================================================
SELECT '🎵 Generating seats for Event 1: Music Festival Mùa Đông...' as status;

CALL sp_test_generate_seats(1, 163, 'VIP');
CALL sp_test_generate_seats(2, 466, 'Standard');
CALL sp_test_generate_seats(3, 717, 'Economy');

-- =====================================================
-- Generate seats cho Event 2: Giải Bóng đá Miền Trung
-- =====================================================
SELECT '⚽ Generating seats for Event 2: Giải Bóng đá Miền Trung...' as status;

CALL sp_test_generate_seats(4, 71, 'VIP');
CALL sp_test_generate_seats(5, 230, 'Standard');
CALL sp_test_generate_seats(6, 497, 'Economy');

-- =====================================================
-- Generate seats cho Event 3: Digital Marketing Workshop
-- =====================================================
SELECT '💼 Generating seats for Event 3: Digital Marketing Workshop...' as status;

CALL sp_test_generate_seats(7, 57, 'VIP');
CALL sp_test_generate_seats(8, 516, 'Standard');

-- =====================================================
-- Kiểm tra kết quả
-- =====================================================

SELECT '✅ SUMMARY: Seats generated for Events 1-3' as status;

-- Tổng số seats
SELECT 
    COUNT(*) as total_seats_created,
    COUNT(DISTINCT ticket_type_id) as ticket_types_processed,
    COUNT(DISTINCT area_name) as unique_areas
FROM Seat
WHERE ticket_type_id IN (1,2,3,4,5,6,7,8);

-- Chi tiết theo event
SELECT 
    e.event_id,
    e.event_name,
    tt.ticket_type_id,
    tt.type_name,
    tt.quantity as expected_seats,
    COUNT(s.seat_id) as actual_seats,
    CASE 
        WHEN COUNT(s.seat_id) = tt.quantity THEN '✓ Match'
        ELSE CONCAT('✗ Mismatch (', COUNT(s.seat_id) - tt.quantity, ')')
    END as validation
FROM Event e
JOIN TicketType tt ON e.event_id = tt.event_id
LEFT JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
WHERE e.event_id IN (1, 2, 3)
GROUP BY e.event_id, tt.ticket_type_id
ORDER BY e.event_id, tt.ticket_type_id;

-- Sample seats từ Event 1
SELECT 
    '📋 Sample seats from Event 1 (VIP)' as info;

SELECT 
    s.seat_id,
    s.ticket_type_id,
    s.area_name,
    s.row_name,
    s.seat_number,
    s.status,
    CONCAT('(', s.x_pos, ',', s.y_pos, ')') as position
FROM Seat s
WHERE s.ticket_type_id = 1
ORDER BY s.row_name, CAST(s.seat_number AS UNSIGNED)
LIMIT 20;

-- Kiểm tra layout
SELECT 
    '📐 Layout analysis for Event 1' as info;

SELECT 
    tt.type_name,
    COUNT(DISTINCT s.row_name) as num_rows,
    MAX(CAST(s.seat_number AS UNSIGNED)) as max_cols,
    COUNT(*) as total_seats
FROM TicketType tt
JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
WHERE tt.event_id = 1
GROUP BY tt.ticket_type_id;

SET FOREIGN_KEY_CHECKS = 1;

-- Cleanup procedure
DROP PROCEDURE IF EXISTS sp_test_generate_seats;

SELECT '🎉 Test completed! If results look good, run generate_all_seats.sql for all 100 events.' as next_step;
