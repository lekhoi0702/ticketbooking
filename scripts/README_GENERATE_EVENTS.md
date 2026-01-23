# Hướng dẫn tạo 100 Events với đầy đủ workflow

## Tổng quan

Script này đã tạo ra:
- ✅ **4 organizers mới** (user_id: 86-89) với đầy đủ thông tin OrganizerInfo
- ✅ **10 event categories** (Âm nhạc, Thể thao, Hội thảo, Triển lãm, Sân khấu, Ẩm thực, Workshop, Hài kịch, Thời trang, Marathon)
- ✅ **24 venues** (3 venues/city x 8 cities)
- ✅ **100 events** với status PUBLISHED (đã được admin approve)
- ✅ **200+ ticket types** (2-3 loại vé/event: VIP, Standard, Economy)
- ✅ **600+ audit logs** (INSERT event, UPDATE PENDING_APPROVAL→APPROVED, UPDATE APPROVED→PUBLISHED)

## Các bước thực hiện

### Bước 1: Generate 100 ảnh events

Có 2 cách để generate ảnh:

#### Cách 1: Sử dụng AI Image Generation (Khuyến nghị)

Bạn có thể sử dụng các công cụ sau để generate ảnh:
- **Google Gemini** (đang dùng trong project)
- **DALL-E 3** (OpenAI)
- **Midjourney**
- **Stable Diffusion**

Prompts cho từng category đã được chuẩn bị sẵn trong file `generate_event_images.py`.

**Chạy script generate ảnh:**

```bash
# Cài đặt dependencies nếu cần
pip install google-generativeai pillow

# Chạy script (cần có API key)
python scripts/generate_event_images.py
```

**Lưu ý:** Bạn cần có API key của Google Gemini hoặc dịch vụ AI khác.

#### Cách 2: Sử dụng ảnh mẫu

Nếu không muốn generate ảnh, bạn có thể:
1. Tải ảnh mẫu từ internet (Unsplash, Pexels, etc.)
2. Đặt tên theo format: `event_{event_id}_{category}.jpg`
3. Copy vào thư mục tương ứng

### Bước 2: Copy ảnh vào đúng thư mục

Cấu trúc thư mục ảnh:

```
ticketbookingapi/uploads/organizers/
├── 85/events/  (Organizer 1)
├── 86/events/  (Organizer 2)
├── 87/events/  (Organizer 3)
├── 88/events/  (Organizer 4)
└── 89/events/  (Organizer 5)
```

**Tạo thư mục:**

```bash
cd ticketbookingapi/uploads/organizers
mkdir -p 85/events 86/events 87/events 88/events 89/events
```

**Copy ảnh vào đúng thư mục theo manager_id trong SQL**

### Bước 3: Chạy SQL script

**Kết nối vào TiDB Cloud database và chạy:**

```sql
-- File: insert_100_events.sql
source scripts/insert_100_events.sql;

-- Hoặc copy-paste nội dung file vào SQL editor
```

**Kiểm tra kết quả:**

```sql
-- Kiểm tra số lượng events
SELECT COUNT(*) FROM Event WHERE status = 'PUBLISHED';
-- Kết quả: 100

-- Kiểm tra số lượng organizers
SELECT COUNT(*) FROM User WHERE role_id = 2;
-- Kết quả: 5 (1 cũ + 4 mới)

-- Kiểm tra số lượng venues
SELECT COUNT(*) FROM Venue;
-- Kết quả: 24

-- Kiểm tra số lượng ticket types
SELECT COUNT(*) FROM TicketType;
-- Kết quả: 200+

-- Kiểm tra audit logs
SELECT COUNT(*) FROM AuditLog WHERE table_name = 'Event';
-- Kết quả: 300 (100 INSERT + 100 UPDATE to APPROVED + 100 UPDATE to PUBLISHED)
```

### Bước 4: Verify trên Web App

1. Khởi động backend:
```bash
cd ticketbookingapi
python run.py
```

2. Khởi động frontend:
```bash
cd ticketbookingwebapp
npm run dev
```

3. Truy cập: `http://localhost:5173`

4. Kiểm tra:
   - Trang chủ hiển thị 100 events
   - Filter theo category
   - Xem chi tiết event
   - Kiểm tra ảnh hiển thị đúng

## Chi tiết dữ liệu đã tạo

### Organizers (5 total)

