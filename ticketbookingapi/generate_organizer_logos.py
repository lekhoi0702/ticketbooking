import pymysql
import os

def create_organizer_logo_svg(org_name, org_id, output_path):
    """
    Create a professional SVG logo for an organizer.
    Uses the organization's initials with a gradient background.
    """
    # Color schemes for different organizers (professional palettes)
    color_schemes = [
        {'start': '#FF6B6B', 'end': '#FF9F40', 'text': '#C92A2A'},   # Red-Orange
        {'start': '#4A90E2', 'end': '#6A5ACD', 'text': '#2B5A9E'},   # Blue-Purple
        {'start': '#34D399', 'end': '#10B981', 'text': '#047857'},   # Teal-Green
        {'start': '#FB923C', 'end': '#F97316', 'text': '#C2410C'},   # Orange
        {'start': '#8B5CF6', 'end': '#7C3AED', 'text': '#5B21B6'},   # Purple
    ]
    
    # Select color scheme based on org_id
    colors = color_schemes[org_id % len(color_schemes)]
    
    # Extract initials from organization name
    words = org_name.split()
    if len(words) >= 2:
        initials = words[0][0] + words[1][0]
    else:
        initials = words[0][:2] if len(words[0]) >= 2 else words[0][0]
    
    initials = initials.upper()
    
    # Create SVG content
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad{org_id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:{colors['start']};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{colors['end']};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background gradient -->
  <rect width="400" height="400" fill="url(#grad{org_id})" />
  
  <!-- White circle background -->
  <circle cx="200" cy="200" r="160" fill="white" opacity="0.95" />
  
  <!-- Initials text -->
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="140" font-weight="bold" 
        fill="{colors['text']}" text-anchor="middle" dominant-baseline="middle">
    {initials}
  </text>
</svg>'''
    
    # Save SVG file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✓ Created logo: {output_path}")

def seed_organizer_logos():
    config = {
        'host': 'mysql-3b8d5202-dailyreport.i.aivencloud.com',
        'port': 20325,
        'user': 'avnadmin',
        'password': 'AVNS_Wyds9xpxDGzYAuRQ8Rm',
        'database': 'ticketbookingdb'
    }
    
    # Create directory structure
    project_root = os.path.dirname(os.path.abspath(__file__))
    logo_dir = os.path.join(project_root, 'uploads', 'organizer', 'info', 'logo')
    
    if not os.path.exists(logo_dir):
        os.makedirs(logo_dir)
        print(f"✓ Created directory: {logo_dir}")
    
    conn = pymysql.connect(**config)
    cursor = conn.cursor()
    
    try:
        # Get all organizers with their info
        cursor.execute("""
            SELECT oi.organizer_id, oi.user_id, oi.organization_name, u.full_name
            FROM OrganizerInfo oi
            JOIN User u ON oi.user_id = u.user_id
        """)
        organizers = cursor.fetchall()
        
        print(f"\nFound {len(organizers)} organizers. Generating logos...\n")
        
        for organizer_id, user_id, org_name, full_name in organizers:
            # Use organization name if available, otherwise use full name
            display_name = org_name if org_name else full_name
            
            # Generate filename
            filename = f"organizer_{user_id}_logo.svg"
            file_path = os.path.join(logo_dir, filename)
            
            # Create logo
            create_organizer_logo_svg(display_name, organizer_id, file_path)
            
            # Update database with logo URL
            logo_url = f"uploads/organizer/info/logo/{filename}"
            cursor.execute("""
                UPDATE OrganizerInfo 
                SET logo_url = %s 
                WHERE organizer_id = %s
            """, (logo_url, organizer_id))
            
            print(f"  → Updated database for: {display_name}")
        
        conn.commit()
        print(f"\n✅ Successfully generated {len(organizers)} organizer logos!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_organizer_logos()
