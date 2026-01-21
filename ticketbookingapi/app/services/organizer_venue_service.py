from sqlalchemy import text
from app.extensions import db
from datetime import datetime
import json

class OrganizerVenueService:
    @staticmethod
    def get_venues(manager_id, exclude_maintenance=True):
        """
        Get venues managed by organizer
        
        Args:
            manager_id: The organizer's user ID
            exclude_maintenance: If True, exclude venues with MAINTENANCE status (default: True)
        """
        if exclude_maintenance:
            query = text("""
                SELECT * FROM Venue 
                WHERE manager_id = :manager_id 
                AND status != 'MAINTENANCE' 
                AND is_active = TRUE
                AND status != 'INACTIVE'
            """)
        else:
            query = text("""
                SELECT * FROM Venue 
                WHERE manager_id = :manager_id
            """)
        result = db.session.execute(query, {"manager_id": manager_id})
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                d = dict(self.row._mapping)
                for k, v in d.items():
                    if isinstance(v, datetime):
                        d[k] = v.isoformat()
                # Parse seat_map_template from JSON string to dict
                if 'seat_map_template' in d and d['seat_map_template']:
                    if isinstance(d['seat_map_template'], str):
                        try:
                            d['seat_map_template'] = json.loads(d['seat_map_template'])
                        except:
                            pass
                return d

        venues = []
        for row in result:
            venues.append(VenueWrapper(row))
        return venues

    @staticmethod
    def create_venue(data):
        query = text("""
            INSERT INTO Venue (
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
            "seat_map_template": json.dumps(data.get('seat_map_template')) if data.get('seat_map_template') and isinstance(data.get('seat_map_template'), dict) else data.get('seat_map_template'),
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
        fetch_query = text("SELECT * FROM Venue WHERE venue_name = :venue_name AND manager_id = :manager_id ORDER BY venue_id DESC LIMIT 1")
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
        check_query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
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
             new_status = data['status']
             # Check if trying to set status to MAINTENANCE
             if new_status == 'MAINTENANCE':
                 # Check for published events using this venue
                 published_event_check = text("""
                     SELECT COUNT(*) as event_count 
                     FROM Event 
                     WHERE venue_id = :venue_id AND status = 'PUBLISHED'
                 """)
                 event_result = db.session.execute(published_event_check, {"venue_id": venue_id})
                 published_event_count = event_result.fetchone()[0]
                 
                 if published_event_count > 0:
                     raise ValueError(f'Không thể chuyển địa điểm sang chế độ bảo trì vì đã có {published_event_count} sự kiện đang được công bố (PUBLISHED) sử dụng địa điểm này. Vui lòng hủy công bố hoặc chuyển các sự kiện sang địa điểm khác trước.')
             
             update_fields.append("status = :status")
             params['status'] = new_status
        if 'seat_map_template' in data:
             update_fields.append("seat_map_template = :seat_map_template")
             params['seat_map_template'] = json.dumps(data['seat_map_template']) if isinstance(data['seat_map_template'], dict) else data['seat_map_template']
        if 'map_embed_code' in data:
             update_fields.append("map_embed_code = :map_embed_code")
             params['map_embed_code'] = data['map_embed_code']
             
        if update_fields:
            sql = f"UPDATE Venue SET {', '.join(update_fields)} WHERE venue_id = :venue_id"
            db.session.execute(text(sql), params)
            db.session.commit()
            
        # Return updated
        result = db.session.execute(check_query, {"venue_id": venue_id})
        updated_venue = result.fetchone()
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                d = dict(self.row._mapping)
                # Parse seat_map_template from JSON string to dict
                if 'seat_map_template' in d and d['seat_map_template']:
                    if isinstance(d['seat_map_template'], str):
                        try:
                            d['seat_map_template'] = json.loads(d['seat_map_template'])
                        except:
                            pass
                return d
                
        return VenueWrapper(updated_venue)

    @staticmethod
    def get_venue(venue_id):
        query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
        result = db.session.execute(query, {"venue_id": venue_id})
        venue = result.fetchone()
        
        if not venue: return None
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                if not self.row: return {}
                d = dict(self.row._mapping)
                from datetime import datetime
                for k, v in d.items():
                    if isinstance(v, datetime):
                        d[k] = v.isoformat()
                
                # Parse seat_map_template from JSON string to dict
                if 'seat_map_template' in d and d['seat_map_template']:
                    if isinstance(d['seat_map_template'], str):
                        try:
                            d['seat_map_template'] = json.loads(d['seat_map_template'])
                        except Exception as e:
                            print(f"Error parsing seat_map_template: {e}")
                return d
        return VenueWrapper(venue)


    @staticmethod
    def delete_venue(venue_id):
        # Check if venue exists
        check_query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
        result = db.session.execute(check_query, {"venue_id": venue_id})
        venue = result.fetchone()
        
        if not venue:
             raise ValueError('Địa điểm không tồn tại')
             
        # Check for events using this venue
        event_check_query = text("""
            SELECT COUNT(*) as event_count 
            FROM Event 
            WHERE venue_id = :venue_id
        """)
        event_result = db.session.execute(event_check_query, {"venue_id": venue_id})
        event_count = event_result.fetchone()[0]
        
        if event_count > 0:
            raise ValueError(f'Không thể xóa địa điểm này vì đã có {event_count} sự kiện đang sử dụng. Vui lòng xóa hoặc chuyển các sự kiện sang địa điểm khác trước.')
        
        # Safe to delete
        delete_query = text("DELETE FROM Venue WHERE venue_id = :venue_id")
        db.session.execute(delete_query, {"venue_id": venue_id})
        db.session.commit()
        return True
