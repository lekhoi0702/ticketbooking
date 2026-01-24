# Migration: Bỏ trạng thái APPROVED của sự kiện

**Trạng thái sự kiện sau khi áp dụng:** Nháp (DRAFT), Chờ duyệt (PENDING_APPROVAL), Công khai (PUBLISHED), Từ chối duyệt (REJECTED), Hủy (CANCELLED). Bỏ Đã phê duyệt (APPROVED).

**Luồng mới:**
- Admin duyệt: PENDING_APPROVAL → PUBLISHED (trực tiếp, không qua APPROVED).
- Admin từ chối: PENDING_APPROVAL → REJECTED.
- Admin hủy sự kiện công khai: PUBLISHED → CANCELLED.

**Chạy migration:**
```bash
mysql -u user -p ticketbookingdb < migrations/remove_approved_event_status.sql
```
Hoặc chạy nội dung `remove_approved_event_status.sql` trong MySQL client.
