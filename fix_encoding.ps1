$ErrorActionPreference = "Stop"
$file = "c:\Users\khoi.le\Desktop\ticketbooking\ticketbookingwebapp\src\pages\admin\Events.jsx"

# Read as bytes and convert
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix all Vietnamese encoding issues
$fixes = @{
    'Xem xÃ©t vÃ  cáº¥p phÃ©p xuáº¥t báº£n cÃ¡c sá»± kiá»‡n trÃªn há»‡ thá»'ng' = 'Xem xét và cấp phép xuất bản các sự kiện trên hệ thống'
    'LÃ m má»›i' = 'Làm mới'
    'Äang cÃ³' = 'Đang có'
    'sá»± kiá»‡n cáº§n Ä'Æ°á»£c báº¡n phÃª duyá»‡t Ä'á»ƒ lÃªn sÃ n' = 'sự kiện cần được bạn phê duyệt để lên sàn'
    'Bá»™ lá»c' = 'Bộ lọc'
    'TÃ¬m kiáº¿m theo tÃªn sá»± kiá»‡n' = 'Tìm kiếm theo tên sự kiện'
    'Tráº¡ng thÃ¡i' = 'Trạng thái'
    'Táº¥t cáº£ tráº¡ng thÃ¡i' = 'Tất cả trạng thái'
    'Chá» duyá»‡t' = 'Chờ duyệt'
    'ÄÃ£ duyá»‡t' = 'Đã duyệt'
    'ÄÃ£ xuáº¥t báº£n' = 'Đã xuất bản'
    'Tá»« chá»'i' = 'Từ chối'
    'NhÃ¡p' = 'Nháp'
    'Äang diá»…n ra' = 'Đang diễn ra'
    'HoÃ n thÃ nh' = 'Hoàn thành'
    'ÄÃ£ há»§y' = 'Đã hủy'
    'Sá»± kiá»‡n ná»•i báº­t' = 'Sự kiện nổi bật'
    'Táº¥t cáº£' = 'Tất cả'
    'Chá»‰ sá»± kiá»‡n ná»•i báº­t' = 'Chỉ sự kiện nổi bật'
    'KhÃ´ng ná»•i báº­t' = 'Không nổi bật'
    'Hiá»ƒn thá»‹' = 'Hiển thị'
    'XÃ³a bá»™ lá»c' = 'Xóa bộ lọc'
}

foreach ($key in $fixes.Keys) {
    $content = $content.Replace($key, $fixes[$key])
}

# Write back
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)

Write-Host "Fixed successfully!"
