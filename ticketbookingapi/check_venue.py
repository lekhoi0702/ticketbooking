from app import create_app
from app.models.venue import Venue
import json

app = create_app()
with app.app_context():
    v = Venue.query.filter(Venue.venue_name.like('%Quân Khu 7%')).first()
    if v:
        print(f"VENUE: {v.venue_name}")
        print("TEMPLATE:")
        print(json.dumps(v.seat_map_template, indent=2))
    else:
        print("Venue not found")
