import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from sqlalchemy import func, and_, or_
from app.extensions import db
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.venue import Venue
from app.models.event_deletion_request import EventDeletionRequest
from app.models.seat import Seat
from app.models.organizer_info import OrganizerInfo
from app.models.user import User

# Define upload folder relative to project root (ticketbooking)
# Assuming ticketbookingapi/app/services/organizer_service.py is 3 levels deep from ticketbookingapi
# We want ../../../uploads relative to this file?
# this file: ticketbookingapi/app/services/organizer_service.py
# dirname 1: app/services
# dirname 2: app
# dirname 3: ticketbookingapi
# dirname 4: ticketbooking
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

class OrganizerService:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @staticmethod
    def get_dashboard_stats(manager_id):
        # Get events managed by this organizer
        events = Event.query.filter_by(manager_id=manager_id).all()
        event_ids = [e.event_id for e in events]
        
        # Calculate total revenue
        total_revenue = db.session.query(func.sum(Order.total_amount)).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id.in_(event_ids),
            Order.order_status == 'PAID'
        ).scalar() or 0
        
        # Calculate total tickets sold
        total_tickets_sold = db.session.query(func.sum(Event.sold_tickets)).filter(
            Event.manager_id == manager_id
        ).scalar() or 0
        
        # Count ongoing events
        ongoing_events = Event.query.filter(
            Event.manager_id == manager_id,
            Event.status.in_(['PUBLISHED', 'ONGOING'])
        ).count()
        
        # Get recent orders
        recent_orders = db.session.query(
            Order.order_id,
            Order.order_code,
            Order.total_amount,
            Order.order_status,
            Order.created_at,
            Event.event_name,
            Order.customer_name,
            Order.customer_email,
            Payment.payment_method
        ).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).join(
            Event, TicketType.event_id == Event.event_id
        ).outerjoin(
            Payment, Order.order_id == Payment.order_id
        ).filter(
            Event.manager_id == manager_id
        ).distinct().order_by(Order.created_at.desc()).limit(10).all()
        
        orders_list = []
        for order in recent_orders:
            orders_list.append({
                'order_id': order.order_id,
                'order_code': order.order_code,
                'event_name': order.event_name,
                'customer_name': order.customer_name,
                'customer_email': order.customer_email,
                'total_amount': float(order.total_amount),
                'status': order.order_status,
                'payment_method': order.payment_method,
                'created_at': order.created_at.isoformat() if order.created_at else None
            })
            
        return {
            'total_revenue': float(total_revenue),
            'total_tickets_sold': int(total_tickets_sold),
            'ongoing_events': ongoing_events,
            'recent_orders': orders_list
        }

    @staticmethod
    def get_events(manager_id, status=None):
        query = Event.query.filter_by(manager_id=manager_id)
        if status:
            query = query.filter_by(status=status)
        
        events = query.order_by(Event.created_at.desc()).all()
        
        events_list = []
        for event in events:
            sold = event.sold_tickets or 0
            total = event.total_capacity or 0
            events_list.append({
                **event.to_dict(include_details=True),
                'tickets_sold_percentage': (sold / total * 100) if total > 0 else 0
            })
        return events_list

    @staticmethod
    def create_event(data, files):
        manager_id = data.get('manager_id', 1, type=int)
        
        banner_image_url = None
        if 'banner_image' in files:
            file = files['banner_image']
            if file and OrganizerService.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                banner_image_url = f"/uploads/{filename}"
        
        venue_id = int(data.get('venue_id'))
        venue = Venue.query.get(venue_id)
        if not venue:
            raise ValueError('Không tìm thấy địa điểm')
        if venue.status != 'ACTIVE':
            raise ValueError(f'Địa điểm "{venue.venue_name}" đang trong quá trình bảo trì hoặc không sẵn sàng.')

        new_event = Event(
            category_id=int(data.get('category_id')),
            venue_id=int(data.get('venue_id')),
            manager_id=manager_id,
            event_name=data.get('event_name'),
            description=data.get('description'),
            start_datetime=datetime.fromisoformat(data.get('start_datetime')),
            end_datetime=datetime.fromisoformat(data.get('end_datetime')),
            sale_start_datetime=datetime.fromisoformat(data.get('sale_start_datetime')) if data.get('sale_start_datetime') else None,
            sale_end_datetime=datetime.fromisoformat(data.get('sale_end_datetime')) if data.get('sale_end_datetime') else None,
            banner_image_url=banner_image_url,
            total_capacity=int(data.get('total_capacity', 0)),
            status='PENDING_APPROVAL',
            is_featured=data.get('is_featured', 'false').lower() == 'true'
        )
        
        db.session.add(new_event)
        db.session.flush()
        
        ticket_types_data = data.getlist('ticket_types')
        if ticket_types_data:
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                ticket_type = TicketType(
                    event_id=new_event.event_id,
                    type_name=tt_data.get('type_name'),
                    price=float(tt_data.get('price')),
                    quantity=int(tt_data.get('quantity')),
                    sold_quantity=0,
                    description=tt_data.get('description')
                )
                db.session.add(ticket_type)
        
        db.session.commit()
        return new_event

    @staticmethod
    def update_event(event_id, data, files):
        event = Event.query.get(event_id)
        if not event:
            raise ValueError('Event not found')
        
        if 'banner_image' in files:
            file = files['banner_image']
            if file and OrganizerService.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                event.banner_image_url = f"/uploads/{filename}"
        
        if data.get('event_name'): event.event_name = data.get('event_name')
        if data.get('description'): event.description = data.get('description')
        if data.get('category_id'): event.category_id = int(data.get('category_id'))
        if data.get('venue_id'): event.venue_id = int(data.get('venue_id'))
        if data.get('start_datetime'): event.start_datetime = datetime.fromisoformat(data.get('start_datetime'))
        if data.get('end_datetime'): event.end_datetime = datetime.fromisoformat(data.get('end_datetime'))
        if data.get('sale_start_datetime'): event.sale_start_datetime = datetime.fromisoformat(data.get('sale_start_datetime'))
        if data.get('sale_end_datetime'): event.sale_end_datetime = datetime.fromisoformat(data.get('sale_end_datetime'))
        if data.get('total_capacity'): event.total_capacity = int(data.get('total_capacity'))
        if data.get('status'):
            new_status = data.get('status')
            if new_status == 'PUBLISHED' and event.status != 'APPROVED':
                raise ValueError('Sự kiện cần được Admin phê duyệt trước khi đăng')
            event.status = new_status
        if 'is_featured' in data:
            event.is_featured = data.get('is_featured', 'false').lower() == 'true'

        ticket_types_data = data.getlist('ticket_types')
        if ticket_types_data:
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                tt_id = tt_data.get('ticket_type_id')
                if tt_id:
                    tt = TicketType.query.get(tt_id)
                    if tt and tt.event_id == event_id:
                        if 'type_name' in tt_data: tt.type_name = tt_data.get('type_name')
                        if 'price' in tt_data: tt.price = float(tt_data.get('price'))
                        if 'description' in tt_data: tt.description = tt_data.get('description')
                else:
                    new_tt = TicketType(
                        event_id=event_id,
                        type_name=tt_data.get('type_name'),
                        price=float(tt_data.get('price', 0)),
                        quantity=int(tt_data.get('quantity', 0)),
                        description=tt_data.get('description', '')
                    )
                    db.session.add(new_tt)
        
        event.updated_at = datetime.utcnow()
        db.session.commit()
        return event

    @staticmethod
    def delete_event(event_id, data):
        event = Event.query.get(event_id)
        if not event:
            raise ValueError('Event not found')
        
        reason = data.get('reason', '')
        manager_id = data.get('manager_id', 1)
        
        if event.status == 'PUBLISHED':
            raise ValueError('Không thể xóa sự kiện đang công khai. Vui lòng chuyển sự kiện về trạng thái "Bản nháp" trước khi xóa.')
        
        existing_request = EventDeletionRequest.query.filter_by(
            event_id=event_id, request_status='PENDING'
        ).first()
        if existing_request:
            raise ValueError('Đã có yêu cầu xóa sự kiện này đang chờ phê duyệt từ Admin.')
        
        active_orders = db.session.query(Order).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id == event_id,
            Order.order_status.in_(['PAID', 'PENDING', 'CANCELLATION_PENDING'])
        ).count()
        
        deletion_request = EventDeletionRequest(
            event_id=event_id,
            organizer_id=manager_id,
            reason=reason,
            request_status='PENDING'
        )
        db.session.add(deletion_request)
        db.session.commit()
        
        return deletion_request, active_orders

    @staticmethod
    def approve_refund(order_id):
        order = Order.query.get(order_id)
        if not order:
            raise ValueError('Order not found')
        if order.order_status != 'CANCELLATION_PENDING':
            raise ValueError('Order is not pending cancellation')
            
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        order.order_status = 'CANCELLED'
        
        for ticket in tickets:
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat: seat.status = 'AVAILABLE'
            
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            if ticket_type:
                ticket_type.sold_quantity = max(0, ticket_type.sold_quantity - 1)
                if ticket_type.event:
                    ticket_type.event.sold_tickets = max(0, ticket_type.event.sold_tickets - 1)
            db.session.delete(ticket)
            
        db.session.commit()
        return True

    @staticmethod
    def reject_refund(order_id):
        order = Order.query.get(order_id)
        if not order:
            raise ValueError('Order not found')
        if order.order_status != 'CANCELLATION_PENDING':
            raise ValueError('Order is not pending cancellation')
        
        order.order_status = 'PAID'
        db.session.commit()
        return True

    @staticmethod
    def get_event_ticket_types(event_id):
        return TicketType.query.filter_by(event_id=event_id).all()

    @staticmethod
    def create_ticket_type(event_id, data):
        ticket_type = TicketType(
            event_id=event_id,
            type_name=data.get('type_name'),
            price=float(data.get('price')),
            quantity=int(data.get('quantity')),
            sold_quantity=0,
            description=data.get('description')
        )
        db.session.add(ticket_type)
        db.session.commit()
        return ticket_type

    @staticmethod
    def update_ticket_type(ticket_type_id, data):
        ticket_type = TicketType.query.get(ticket_type_id)
        if not ticket_type:
            raise ValueError('Ticket type not found')
        
        if data.get('type_name'): ticket_type.type_name = data.get('type_name')
        if data.get('price') is not None: ticket_type.price = float(data.get('price'))
        if data.get('quantity') is not None: ticket_type.quantity = int(data.get('quantity'))
        if data.get('description') is not None: ticket_type.description = data.get('description')
        
        db.session.commit()
        return ticket_type

    @staticmethod
    def delete_ticket_type(ticket_type_id):
        ticket_type = TicketType.query.get(ticket_type_id)
        if not ticket_type:
            raise ValueError('Ticket type not found')
        if ticket_type.sold_quantity > 0:
            raise ValueError('Cannot delete ticket type with sold tickets')
        
        db.session.delete(ticket_type)
        db.session.commit()
        return True

    @staticmethod
    def get_event_orders(event_id):
        event = Event.query.get(event_id)
        if not event:
            raise ValueError('Event not found')
            
        orders = db.session.query(Order).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id == event_id
        ).distinct().all()
        
        orders_data = []
        for order in orders:
            tickets = db.session.query(Ticket).join(TicketType).filter(
                Ticket.order_id == order.order_id,
                TicketType.event_id == event_id
            ).all()
            order_dict = order.to_dict()
            order_dict['tickets_count'] = len(tickets)
            order_dict['tickets'] = [t.to_dict() for t in tickets]
            orders_data.append(order_dict)
        return orders_data

    @staticmethod
    def get_venues(manager_id):
        return Venue.query.filter_by(manager_id=manager_id).all()

    @staticmethod
    def create_venue(data):
        new_venue = Venue(
            venue_name=data.get('venue_name'),
            address=data.get('address'),
            city=data.get('city'),
            capacity=int(data.get('capacity', 0)),
            manager_id=data.get('manager_id', 1),
            vip_seats=int(data.get('vip_seats', 0)),
            standard_seats=int(data.get('standard_seats', 0)),
            economy_seats=int(data.get('economy_seats', 0)),
            contact_phone=data.get('contact_phone'),
            seat_map_template=data.get('seat_map_template'),
            status='ACTIVE'
        )
        db.session.add(new_venue)
        db.session.commit()
        return new_venue

    @staticmethod
    def update_venue(venue_id, data):
        venue = Venue.query.get(venue_id)
        if not venue:
            raise ValueError('Venue not found')
            
        if 'venue_name' in data: venue.venue_name = data['venue_name']
        if 'address' in data: venue.address = data['address']
        if 'city' in data: venue.city = data['city']
        if 'contact_phone' in data: venue.contact_phone = data['contact_phone']
        if 'capacity' in data: venue.capacity = int(data['capacity'])
        if 'vip_seats' in data: venue.vip_seats = int(data['vip_seats'])
        if 'standard_seats' in data: venue.standard_seats = int(data['standard_seats'])
        if 'economy_seats' in data: venue.economy_seats = int(data['economy_seats'])
        if 'status' in data: venue.status = data['status']
        if 'seat_map_template' in data: venue.seat_map_template = data['seat_map_template']
        
        db.session.commit()
        return venue

    @staticmethod
    def get_venue(venue_id):
        return Venue.query.get(venue_id)

    @staticmethod
    def search_tickets(manager_id, query_text, event_id, status):
        organizer_events = Event.query.filter_by(manager_id=manager_id).all()
        org_event_ids = [e.event_id for e in organizer_events]
        
        query = db.session.query(Ticket).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        )
        
        if event_id:
            if event_id not in org_event_ids:
                return []
            query = query.filter(TicketType.event_id == event_id)
        else:
            query = query.filter(TicketType.event_id.in_(org_event_ids))
            
        if status and status != 'ALL':
            query = query.filter(Ticket.ticket_status == status)
            
        if query_text:
            query = query.filter(
                or_(
                    Ticket.ticket_code.like(f'%{query_text}%'),
                    Ticket.holder_email.like(f'%{query_text}%'),
                    Ticket.holder_name.like(f'%{query_text}%')
                )
            )
            
        tickets = query.all()
        
        results = []
        for ticket in tickets:
            tt = TicketType.query.get(ticket.ticket_type_id)
            evt = Event.query.get(tt.event_id)
            t_data = ticket.to_dict()
            t_data['event_name'] = evt.event_name
            t_data['ticket_type_name'] = tt.type_name
            results.append(t_data)
            
        return results

    @staticmethod
    def check_in_ticket(data):
        ticket_code = data.get('ticket_code')
        manager_id = data.get('manager_id', 1)
        
        ticket = Ticket.query.filter_by(ticket_code=ticket_code).first()
        
        if not ticket:
            raise ValueError('Ticket not found')
            
        tt = TicketType.query.get(ticket.ticket_type_id)
        evt = Event.query.get(tt.event_id)
        
        if evt.manager_id != manager_id:
             raise ValueError('Unauthorized access to this ticket')
             
        if ticket.ticket_status == 'USED':
             # Return special object or raise specific error to handle 400 with extra data?
             # For simplicity, we'll raise ValueError with a specific prefix or just return the ticket with info that controller handles.
             # Service usually shoudln't return HTTP responses.
             # Let's raise a ValueError with a clear message.
             raise ValueError(f'Vé đã được sử dụng trước đó (Check-in lúc: {ticket.checked_in_at})')
             
        if ticket.ticket_status != 'ACTIVE':
             raise ValueError(f'Vé không hợp lệ (Trạng thái: {ticket.ticket_status})')
             
        ticket.ticket_status = 'USED'
        ticket.checked_in_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'ticket_code': ticket.ticket_code,
            'holder_name': ticket.holder_name,
            'event_name': evt.event_name,
            'checked_in_at': ticket.checked_in_at.isoformat()
        }

    @staticmethod
    def get_organizer_stats_detailed(manager_id):
        # Revenue
        total_revenue = db.session.query(func.sum(Ticket.price))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
            .scalar() or 0
            
        # Sold Tickets
        total_tickets_sold = db.session.query(func.count(Ticket.ticket_id))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
            .scalar() or 0
            
        # Refunded
        refunded_tickets = db.session.query(func.count(Ticket.ticket_id))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['REFUNDED', 'CANCELLED']))\
            .scalar() or 0
            
        # Total Events
        total_events = Event.query.filter_by(manager_id=manager_id).count()

        # Best Selling
        best_selling_query = db.session.query(
            Event,
            func.count(Ticket.ticket_id).label('sold_count')
        ).join(TicketType, Event.event_id == TicketType.event_id)\
         .join(Ticket, TicketType.ticket_type_id == Ticket.ticket_type_id)\
         .filter(Event.manager_id == manager_id)\
         .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
         .group_by(Event.event_id)\
         .order_by(func.count(Ticket.ticket_id).desc())\
         .limit(5).all()
        
        best_selling_data = [{
            'event_id': e.event_id,
            'event_name': e.event_name,
            'sold_tickets': count,
            'total_capacity': e.total_capacity,
            'fill_rate': round((count / e.total_capacity * 100), 1) if e.total_capacity > 0 else 0
        } for e, count in best_selling_query]

        # Highest Revenue
        revenue_query = db.session.query(
            Event.event_id, 
            Event.event_name, 
            func.sum(Ticket.price).label('revenue')
        ).join(TicketType, Event.event_id == TicketType.event_id)\
         .join(Ticket, TicketType.ticket_type_id == Ticket.ticket_type_id)\
         .filter(Event.manager_id == manager_id)\
         .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
         .group_by(Event.event_id, Event.event_name)\
         .order_by(func.sum(Ticket.price).desc())\
         .limit(5).all()

        revenue_data = [{
            'event_id': r.event_id,
            'event_name': r.event_name,
            'revenue': float(r.revenue or 0)
        } for r in revenue_query]
        
        return {
            'total_revenue': float(total_revenue),
            'total_tickets_sold': total_tickets_sold,
            'refunded_tickets': refunded_tickets,
            'total_events': total_events,
            'best_selling_events': best_selling_data,
            'revenue_events': revenue_data
        }

    @staticmethod
    def get_organizer_orders_paginated(manager_id, search, page, per_page):
        query = db.session.query(Order).join(Ticket).join(TicketType).join(Event)
        query = query.filter(Event.manager_id == manager_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(
                Order.order_code.ilike(search_term),
                Order.customer_name.ilike(search_term),
                Order.customer_email.ilike(search_term),
                Order.customer_phone.ilike(search_term)
            ))
            
        query = query.group_by(Order.order_id).order_by(Order.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        orders_data = []
        for order in pagination.items:
            relevant_tickets = [
                t for t in order.tickets 
                if t.ticket_type and t.ticket_type.event and t.ticket_type.event.manager_id == manager_id
            ]
            
            if not relevant_tickets: continue

            org_revenue = sum(t.price for t in relevant_tickets)
            
            orders_data.append({
                'order_id': order.order_id,
                'order_code': order.order_code,
                'customer_name': order.customer_name or "Unknown",
                'customer_email': order.customer_email or "N/A",
                'customer_phone': order.customer_phone,
                'created_at': order.created_at.isoformat(),
                'status': order.order_status,
                'revenue': float(org_revenue),
                'ticket_count': len(relevant_tickets),
                'tickets': [{
                    'ticket_id': t.ticket_id,
                    'code': t.ticket_code,
                    'event': t.ticket_type.event.event_name,
                    'type': t.ticket_type.type_name,
                    'price': float(t.price),
                    'status': 'EXPIRED' if t.ticket_status == 'ACTIVE' and t.ticket_type.event.end_datetime < datetime.utcnow() else t.ticket_status
                } for t in relevant_tickets]
            })
            
        return orders_data, pagination

    @staticmethod
    def get_organizer_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        
        if not organizer_info:
            organizer_info = OrganizerInfo(
                user_id=user_id,
                organization_name=user.full_name
            )
            db.session.add(organizer_info)
            db.session.commit()
            
        return {
            **organizer_info.to_dict(),
            'user_email': user.email,
            'user_full_name': user.full_name
        }

    @staticmethod
    def update_organizer_profile(user_id, data, files):
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        if not organizer_info:
            raise ValueError('Organizer info not found')
        
        if data.get('organization_name'):
            organizer_info.organization_name = data.get('organization_name')
        if data.get('description'):
            organizer_info.description = data.get('description')
        if data.get('contact_phone'):
            organizer_info.contact_phone = data.get('contact_phone')
        
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
                organizer_info.logo_url = f"/uploads/organizer/info/logo/{filename}"
        
        organizer_info.updated_at = datetime.utcnow()
        db.session.commit()
        return organizer_info
