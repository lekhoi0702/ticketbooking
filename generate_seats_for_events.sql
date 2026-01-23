-- =====================================================
-- Script: Generate Seats cho tất cả Events
-- Tạo seats tự động dựa trên TicketType và Venue seatmap
-- =====================================================

USE ticketbookingdb;

DELIMITER $$

-- =====================================================
-- Stored Procedure: Generate seats cho một ticket type
-- =====================================================
DROP PROCEDURE IF EXISTS generate_seats_for_ticket_type$$

CREATE PROCEDURE generate_seats_for_ticket_type(
    IN p_ticket_type_id INT,
    IN p_area_name VARCHAR(100),
    IN p_rows INT,
    IN p_cols INT
)
BEGIN
    DECLARE v_row_index INT DEFAULT 0;
    DECLARE v_col_index INT DEFAULT 1;
    DECLARE v_row_letter VARCHAR(10);
    DECLARE v_alphabet VARCHAR(26) DEFAULT 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    -- Loop qua các rows
    WHILE v_row_index < p_rows DO
        SET v_row_index = v_row_index + 1;
        
        -- Tạo row letter (A, B, C, ..., Z, AA, AB, ...)
        IF v_row_index <= 26 THEN
            SET v_row_letter = SUBSTRING(v_alphabet, v_row_index, 1);
        ELSE
            SET v_row_letter = CONCAT(
                SUBSTRING(v_alphabet, FLOOR((v_row_index - 1) / 26), 1),
                SUBSTRING(v_alphabet, ((v_row_index - 1) MOD 26) + 1, 1)
            );
        END IF;
        
        -- Loop qua các columns
        SET v_col_index = 1;
        WHILE v_col_index <= p_cols DO
            -- Insert seat
            INSERT INTO Seat (
                ticket_type_id,
                row_name,
                seat_number,
                status,
                is_active,
                area_name,
                x_pos,
                y_pos
            ) VALUES (
                p_ticket_type_id,
                v_row_letter,
                CAST(v_col_index AS CHAR),
                'AVAILABLE',
                1,
                p_area_name,
                v_col_index,
                v_row_index
            );
            
            SET v_col_index = v_col_index + 1;
        END WHILE;
    END WHILE;
END$$

DELIMITER ;

-- =====================================================
-- Xóa seats cũ (nếu cần)
-- =====================================================
-- TRUNCATE TABLE Seat;

-- =====================================================
-- Generate seats cho Event 1 (Music Festival Mùa Đông)
-- Venue 17: Nhà hát Vũng Tàu
-- TicketTypes: 1 (VIP), 2 (Standard), 3 (Economy)
-- =====================================================

-- VIP - Hàng Đầu (10 rows x 20 cols = 200 seats)
CALL generate_seats_for_ticket_type(1, 'VIP - Hàng Đầu', 10, 20);

-- Standard - Giữa (20 rows x 25 cols = 500 seats)  
CALL generate_seats_for_ticket_type(2, 'Standard - Giữa', 20, 25);

-- Economy - Sau (30 rows x 10 cols = 300 seats, phần còn lại không có ghế cố định)
CALL generate_seats_for_ticket_type(3, 'Economy - Sau', 30, 10);

-- =====================================================
-- Generate seats cho Event 2 (Giải Bóng đá Miền Trung)
-- Venue 10: Trung tâm Hội nghị Cần Thơ
-- TicketTypes: 4 (VIP), 5 (Standard), 6 (Economy)
-- =====================================================

-- VIP (12 rows x 22 cols)
CALL generate_seats_for_ticket_type(4, 'Orchestra VIP', 12, 22);

-- Standard (18 rows x 28 cols)
CALL generate_seats_for_ticket_type(5, 'Mezzanine', 18, 28);

-- Economy (25 rows x 20 cols)
CALL generate_seats_for_ticket_type(6, 'Upper Circle', 25, 20);

-- =====================================================
-- Generate seats cho Event 3 (Digital Marketing Workshop)
-- Venue 21: Cafe & Event Space Huế
-- TicketTypes: 7 (VIP), 8 (Standard)
-- =====================================================

-- VIP (8 rows x 7 cols)
CALL generate_seats_for_ticket_type(7, 'Executive Front', 8, 7);

-- Standard (25 rows x 21 cols)
CALL generate_seats_for_ticket_type(8, 'Business Class', 25, 21);

-- =====================================================
-- Generate seats cho Event 4 (Triển lãm nghệ thuật)
-- Venue 5: Nhà hát Hà Nội
-- TicketTypes: 9 (VIP), 10 (Standard)
-- =====================================================

-- VIP (10 rows x 19 cols)
CALL generate_seats_for_ticket_type(9, 'Parterre VIP', 10, 19);

-- Standard (8 rows x 51 cols)
CALL generate_seats_for_ticket_type(10, 'Balcony Tier', 8, 51);

-- =====================================================
-- Generate seats cho Event 5 (Kịch: Số Đỏ)
-- Venue 8: Nhà hát Đà Nẵng
-- TicketTypes: 11 (VIP), 12 (Standard)
-- =====================================================

-- VIP (7 rows x 27 cols)
CALL generate_seats_for_ticket_type(11, 'Premium Orchestra', 7, 27);

-- Standard (15 rows x 27 cols)
CALL generate_seats_for_ticket_type(12, 'Orchestra', 15, 27);

-- =====================================================
-- Tiếp tục generate cho các events khác...
-- Bạn có thể thêm các CALL tương tự cho các events còn lại
-- =====================================================

-- =====================================================
-- Kiểm tra kết quả
-- =====================================================

-- Xem tổng số seats đã tạo cho mỗi ticket type
SELECT 
    tt.ticket_type_id,
    tt.event_id,
    e.event_name,
    tt.type_name,
    tt.quantity as expected_quantity,
    COUNT(s.seat_id) as actual_seats,
    s.area_name
FROM TicketType tt
LEFT JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
LEFT JOIN Event e ON tt.event_id = e.event_id
WHERE tt.ticket_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
GROUP BY tt.ticket_type_id, s.area_name
ORDER BY tt.ticket_type_id, s.area_name;

-- Xem sample seats
SELECT 
    seat_id,
    ticket_type_id,
    area_name,
    row_name,
    seat_number,
    status,
    x_pos,
    y_pos
FROM Seat
WHERE ticket_type_id IN (1, 2, 3)
ORDER BY ticket_type_id, area_name, row_name, seat_number
LIMIT 50;

-- Thống kê tổng quan
SELECT 
    COUNT(*) as total_seats,
    COUNT(DISTINCT ticket_type_id) as ticket_types_with_seats,
    COUNT(DISTINCT area_name) as unique_areas
FROM Seat;
