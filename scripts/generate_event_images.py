"""
Script to generate 100 event images using Google Gemini API
This script will create event banner images for all 100 events
"""

import os
import sys
import time
import json
from datetime import datetime
import google.generativeai as genai
from PIL import Image
import io
import requests

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyCe7yTUKmWjHNDF9VC9ZP-IQM2MsJbaRrg"
genai.configure(api_key=GEMINI_API_KEY)

# Image generation model
model = genai.GenerativeModel('gemini-1.5-flash')

# Event categories and their image prompts
IMAGE_PROMPTS = {
    "Âm nhạc": "Professional concert poster design for a live music event. Vibrant stage lighting with purple and blue colors, silhouettes of crowd with raised hands, modern typography, energetic and dynamic atmosphere, high quality event banner, 16:9 aspect ratio",
    "Thể thao": "Sports event poster, dynamic action shot style, stadium atmosphere with bright lights, energetic sports atmosphere, bold typography, professional sports event design, 16:9 aspect ratio",
    "Hội thảo": "Modern tech conference poster, clean minimalist design, abstract geometric shapes in blue and white, professional business atmosphere, corporate event style, 16:9 aspect ratio",
    "Triển lãm": "Art exhibition poster, elegant gallery setting, abstract colorful paintings on white walls, sophisticated cultural event design, modern art aesthetic, soft lighting, elegant typography, 16:9 aspect ratio",
    "Sân khấu": "Theater performance poster, dramatic stage with red curtains, spotlight effect, classic theater atmosphere, elegant vintage-modern design, cultural event style, 16:9 aspect ratio",
    "Ẩm thực": "Food festival event poster, colorful street food stalls, vibrant atmosphere, delicious dishes display, people enjoying food, bold typography, festive and appetizing design, 16:9 aspect ratio",
    "Workshop": "Professional workshop event poster, people collaborating around table, modern office setting, creative brainstorming atmosphere, clean typography, educational event style, 16:9 aspect ratio",
    "Hài kịch": "Stand-up comedy show poster, microphone on stage with spotlight, brick wall background, fun and energetic atmosphere, playful typography, entertainment event design, 16:9 aspect ratio",
    "Thời trang": "Fashion show event poster, elegant runway with models, dramatic lighting, sophisticated glamorous atmosphere, stylish typography, luxury event design, 16:9 aspect ratio",
    "Marathon": "Marathon running event poster, runners in action on city streets, energetic sports atmosphere, sunrise lighting, dynamic typography, athletic event design, 16:9 aspect ratio"
}

# Events data (from SQL script)
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

def generate_event_image(event_id, event_name, category, manager_id, output_path):
    """Generate event image using Google Gemini API"""
    
    try:
        # Get base prompt for category
        base_prompt = IMAGE_PROMPTS.get(category, "Professional event poster, modern design, 16:9 aspect ratio")
        
        # Create full prompt with event name
        full_prompt = f"Create a professional event poster for '{event_name}'. {base_prompt}. Make it visually stunning and eye-catching."
        
        print(f"[{event_id}/100] Generating: {event_name}")
        print(f"  Category: {category}")
        print(f"  Prompt: {full_prompt[:100]}...")
        
        # Note: Gemini API currently doesn't support direct image generation
        # We'll use a placeholder approach or you can integrate with another service
        # For now, let's create a simple colored placeholder
        
        # Create a simple placeholder image
        from PIL import Image, ImageDraw, ImageFont
        
        # Create image with category-specific color
        colors = {
            "Âm nhạc": (138, 43, 226),  # Purple
            "Thể thao": (34, 139, 34),   # Green
            "Hội thảo": (30, 144, 255),  # Blue
            "Triển lãm": (255, 140, 0),  # Orange
            "Sân khấu": (220, 20, 60),   # Red
            "Ẩm thực": (255, 215, 0),    # Gold
            "Workshop": (70, 130, 180),  # Steel Blue
            "Hài kịch": (255, 105, 180), # Hot Pink
            "Thời trang": (186, 85, 211), # Orchid
            "Marathon": (0, 191, 255),   # Deep Sky Blue
        }
        
        color = colors.get(category, (128, 128, 128))
        
        # Create 16:9 image
        width, height = 1920, 1080
        img = Image.new('RGB', (width, height), color=color)
        draw = ImageDraw.Draw(img)
        
        # Add text
        try:
            # Try to use a nice font
            font_large = ImageFont.truetype("arial.ttf", 80)
            font_small = ImageFont.truetype("arial.ttf", 40)
        except:
            # Fallback to default font
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw event name (centered)
        text = event_name
        bbox = draw.textbbox((0, 0), text, font=font_large)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (width - text_width) // 2
        y = (height - text_height) // 2 - 100
        
        # Draw shadow
        draw.text((x+5, y+5), text, fill=(0, 0, 0), font=font_large)
        # Draw text
        draw.text((x, y), text, fill=(255, 255, 255), font=font_large)
        
        # Draw category
        cat_text = category.upper()
        bbox = draw.textbbox((0, 0), cat_text, font=font_small)
        cat_width = bbox[2] - bbox[0]
        cat_x = (width - cat_width) // 2
        cat_y = y + text_height + 50
        draw.text((cat_x, cat_y), cat_text, fill=(255, 255, 255), font=font_small)
        
        # Save image
        img.save(output_path, 'JPEG', quality=95)
        
        print(f"  ✓ Saved: {output_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return False

def main():
    print("=" * 70)
    print("GENERATING 100 EVENT IMAGES")
    print("=" * 70)
    print()
    
    # Base directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    uploads_dir = os.path.join(base_dir, 'ticketbookingapi', 'uploads', 'organizers')
    
    # Create directories for each organizer
    for manager_id in [85, 86, 87, 88, 89]:
        events_dir = os.path.join(uploads_dir, str(manager_id), 'events')
        os.makedirs(events_dir, exist_ok=True)
        print(f"✓ Created directory: {events_dir}")
    
    print()
    print("Starting image generation...")
    print()
    
    success_count = 0
    failed_events = []
    
    for event in EVENTS:
        # Construct output path
        category_slug = event['category'].lower().replace(' ', '_')
        filename = f"event_{event['id']}_{category_slug}.jpg"
        output_dir = os.path.join(uploads_dir, str(event['manager_id']), 'events')
        output_path = os.path.join(output_dir, filename)
        
        # Generate image
        if generate_event_image(
            event['id'],
            event['name'],
            event['category'],
            event['manager_id'],
            output_path
        ):
            success_count += 1
        else:
            failed_events.append(event)
        
        # Rate limiting - wait a bit between requests
        time.sleep(0.5)
        
        # Progress update every 10 images
        if event['id'] % 10 == 0:
            print()
            print(f"Progress: {event['id']}/100 images generated ({success_count} successful)")
            print()
    
    print()
    print("=" * 70)
    print("GENERATION COMPLETE")
    print("=" * 70)
    print(f"✓ Successfully generated: {success_count}/100 images")
    
    if failed_events:
        print(f"✗ Failed: {len(failed_events)} images")
        print("\nFailed events:")
        for event in failed_events:
            print(f"  - Event {event['id']}: {event['name']}")
    else:
        print("✓ All images generated successfully!")
    
    print()
    print("Images saved to:")
    print(f"  {uploads_dir}")
    print()
    print("Next steps:")
    print("  1. Review generated images")
    print("  2. Run SQL script: scripts/insert_100_events.sql")
    print("  3. Start backend and frontend")
    print("  4. Verify events on website")
    print()

if __name__ == "__main__":
    main()