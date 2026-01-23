"""
Generate 100 realistic event images using Pexels API (FREE & RELIABLE)
Requires: pip install requests

Get your FREE API key from: https://www.pexels.com/api/
"""

import os
import time
import requests

# ⚠️ THÊM PEXELS API KEY TẠI ĐÂY (MIỄN PHÍ)
# Get it from: https://www.pexels.com/api/
PEXELS_API_KEY = "m4xnBhQcRhWRu7spLQHJ5HUtaF4Fh9wBjQUG9rN2brSItjwV9m4746IM"  # ← THAY ĐỔI DÒNG NÀY

# Pexels API Configuration
PEXELS_API_URL = "https://api.pexels.com/v1/search"

# Base directory
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "ticketbookingapi", "uploads", "organizers")

# Search queries for each category
CATEGORY_QUERIES = {
    "Âm nhạc": [
        "concert stage lights crowd",
        "music festival outdoor",
        "live band performance",
        "rock concert audience",
        "dj party nightclub"
    ],
    "Thể thao": [
        "football stadium match",
        "basketball game arena",
        "marathon city runners",
        "sports event crowd",
        "athletic competition"
    ],
    "Hội thảo": [
        "business conference hall",
        "tech summit presentation",
        "seminar audience",
        "corporate meeting",
        "professional workshop"
    ],
    "Triển lãm": [
        "art gallery exhibition",
        "museum modern art",
        "contemporary art show",
        "gallery opening event",
        "art exhibition visitors"
    ],
    "Sân khấu": [
        "theater stage performance",
        "musical show actors",
        "opera house interior",
        "drama performance",
        "stage curtains spotlight"
    ],
    "Ẩm thực": [
        "food festival market",
        "street food stalls",
        "culinary event",
        "food market night",
        "gourmet festival"
    ],
    "Workshop": [
        "workshop training session",
        "team collaboration meeting",
        "creative workshop",
        "learning seminar",
        "professional training"
    ],
    "Hài kịch": [
        "comedy show stage",
        "stand up comedian",
        "entertainment venue",
        "comedy club performance",
        "comedian microphone"
    ],
    "Thời trang": [
        "fashion show runway",
        "fashion week models",
        "haute couture show",
        "runway catwalk",
        "fashion event"
    ],
    "Marathon": [
        "marathon runners city",
        "running race event",
        "city marathon",
        "athletic race",
        "runners competition"
    ]
}

