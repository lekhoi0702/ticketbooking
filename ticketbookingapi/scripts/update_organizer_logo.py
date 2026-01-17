from app import create_app
from app.extensions import db
from app.models.organizer_info import OrganizerInfo

app = create_app()

with app.app_context():
    # Update all organizers to have the new logo for demo purposes, 
    # or just the one associated with the events if we knew the ID.
    # Let's update all for now since it's a demo environment often suitable for "Sky Entertainment"
    organizers = OrganizerInfo.query.all()
    for org in organizers:
        org.organization_name = "Sky Entertainment"
        org.logo_url = "http://127.0.0.1:5000/uploads/organizer_logo_1.png"
        org.description = "Chuyên tổ chức các sự kiện giải trí hàng đầu, mang đến những trải nghiệm âm nhạc đỉnh cao."
    
    db.session.commit()
    print(f"Updated {len(organizers)} organizers with new logo and info.")
