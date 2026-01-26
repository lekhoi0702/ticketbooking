from sqlalchemy import text
from app.extensions import db
from datetime import datetime
import json

class OrganizerVenueService:
    @staticmethod
    def get_venues(organizer_id, exclude_maintenance=True):
        """
        Get venues managed by organizer
        
        Args:
            organizer_id: The organizer's user ID (maps to Venue.organizer_id in DB)
            exclude_maintenance: If True, exclude venues with MAINTENANCE status (default: True)
        """
        if exclude_maintenance:
            query = text("""
                SELECT * FROM Venue 
                WHERE organizer_id = :organizer_id 
                AND status != 'MAINTENANCE' 
                AND is_active = TRUE
                AND status != 'INACTIVE'
            """)
        else:
            query = text("""
                SELECT * FROM Venue 
                WHERE organizer_id = :organizer_id
            """)
        result = db.session.execute(query, {"organizer_id": organizer_id})
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                d = dict(self.row._mapping)
                for k, v in d.items():
                    if isinstance(v, datetime):
                        d[k] = v.isoformat()
                # Parse seat_map from JSON string to dict (if driver returns string)
                if 'seat_map' in d and d['seat_map'] and isinstance(d['seat_map'], str):
                    try:
                        d['seat_map'] = json.loads(d['seat_map'])
                    except Exception:
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
                venue_name, address, city, capacity, organizer_id,
                contact_phone, seat_map, map_embed, status, is_active
            ) VALUES (
                :venue_name, :address, :city, :capacity, :organizer_id,
                :contact_phone, :seat_map, :map_embed, :status, :is_active
            )
        """)
        
        params = {
            "venue_name": data.get('venue_name'),
            "address": data.get('address'),
            "city": data.get('city'),
            "capacity": int(data.get('capacity', 0)),
            "organizer_id": data.get('organizer_id', data.get('manager_id', 1)),
            "contact_phone": data.get('contact_phone'),
            "seat_map": json.dumps(data.get('seat_map')) if isinstance(data.get('seat_map'), (dict, list)) else data.get('seat_map'),
            "map_embed": data.get('map_embed'),
            "status": data.get('status') or 'ACTIVE',
            "is_active": data.get('is_active', True),
        }
        
        db.session.execute(query, params)
        db.session.commit()
        
        fetch_query = text("""
            SELECT * FROM Venue
            WHERE venue_name = :venue_name AND organizer_id = :organizer_id
            ORDER BY venue_id DESC
            LIMIT 1
        """)
        result = db.session.execute(fetch_query, {"venue_name": params['venue_name'], "organizer_id": params['organizer_id']})
        venue = result.fetchone()
        
        class VenueWrapper:
            def __init__(self, row):
                self.row = row
            def to_dict(self):
                d = dict(self.row._mapping) if self.row else {}
                if 'seat_map' in d and d['seat_map'] and isinstance(d['seat_map'], str):
                    try:
                        d['seat_map'] = json.loads(d['seat_map'])
                    except Exception:
                        pass
                return d

        return VenueWrapper(venue)

    @staticmethod
    def update_venue(venue_id, data):
        # First check existence
        check_query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
        result = db.session.execute(check_query, {"venue_id": venue_id})
        venue = result.fetchone()
        if not venue:
            raise ValueError('Venue not found')

        # Check if venue is being used by any PUBLISHED events
        # Only check if we're updating fields that would affect published events
        fields_that_affect_events = ['venue_name', 'address', 'city', 'capacity', 'seat_map', 'map_embed']
        is_updating_critical_fields = any(field in data for field in fields_that_affect_events)
        
        if is_updating_critical_fields:
            published_event_check = text("""
                SELECT COUNT(*) as event_count 
                FROM Event 
                WHERE venue_id = :venue_id AND status = 'PUBLISHED'
            """)
            event_result = db.session.execute(published_event_check, {"venue_id": venue_id})
            published_event_count = event_result.fetchone()[0]
            
            if published_event_count > 0:
                raise ValueError(f'Không thể sửa địa điểm này vì đã có {published_event_count} sự kiện đang được công bố (PUBLISHED) sử dụng địa điểm này. Vui lòng hủy công bố hoặc chuyển các sự kiện sang địa điểm khác trước.')

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
        if 'organizer_id' in data:
             update_fields.append("organizer_id = :organizer_id")
             params['organizer_id'] = int(data['organizer_id'])
        if 'is_active' in data:
             update_fields.append("is_active = :is_active")
             params['is_active'] = bool(data['is_active'])
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
        if 'seat_map' in data:
             update_fields.append("seat_map = :seat_map")
             params['seat_map'] = json.dumps(data['seat_map']) if isinstance(data['seat_map'], (dict, list)) else data['seat_map']
        if 'map_embed' in data:
             update_fields.append("map_embed = :map_embed")
             params['map_embed'] = data['map_embed']
             
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
                # Parse seat_map from JSON string to dict
                if 'seat_map' in d and d['seat_map'] and isinstance(d['seat_map'], str):
                    try:
                        d['seat_map'] = json.loads(d['seat_map'])
                    except Exception:
                        pass
                return d
                
        return VenueWrapper(updated_venue)

    @staticmethod
    def get_venue(venue_id):
        query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
        result = db.session.execute(query, {"venue_id": venue_id})
        venue = result.fetchone()
        
        if not venue: return None
        
        # Check if venue is being used by PUBLISHED events
        published_event_check = text("""
            SELECT COUNT(*) as event_count 
            FROM Event 
            WHERE venue_id = :venue_id AND status = 'PUBLISHED'
        """)
        event_result = db.session.execute(published_event_check, {"venue_id": venue_id})
        published_event_count = event_result.fetchone()[0]
        
        class VenueWrapper:
            def __init__(self, row, has_published_events):
                self.row = row
                self.has_published_events = has_published_events
            def to_dict(self):
                if not self.row: return {}
                d = dict(self.row._mapping)
                from datetime import datetime
                for k, v in d.items():
                    if isinstance(v, datetime):
                        d[k] = v.isoformat()
                
                # Parse seat_map from JSON string to dict
                if 'seat_map' in d and d['seat_map'] and isinstance(d['seat_map'], str):
                    try:
                        d['seat_map'] = json.loads(d['seat_map'])
                    except Exception:
                        pass
                
                # Add published events info
                d['has_published_events'] = self.has_published_events > 0
                d['published_event_count'] = self.has_published_events
                return d
        return VenueWrapper(venue, published_event_count)


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