EVENTS = [
    {"id": 1, "name": "Music Festival Mùa Đông", "category": "Âm nhạc", "manager_id": 88},
    {"id": 2, "name": "Giải Bóng đá Miền Trung", "category": "Thể thao", "manager_id": 89},
    {"id": 3, "name": "Digital Marketing Workshop", "category": "Hội thảo", "manager_id": 87},
    {"id": 4, "name": "Triển lãm nghệ thuật Đương Đại", "category": "Triển lãm", "manager_id": 87},
    {"id": 5, "name": "Kịch: Số Đỏ", "category": "Sân khấu", "manager_id": 87},
    {"id": 6, "name": "Street Food Night", "category": "Ẩm thực", "manager_id": 88},
    {"id": 7, "name": "Khóa học Lập trình Python", "category": "Workshop", "manager_id": 87},
    {"id": 8, "name": "Stand-up Show", "category": "Hài kịch", "manager_id": 86},
    {"id": 9, "name": "Fashion Show Mùa Hè", "category": "Thời trang", "manager_id": 86},
    {"id": 10, "name": "Marathon Vũng Tàu 2026", "category": "Marathon", "manager_id": 85},
    {"id": 11, "name": "Acoustic Night", "category": "Âm nhạc", "manager_id": 86},
    {"id": 12, "name": "Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa", "category": "Thể thao", "manager_id": 88},
    {"id": 13, "name": "Digital Marketing Workshop", "category": "Hội thảo", "manager_id": 87},
    {"id": 14, "name": "Art Exhibition: Mỹ Tâm", "category": "Triển lãm", "manager_id": 87},
    {"id": 15, "name": "Musical Show", "category": "Sân khấu", "manager_id": 89},
    {"id": 16, "name": "Food Festival Mùa Hè", "category": "Ẩm thực", "manager_id": 87},
    {"id": 17, "name": "Khóa học Thiết kế đồ họa", "category": "Workshop", "manager_id": 89},
    {"id": 18, "name": "Comedy Night with Trấn Thành", "category": "Hài kịch", "manager_id": 85},
    {"id": 19, "name": "Fashion Show Mùa Hè", "category": "Thời trang", "manager_id": 85},
    {"id": 20, "name": "Marathon Hải Phòng 2026", "category": "Marathon", "manager_id": 87},
    {"id": 21, "name": "Live Concert: Noo Phước Thịnh", "category": "Âm nhạc", "manager_id": 89},
    {"id": 22, "name": "Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC", "category": "Thể thao", "manager_id": 89},
    {"id": 23, "name": "Business Conference", "category": "Hội thảo", "manager_id": 86},
    {"id": 24, "name": "Art Exhibition: Sơn Tùng MTP", "category": "Triển lãm", "manager_id": 87},
    {"id": 25, "name": "Musical Show", "category": "Sân khấu", "manager_id": 86},
    {"id": 26, "name": "Food Festival Mùa Thu", "category": "Ẩm thực", "manager_id": 89},
    {"id": 27, "name": "Workshop Photography", "category": "Workshop", "manager_id": 88},
    {"id": 28, "name": "Stand-up Show", "category": "Hài kịch", "manager_id": 85},
    {"id": 29, "name": "Runway Show: Công Trí", "category": "Thời trang", "manager_id": 89},
    {"id": 30, "name": "Marathon Hồ Chí Minh 2026", "category": "Marathon", "manager_id": 87},
    {"id": 31, "name": "Acoustic Night", "category": "Âm nhạc", "manager_id": 86},
    {"id": 32, "name": "Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC", "category": "Thể thao", "manager_id": 86},
    {"id": 33, "name": "Tech Summit 2026", "category": "Hội thảo", "manager_id": 87},
    {"id": 34, "name": "Triển lãm nghệ thuật Đương Đại", "category": "Triển lãm", "manager_id": 87},
    {"id": 35, "name": "Musical Show", "category": "Sân khấu", "manager_id": 85},
    {"id": 36, "name": "Food Festival Mùa Thu", "category": "Ẩm thực", "manager_id": 87},
    {"id": 37, "name": "Khóa học Nhiếp ảnh", "category": "Workshop", "manager_id": 86},
    {"id": 38, "name": "Comedy Night with Trấn Thành", "category": "Hài kịch", "manager_id": 87},
    {"id": 39, "name": "Runway Show: Lê Thanh Hòa", "category": "Thời trang", "manager_id": 85},
    {"id": 40, "name": "Fun Run 21km", "category": "Marathon", "manager_id": 89},
    {"id": 41, "name": "Music Festival Mùa Xuân", "category": "Âm nhạc", "manager_id": 87},
    {"id": 42, "name": "Trận cầu đỉnh cao: HAGL vs Thanh Hóa", "category": "Thể thao", "manager_id": 89},
    {"id": 43, "name": "Tech Summit 2026", "category": "Hội thảo", "manager_id": 85},
    {"id": 44, "name": "Triển lãm nghệ thuật Đương Đại", "category": "Triển lãm", "manager_id": 85},
    {"id": 45, "name": "Musical Show", "category": "Sân khấu", "manager_id": 89},
    {"id": 46, "name": "Street Food Night", "category": "Ẩm thực", "manager_id": 87},
    {"id": 47, "name": "Workshop Digital Marketing", "category": "Workshop", "manager_id": 87},
    {"id": 48, "name": "Comedy Night with Trường Giang", "category": "Hài kịch", "manager_id": 87},
    {"id": 49, "name": "Fashion Show Mùa Đông", "category": "Thời trang", "manager_id": 87},
    {"id": 50, "name": "Fun Run 42km", "category": "Marathon", "manager_id": 88},
    {"id": 51, "name": "Music Festival Mùa Hè", "category": "Âm nhạc", "manager_id": 87},
    {"id": 52, "name": "Giải Bóng rổ Miền Bắc", "category": "Thể thao", "manager_id": 86},
    {"id": 53, "name": "Business Conference", "category": "Hội thảo", "manager_id": 85},
    {"id": 54, "name": "Art Exhibition: Đen Vâu", "category": "Triển lãm", "manager_id": 87},
    {"id": 55, "name": "Musical Show", "category": "Sân khấu", "manager_id": 86},
    {"id": 56, "name": "Street Food Night", "category": "Ẩm thực", "manager_id": 88},
    {"id": 57, "name": "Workshop AI & Machine Learning", "category": "Workshop", "manager_id": 88},
    {"id": 58, "name": "Stand-up Show", "category": "Hài kịch", "manager_id": 85},
    {"id": 59, "name": "Fashion Show Mùa Xuân", "category": "Thời trang", "manager_id": 85},
    {"id": 60, "name": "Marathon Hải Phòng 2026", "category": "Marathon", "manager_id": 86},
    {"id": 61, "name": "Live Concert: Hòa Minzy", "category": "Âm nhạc", "manager_id": 86},
    {"id": 62, "name": "Trận cầu đỉnh cao: Hà Nội FC vs TP.HCM FC", "category": "Thể thao", "manager_id": 87},
    {"id": 63, "name": "Digital Marketing Workshop", "category": "Hội thảo", "manager_id": 85},
    {"id": 64, "name": "Triển lãm nghệ thuật Hiện Đại", "category": "Triển lãm", "manager_id": 85},
    {"id": 65, "name": "Kịch: Số Đỏ", "category": "Sân khấu", "manager_id": 85},
    {"id": 66, "name": "Food Festival Mùa Hè", "category": "Ẩm thực", "manager_id": 89},
    {"id": 67, "name": "Workshop AI & Machine Learning", "category": "Workshop", "manager_id": 88},
    {"id": 68, "name": "Stand-up Show", "category": "Hài kịch", "manager_id": 86},
    {"id": 69, "name": "Runway Show: Lê Thanh Hòa", "category": "Thời trang", "manager_id": 86},
    {"id": 70, "name": "Fun Run 5km", "category": "Marathon", "manager_id": 88},
    {"id": 71, "name": "Music Festival Mùa Đông", "category": "Âm nhạc", "manager_id": 87},
    {"id": 72, "name": "Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa", "category": "Thể thao", "manager_id": 87},
    {"id": 73, "name": "Tech Summit 2026", "category": "Hội thảo", "manager_id": 86},
    {"id": 74, "name": "Art Exhibition: Đen Vâu", "category": "Triển lãm", "manager_id": 87},
    {"id": 75, "name": "Kịch: Số Đỏ", "category": "Sân khấu", "manager_id": 88},
    {"id": 76, "name": "Food Festival Mùa Đông", "category": "Ẩm thực", "manager_id": 88},
    {"id": 77, "name": "Khóa học Thiết kế đồ họa", "category": "Workshop", "manager_id": 88},
    {"id": 78, "name": "Comedy Night with Trường Giang", "category": "Hài kịch", "manager_id": 86},
    {"id": 79, "name": "Runway Show: Đỗ Mạnh Cường", "category": "Thời trang", "manager_id": 85},
    {"id": 80, "name": "Marathon Cần Thơ 2026", "category": "Marathon", "manager_id": 86},
    {"id": 81, "name": "Acoustic Night", "category": "Âm nhạc", "manager_id": 86},
    {"id": 82, "name": "Trận cầu đỉnh cao: Viettel FC vs TP.HCM FC", "category": "Thể thao", "manager_id": 89},
    {"id": 83, "name": "Digital Marketing Workshop", "category": "Hội thảo", "manager_id": 88},
    {"id": 84, "name": "Art Exhibition: Hòa Minzy", "category": "Triển lãm", "manager_id": 85},
    {"id": 85, "name": "Musical Show", "category": "Sân khấu", "manager_id": 89},
    {"id": 86, "name": "Food Festival Mùa Đông", "category": "Ẩm thực", "manager_id": 88},
    {"id": 87, "name": "Khóa học Thiết kế đồ họa", "category": "Workshop", "manager_id": 87},
    {"id": 88, "name": "Stand-up Show", "category": "Hài kịch", "manager_id": 85},
    {"id": 89, "name": "Runway Show: Lê Thanh Hòa", "category": "Thời trang", "manager_id": 85},
    {"id": 90, "name": "Marathon Hải Phòng 2026", "category": "Marathon", "manager_id": 89},
    {"id": 91, "name": "Acoustic Night", "category": "Âm nhạc", "manager_id": 86},
    {"id": 92, "name": "Trận cầu đỉnh cao: Hà Nội FC vs Thanh Hóa", "category": "Thể thao", "manager_id": 85},
    {"id": 93, "name": "Digital Marketing Workshop", "category": "Hội thảo", "manager_id": 85},
    {"id": 94, "name": "Art Exhibition: Sơn Tùng MTP", "category": "Triển lãm", "manager_id": 87},
    {"id": 95, "name": "Kịch: Số Đỏ", "category": "Sân khấu", "manager_id": 88},
    {"id": 96, "name": "Street Food Night", "category": "Ẩm thực", "manager_id": 89},
    {"id": 97, "name": "Workshop AI & Machine Learning", "category": "Workshop", "manager_id": 88},
    {"id": 98, "name": "Comedy Night with Trấn Thành", "category": "Hài kịch", "manager_id": 87},
    {"id": 99, "name": "Runway Show: Lê Thanh Hòa", "category": "Thời trang", "manager_id": 87},
    {"id": 100, "name": "Fun Run 21km", "category": "Marathon", "manager_id": 86},
]

