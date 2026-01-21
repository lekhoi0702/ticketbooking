# Seat Reservation Feature - 5 Minute Hold

## Tổng quan

Tính năng này cho phép user chọn ghế và giữ ghế trong 5 phút, kể cả khi refresh trang. Nếu user nhấn checkout nhưng không thanh toán thành công (back về trước hoặc nhấn vào trang khác), ghế sẽ được reset.

## Các thay đổi

### Backend

1. **Model mới**: `SeatReservation` - Track reservations với expiry time
2. **Socket.IO Server**: Real-time seat reservation với timeout 5 phút
3. **API Endpoints mới**:
   - `POST /api/seats/lock` - Lock một ghế (5 phút)
   - `POST /api/seats/unlock` - Unlock một ghế
   - `GET /api/seats/my-reservations/:eventId/:userId` - Lấy reservations của user
   - `POST /api/seats/unlock-all` - Unlock tất cả ghế của user trong event

### Frontend

1. **SeatMap Component**: 
   - Tích hợp Socket.IO client
   - Persist reservations qua localStorage
   - Restore reservations khi refresh trang
   - Real-time updates khi ghế được reserve/release

2. **useCheckout Hook**:
   - Unlock tất cả ghế khi user rời checkout mà chưa thanh toán thành công
   - Handle beforeunload event để unlock ghế khi đóng tab

## Migration

Chạy migration script để tạo bảng `SeatReservation`:

```sql
-- Chạy file: ticketbookingapi/migrations/create_seat_reservation_table.sql
```

Hoặc chạy trực tiếp:

```bash
mysql -u your_user -p your_database < ticketbookingapi/migrations/create_seat_reservation_table.sql
```

## Cách hoạt động

### 1. User chọn ghế

- User click vào ghế → Frontend gọi `POST /api/seats/lock`
- Backend tạo `SeatReservation` với `expires_at` = now + 5 phút
- Seat status được set thành `RESERVED`
- Socket.IO broadcast `seat_reserved` event đến tất cả users trong event room
- Frontend lưu reservation vào localStorage với expiry time

### 2. Refresh trang

- Frontend restore reservations từ localStorage
- Gọi `GET /api/seats/my-reservations/:eventId/:userId` để verify
- Nếu reservation còn valid (< 5 phút), ghế vẫn được giữ
- Socket.IO reconnect và join event room

### 3. Timeout 5 phút

- Backend có background task cleanup expired reservations mỗi phút
- Socket.IO timer tự động release ghế sau 5 phút
- Seat status được set về `AVAILABLE`
- Socket.IO broadcast `seat_released` event

### 4. User rời checkout mà chưa thanh toán

- `useCheckout` hook detect khi component unmount
- Gọi `POST /api/seats/unlock-all` để unlock tất cả ghế
- Clear localStorage reservations
- Socket.IO broadcast `seat_released` events

### 5. Thanh toán thành công

- Khi order được tạo thành công, ghế được giữ trong database
- Seat status vẫn là `RESERVED` cho đến khi order được paid
- Reservations không bị unlock khi thanh toán thành công

## Testing

1. **Test chọn ghế và giữ 5 phút**:
   - Chọn một ghế
   - Refresh trang
   - Ghế vẫn được giữ trong 5 phút

2. **Test timeout**:
   - Chọn một ghế
   - Đợi 5 phút
   - Ghế tự động được release

3. **Test rời checkout**:
   - Chọn ghế → Checkout
   - Nhấn back hoặc navigate đến trang khác
   - Ghế được unlock

4. **Test real-time updates**:
   - Mở 2 browsers
   - Browser 1 chọn ghế
   - Browser 2 thấy ghế đó bị reserved ngay lập tức

## Lưu ý

- Socket.IO server chạy trên cùng port với Flask app (5000)
- Cần đảm bảo Socket.IO client kết nối đúng URL
- Reservations được cleanup tự động mỗi phút
- localStorage được sử dụng để persist qua refresh
