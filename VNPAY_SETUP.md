# Hướng Dẫn Cấu Hình VNPay

## 1. Đăng Ký Tài Khoản VNPay

1. Truy cập https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản sandbox (miễn phí cho môi trường test)
3. Sau khi đăng ký, bạn sẽ nhận được:
   - **TMN Code** (Terminal Code)
   - **Hash Secret** (Secret Key)

## 2. Cấu Hình Backend

Mở file `ticketbookingapi/app/routes/payments.py` và cập nhật các thông tin sau:

```python
# VNPay Configuration
VNPAY_TMN_CODE = "YOUR_TMN_CODE"  # Thay bằng TMN Code của bạn
VNPAY_HASH_SECRET = "YOUR_HASH_SECRET"  # Thay bằng Hash Secret của bạn
VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"  # URL sandbox
VNPAY_RETURN_URL = "http://localhost:5174/payment/vnpay-return"  # URL frontend return
```

### Khuyến nghị: Di chuyển config vào file riêng

Tạo file `ticketbookingapi/app/config.py` và thêm:

```python
import os

class Config:
    # ... existing config ...
    
    # VNPay Configuration
    VNPAY_TMN_CODE = os.getenv('VNPAY_TMN_CODE', 'YOUR_TMN_CODE')
    VNPAY_HASH_SECRET = os.getenv('VNPAY_HASH_SECRET', 'YOUR_HASH_SECRET')
    VNPAY_URL = os.getenv('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
    VNPAY_RETURN_URL = os.getenv('VNPAY_RETURN_URL', 'http://localhost:5174/payment/vnpay-return')
```

## 3. Test Thanh Toán VNPay Sandbox

VNPay Sandbox cung cấp các thẻ test:

### Thẻ ATM Nội Địa
- **Ngân hàng**: NCB
- **Số thẻ**: 9704198526191432198
- **Tên chủ thẻ**: NGUYEN VAN A
- **Ngày phát hành**: 07/15
- **Mật khẩu OTP**: 123456

### Thẻ Quốc Tế
- **Số thẻ**: 4111111111111111
- **Tên chủ thẻ**: NGUYEN VAN A
- **Ngày hết hạn**: 12/25
- **CVV**: 123

## 4. Cấu Hình Production

Khi triển khai production:

1. Đăng ký tài khoản VNPay chính thức tại https://vnpay.vn/
2. Hoàn tất thủ tục hợp đồng và xác minh
3. Cập nhật URL production:
   ```python
   VNPAY_URL = "https://pay.vnpay.vn/vpcpay.html"
   ```
4. Cập nhật VNPAY_RETURN_URL với domain production của bạn

## 5. Webhook/IPN Configuration

VNPay sẽ gửi IPN (Instant Payment Notification) đến endpoint:
```
POST /api/payments/vnpay/callback
```

Đảm bảo endpoint này:
- Có thể truy cập từ internet (không localhost)
- Xử lý request nhanh chóng (< 30 giây)
- Trả về response code 200 khi thành công

## 6. Bảo Mật

⚠️ **QUAN TRỌNG**:
- **KHÔNG** commit Hash Secret vào Git
- Sử dụng environment variables
- Tạo file `.env` và thêm vào `.gitignore`
- Validate secure hash từ VNPay để tránh giả mạo

## 7. Flow Thanh Toán

```
1. User chọn vé và điền thông tin
   ↓
2. Frontend gọi API tạo đơn hàng
   ↓
3. Backend tạo order và payment record
   ↓
4. Backend tạo VNPay payment URL
   ↓
5. Frontend redirect user đến VNPay
   ↓
6. User thanh toán trên VNPay
   ↓
7. VNPay redirect về VNPAY_RETURN_URL
   ↓
8. VNPay gửi IPN đến callback endpoint
   ↓
9. Backend cập nhật payment status
   ↓
10. Frontend hiển thị kết quả
```

## 8. Troubleshooting

### Lỗi "Invalid Signature"
- Kiểm tra Hash Secret
- Đảm bảo sort parameters đúng thứ tự
- Kiểm tra encoding UTF-8

### Lỗi "Invalid TMN Code"
- Kiểm tra TMN Code
- Đảm bảo đang dùng đúng môi trường (sandbox/production)

### Payment không cập nhật status
- Kiểm tra IPN endpoint có accessible không
- Xem logs backend
- Kiểm tra database payment record

## 9. Logs và Monitoring

Thêm logging để debug:

```python
import logging

logger = logging.getLogger(__name__)

@payments_bp.route("/payments/vnpay/callback", methods=["GET"])
def vnpay_callback():
    logger.info(f"VNPay callback received: {request.args}")
    # ... rest of code
```

## 10. Testing Checklist

- [ ] Tạo đơn hàng thành công
- [ ] Redirect đến VNPay thành công
- [ ] Thanh toán thành công cập nhật status
- [ ] Thanh toán thất bại xử lý đúng
- [ ] IPN callback hoạt động
- [ ] Email confirmation được gửi (nếu có)
- [ ] Vé được tạo và active
