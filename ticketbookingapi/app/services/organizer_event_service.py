import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from sqlalchemy import text
from app.extensions import db

# Define upload folder relative to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

class EventWrapper:
    def __init__(self, row, ticket_types=None, venue=None):
        self.row = row
        self.ticket_types = ticket_types or []
        self.venue = venue
        self._mapping = row._mapping

    def __getattr__(self, name):
        if name in self._mapping:
            return self._mapping[name]
        raise AttributeError(f"'EventWrapper' object has no attribute '{name}'")

    @property
    def event_id(self):
        return self._mapping['event_id']
    
    @property
    def group_id(self):
        return self._mapping['group_id']

    @property
    def manager_id(self):
        return self._mapping['manager_id']
        
    @property
    def start_datetime(self):
        val = self._mapping['start_datetime']
        if isinstance(val, str): return datetime.fromisoformat(val)
        return val

    @property
    def end_datetime(self):
        val = self._mapping['end_datetime']
        if isinstance(val, str): return datetime.fromisoformat(val)
        return val

    def to_dict(self, include_details=False):
        d = dict(self._mapping)
        # Convert datetime objects to string
        for k, v in d.items():
            if isinstance(v, datetime):
                d[k] = v.isoformat()
        
        if include_details:
            if self.venue:
                d['venue'] = dict(self.venue._mapping) if hasattr(self.venue, '_mapping') else self.venue
            if self.ticket_types:
                d['ticket_types'] = [dict(tt._mapping) for tt in self.ticket_types]
                
        return d