| ID | Email | Organization Name |
|----|-------|-------------------|
| 85 | organizer@gmail.com | (Existing) |
| 86 | organizer2@gmail.com | Công ty Tổ chức Sự kiện Sao Việt |
| 87 | organizer3@gmail.com | Trung tâm Hội nghị và Triển lãm Quốc tế |
| 88 | organizer4@gmail.com | Công ty Sự kiện Thể thao Việt Nam |
| 89 | organizer5@gmail.com | Trung tâm Văn hóa Nghệ thuật |

### Event Categories (10 total)

1. Âm nhạc
2. Thể thao
3. Hội thảo
4. Triển lãm
5. Sân khấu
6. Ẩm thực
7. Workshop
8. Hài kịch
9. Thời trang
10. Marathon

### Venues (24 total - 3 per city)

**Cities:** Hồ Chí Minh, Hà Nội, Đà Nẵng, Cần Thơ, Nha Trang, Vũng Tàu, Huế, Hải Phòng

**Per city:**
- Trung tâm Hội nghị (capacity: 5000)
- Nhà hát (capacity: 1000)
- Cafe & Event Space (capacity: 200)

### Events (100 total)

- **Distribution:** 10 events per category
- **Status:** All PUBLISHED (đã được admin approve)
- **Featured:** First 10 events are featured
- **Dates:** Random dates in next 6 months
- **Capacity:** Varies by event type (50-5000)

### Ticket Types (200+ total)

- **VIP:** 3x base price
- **Standard:** 2x base price
- **Economy:** 1x base price

Each event has 2-3 ticket types depending on capacity.

### Audit Logs (300+ total)

For each event:
1. INSERT log (event creation)
2. UPDATE log (PENDING_APPROVAL → APPROVED by admin)
3. UPDATE log (APPROVED → PUBLISHED by admin)

## Workflow tuân thủ

Script đã tuân thủ đầy đủ workflow của hệ thống:

1. ✅ **Organizer tạo event** → Status: PENDING_APPROVAL
2. ✅ **Admin approve** → Status: APPROVED
3. ✅ **Admin publish** → Status: PUBLISHED
4. ✅ **Audit logs** được tạo cho mỗi thao tác
5. ✅ **Venues** được tạo trước khi tạo events
6. ✅ **Ticket types** được tạo cùng với events
7. ✅ **OrganizerInfo** được tạo đầy đủ cho mỗi organizer

## Troubleshooting

### Lỗi: Foreign key constraint fails

**Nguyên nhân:** Database chưa có categories hoặc venues

**Giải pháp:** Chạy lại từ đầu file SQL (đã có DROP TABLE IF EXISTS)

### Lỗi: Duplicate entry for key 'PRIMARY'

**Nguyên nhân:** Đã chạy script trước đó

**Giải pháp:** 
```sql
-- Xóa dữ liệu cũ
DELETE FROM AuditLog WHERE table_name = 'Event';
DELETE FROM TicketType WHERE event_id BETWEEN 1 AND 100;
DELETE FROM Event WHERE event_id BETWEEN 1 AND 100;
DELETE FROM Venue WHERE venue_id BETWEEN 1 AND 24;
DELETE FROM EventCategory WHERE category_id BETWEEN 1 AND 10;
DELETE FROM OrganizerInfo WHERE user_id BETWEEN 86 AND 89;
DELETE FROM User WHERE user_id BETWEEN 86 AND 89;

-- Chạy lại script
```

### Ảnh không hiển thị

**Nguyên nhân:** Ảnh chưa được copy vào đúng thư mục

**Giải pháp:**
1. Kiểm tra đường dẫn trong database:
```sql
SELECT event_id, event_name, banner_image_url FROM Event LIMIT 10;
```

2. Kiểm tra file tồn tại:
```bash
ls -la ticketbookingapi/uploads/organizers/85/events/
```

3. Đảm bảo backend serve static files đúng cách

## Kết luận

Script này đã tạo ra một dataset hoàn chỉnh với 100 events, tuân thủ đầy đủ workflow của hệ thống. 

Tất cả dữ liệu đã được tạo với:
- ✅ Thông tin đầy đủ và realistic
- ✅ Audit logs đầy đủ
- ✅ Workflow đúng (PENDING_APPROVAL → APPROVED → PUBLISHED)
- ✅ Phân bổ đều các categories
- ✅ Đa dạng venues và cities
- ✅ Ticket types hợp lý

**Chúc bạn thành công!** 🎉
