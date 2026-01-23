# 🎨 Hướng Dẫn Tạo Ảnh Thực Tế Cho 100 Events

Bạn có **3 lựa chọn** để tạo ảnh thực tế, chất lượng cao cho 100 events:

---

## ⭐ OPTION 1: Pexels API (KHUYẾN NGHỊ - MIỄN PHÍ)

### ✅ Ưu điểm:
- **MIỄN PHÍ 100%**
- Ảnh chất lượng cao, chuyên nghiệp
- API ổn định, không giới hạn
- Tự động download 100 ảnh

### 📝 Hướng dẫn:

1. **Đăng ký API key (2 phút):**
   ```
   https://www.pexels.com/api/
   ```
   - Click "Get Started"
   - Đăng nhập/Đăng ký (miễn phí)
   - Copy API key

2. **Cấu hình script:**
   - Mở file: `scripts/generate_with_pexels.py`
   - Tìm dòng: `PEXELS_API_KEY = "YOUR_PEXELS_API_KEY_HERE"`
   - Thay thế bằng API key của bạn

3. **Chạy script:**
   ```bash
   cd ticketbooking
   python scripts/generate_with_pexels.py
   ```

4. **Chờ ~5-10 phút** để download 100 ảnh

### 📊 Kết quả:
- 100 ảnh chất lượng cao (1920x1080)
- Tự động phân loại theo category
- Lưu vào đúng thư mục: `uploads/organizers/{manager_id}/events/`

---

## 💰 OPTION 2: DALL-E 3 (TRẢ PHÍ - CHẤT LƯỢNG CAO NHẤT)

### ✅ Ưu điểm:
- Ảnh được AI tạo riêng, độc đáo 100%
- Chất lượng photorealistic cực cao
- Tùy chỉnh theo prompt chi tiết

### ❌ Nhược điểm:
- **Chi phí: ~$8 USD** cho 100 ảnh
- Cần OpenAI API key

### 📝 Hướng dẫn:

1. **Lấy OpenAI API key:**
   ```
   https://platform.openai.com/api-keys
   ```
   - Tạo account và nạp tiền ($10 tối thiểu)
   - Tạo API key mới

2. **Cấu hình script:**
   - Mở file: `scripts/generate_with_dalle.py`
   - Thay đổi: `OPENAI_API_KEY = "your_key_here"`

3. **Chạy script:**
   ```bash
   python scripts/generate_with_dalle.py
   ```

4. **Chờ ~30-40 phút** (DALL-E có rate limit)

### 💵 Chi phí:
- $0.080 per image (HD quality, 1792x1024)
- **Tổng: $8.00 USD** cho 100 ảnh

---

## 🎨 OPTION 3: Tạo Thủ Công (CHẤT LƯỢNG TỐT NHẤT)

### ✅ Ưu điểm:
- Kiểm soát hoàn toàn chất lượng
- Ảnh phù hợp 100% với nội dung event
- Có thể sử dụng nhiều nguồn khác nhau

### 📝 Hướng dẫn:

Tôi đã tạo file với **100 prompts chi tiết** cho từng event:

```bash
python scripts/generate_event_images_realistic.py
```

Script sẽ in ra 100 prompts. Bạn có thể:

1. **Sử dụng Google Gemini (Imagen):**
   - Truy cập: https://aistudio.google.com/
   - Chọn model "Imagen"
   - Copy từng prompt và generate
   - Download ảnh

2. **Sử dụng Midjourney:**
   - Join Discord: https://discord.gg/midjourney
   - Dùng `/imagine` command với prompts
   - Download ảnh chất lượng cao

3. **Sử dụng Leonardo.ai:**
   - Truy cập: https://leonardo.ai/
   - Free tier: 150 credits/day
   - Generate với prompts

4. **Tìm ảnh trên stock photo sites:**
   - Pexels.com (miễn phí)
   - Unsplash.com (miễn phí)
   - Pixabay.com (miễn phí)

### 📁 Cấu trúc lưu ảnh:

```
ticketbookingapi/uploads/organizers/
├── 85/events/
│   ├── event_10_marathon.jpg
│   ├── event_18_hài_kịch.jpg
│   └── ...
├── 86/events/
│   ├── event_8_hài_kịch.jpg
│   ├── event_9_thời_trang.jpg
│   └── ...
├── 87/events/
│   ├── event_3_hội_thảo.jpg
│   ├── event_4_triển_lãm.jpg
│   └── ...
├── 88/events/
│   ├── event_1_âm_nhạc.jpg
│   ├── event_6_ẩm_thực.jpg
│   └── ...
└── 89/events/
    ├── event_2_thể_thao.jpg
    ├── event_15_sân_khấu.jpg
    └── ...
```

### 📝 Format tên file:
```
event_{id}_{category}.jpg
```

Ví dụ:
- Event 1 (Âm nhạc) → `event_1_âm_nhạc.jpg`
- Event 2 (Thể thao) → `event_2_thể_thao.jpg`

---

## 🚀 So Sánh Các Options

| Feature | Pexels | DALL-E 3 | Thủ công |
|---------|--------|----------|----------|
| **Chi phí** | ✅ Miễn phí | ❌ $8 USD | ✅ Miễn phí |
| **Thời gian** | ⚡ 5-10 phút | ⏱️ 30-40 phút | 🐌 2-3 giờ |
| **Chất lượng** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tự động** | ✅ 100% | ✅ 100% | ❌ Thủ công |
| **Độc đáo** | ⚠️ Stock photos | ✅ AI-generated | ✅ Tùy chọn |

---

## 💡 Khuyến Nghị

### Cho Development/Testing:
→ **Sử dụng Pexels** (Option 1)
- Nhanh, miễn phí, đủ chất lượng

### Cho Production:
→ **Sử dụng DALL-E 3** (Option 2) hoặc **Thủ công** (Option 3)
- Ảnh độc đáo, chất lượng cao hơn

---

## ❓ Troubleshooting

### Lỗi: "API key invalid"
- Kiểm tra lại API key
- Đảm bảo đã copy đúng (không có khoảng trắng)

### Lỗi: "Rate limit exceeded"
- Chờ 1 giờ và thử lại
- Hoặc giảm `time.sleep()` trong script

### Ảnh không hiển thị trên website:
- Kiểm tra đường dẫn file
- Đảm bảo tên file đúng format
- Restart backend server

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console output để xem lỗi
2. Verify API key còn hoạt động
3. Test với 1-2 ảnh trước khi chạy full 100 ảnh

---

**Chúc bạn thành công! 🎉**
