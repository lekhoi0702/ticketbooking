-- =====================================================
-- Script: Generate ALL Seats cho TẤT CẢ Events
-- TiDB Compatible Version - Không dùng stored procedures
-- Sử dụng Python script để generate INSERT statements
-- =====================================================

-- NOTE: TiDB không hỗ trợ stored procedures đầy đủ
-- Vui lòng sử dụng Python script để generate seats:
-- 
-- 1. Chạy: python generate_seats_inserts_full.py
-- 2. Import: mysql -h ... -p ticketbookingdb < insert_all_seats.sql
--
-- Hoặc sử dụng script INSERT trực tiếp bên dưới

USE ticketbookingdb;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- Xóa seats cũ nếu cần (CẢNH BÁO!)
-- =====================================================
-- TRUNCATE TABLE Seat;

-- =====================================================
-- SAMPLE: Manual INSERT cho Event 1 (Music Festival)
-- =====================================================

-- Event 1, Ticket Type 1: VIP (163 seats)
-- Layout: 13 rows x 13 cols
-- Chỉ hiển thị 10 seats đầu tiên làm mẫu

INSERT INTO Seat (ticket_type_id, row_name, seat_number, status, is_active, area_name, x_pos, y_pos) VALUES
(1, 'A', '1', 'AVAILABLE', 1, 'VIP', 1, 1),
(1, 'A', '2', 'AVAILABLE', 1, 'VIP', 2, 1),
(1, 'A', '3', 'AVAILABLE', 1, 'VIP', 3, 1),
(1, 'A', '4', 'AVAILABLE', 1, 'VIP', 4, 1),
(1, 'A', '5', 'AVAILABLE', 1, 'VIP', 5, 1),
(1, 'A', '6', 'AVAILABLE', 1, 'VIP', 6, 1),
(1, 'A', '7', 'AVAILABLE', 1, 'VIP', 7, 1),
(1, 'A', '8', 'AVAILABLE', 1, 'VIP', 8, 1),
(1, 'A', '9', 'AVAILABLE', 1, 'VIP', 9, 1),
(1, 'A', '10', 'AVAILABLE', 1, 'VIP', 10, 1);

-- ... (Còn 153 seats nữa cho ticket type 1)
-- ... (Và hàng nghìn seats khác cho các ticket types còn lại)

-- =====================================================
-- RECOMMENDED: Sử dụng Python script
-- =====================================================

-- File Python đã tạo: generate_seats_inserts_full.py
-- Chạy script đó để tạo file SQL hoàn chỉnh với tất cả seats

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Kiểm tra kết quả sau khi import
-- =====================================================

-- Thống kê tổng quan
SELECT 
    COUNT(*) as total_seats,
    COUNT(DISTINCT ticket_type_id) as ticket_types_with_seats,
    COUNT(DISTINCT area_name) as unique_areas,
    SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_seats
FROM Seat;

-- Xem seats theo event
SELECT 
    e.event_id,
    e.event_name,
    tt.type_name,
    tt.quantity as expected_seats,
    COUNT(s.seat_id) as actual_seats,
    CASE 
        WHEN COUNT(s.seat_id) = tt.quantity THEN '✓'
        ELSE '✗'
    END as match_status
FROM Event e
JOIN TicketType tt ON e.event_id = tt.event_id
LEFT JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
WHERE e.event_id <= 10
GROUP BY e.event_id, tt.ticket_type_id
ORDER BY e.event_id, tt.ticket_type_id;

-- Xem sample seats
SELECT 
    s.seat_id,
    s.ticket_type_id,
    tt.type_name,
    e.event_name,
    s.area_name,
    s.row_name,
    s.seat_number,
    s.status
FROM Seat s
JOIN TicketType tt ON s.ticket_type_id = tt.ticket_type_id
JOIN Event e ON tt.event_id = e.event_id
WHERE e.event_id = 1
ORDER BY s.ticket_type_id, s.row_name, CAST(s.seat_number AS UNSIGNED)
LIMIT 30;
