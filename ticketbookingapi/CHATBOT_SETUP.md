# Chatbot Setup Guide

## Cấu hình API Key

Thêm các biến môi trường sau vào file `.env` trong thư mục `ticketbookingapi`:

```env
GEMINI_API_KEY=AIzaSyCe7yTUKmWjHNDF9VC9ZP-IQM2MsJbaRrg
GEMINI_MODEL=gemini-2.5-flash
CHATBOT_ENABLED=true
```

**Lưu ý về Model:**
- `gemini-2.5-flash` (mặc định): Model mới nhất, ổn định, phù hợp production
- `gemini-2.0-flash-exp`: Model thử nghiệm, có thể hết quota nhanh hoặc không available
- `gemini-1.5-flash`: Model cũ hơn, có thể không còn được hỗ trợ
- `gemini-1.5-pro`: Model mạnh hơn cho câu hỏi phức tạp, nhưng chậm và tốn quota hơn

**Nếu gặp lỗi "model not found":**
- Thử đổi sang `gemini-2.0-flash-exp` trong `.env`
- Hoặc kiểm tra danh sách models available tại: https://ai.google.dev/gemini-api/docs/models

## Cài đặt Dependencies

Cài đặt package `google-genai`:

```bash
cd ticketbookingapi
pip install google-genai>=1.0.0
```

Hoặc cài đặt tất cả dependencies:

```bash
pip install -r requirements.txt
```

## Kiểm tra

1. Khởi động Flask server:
```bash
python run.py
```

2. Test API endpoint:
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào"}'
```

3. Mở trình duyệt và kiểm tra chatbot button ở góc dưới bên phải trang web.

## Lưu ý

- API key đã được cung cấp và cấu hình trong code
- Chatbot sẽ tự động lấy thông tin events và orders từ database khi cần
- Không lưu lịch sử chat vào database - mỗi session độc lập
- Chatbot hỗ trợ tiếng Việt và hiểu về hệ thống đặt vé

## Xử lý lỗi Quota

Nếu gặp lỗi "429 RESOURCE_EXHAUSTED" (hết quota):
1. Đợi vài phút để quota reset (thường là 1 phút hoặc 1 ngày tùy loại quota)
2. Kiểm tra quota tại: https://ai.dev/rate-limit
3. Có thể đổi sang model khác trong `.env`: `GEMINI_MODEL=gemini-1.5-pro`
4. Hoặc nâng cấp plan tại Google AI Studio nếu cần quota cao hơn
