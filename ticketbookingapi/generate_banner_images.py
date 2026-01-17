import pymysql
import os

def create_banner_svg(title, banner_id, output_path):
    """
    Create a professional banner SVG with gradient background and text.
    """
    # Different color schemes for variety
    color_schemes = [
        {
            'gradient_start': '#FF6B6B',
            'gradient_end': '#FF9F40',
            'overlay': 'rgba(0, 0, 0, 0.3)',
            'text_color': '#FFFFFF'
        },
        {
            'gradient_start': '#4A90E2',
            'gradient_end': '#6A5ACD',
            'overlay': 'rgba(0, 0, 0, 0.4)',
            'text_color': '#FFFFFF'
        },
        {
            'gradient_start': '#34D399',
            'gradient_end': '#10B981',
            'overlay': 'rgba(0, 0, 0, 0.3)',
            'text_color': '#FFFFFF'
        }
    ]
    
    colors = color_schemes[banner_id % len(color_schemes)]
    
    # Create SVG content (1600x600 for banner)
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bannerGrad{banner_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{colors['gradient_start']};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{colors['gradient_end']};stop-opacity:1" />
    </linearGradient>
    
    <!-- Pattern for visual interest -->
    <pattern id="pattern{banner_id}" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="50" cy="50" r="30" fill="white" opacity="0.05"/>
      <circle cx="0" cy="0" r="30" fill="white" opacity="0.05"/>
      <circle cx="100" cy="100" r="30" fill="white" opacity="0.05"/>
    </pattern>
  </defs>
  
  <!-- Background gradient -->
  <rect width="1600" height="600" fill="url(#bannerGrad{banner_id})" />
  
  <!-- Pattern overlay -->
  <rect width="1600" height="600" fill="url(#pattern{banner_id})" />
  
  <!-- Dark overlay for text readability -->
  <rect width="1600" height="600" fill="{colors['overlay']}" />
  
  <!-- Decorative circles -->
  <circle cx="1400" cy="100" r="150" fill="white" opacity="0.1" />
  <circle cx="200" cy="500" r="100" fill="white" opacity="0.1" />
  
  <!-- Title text -->
  <text x="800" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
        fill="{colors['text_color']}" text-anchor="middle">
    {title}
  </text>
  
  <!-- Subtitle -->
  <text x="800" y="350" font-family="Arial, sans-serif" font-size="32" 
        fill="{colors['text_color']}" text-anchor="middle" opacity="0.9">
    Trải nghiệm sự kiện tuyệt vời
  </text>
  
  <!-- Call to action button background -->
  <rect x="650" y="400" width="300" height="60" rx="30" fill="white" opacity="0.2"/>
  <rect x="652" y="402" width="296" height="56" rx="28" fill="white" opacity="0.9"/>
  
  <!-- Call to action text -->
  <text x="800" y="440" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
        fill="{colors['gradient_end']}" text-anchor="middle">
    Xem chi tiết →
  </text>
</svg>'''
    
    # Save SVG file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✓ Created banner: {output_path}")

def seed_banner_images():
    config = {
        'host': 'mysql-3b8d5202-dailyreport.i.aivencloud.com',
        'port': 20325,
        'user': 'avnadmin',
        'password': 'AVNS_Wyds9xpxDGzYAuRQ8Rm',
        'database': 'ticketbookingdb'
    }
    
    # Create directory structure
    project_root = os.path.dirname(os.path.abspath(__file__))
    banner_dir = os.path.join(project_root, 'uploads', 'banner')
    
    if not os.path.exists(banner_dir):
        os.makedirs(banner_dir)
        print(f"✓ Created directory: {banner_dir}")
    
    conn = pymysql.connect(**config)
    cursor = conn.cursor()
    
    try:
        # Clear existing banners
        cursor.execute("DELETE FROM Banner")
        print("✓ Cleared existing banners")
        
        # Banner data
        banners = [
            {
                'title': 'Đại Nhạc Hội Mùa Hè 2026',
                'link': '/category/1',
                'order': 0
            },
            {
                'title': 'Kịch Nói Kinh Điển',
                'link': '/category/2',
                'order': 1
            },
            {
                'title': 'Giải Bóng Đá Vô Địch',
                'link': '/category/3',
                'order': 2
            }
        ]
        
        print(f"\nGenerating {len(banners)} banner images...\n")
        
        for idx, banner in enumerate(banners):
            # Generate filename
            filename = f"banner_{idx + 1}.svg"
            file_path = os.path.join(banner_dir, filename)
            
            # Create banner image
            create_banner_svg(banner['title'], idx, file_path)
            
            # Update database with banner
            image_url = f"uploads/banner/{filename}"
            sql = """
            INSERT INTO Banner (image_url, title, link, is_active, `order`, created_at)
            VALUES (%s, %s, %s, 1, %s, NOW())
            """
            cursor.execute(sql, (image_url, banner['title'], banner['link'], banner['order']))
            
            print(f"  → Added to database: {banner['title']}")
        
        conn.commit()
        print(f"\n✅ Successfully created {len(banners)} banner images and updated database!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_banner_images()
