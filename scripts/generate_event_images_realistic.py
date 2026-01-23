"""
Script to generate 100 REALISTIC event images using Google Imagen 3
This will create high-quality, photorealistic event posters
"""

import os
import time
import requests
from datetime import datetime

# Google Gemini API Configuration
GEMINI_API_KEY = "AIzaSyCe7yTUKmWjHNDF9VC9ZP-IQM2MsJbaRrg"
IMAGEN_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict"

# Detailed prompts for each category
DETAILED_PROMPTS = {
    "Âm nhạc": [
        "Professional concert photography, vibrant stage with purple and blue LED lights, massive crowd with raised hands, smoke effects, professional stage setup, energetic atmosphere, high quality event photography, photorealistic, 16:9",
        "Live music festival poster design, outdoor stage at sunset, colorful stage lights, large crowd silhouettes, festival atmosphere, professional photography, vibrant colors, 16:9 aspect ratio",
        "Rock concert scene, electric guitars on stage, dramatic red lighting, crowd surfing, energetic performance, professional concert photography, high detail, 16:9"
    ],
    "Thể thao": [
        "Professional football match photography, modern stadium with bright floodlights, players in action, dramatic moment, crowd in background, sports photography, high quality, 16:9",
        "Basketball game action shot, indoor arena, players jumping for the ball, dramatic lighting, crowd excitement, professional sports photography, 16:9 aspect ratio",
        "Marathon runners on city streets, sunrise lighting, urban background, athletic action, professional sports event photography, vibrant colors, 16:9"
    ],
    "Hội thảo": [
        "Modern tech conference hall, professional business setting, large LED screens, attendees networking, contemporary architecture, corporate photography, clean aesthetic, 16:9",
        "Business summit interior, glass windows with city skyline, professional people in suits, modern conference room, corporate event photography, high quality, 16:9",
        "Technology expo hall, innovative displays, professional attendees, modern lighting, tech event atmosphere, professional photography, 16:9 aspect ratio"
    ],
    "Triển lãm": [
        "Modern art gallery interior, white walls with colorful abstract paintings, soft gallery lighting, visitors viewing art, sophisticated atmosphere, professional photography, 16:9",
        "Contemporary art exhibition, large canvas paintings, gallery space, art enthusiasts, elegant setting, cultural event photography, high quality, 16:9",
        "Museum exhibition hall, artistic displays, professional lighting, cultural atmosphere, visitors exploring, fine art photography, 16:9 aspect ratio"
    ],
    "Sân khấu": [
        "Theater stage with red velvet curtains, dramatic spotlight, elegant performance space, classic theater interior, cultural event photography, sophisticated atmosphere, 16:9",
        "Musical theater performance, actors on stage, colorful costumes, dramatic lighting, audience in foreground, professional theater photography, 16:9",
        "Opera house interior, grand stage, ornate architecture, performance in progress, classical elegance, professional photography, 16:9 aspect ratio"
    ],
    "Ẩm thực": [
        "Vibrant food festival, colorful food stalls with string lights, people enjoying street food, festive atmosphere, delicious dishes on display, food photography, 16:9",
        "Outdoor food market, diverse cuisine stalls, happy people eating, sunset lighting, festive decorations, professional food event photography, 16:9",
        "Gourmet food festival, chef demonstrations, beautiful food presentations, culinary event, professional photography, appetizing atmosphere, 16:9 aspect ratio"
    ],
    "Workshop": [
        "Modern workshop space, people collaborating around table, laptops and notebooks, creative brainstorming, natural lighting, professional educational photography, 16:9",
        "Professional training session, instructor presenting, engaged participants, modern office setting, educational atmosphere, corporate photography, 16:9",
        "Creative workshop, diverse group working together, modern workspace, collaborative atmosphere, professional photography, 16:9 aspect ratio"
    ],
    "Hài kịch": [
        "Comedy club interior, comedian on stage with microphone, spotlight, brick wall background, laughing audience, entertainment photography, fun atmosphere, 16:9",
        "Stand-up comedy show, performer under spotlight, intimate venue, audience enjoying, professional entertainment photography, 16:9",
        "Comedy night scene, stage with microphone stand, warm lighting, crowd laughing, entertainment venue, professional photography, 16:9 aspect ratio"
    ],
    "Thời trang": [
        "Fashion runway show, elegant models walking, dramatic lighting, sophisticated audience, luxury fashion event, professional fashion photography, 16:9",
        "High fashion show, models in designer clothes, professional runway, glamorous atmosphere, fashion week event, high-end photography, 16:9",
        "Fashion event, elegant runway with spotlights, stylish models, luxury setting, professional fashion photography, 16:9 aspect ratio"
    ],
    "Marathon": [
        "City marathon event, runners on urban streets, sunrise golden hour, city skyline background, athletic action, professional sports photography, 16:9",
        "Marathon race, large group of runners, city environment, energetic atmosphere, morning light, professional event photography, 16:16",
        "Running event, athletes in motion, urban setting, vibrant energy, professional sports photography, dynamic composition, 16:9 aspect ratio"
    ]
}

