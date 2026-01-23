# 📋 Hướng dẫn: Thêm Seatmap và Seats cho Database

## 🎯 Tổng quan
Dự án này bao gồm 3 bước chính:
1. **Thêm seatmap template** vào bảng `Venue` (24 venues)
2. **Generate seats** cho tất cả `TicketType` (253 ticket types, 100 events)
3. **Kiểm tra và validate** dữ liệu

---

## 📁 Files đã tạo

### 1. `add_venue_seatmaps_v2.sql`
**Mục đích:** Cập nhật `seat_map_template` cho 24 venues với format `areas`

**Cấu trúc seatmap:**
```json
{
  "areas": [
    {
      "name": "Tên khu vực",
      "rows": 10,
      "cols": 20,
      "locked_seats": []
    }
  ]
}
```

**Cách chạy:**
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u root -p ticketbookingdb < add_venue_seatmaps_v2.sql
```

**Kết quả:**
- ✅ 24 venues có `seat_map_template`
- ✅ Cập nhật `vip_seats`, `standard_seats`, `economy_seats`

---

### 2. `generate_all_seats.sql` ⭐ RECOMMENDED
**Mục đích:** Tự động generate seats cho TẤT CẢ ticket types

**Tính năng:**
- 🔄 Stored procedure `sp_generate_seats()` - Generate seats cho 1 ticket type
- 🔄 Stored procedure `sp_generate_all_seats()` - Generate cho TẤT CẢ ticket types
- 📊 Auto-calculate layout (rows × cols) dựa trên quantity
- ✅ Validation và reporting

**Cách chạy:**
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u root -p ticketbookingdb < generate_all_seats.sql
```

**Thời gian ước tính:** 2-5 phút (tùy thuộc vào server)

**Kết quả:**
- ✅ ~100,000+ seats được tạo
- ✅ Mỗi seat có: `row_name`, `seat_number`, `area_name`, `x_pos`, `y_pos`
- ✅ Status mặc định: `AVAILABLE`

---

### 3. `generate_seats_for_events.sql`
**Mục đích:** Sample script với manual configuration cho 5 events đầu tiên

**Khi nào dùng:**
- Muốn kiểm soát chính xác area name
- Chỉ generate cho một số events cụ thể
- Testing và debugging

---

### 4. `generate_seats_inserts.py`
**Mục đích:** Python script để generate INSERT statements

**Output:** `insert_seats_data.sql` (8,500 seats cho 10 events đầu)

**Cách chạy:**
```bash
python generate_seats_inserts.py
mysql -h ... -p ticketbookingdb < insert_seats_data.sql
```

**Ưu điểm:**
- ✅ Dễ customize
- ✅ Có thể review SQL trước khi chạy

**Nhược điểm:**
- ❌ File SQL rất lớn nếu generate cho 100 events
- ❌ Chậm hơn stored procedure

---

## 🚀 Quy trình khuyến nghị

### Bước 1: Cập nhật Venue Seatmaps
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u root -p ticketbookingdb < add_venue_seatmaps_v2.sql
```

### Bước 2: Generate TẤT CẢ Seats
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u root -p ticketbookingdb < generate_all_seats.sql
```

### Bước 3: Kiểm tra kết quả
```sql
-- Thống kê tổng quan
SELECT 
    COUNT(*) as total_seats,
    COUNT(DISTINCT ticket_type_id) as ticket_types_with_seats,
    COUNT(DISTINCT area_name) as unique_areas
FROM Seat;

-- Kiểm tra seats theo event
SELECT 
    e.event_id,
    e.event_name,
    COUNT(s.seat_id) as total_seats
FROM Event e
JOIN TicketType tt ON e.event_id = tt.event_id
LEFT JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
WHERE e.event_id <= 10
GROUP BY e.event_id
ORDER BY e.event_id;

-- Xem sample seats
SELECT * FROM Seat WHERE ticket_type_id = 1 LIMIT 20;
```

---

## 📊 Cấu trúc dữ liệu

### Bảng `Venue`
```sql
venue_id | venue_name | seat_map_template (JSON) | vip_seats | standard_seats | economy_seats
---------|------------|--------------------------|-----------|----------------|---------------
1        | Trung tâm HCM | {"areas": [...]}      | 200       | 500            | 900
```

### Bảng `TicketType`
```sql
ticket_type_id | event_id | type_name | quantity
---------------|----------|-----------|----------
1              | 1        | VIP       | 163
2              | 1        | Standard  | 466
3              | 1        | Economy   | 717
```

### Bảng `Seat`
```sql
seat_id | ticket_type_id | row_name | seat_number | area_name | status    | x_pos | y_pos
--------|----------------|----------|-------------|-----------|-----------|-------|-------
1       | 1              | A        | 1           | VIP       | AVAILABLE | 1     | 1
2       | 1              | A        | 2           | VIP       | AVAILABLE | 2     | 1
```

---

## 🔍 Troubleshooting

### Lỗi: "Deadlock found"
**Giải pháp:** Chạy lại script, hoặc giảm batch size

### Lỗi: "Foreign key constraint fails"
**Giải pháp:** 
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Run your script
SET FOREIGN_KEY_CHECKS = 1;
```

### Seats không khớp với quantity
**Kiểm tra:**
```sql
SELECT 
    tt.ticket_type_id,
    tt.quantity as expected,
    COUNT(s.seat_id) as actual
FROM TicketType tt
LEFT JOIN Seat s ON tt.ticket_type_id = s.ticket_type_id
GROUP BY tt.ticket_type_id
HAVING expected != actual;
```

---

## 📈 Thống kê dự kiến

- **Venues:** 24 venues
- **Events:** 100 events
- **Ticket Types:** ~253 ticket types (2-3 types/event)
- **Total Seats:** ~100,000 - 150,000 seats
- **Execution Time:** 2-5 phút

---

## 🎨 Customization

### Thay đổi area names
Sửa trong `sp_generate_seats()`:
```sql
-- Thay vì dùng type_name, dùng custom name
CALL sp_generate_seats(1, 163, 'VIP - Hàng Đầu');
```

### Thay đổi layout
Sửa logic tính rows/cols trong procedure:
```sql
-- Ví dụ: Layout 16:9
SET v_cols = CEIL(SQRT(p_quantity * 16 / 9));
SET v_rows = CEIL(p_quantity / v_cols);
```

---

## ✅ Checklist

- [ ] Chạy `add_venue_seatmaps_v2.sql`
- [ ] Verify venues có seatmap: `SELECT venue_id, seat_map_template FROM Venue WHERE venue_id <= 24`
- [ ] Chạy `generate_all_seats.sql`
- [ ] Verify seats đã được tạo: `SELECT COUNT(*) FROM Seat`
- [ ] Kiểm tra sample data: `SELECT * FROM Seat LIMIT 50`
- [ ] Test UI với seatmap mới

---

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Connection string đúng chưa
2. Database permissions
3. TiDB version compatibility
4. Log files cho error details

---

**Created:** 2026-01-23  
**Version:** 2.0  
**Format:** Areas-based seatmap (grid layout)
