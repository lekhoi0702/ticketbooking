from sqlalchemy import text
from app.extensions import db

class OrganizerVenueService:
    @staticmethod
    def get_venues(manager_id):
        query = text("""
            SELECT * FROM venues 
            WHERE manager_id = :manager_id
        """)
        result = db.session.execute(query, {"manager_id": manager_id})
        return [dict(row._mapping) for row in result]

    @staticmethod
    def create_venue(data):
        query = text("""
            INSERT INTO venues (
                venue_name, address, city, capacity, manager_id,
                vip_seats, standard_seats, economy_seats,
                contact_phone, seat_map_template, map_embed_code, status
            ) VALUES (
                :venue_name, :address, :city, :capacity, :manager_id,
                :vip_seats, :standard_seats, :economy_seats,
                :contact_phone, :seat_map_template, :map_embed_code, :status
            )
        """)
        
        params = {
            "venue_name": data.get('venue_name'),
            "address": data.get('address'),
            "city": data.get('city'),
            "capacity": int(data.get('capacity', 0)),
            "manager_id": data.get('manager_id', 1),
            "vip_seats": int(data.get('vip_seats', 0)),
            "standard_seats": int(data.get('standard_seats', 0)),
            "economy_seats": int(data.get('economy_seats', 0)),
            "contact_phone": data.get('contact_phone'),
            "seat_map_template": data.get('seat_map_template'),
            "map_embed_code": data.get('map_embed_code'),
            "status": 'ACTIVE'
        }
        
        db.session.execute(query, params)
        db.session.commit()
        
        # Fetch created venue to return object-like dict (for consistency)
        # Using last_insert_id is DB specific. Safer to query by unique or max ID if concurrency low, 
        # or just return what we inserted + ID if backend supports RETURNING
        # SQLite supports RETURNING in newer versions. MySQL does not always.
        # Let's simple query back.
        
        # For simplicity in this specific "Core" style request without specialized DB knowledge,
        # we often rely on driver quirks. But a standardized simple way:
        fetch_query = text("SELECT * FROM venues WHERE venue_name = :venue_name AND manager_id = :manager_id ORDER BY venue_id DESC LIMIT 1")
        result = db.session.execute(fetch_query, {"venue_name": params['venue_name'], "manager_id": params['manager_id']})
        venue = result.fetchone()
        
        # Mocking a class to support .to_dict() if the controller expects it?
        # The controller calls .to_dict(). I should check the controller usage.
        # The controller calls new_venue.to_dict().
        # So I need to return an object that has to_dict(), or change the controller.
        # Since I'm refactoring the "backend" (service), I should probably return a dict or an object wrapping it.
        # Or better: Update the controller in next steps to handle dicts?
        # The prompt is "refactor backend". Usually implies Service layer logic.
        # If I change return type to dict, accessing .to_dict() in controller will fail.
        # I should provide a wrapper or change controller.
        # Changing controller is cleaner for "Core" style (working with dicts).
        # OR I return a simple object that mimics the model.
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                return dict(self.row._mapping)

        return VenueWrapper(venue)

    @staticmethod
    def update_venue(venue_id, data):
        # First check existence
        check_query = text("SELECT * FROM venues WHERE venue_id = :venue_id")
        result = db.session.execute(check_query, {"venue_id": venue_id})
        venue = result.fetchone()
        if not venue:
            raise ValueError('Venue not found')

        # Build update query dynamically
        update_fields = []
        params = {"venue_id": venue_id}
        
        if 'venue_name' in data:
            update_fields.append("venue_name = :venue_name")
            params['venue_name'] = data['venue_name']
        if 'address' in data:
            update_fields.append("address = :address")
            params['address'] = data['address']
        if 'city' in data:
             update_fields.append("city = :city")
             params['city'] = data['city']
        if 'contact_phone' in data:
             update_fields.append("contact_phone = :contact_phone")
             params['contact_phone'] = data['contact_phone']
        if 'capacity' in data:
             update_fields.append("capacity = :capacity")
             params['capacity'] = int(data['capacity'])
        if 'vip_seats' in data:
             update_fields.append("vip_seats = :vip_seats")
             params['vip_seats'] = int(data['vip_seats'])
        if 'standard_seats' in data:
             update_fields.append("standard_seats = :standard_seats")
             params['standard_seats'] = int(data['standard_seats'])
        if 'economy_seats' in data:
             update_fields.append("economy_seats = :economy_seats")
             params['economy_seats'] = int(data['economy_seats'])
        if 'status' in data:
             update_fields.append("status = :status")
             params['status'] = data['status']
        if 'seat_map_template' in data:
             update_fields.append("seat_map_template = :seat_map_template")
             params['seat_map_template'] = data['seat_map_template']
        if 'map_embed_code' in data:
             update_fields.append("map_embed_code = :map_embed_code")
             params['map_embed_code'] = data['map_embed_code']
             
        if update_fields:
            sql = f"UPDATE venues SET {', '.join(update_fields)} WHERE venue_id = :venue_id"
            db.session.execute(text(sql), params)
            db.session.commit()
            
        # Return updated
        result = db.session.execute(check_query, {"venue_id": venue_id})
        updated_venue = result.fetchone()
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                return dict(self.row._mapping)
                
        return VenueWrapper(updated_venue)

    @staticmethod
    def get_venue(venue_id):
        query = text("SELECT * FROM venues WHERE venue_id = :venue_id")
        result = db.session.execute(query, {"venue_id": venue_id})
        venue = result.fetchone()
        
        if not venue: return None
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                return dict(self.row._mapping)
        return VenueWrapper(venue)