# Events data
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

print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   HƯỚNG DẪN TẠO ẢNH THỰC TẾ CHO 100 EVENTS                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Do Google Gemini API hiện tại KHÔNG hỗ trợ tạo ảnh trực tiếp,
bạn có 3 lựa chọn để tạo ảnh thực tế:

┌──────────────────────────────────────────────────────────────┐
│ OPTION 1: Sử dụng Gemini trong Google AI Studio (KHUYẾN NGHỊ)│
└──────────────────────────────────────────────────────────────┘

1. Truy cập: https://aistudio.google.com/
2. Login với Google account
3. Chọn "Imagen" model
4. Copy từng prompt dưới đây và generate
5. Download ảnh và đặt tên theo format: event_{id}_{category}.jpg

┌──────────────────────────────────────────────────────────────┐
│ OPTION 2: Sử dụng DALL-E 3 (OpenAI)                         │
└──────────────────────────────────────────────────────────────┘

1. Truy cập: https://platform.openai.com/playground
2. Chọn DALL-E 3 model
3. Copy prompts và generate
4. Download và rename

┌──────────────────────────────────────────────────────────────┐
│ OPTION 3: Sử dụng Midjourney                                │
└──────────────────────────────────────────────────────────────┘

1. Join Midjourney Discord
2. Sử dụng /imagine command với prompts
3. Download ảnh chất lượng cao

╔══════════════════════════════════════════════════════════════╗
║                    PROMPTS CHO 100 EVENTS                    ║
╚══════════════════════════════════════════════════════════════╝
""")

# Generate prompts for all events
for i, event in enumerate(EVENTS, 1):
    category = event['category']
    prompts_list = DETAILED_PROMPTS.get(category, ["Professional event poster, 16:9"])
    
    # Rotate through prompts for variety
    prompt_index = (event['id'] - 1) % len(prompts_list)
    prompt = prompts_list[prompt_index]
    
    # Add event-specific details
    full_prompt = f"{prompt}. Event title: '{event['name']}'. Professional event photography, high quality, detailed, photorealistic."
    
    print(f"\n{'='*70}")
    print(f"EVENT {event['id']}/100: {event['name']}")
    print(f"{'='*70}")
    print(f"Category: {category}")
    print(f"Manager ID: {event['manager_id']}")
    print(f"\nPROMPT:")
    print(f"{full_prompt}")
    print(f"\nSave as: ticketbookingapi/uploads/organizers/{event['manager_id']}/events/event_{event['id']}_{category.lower().replace(' ', '_')}.jpg")
    
    if i % 10 == 0:
        print(f"\n{'─'*70}")
        print(f"Progress: {i}/100 prompts generated")
        print(f"{'─'*70}")

print(f"\n\n{'='*70}")
print("HOÀN THÀNH! Đã tạo 100 prompts chi tiết")
print(f"{'='*70}\n")

print("""
╔══════════════════════════════════════════════════════════════╗
║                    HƯỚNG DẪN NHANH                           ║
╚══════════════════════════════════════════════════════════════╝

1. Copy từng prompt ở trên
2. Paste vào AI image generator (Gemini/DALL-E/Midjourney)
3. Generate và download ảnh
4. Đặt tên theo format: event_{id}_{category}.jpg
5. Copy vào thư mục tương ứng

VÍ DỤ:
- Event 1 → event_1_âm_nhạc.jpg → uploads/organizers/88/events/
- Event 2 → event_2_thể_thao.jpg → uploads/organizers/89/events/

TIP: Bạn có thể sử dụng tool automation như Selenium hoặc
Puppeteer để tự động generate hàng loạt nếu muốn!

Hoặc liên hệ với tôi để tôi hỗ trợ generate bằng các công cụ khác!
""")
