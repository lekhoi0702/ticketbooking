import os

f_path = r'C:\Users\khoi.le\Desktop\ticketbooking\ticketbookingwebapp\src\features\admin\pages\Events.jsx'
with open(f_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix literal '?' remaining
replacements = {
    '<Option value="ALL">T?t c?</Option>': '<Option value="ALL">Tất cả</Option>',
    'T?ng s? ${total} s? ki?n': 'Tổng số ${total} sự kiện',
    'Ch? s? ki?n dă duy?t ho?c công khai m?i có th? dánh d?u n?i b?t': 'Chỉ sự kiện đã duyệt hoặc công khai mới có thể đánh dấu nổi bật',
    'Ch? phê duy?t': 'Chờ phê duyệt',
    'Sá»± kiá»‡n ná»•i báº­t': 'Sự kiện nổi bật',
    'Sá»± kiá»‡n thÆ°á»ng': 'Sự kiện thường'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(f_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished fixing Events.jsx")
