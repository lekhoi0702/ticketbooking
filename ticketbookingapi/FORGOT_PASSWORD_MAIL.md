# Cấu hình gửi mail cho chức năng Quên mật khẩu

Chức năng **Quên mật khẩu** gửi mật khẩu tạm qua Gmail SMTP. Cần cấu hình trong `.env`:

```env
MAIL_FROM_EMAIL=your@gmail.com
MAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

- **MAIL_FROM_EMAIL**: Địa chỉ Gmail gửi (ví dụ: lekhoi0702@gmail.com).
- **MAIL_APP_PASSWORD**: [App password](https://support.google.com/accounts/answer/185833) của Gmail (16 ký tự, có thể có dấu cách). Không dùng mật khẩu đăng nhập thông thường.

Nếu không cấu hình, yêu cầu quên mật khẩu sẽ trả lỗi "Không thể gửi email".
