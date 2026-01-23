"""
Generate 100 realistic event images using OpenAI DALL-E 3
Requires: pip install openai requests pillow
"""

import os
import time
import requests
from openai import OpenAI

# ⚠️ BẠN CẦN THÊM OPENAI API KEY TẠI ĐÂY
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"  # ← THAY ĐỔI DÒNG NÀY

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Base directory for uploads
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "ticketbookingapi", "uploads", "organizers")

# Detailed prompts for each category
PROMPTS = {
    "Âm nhạc": [
        "Professional concert photography, vibrant stage with purple and blue LED lights, massive crowd with raised hands, smoke effects, energetic atmosphere, photorealistic, 16:9 aspect ratio",
        "Live music festival, outdoor stage at golden hour sunset, colorful stage lights, large crowd silhouettes, festival vibes, professional photography, 16:9",
        "Rock concert scene, electric guitars on stage, dramatic red lighting, crowd surfing, energetic performance, concert photography, 16:9"
    ],
    "Thể thao": [
        "Professional football stadium, bright floodlights, players in action during match, dramatic moment, crowd in background, sports photography, 16:9",
        "Basketball game action, indoor arena, players jumping for ball, dramatic lighting, excited crowd, professional sports photo, 16:9",
        "Marathon runners on city streets, sunrise golden hour, urban skyline background, athletic action, sports event photography, 16:9"
    ],
    "Hội thảo": [
        "Modern tech conference hall, professional business setting, large LED presentation screens, attendees networking, contemporary architecture, corporate photography, 16:9",
        "Business summit interior, floor-to-ceiling windows with city skyline view, professionals in business attire, modern conference room, corporate event, 16:9",
        "Technology expo hall, innovative product displays, professional attendees, modern lighting, tech event atmosphere, 16:9"
    ],
    "Triển lãm": [
        "Modern art gallery interior, white walls with colorful contemporary paintings, soft gallery lighting, visitors viewing artwork, sophisticated atmosphere, 16:9",
        "Contemporary art exhibition, large canvas paintings, spacious gallery, art enthusiasts admiring work, elegant cultural setting, 16:9",
        "Museum exhibition hall, artistic displays with professional lighting, cultural atmosphere, visitors exploring exhibits, fine art photography, 16:9"
    ],
    "Sân khấu": [
        "Theater stage with red velvet curtains, dramatic spotlight from above, elegant performance space, classic theater interior, cultural event, 16:9",
        "Musical theater performance, actors in colorful costumes on stage, dramatic stage lighting, audience silhouettes in foreground, 16:9",
        "Opera house interior, grand ornate stage, classical architecture, performance in progress, elegant cultural venue, 16:9"
    ],
    "Ẩm thực": [
        "Vibrant food festival, colorful food stalls with warm string lights, people enjoying street food, festive atmosphere, delicious dishes on display, 16:9",
        "Outdoor food market at dusk, diverse international cuisine stalls, happy people eating and socializing, warm sunset lighting, festive decorations, 16:9",
        "Gourmet food festival, professional chef demonstrations, beautiful food presentations on display, culinary event atmosphere, 16:9"
    ],
    "Workshop": [
        "Modern workshop space, diverse people collaborating around table, laptops and notebooks, creative brainstorming session, natural window lighting, 16:9",
        "Professional training session, instructor presenting at whiteboard, engaged participants taking notes, modern office setting, educational atmosphere, 16:9",
        "Creative workshop, diverse group working together on project, modern coworking space, collaborative atmosphere, 16:9"
    ],
    "Hài kịch": [
        "Comedy club interior, comedian performing on stage with microphone, spotlight, exposed brick wall background, laughing audience, entertainment venue, 16:9",
        "Stand-up comedy show, performer under warm spotlight, intimate venue setting, audience enjoying and laughing, professional entertainment photography, 16:9",
        "Comedy night scene, stage with microphone stand, warm atmospheric lighting, crowd laughing and having fun, entertainment venue, 16:9"
    ],
    "Thời trang": [
        "Fashion runway show, elegant models walking on catwalk, dramatic professional lighting, sophisticated audience seated on sides, luxury fashion event, 16:9",
        "High fashion show, models in designer haute couture, professional runway with spotlights, glamorous atmosphere, fashion week event, 16:9",
        "Fashion event, elegant runway with dramatic lighting, stylish models showcasing designs, luxury setting, professional fashion photography, 16:9"
    ],
    "Marathon": [
        "City marathon event, large group of runners on urban streets, sunrise golden hour lighting, modern city skyline in background, athletic action, 16:9",
        "Marathon race, diverse runners in colorful athletic wear, city environment, energetic atmosphere, beautiful morning light, professional sports photography, 16:9",
        "Running event, athletes in motion on city streets, urban setting with buildings, vibrant energy, professional sports event photography, 16:9"
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
    # ... Add all 100 events here (truncated for brevity)
]

def generate_image(prompt, event_id, category, manager_id):
    """Generate image using DALL-E 3"""
    try:
        print(f"\n🎨 Generating image for Event {event_id}...")
        print(f"   Prompt: {prompt[:80]}...")
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",  # 16:9 aspect ratio
            quality="hd",
            n=1,
        )
        
        image_url = response.data[0].url
        
        # Download image
        img_data = requests.get(image_url).content
        
        # Create directory if not exists
        save_dir = os.path.join(BASE_DIR, str(manager_id), "events")
        os.makedirs(save_dir, exist_ok=True)
        
        # Save image
        filename = f"event_{event_id}_{category.lower().replace(' ', '_')}.jpg"
        filepath = os.path.join(save_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(img_data)
        
        print(f"   ✅ Saved: {filepath}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   DALL-E 3 IMAGE GENERATOR FOR 100 EVENTS                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    if OPENAI_API_KEY == "YOUR_OPENAI_API_KEY_HERE":
        print("""
❌ LỖI: Bạn chưa cấu hình OpenAI API Key!

HƯỚNG DẪN:
1. Truy cập: https://platform.openai.com/api-keys
2. Tạo API key mới
3. Mở file này và thay thế dòng:
   OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"
   
4. Chạy lại script

⚠️ LƯU Ý: DALL-E 3 có chi phí:
   - $0.040 per image (1024x1024)
   - $0.080 per image (1792x1024 - HD quality)
   - Tổng chi phí cho 100 ảnh: ~$8 USD
""")
        return
    
    print(f"\n📊 Tổng số events: {len(EVENTS)}")
    print(f"💰 Chi phí ước tính: ${len(EVENTS) * 0.08:.2f} USD\n")
    
    input("Nhấn ENTER để bắt đầu generate (hoặc Ctrl+C để hủy)...")
    
    success_count = 0
    fail_count = 0
    
    for i, event in enumerate(EVENTS, 1):
        category = event['category']
        prompts_list = PROMPTS.get(category, ["Professional event poster, 16:9"])
        
        # Rotate through prompts
        prompt_index = (event['id'] - 1) % len(prompts_list)
        prompt = prompts_list[prompt_index]
        
        # Generate image
        if generate_image(prompt, event['id'], category, event['manager_id']):
            success_count += 1
        else:
            fail_count += 1
        
        # Progress
        if i % 10 == 0:
            print(f"\n{'─'*70}")
            print(f"📈 Progress: {i}/{len(EVENTS)} | ✅ {success_count} | ❌ {fail_count}")
            print(f"{'─'*70}\n")
        
        # Rate limiting (DALL-E has limits)
        if i < len(EVENTS):
            time.sleep(2)  # Wait 2 seconds between requests
    
    print(f"\n\n{'='*70}")
    print(f"🎉 HOÀN THÀNH!")
    print(f"✅ Thành công: {success_count}/{len(EVENTS)}")
    print(f"❌ Thất bại: {fail_count}/{len(EVENTS)}")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