def search_and_download(query, event_id, category, manager_id):
    """Search Pexels and download image"""
    try:
        headers = {
            "Authorization": PEXELS_API_KEY
        }
        
        params = {
            "query": query,
            "per_page": 1,
            "orientation": "landscape"
        }
        
        print(f"🔍 Event {event_id}: Searching '{query}'...")
        
        # Search for image
        response = requests.get(PEXELS_API_URL, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('photos'):
            print(f"   ⚠️  No photos found for '{query}'")
            return False
        
        # Get large image URL
        photo = data['photos'][0]
        image_url = photo['src']['large2x']  # High quality
        
        # Download image
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()
        
        # Create directory
        save_dir = os.path.join(BASE_DIR, str(manager_id), "events")
        os.makedirs(save_dir, exist_ok=True)
        
        # Save image
        filename = f"event_{event_id}_{category.lower().replace(' ', '_')}.jpg"
        filepath = os.path.join(save_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(img_response.content)
        
        print(f"   ✅ Saved: {filepath}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   PEXELS IMAGE DOWNLOADER FOR 100 EVENTS (FREE!)            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

✅ MIỄN PHÍ - Chỉ cần đăng ký API key
✅ Ảnh chất lượng cao, chuyên nghiệp
✅ Tự động download 100 ảnh
✅ Ổn định hơn Unsplash

HƯỚNG DẪN:
1. Truy cập: https://www.pexels.com/api/
2. Đăng ký tài khoản (miễn phí)
3. Lấy API key
4. Thay thế trong file này: PEXELS_API_KEY = "your_key_here"
5. Chạy lại script

""")
    
    if PEXELS_API_KEY == "YOUR_PEXELS_API_KEY_HERE":
        print("❌ Vui lòng cấu hình PEXELS_API_KEY trước!\n")
        return
    
    print(f"📊 Tổng số events: {len(EVENTS)}\n")
    
    input("Nhấn ENTER để bắt đầu download...")
    
    success_count = 0
    fail_count = 0
    
    for i, event in enumerate(EVENTS, 1):
        category = event['category']
        queries = CATEGORY_QUERIES.get(category, ["event"])
        
        # Rotate through queries
        query_index = (event['id'] - 1) % len(queries)
        query = queries[query_index]
        
        # Download image
        if search_and_download(query, event['id'], category, event['manager_id']):
            success_count += 1
        else:
            fail_count += 1
        
        # Progress
        if i % 10 == 0:
            print(f"\n{'─'*70}")
            print(f"📈 Progress: {i}/{len(EVENTS)} | ✅ {success_count} | ❌ {fail_count}")
            print(f"{'─'*70}\n")
        
        # Rate limiting (Pexels allows 200 requests/hour)
        time.sleep(2)
    
    print(f"\n\n{'='*70}")
    print(f"🎉 HOÀN THÀNH!")
    print(f"✅ Thành công: {success_count}/{len(EVENTS)}")
    print(f"❌ Thất bại: {fail_count}/{len(EVENTS)}")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
