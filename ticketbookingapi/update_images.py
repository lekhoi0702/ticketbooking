"""
Update event banner images in database
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import Event

def update_event_images():
    app = create_app()
    
    with app.app_context():
        print("Updating event banner images...")
        
        # Mapping of event names to image files
        image_mapping = {
            'Chương trình Hòa nhạc Năm mới 2026': '/uploads/events/new-year-concert.jpg',
            'Live Concert - Sơn Tùng M-TP': '/uploads/events/sontung-concert.jpg',
            'Đêm nhạc Trịnh Công Sơn': '/uploads/events/trinh-cong-son.jpg',
            'Festival Âm nhạc Quốc tế': '/uploads/events/music-festival.jpg',
            'Anh Trai "Say Hi" Concert 2026': '/uploads/events/anh-trai-say-hi.jpg',
            'Liveshow Đen Vâu': '/uploads/events/den-vau.jpg',
            'Kịch nói: Số Đỏ': '/uploads/events/so-do.jpg',
            'V.League: HAGL vs Hà Nội FC': '/uploads/events/vleague.jpg'
        }
        
        updated_count = 0
        for event_name, image_url in image_mapping.items():
            event = Event.query.filter_by(event_name=event_name).first()
            if event:
                event.banner_image_url = image_url
                updated_count += 1
                print(f"✓ Updated: {event_name}")
            else:
                print(f"✗ Not found: {event_name}")
        
        db.session.commit()
        print(f"\n✅ Successfully updated {updated_count} event images!")

if __name__ == "__main__":
    update_event_images()