class OrganizerEventService:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @staticmethod
    def _fetch_event(event_id):
        query = text("SELECT * FROM Event WHERE event_id = :event_id")
        result = db.session.execute(query, {"event_id": event_id})
        row = result.fetchone()
        if not row: return None
        return EventWrapper(row)

    @staticmethod
    def get_events(manager_id, status=None):
        sql = "SELECT * FROM Event WHERE manager_id = :manager_id"
        params = {"manager_id": manager_id}
        
        if status:
            sql += " AND status = :status"
            params['status'] = status
            
        sql += " ORDER BY created_at DESC"
        
        result = db.session.execute(text(sql), params)
        rows = result.fetchall()
        
        events_list = []
        for row in rows:
            # We need simple to_dict-like behavior.
            # The original code did: sold / total * 100
            # and included details.
            # We can just return the dict + calculation.
            # For simplicity, we bypass 'include_details=True' complexity for list unless needed.
            # Original code: **event.to_dict(include_details=True)
            # So we SHOULD fetch details? That's expensive for N+1 queries.
            # BUT original code with ORM uses lazy loading or joinedload.
            # Let's simple fetch current row and venue?
            # 'include_details=True' usually means venue and TicketType.
            # Doing N+1 SQL queries is rough but safest for straightforward refactor.
            
            evt = EventWrapper(row)
            
            # Fetch venue
            v_query = text("SELECT * FROM Venue WHERE venue_id = :venue_id")
            v_res = db.session.execute(v_query, {"venue_id": evt.venue_id})
            venue_row = v_res.fetchone()
            evt.venue = venue_row # Wrapper handles None check implicitly if property access
            
            sold = evt.sold_tickets or 0
            total = evt.total_capacity or 0
            
            d = evt.to_dict(include_details=True)
            d['tickets_sold_percentage'] = (sold / total * 100) if total > 0 else 0
            events_list.append(d)
            
        return events_list

    @staticmethod
    def create_event(data, files):
        manager_id = int(data.get('manager_id', 1))
        
        banner_image_url = None
        if 'banner_image' in files:
            file = files['banner_image']
            if file and OrganizerEventService.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                banner_image_url = f"/uploads/{filename}"
        
        venue_id = int(data.get('venue_id'))
        # Check venue
        v_res = db.session.execute(text("SELECT * FROM Venue WHERE venue_id = :id"), {"id": venue_id})
        venue = v_res.fetchone()
        if not venue:
            raise ValueError('Không tìm thấy địa điểm')
        if venue.status != 'ACTIVE':
            raise ValueError(f'Địa điểm "{venue.venue_name}" đang trong quá trình bảo trì hoặc không sẵn sàng.')

        # Helper to check overlap with DB
        def check_overlap(venue_id, start, end, exclude_event_id=None):
            sql = """
                SELECT event_name, start_datetime, end_datetime 
                FROM Event 
                WHERE venue_id = :vid 
                AND status NOT IN ('CANCELLED', 'REJECTED')
                AND (
                    (start_datetime < :end AND end_datetime > :start)
                )
            """
            params = {"vid": venue_id, "start": start, "end": end}
            if exclude_event_id:
                sql += " AND event_id != :exclude_id"
                params["exclude_id"] = exclude_event_id
            
            existing = db.session.execute(text(sql), params).fetchone()
            if existing:
                return existing
            return None

        # Helper to check internal overlap within new showtimes list
        def check_internal_overlap(all_times):
            # Sort by start time
            sorted_times = sorted(all_times, key=lambda x: x['start'])
            for i in range(len(sorted_times) - 1):
                current = sorted_times[i]
                next_event = sorted_times[i+1]
                if current['end'] > next_event['start']:
                     return (current, next_event)
            return None

        # 1. Collect all times to be created (Main + Extra)
        start_datetime = datetime.fromisoformat(data.get('start_datetime'))
        end_datetime = datetime.fromisoformat(data.get('end_datetime'))
        
        all_new_times = [{'start': start_datetime, 'end': end_datetime, 'label': 'Sự kiện chính'}]
        
        extra_showtimes = data.getlist('extra_showtimes')
        if extra_showtimes:
            for idx, st_json in enumerate(extra_showtimes):
                st_data = json.loads(st_json)
                if 'start_datetime' in st_data and 'end_datetime' in st_data:
                    s_dt = datetime.fromisoformat(st_data['start_datetime'])
                    e_dt = datetime.fromisoformat(st_data['end_datetime'])
                    all_new_times.append({'start': s_dt, 'end': e_dt, 'label': f'Suất diễn phụ #{idx+1}'})

        # 2. Check internal overlap
        internal_conflict = check_internal_overlap(all_new_times)
        if internal_conflict:
             c1, c2 = internal_conflict
             raise ValueError(f"Xung đột thời gian giữa các suất diễn mới: {c1['label']} ({c1['start']} - {c1['end']}) và {c2['label']} ({c2['start']} - {c2['end']})")

        # 3. Check DB overlap for each time slot
        for t in all_new_times:
             conflict = check_overlap(venue_id, t['start'], t['end'])
             if conflict:
                  raise ValueError(f"Địa điểm đang bận tại khung giờ {t['start']} - {t['end']}. Trùng với sự kiện: '{conflict.event_name}'")

        # Insert Event
        insert_sql = text("""
            INSERT INTO Event (
                category_id, venue_id, manager_id, event_name, description,
                start_datetime, end_datetime, sale_start_datetime, sale_end_datetime,
                banner_image_url, total_capacity, status, is_featured,
                sold_tickets, created_at, updated_at
            ) VALUES (
                :category_id, :venue_id, :manager_id, :event_name, :description,
                :start_datetime, :end_datetime, :sale_start_datetime, :sale_end_datetime,
                :banner_image_url, :total_capacity, :status, :is_featured,
                0, :now, :now
            )
        """)
        
        now = datetime.utcnow()
        is_featured = data.get('is_featured', 'false').lower() == 'true'
        
        params = {
            "category_id": int(data.get('category_id')),
            "venue_id": venue_id,
            "manager_id": manager_id,
            "event_name": data.get('event_name'),
            "description": data.get('description'),
            "start_datetime": datetime.fromisoformat(data.get('start_datetime')),
            "end_datetime": datetime.fromisoformat(data.get('end_datetime')),
            "sale_start_datetime": datetime.fromisoformat(data.get('sale_start_datetime')) if data.get('sale_start_datetime') else None,
            "sale_end_datetime": datetime.fromisoformat(data.get('sale_end_datetime')) if data.get('sale_end_datetime') else None,
            "banner_image_url": banner_image_url,
            "total_capacity": int(data.get('total_capacity', 0)),
            "status": 'PENDING_APPROVAL',
            "is_featured": is_featured,
            "now": now
        }
        
        result = db.session.execute(insert_sql, params)
        db.session.commit()
        
        # Get Event ID
        # Assuming lastrowid works
        event_id = result.lastrowid
        # Fallback if not supported
        if not event_id:
             # This assumes event_name + manager_id + created_at is unique enough within seconds
             fetch_id = text("SELECT event_id FROM Event WHERE manager_id=:m AND event_name=:n ORDER BY created_at DESC LIMIT 1")
             row = db.session.execute(fetch_id, {"m": manager_id, "n": params['event_name']}).fetchone()
             event_id = row.event_id
             
        # Insert Ticket Types
        ticket_types_data = data.getlist('ticket_types')
        if ticket_types_data:
            tt_sql = text("""
                INSERT INTO TicketType (
                    event_id, type_name, price, quantity, sold_quantity, description
                ) VALUES (
                    :event_id, :type_name, :price, :quantity, 0, :description
                )
            """)
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                db.session.execute(tt_sql, {
                    "event_id": event_id,
                    "type_name": tt_data.get('type_name'),
                    "price": float(tt_data.get('price')),
                    "quantity": int(tt_data.get('quantity')),
                    "description": tt_data.get('description')
                })
        
        db.session.commit()

        # Handle extra showtimes
        extra_showtimes = data.getlist('extra_showtimes')
        if extra_showtimes:
            # Check/Update group_id for main event
            # Standard way implies FetchWrapper logic. 
            # We just need to check if group_id is null.
            evt_row = db.session.execute(text("SELECT group_id FROM Event WHERE event_id = :id"), {"id": event_id}).fetchone()
            if not evt_row.group_id:
                import uuid
                new_gid = str(uuid.uuid4())
                db.session.execute(text("UPDATE Event SET group_id = :gid WHERE event_id = :id"), {"gid": new_gid, "id": event_id})
                db.session.commit()
            
            for st_json in extra_showtimes:
                st_data = json.loads(st_json)
                if 'start_datetime' in st_data and 'end_datetime' in st_data:
                    OrganizerEventService.add_showtime(event_id, st_data)
        
        return OrganizerEventService._fetch_event(event_id)

    @staticmethod
    def update_event(event_id, data, files):
        event_row = db.session.execute(text("SELECT * FROM Event WHERE event_id = :id"), {"id": event_id}).fetchone()
        if not event_row:
            raise ValueError('Event not found')
        
        update_fields = []
        params = {"event_id": event_id}
        
        if 'banner_image' in files:
            file = files['banner_image']
            if file and OrganizerEventService.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                
                update_fields.append("banner_image_url = :banner_image_url")
                params['banner_image_url'] = f"/uploads/{filename}"
        
        mapping = {
            'event_name': 'event_name',
            'description': 'description',
            'category_id': 'category_id',
            'venue_id': 'venue_id',
            'total_capacity': 'total_capacity'
        }
        
        for key, col in mapping.items():
            if data.get(key):
                val = data.get(key)
                if col in ['category_id', 'venue_id', 'total_capacity']:
                    val = int(val)
                update_fields.append(f"{col} = :{col}")
                params[col] = val

        date_fields = ['start_datetime', 'end_datetime', 'sale_start_datetime', 'sale_end_datetime']
        for df in date_fields:
            if data.get(df):
                update_fields.append(f"{df} = :{df}")
                params[df] = datetime.fromisoformat(data.get(df))
                
        if data.get('status'):
            new_status = data.get('status')
            if new_status == 'PUBLISHED' and event_row.status not in ['APPROVED', 'PUBLISHED']:
                 raise ValueError('Sự kiện cần được Admin phê duyệt trước khi đăng')
            update_fields.append("status = :status")
            params['status'] = new_status
            
        if 'is_featured' in data:
            update_fields.append("is_featured = :is_featured")
            params['is_featured'] = (data.get('is_featured', 'false').lower() == 'true')
            
        update_fields.append("updated_at = :now")
        params['now'] = datetime.utcnow()
        
        if update_fields:
            sql = f"UPDATE Event SET {', '.join(update_fields)} WHERE event_id = :event_id"
            db.session.execute(text(sql), params)
            db.session.commit()

        # Update Ticket Types
        ticket_types_data = data.getlist('ticket_types')
        if ticket_types_data:
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                tt_id = tt_data.get('ticket_type_id')
                
                if tt_id:
                    # Update existing
                    # Using specific update fields
                    tt_up_fields = []
                    tt_params = {"id": tt_id}
                    if 'type_name' in tt_data: 
                        tt_up_fields.append("type_name = :type_name")
                        tt_params['type_name'] = tt_data['type_name']
                    if 'price' in tt_data:
                        tt_up_fields.append("price = :price")
                        tt_params['price'] = float(tt_data['price'])
                    if 'description' in tt_data:
                        tt_up_fields.append("description = :description")
                        tt_params['description'] = tt_data['description']
                        
                    if tt_up_fields:
                        tt_sql = f"UPDATE TicketType SET {', '.join(tt_up_fields)} WHERE ticket_type_id = :id"
                        db.session.execute(text(tt_sql), tt_params)
                else:
                    # Insert new
                    ins_sql = text("""
                        INSERT INTO TicketType (event_id, type_name, price, quantity, sold_quantity, description)
                        VALUES (:eid, :tn, :p, :q, 0, :d)
                    """)
                    db.session.execute(ins_sql, {
                        "eid": event_id,
                        "tn": tt_data.get('type_name'),
                        "p": float(tt_data.get('price', 0)),
                        "q": int(tt_data.get('quantity', 0)),
                        "d": tt_data.get('description', '')
                    })
            db.session.commit()

        # Handle extra showtimes
        extra_showtimes = data.getlist('extra_showtimes')
        if extra_showtimes:
            # Check/Set group_id
            curr_row = db.session.execute(text("SELECT group_id FROM Event WHERE event_id = :id"), {"id": event_id}).fetchone()
            if not curr_row.group_id:
                import uuid
                new_gid = str(uuid.uuid4())
                db.session.execute(text("UPDATE Event SET group_id = :gid WHERE event_id = :id"), {"gid": new_gid, "id": event_id})
                db.session.commit()
            
            for st_json in extra_showtimes:
                st_data = json.loads(st_json)
                if 'start_datetime' in st_data and 'end_datetime' in st_data:
                    OrganizerEventService.add_showtime(event_id, st_data)

        return OrganizerEventService._fetch_event(event_id)


    @staticmethod
    def add_showtime(event_id, data):
        # Fetch Source Event
        s_query = text("SELECT * FROM Event WHERE event_id = :id")
        source_event = db.session.execute(s_query, {"id": event_id}).fetchone()
        if not source_event:
            raise ValueError('Sự kiện gốc không tồn tại')
        
        # Ensure source event has group_id
        if not source_event.group_id:
            import uuid
            new_gid = str(uuid.uuid4())
            db.session.execute(text("UPDATE Event SET group_id = :gid WHERE event_id = :id"), 
                             {"gid": new_gid, "id": event_id})
            db.session.commit()
            # Re-fetch to get updated group_id
            source_event = db.session.execute(s_query, {"id": event_id}).fetchone()
            
        # Parse datetime strings without timezone conversion
        start_str = data.get('start_datetime')
        end_str = data.get('end_datetime')
        
        # Handle both ISO format and our custom format
        try:
            start_datetime = datetime.strptime(start_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            start_datetime = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            
        try:
            end_datetime = datetime.strptime(end_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            end_datetime = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        now = datetime.utcnow()
        
        # Insert New Event (Clone)
        insert_sql = text("""
            INSERT INTO Event (
                group_id, category_id, venue_id, manager_id, event_name, description,
                start_datetime, end_datetime, sale_start_datetime, sale_end_datetime,
                banner_image_url, total_capacity, sold_tickets, status, is_featured,
                created_at, updated_at
            ) VALUES (
                :group_id, :category_id, :venue_id, :manager_id, :event_name, :description,
                :start_datetime, :end_datetime, :sale_start_datetime, :sale_end_datetime,
                :banner_image_url, :total_capacity, 0, 'PENDING_APPROVAL', 0,
                :now, :now
            )
        """)
        
        params = {
            "group_id": source_event.group_id,
            "category_id": source_event.category_id,
            "venue_id": source_event.venue_id,
            "manager_id": source_event.manager_id,
            "event_name": source_event.event_name,
            "description": source_event.description,
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
            "sale_start_datetime": source_event.sale_start_datetime,
            "sale_end_datetime": source_event.sale_end_datetime,
            "banner_image_url": source_event.banner_image_url,
            "total_capacity": source_event.total_capacity,
            "now": now
        }
        
        result = db.session.execute(insert_sql, params)
        db.session.commit()
        
        new_event_id = result.lastrowid
        # Fallback ID fetch
        if not new_event_id:
             fetch_id = text("SELECT event_id FROM Event WHERE manager_id=:m AND event_name=:n AND start_datetime=:sd ORDER BY created_at DESC LIMIT 1")
             row = db.session.execute(fetch_id, {"m": source_event.manager_id, "n": source_event.event_name, "sd": start_datetime}).fetchone()
             new_event_id = row.event_id
        
        # Clone Ticket Types
        tt_query = text("SELECT * FROM TicketType WHERE event_id = :id")
        source_tts = db.session.execute(tt_query, {"id": event_id}).fetchall()
        
        if source_tts:
            ins_tt_sql = text("""
                INSERT INTO TicketType (event_id, type_name, price, quantity, sold_quantity, description)
                VALUES (:eid, :tn, :p, :q, 0, :d)
            """)
            for tt in source_tts:
                db.session.execute(ins_tt_sql, {
                    "eid": new_event_id,
                    "tn": tt.type_name,
                    "p": tt.price,
                    "q": tt.quantity,
                    "d": tt.description
                })
            db.session.commit()
            
        return OrganizerEventService._fetch_event(new_event_id)

    @staticmethod
    def delete_event(event_id, data):
        check_query = text("SELECT * FROM Event WHERE event_id = :id")
        event = db.session.execute(check_query, {"id": event_id}).fetchone()
        if not event:
            raise ValueError('Event not found')
        
        reason = data.get('reason', '')
        manager_id = data.get('manager_id', 1)
        
        if event.status == 'PENDING_APPROVAL':
            # Direct delete if pending approval
            # Delete related TicketTypes first? Database constraints usually CASCADE, 
            # but to be safe and clear:
            del_tt_sql = text("DELETE FROM TicketType WHERE event_id = :id")
            db.session.execute(del_tt_sql, {"id": event_id})
            
            # Also Seat if any? Seat table usually links to TicketType/Event. Assuming clean up needed.
            # Ideally CASCADE on FK handles this. Let's assume FKs are set.
            
            del_evt_sql = text("DELETE FROM Event WHERE event_id = :id")
            db.session.execute(del_evt_sql, {"id": event_id})
            db.session.commit()
            return None, 0 # Return None for request object to signal direct deletion

        if event.status == 'PUBLISHED':
            raise ValueError('Không thể xóa sự kiện đang công khai. Vui lòng chuyển sự kiện về trạng thái "Bản nháp" trước khi xóa.')
        
        # Check existing deletion request
        req_query = text("SELECT * FROM EventDeletionRequest WHERE event_id = :id AND request_status = 'PENDING'")
        existing_request = db.session.execute(req_query, {"id": event_id}).fetchone()
        if existing_request:
            raise ValueError('Đã có yêu cầu xóa sự kiện này đang chờ phê duyệt từ Admin.')
        
        # Count active Order
        # Using raw SQL join
        order_count_sql = text("""
            SELECT COUNT(DISTINCT o.order_id) as cnt
            FROM `Order` o
            JOIN Ticket t ON o.order_id = t.order_id
            JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
            WHERE tt.event_id = :eid
            AND o.order_status IN ('PAID', 'PENDING', 'CANCELLATION_PENDING')
        """)
        
        cnt_row = db.session.execute(order_count_sql, {"eid": event_id}).fetchone()
        active_orders = cnt_row.cnt if cnt_row else 0
        
        # Create Deletion Request
        ins_req_sql = text("""
            INSERT INTO EventDeletionRequest (event_id, organizer_id, reason, request_status, created_at)
            VALUES (:eid, :oid, :reason, 'PENDING', :now)
        """)
        
        db.session.execute(ins_req_sql, {
            "eid": event_id,
            "oid": manager_id,
            "reason": reason,
            "now": datetime.utcnow()
        })
        db.session.commit()
        
        # Return object-like structure just for the controller (which accesses .request_id)
        # We need to fetch the inserted request ID.
        lrid = db.session.execute(text("SELECT MAX(request_id) as id FROM EventDeletionRequest")).fetchone().id
        
        class MockRequest:
            def __init__(self, rid): self.request_id = rid
            
        return MockRequest(lrid), active_orders

    @staticmethod
    def get_event_ticket_types(event_id):
        # Return wrapper objects for consistency if needed, strictly Model objects?
        # The controller calls .to_dict().
        # So we can return wrappers.
        query = text("SELECT * FROM TicketType WHERE event_id = :id")
        rows = db.session.execute(query, {"id": event_id}).fetchall()
        
        class TTWrapper:
            def __init__(self, row):
                self.row = row
                self._mapping = row._mapping
            def to_dict(self):
                return dict(self._mapping)
        
        return [TTWrapper(row) for row in rows]

    @staticmethod
    def create_ticket_type(event_id, data):
        ins_sql = text("""
            INSERT INTO TicketType (event_id, type_name, price, quantity, sold_quantity, description)
            VALUES (:eid, :tn, :p, :q, 0, :d)
        """)
        res = db.session.execute(ins_sql, {
            "eid": event_id,
            "tn": data.get('type_name'),
            "p": float(data.get('price')),
            "q": int(data.get('quantity')),
            "d": data.get('description')
        })
        db.session.commit()
        
        new_id = res.lastrowid
        # Fetch and return wrapper
        query = text("SELECT * FROM TicketType WHERE ticket_type_id = :id")
        row = db.session.execute(query, {"id": new_id}).fetchone()
        
        class TTWrapper:
            def __init__(self, row):
                self._mapping = row._mapping
            def to_dict(self):
                return dict(self._mapping)
        return TTWrapper(row)

    @staticmethod
    def update_ticket_type(ticket_type_id, data):
        check_query = text("SELECT * FROM TicketType WHERE ticket_type_id = :id")
        row = db.session.execute(check_query, {"id": ticket_type_id}).fetchone()
        if not row:
             raise ValueError('Ticket type not found')
             
        update_fields = []
        params = {"id": ticket_type_id}
        
        if data.get('type_name'):
             update_fields.append("type_name = :tn")
             params['tn'] = data.get('type_name')
        if data.get('price') is not None:
             update_fields.append("price = :p")
             params['p'] = float(data.get('price'))
        if data.get('quantity') is not None:
             update_fields.append("quantity = :q")
             params['q'] = int(data.get('quantity'))
        if data.get('description') is not None:
             update_fields.append("description = :d")
             params['d'] = data.get('description')
             
        if update_fields:
            sql = f"UPDATE TicketType SET {', '.join(update_fields)} WHERE ticket_type_id = :id"
            db.session.execute(text(sql), params)
            db.session.commit()
            
        # Return updated wrapper
        row = db.session.execute(check_query, {"id": ticket_type_id}).fetchone()
        class TTWrapper:
            def __init__(self, row):
                self._mapping = row._mapping
            def to_dict(self):
                return dict(self._mapping)
        return TTWrapper(row)

    @staticmethod
    def delete_ticket_type(ticket_type_id):
        check_query = text("SELECT sold_quantity FROM TicketType WHERE ticket_type_id = :id")
        row = db.session.execute(check_query, {"id": ticket_type_id}).fetchone()
        if not row:
             raise ValueError('Ticket type not found')
             
        if row.sold_quantity > 0:
             raise ValueError('Cannot delete ticket type with sold Ticket')
             
        del_sql = text("DELETE FROM TicketType WHERE ticket_type_id = :id")
        db.session.execute(del_sql, {"id": ticket_type_id})
        db.session.commit()
        return True

    @staticmethod
    def get_recommended_events(event_id, limit=4):
        # 1. Get current event's category
        query_cat = text("SELECT category_id FROM Event WHERE event_id = :id")
        res_cat = db.session.execute(query_cat, {"id": event_id}).fetchone()
        if not res_cat:
            return []
        
        category_id = res_cat.category_id

        # 2. Fetch related Event in same category, different event_id
        # Use subquery for min price to avoid GROUP BY issues
        sql = text("""
            SELECT e.event_id, e.event_name, e.banner_image_url, e.start_datetime,
                   (SELECT MIN(tt.price) FROM TicketType tt WHERE tt.event_id = e.event_id) as min_price
            FROM Event e
            WHERE e.category_id = :cat_id
              AND e.event_id != :eid
              AND e.status = 'PUBLISHED'
            ORDER BY e.start_datetime ASC
            LIMIT :limit
        """)
        
        events_rows = db.session.execute(sql, {"cat_id": category_id, "eid": event_id, "limit": limit}).fetchall()
        
        results = []
        for row in events_rows:
            results.append({
                "event_id": row.event_id,
                "event_name": row.event_name,
                "banner_image_url": row.banner_image_url,
                "start_datetime": row.start_datetime.isoformat() if row.start_datetime else None,
                "min_price": float(row.min_price) if row.min_price is not None else 0
            })
            
        return results




