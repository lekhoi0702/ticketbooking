import os
from datetime import datetime
from werkzeug.utils import secure_filename
from sqlalchemy import text, func, and_, or_
from app.extensions import db
# Models are no longer strictly needed for querying but might be imported for type hints or legacy
# keeping just in case
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.venue import Venue
from app.models.seat import Seat
from app.models.organizer_info import OrganizerInfo
from app.models.user import User

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

class OrganizerService:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @staticmethod
    def approve_refund(order_id):
        # Check order
        o_res = db.session.execute(text("SELECT order_status FROM `Order` WHERE order_id = :id"), {"id": order_id})
        order = o_res.fetchone()
        
        if not order:
            raise ValueError('Order not found')
        if order.order_status != 'CANCELLATION_PENDING':
            raise ValueError('Order is not pending cancellation')
            
        # Get Ticket
        t_res = db.session.execute(text("SELECT * FROM Ticket WHERE order_id = :id"), {"id": order_id})
        tickets = t_res.fetchall()
        
        # Update order status
        db.session.execute(text("UPDATE `Order` SET order_status = 'CANCELLED' WHERE order_id = :id"), {"id": order_id})
        
        for ticket in tickets:
            # Release seat
            if ticket.seat_id:
                db.session.execute(text("UPDATE Seat SET status = 'AVAILABLE' WHERE seat_id = :sid"), {"sid": ticket.seat_id})
            
            # Update sold counts
            tt_id = ticket.ticket_type_id
            
            # Decrement ticket_type sold_quantity
            db.session.execute(text("""
                UPDATE TicketType 
                SET sold_quantity = GREATEST(0, sold_quantity - 1) 
                WHERE ticket_type_id = :tid
            """), {"tid": tt_id})
            
            # Decrement event sold_tickets
            # Need event_id from ticket_type
            tt_row = db.session.execute(text("SELECT event_id FROM TicketType WHERE ticket_type_id = :tid"), {"tid": tt_id}).fetchone()
            if tt_row:
                db.session.execute(text("""
                    UPDATE Event 
                    SET sold_tickets = GREATEST(0, sold_tickets - 1) 
                    WHERE event_id = :eid
                """), {"eid": tt_row.event_id})
            
            # Delete ticket
            db.session.execute(text("DELETE FROM Ticket WHERE ticket_id = :tid"), {"tid": ticket.ticket_id})
            
        db.session.commit()
        return True

    @staticmethod
    def reject_refund(order_id):
        # Check order
        o_res = db.session.execute(text("SELECT order_status FROM `Order` WHERE order_id = :id"), {"id": order_id})
        order = o_res.fetchone()
        
        if not order:
            raise ValueError('Order not found')
        if order.order_status != 'CANCELLATION_PENDING':
            raise ValueError('Order is not pending cancellation')
        
        db.session.execute(text("UPDATE `Order` SET order_status = 'PAID' WHERE order_id = :id"), {"id": order_id})
        db.session.commit()
        return True

    @staticmethod
    def get_event_orders(event_id):
        # Verify event
        if not db.session.execute(text("SELECT 1 FROM Event WHERE event_id = :id"), {"id": event_id}).scalar():
            raise ValueError('Event not found')
            
        # Get Order
        orders_sql = text("""
            SELECT DISTINCT o.*
            FROM `Order` o
            JOIN Ticket t ON o.order_id = t.order_id
            JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
            WHERE tt.event_id = :eid
        """)
        orders_rows = db.session.execute(orders_sql, {"eid": event_id}).fetchall()
        
        orders_data = []
        for order in orders_rows:
            # Get Ticket for this order AND this event
            t_sql = text("""
                SELECT t.*, tt.type_name, tt.price
                FROM Ticket t
                JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
                WHERE t.order_id = :oid AND tt.event_id = :eid
            """)
            tickets = db.session.execute(t_sql, {"oid": order.order_id, "eid": event_id}).fetchall()
            
            order_dict = dict(order._mapping)
            # handle datetime serialization
            for key, val in order_dict.items():
                if isinstance(val, datetime):
                    order_dict[key] = val.isoformat()
            
            order_dict['tickets_count'] = len(tickets)
            
            ticket_list = []
            for t in tickets:
                td = dict(t._mapping)
                for tk, tv in td.items():
                    if isinstance(tv, datetime):
                        td[tk] = tv.isoformat()
                ticket_list.append(td)
                
            order_dict['Ticket'] = ticket_list
            orders_data.append(order_dict)
        return orders_data

    @staticmethod
    def search_tickets(manager_id, query_text, event_id, status):
        # Get organizer event IDs
        ev_res = db.session.execute(text("SELECT event_id FROM Event WHERE manager_id = :mid"), {"mid": manager_id})
        org_event_ids = [r.event_id for r in ev_res]
        
        if not org_event_ids:
            return []
            
        params = {}
        
        sql = """
            SELECT t.*, tt.type_name, e.event_name
            FROM Ticket t
            JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN Event e ON tt.event_id = e.event_id
        """
        
        where_clauses = []
        
        if event_id:
            if event_id not in org_event_ids:
                return []
            where_clauses.append("tt.event_id = :eid")
            params['eid'] = event_id
        else:
            # safe to inject list of ints if not empty
            ids_str = ','.join(map(str, org_event_ids))
            where_clauses.append(f"tt.event_id IN ({ids_str})")
            
        if status and status != 'ALL':
            where_clauses.append("t.ticket_status = :status")
            params['status'] = status
            
        if query_text:
            where_clauses.append("""(
                t.ticket_code LIKE :q OR
                t.holder_email LIKE :q OR
                t.holder_name LIKE :q
            )""")
            params['q'] = f"%{query_text}%"
            
        if where_clauses:
            sql += " WHERE " + " AND ".join(where_clauses)
            
        result = db.session.execute(text(sql), params).fetchall()
        
        final_results = []
        for row in result:
            d = dict(row._mapping)
            for k, v in d.items():
                if isinstance(v, datetime):
                    d[k] = v.isoformat()
            final_results.append(d)
        return final_results

    @staticmethod
    def check_in_ticket(data):
        ticket_code = data.get('ticket_code')
        manager_id = int(data.get('manager_id', 1))
        
        # Find ticket with event info
        sql = text("""
            SELECT t.*, tt.event_id, e.manager_id, e.event_name
            FROM Ticket t
            JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN Event e ON tt.event_id = e.event_id
            WHERE t.ticket_code = :code
        """)
        
        ticket = db.session.execute(sql, {"code": ticket_code}).fetchone()
        
        if not ticket:
            raise ValueError('Ticket not found')
            
        if ticket.manager_id != manager_id:
             raise ValueError('Unauthorized access to this ticket')
             
        if ticket.ticket_status == 'USED':
             # Format checked_in_at
             check_time = ticket.checked_in_at
             if isinstance(check_time, str):
                 check_time_str = check_time
             elif check_time:
                 check_time_str = check_time.isoformat()
             else:
                 check_time_str = "Unknown"
             raise ValueError(f'Vé đã được sử dụng trước đó (Check-in lúc: {check_time_str})')
             
        if ticket.ticket_status != 'ACTIVE':
             raise ValueError(f'Vé không hợp lệ (Trạng thái: {ticket.ticket_status})')
             
        now = datetime.utcnow()
        db.session.execute(text("UPDATE Ticket SET ticket_status = 'USED', checked_in_at = :now WHERE ticket_id = :tid"), 
                         {"now": now, "tid": ticket.ticket_id})
        db.session.commit()
        
        return {
            'ticket_code': ticket.ticket_code,
            'holder_name': ticket.holder_name,
            'event_name': ticket.event_name,
            'checked_in_at': now.isoformat()
        }

    @staticmethod
    def get_organizer_profile(user_id):
        # Fetch User
        u_res = db.session.execute(text("SELECT email, full_name FROM User WHERE user_id = :uid"), {"uid": user_id})
        user = u_res.fetchone()
        if not user:
            raise ValueError('User not found')
        
        # Fetch Organizer Info
        o_res = db.session.execute(text("SELECT * FROM OrganizerInfo WHERE user_id = :uid"), {"uid": user_id})
        org_info = o_res.fetchone()
        
        if not org_info:
            # Create default
            ins_sql = text("INSERT INTO OrganizerInfo (user_id, organization_name) VALUES (:uid, :name)")
            db.session.execute(ins_sql, {"uid": user_id, "name": user.full_name})
            db.session.commit()
            
            # Re-fetch
            o_res = db.session.execute(text("SELECT * FROM OrganizerInfo WHERE user_id = :uid"), {"uid": user_id})
            org_info = o_res.fetchone()
            
        data = dict(org_info._mapping)
        data['user_email'] = user.email
        data['user_full_name'] = user.full_name
        return data

    @staticmethod
    def update_organizer_profile(user_id, data, files):
        # Check existence
        check = db.session.execute(text("SELECT 1 FROM OrganizerInfo WHERE user_id = :uid"), {"uid": user_id}).scalar()
        if not check:
            raise ValueError('Organizer info not found')
        
        update_fields = []
        params = {"uid": user_id}
        
        if data.get('organization_name'):
            update_fields.append("organization_name = :name")
            params['name'] = data.get('organization_name')
        if data.get('description'):
            update_fields.append("description = :desc")
            params['desc'] = data.get('description')
        if data.get('contact_phone'):
            update_fields.append("contact_phone = :phone")
            params['phone'] = data.get('contact_phone')
        
        if 'logo' in files:
            file = files['logo']
            if file and OrganizerService.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"organizer_{user_id}_logo_{timestamp}_{filename}"
                
                logo_folder = os.path.join(UPLOAD_FOLDER, 'organizer', 'info', 'logo')
                os.makedirs(logo_folder, exist_ok=True)
                
                filepath = os.path.join(logo_folder, filename)
                file.save(filepath)
                
                update_fields.append("logo_url = :logo")
                params['logo'] = f"/uploads/organizer/info/logo/{filename}"
        
        update_fields.append("updated_at = :now")
        params['now'] = datetime.utcnow()
        
        if update_fields:
            sql = f"UPDATE OrganizerInfo SET {', '.join(update_fields)} WHERE user_id = :uid"
            db.session.execute(text(sql), params)
            db.session.commit()
            
        # Return updated data
        return OrganizerService.get_organizer_profile(user_id)
        
        class MockObj:
             def __init__(self, data): self.data = data
             def to_dict(self): return self.data
             
        return MockObj(OrganizerService.get_organizer_profile(user_id))



