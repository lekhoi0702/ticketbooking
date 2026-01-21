from datetime import datetime
import random
import string
from flask import current_app
from app.extensions import db
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.ticket_type import TicketType
from app.models.event import Event
from app.models.payment import Payment
from app.models.discount import Discount
from app.models.seat import Seat
from app.models.venue import Venue
from app.utils import generate_ticket_qr

class OrderService:
    @staticmethod
    def generate_order_code():
        """Generate unique order code"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"ORD-{timestamp}-{random_str}"

    @staticmethod
    def generate_ticket_code():
        """Generate unique ticket code"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"TKT-{timestamp}-{random_str}"

    @staticmethod
    def validate_and_calculate_discount(discount_code, items):
        """
        items: list of dict {'ticket_type': obj, 'quantity': int, 'price': float}
        Returns: (is_valid, amount, message, discount_obj)
        """
        discount = Discount.query.filter_by(discount_code=discount_code).first()
        if not discount:
            return False, 0, "Mã giảm giá không tồn tại", None
            
        if not discount.is_active:
            return False, 0, "Mã giảm giá đã bị khóa", None

        if discount.end_date < datetime.utcnow():
             return False, 0, "Mã giảm giá đã hết hạn", None
        
        if discount.start_date > datetime.utcnow():
             return False, 0, "Mã giảm giá chưa có hiệu lực", None

        if discount.usage_limit and discount.usage_limit > 0:
            if (discount.used_count or 0) >= discount.usage_limit:
                 return False, 0, "Mã giảm giá đã hết lượt sử dụng", None
                 
        eligible_amount = 0
        has_valid_item = False
        
        for item in items:
            tt = item['ticket_type']
            is_applicable = False
            
            # Check Event ID constraint
            if discount.event_id:
                 if tt.event_id == discount.event_id:
                     is_applicable = True
            # Check Manager ID constraint
            elif discount.manager_id:
                 event = Event.query.get(tt.event_id)
                 if event and event.manager_id == discount.manager_id:
                      is_applicable = True
            else:
                 is_applicable = True
                 
            if is_applicable:
                eligible_amount += item['price'] * item['quantity']
                has_valid_item = True
                
        if not has_valid_item:
            return False, 0, "Mã giảm giá không áp dụng cho đơn hàng này", None
            
        if discount.min_order_amount and eligible_amount < discount.min_order_amount:
             return False, 0, f"Đơn hàng chưa đạt giá trị tối thiểu {float(discount.min_order_amount):,.0f}đ", None
             
        amount = 0
        if discount.discount_type == 'PERCENTAGE':
            amount = eligible_amount * (float(discount.discount_value) / 100)
        else:
            amount = float(discount.discount_value)
            
        if discount.max_discount_amount and amount > float(discount.max_discount_amount):
            amount = float(discount.max_discount_amount)
            
        if amount > eligible_amount:
            amount = eligible_amount
            
        return True, amount, "Áp dụng thành công", discount

    @classmethod
    def create_order(cls, data):
        # Validate required fields
        required_fields = ['user_id', 'customer_name', 'customer_email', 'customer_phone', 'tickets']
        for field in required_fields:
            if field not in data:
                raise ValueError(f'Missing required field: {field}')
        
        tickets_data = data.get('tickets', [])
        if not tickets_data:
            raise ValueError('At least one ticket is required')
        
        # Calculate total amount and validate ticket availability
        total_amount = 0
        ticket_types_to_update = []
        
        for ticket_item in tickets_data:
            ticket_type_id = ticket_item.get('ticket_type_id')
            quantity = ticket_item.get('quantity', 1)
            seat_ids = ticket_item.get('seat_ids', []) # optional seat selection
            
            ticket_type = TicketType.query.get(ticket_type_id)
            if not ticket_type:
                raise ValueError(f'Ticket type {ticket_type_id} not found')
            
            # If Seat are provided, quantity should match seat_ids length
            if seat_ids:
                if len(seat_ids) != quantity:
                    raise ValueError(f'Quantity ({quantity}) does not match number of selected Seat ({len(seat_ids)})')
                
                # Check status each seat
                for seat_id in seat_ids:
                    seat = Seat.query.get(seat_id)
                    if not seat or seat.ticket_type_id != ticket_type_id:
                        raise ValueError(f'Ghế {seat_id} không hợp lệ')
                    
                    # If seat is RESERVED by an old pending order from the same user, release it
                    if seat.status == 'RESERVED':
                        # Find the ticket that reserved this seat
                        from datetime import timedelta
                        threshold = datetime.utcnow() - timedelta(minutes=15)
                        reserving_ticket = Ticket.query.filter(
                            Ticket.seat_id == seat_id,
                            Ticket.ticket_status == 'ACTIVE'
                        ).join(Order).filter(
                            Order.user_id == data.get('user_id'),
                            Order.order_status == 'PENDING',
                            Order.created_at < threshold
                        ).first()
                        
                        if reserving_ticket:
                            # Release the seat by cancelling the old order
                            try:
                                cls.cancel_order(reserving_ticket.order_id)
                                db.session.flush()  # Refresh seat status
                                seat = Seat.query.get(seat_id)  # Reload seat
                            except Exception as e:
                                print(f"Error releasing seat from old order: {e}")
                    
                    if seat.status != 'AVAILABLE':
                        raise ValueError(f'Ghế {seat.row_name}{seat.seat_number} đã được đặt')
            
            # Check availability (for non-seat Ticket)
            available = ticket_type.quantity - ticket_type.sold_quantity
            if available < quantity:
                raise ValueError(f'Not enough Ticket available for {ticket_type.type_name}. Only {available} left.')
            
            total_amount += float(ticket_type.price) * quantity
            ticket_types_to_update.append({
                'ticket_type': ticket_type,
                'quantity': quantity,
                'price': float(ticket_type.price),
                'seat_ids': seat_ids
            })
        
        # Apply discount if provided
        discount_amount = 0
        if data.get('discount_code'):
            is_valid, amount, msg, discount_obj = cls.validate_and_calculate_discount(
                data.get('discount_code'), 
                ticket_types_to_update
            )
            if not is_valid:
                raise ValueError(msg)
                
            discount_amount = amount
            
            # Increment usage count
            if discount_obj:
                discount_obj.used_count = (discount_obj.used_count or 0) + 1
        
        final_amount = total_amount - discount_amount
        
        # Create order
        order = Order(
            user_id=data.get('user_id'),
            order_code=cls.generate_order_code(),
            total_amount=total_amount,
            final_amount=final_amount,
            order_status='PENDING',
            customer_name=data.get('customer_name'),
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order_id
        
        # Create Ticket
        created_tickets = []
        for ticket_info in ticket_types_to_update:
            ticket_type = ticket_info['ticket_type']
            quantity = ticket_info['quantity']
            price = ticket_info['price']
            seat_ids = ticket_info['seat_ids']
            
            for i in range(quantity):
                seat_id = seat_ids[i] if seat_ids and i < len(seat_ids) else None
                
                ticket = Ticket(
                    order_id=order.order_id,
                    ticket_type_id=ticket_type.ticket_type_id,
                    ticket_code=cls.generate_ticket_code(),
                    ticket_status='ACTIVE',
                    seat_id=seat_id,
                    price=price,
                    holder_name=data.get('customer_name'),
                    holder_email=data.get('customer_email')
                )
                db.session.add(ticket)
                db.session.flush()  # Get ticket_id
                
                # Generate QR code for ticket
                try:
                    qr_url = generate_ticket_qr(ticket.ticket_code, ticket.ticket_id)
                    ticket.qr_code_url = qr_url
                except Exception as qr_err:
                    print(f"Error generating QR code: {qr_err}")
                
                created_tickets.append(ticket)
                
                # Mark seat as RESERVED (will be BOOKED when payment succeeds)
                if seat_id:
                    seat = Seat.query.get(seat_id)
                    if seat.status == 'AVAILABLE':
                        seat.status = 'RESERVED'
            
            # NOTE: sold_quantity and sold_tickets will be updated when payment succeeds
            # Do NOT update them here to prevent counting unpaid orders as sold
        
        return order, created_tickets, (final_amount > 0)

    @staticmethod
    def get_order_details(order_id):
        order = Order.query.get(order_id)
        if not order:
            return None
            
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        payment = Payment.query.filter_by(order_id=order_id).first()
        
        # Enrich ticket data with ticket type name and seat info
        tickets_data = []
        for ticket in tickets:
            ticket_dict = ticket.to_dict()
            
            # Get ticket type name
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            ticket_dict['ticket_type_name'] = ticket_type.type_name if ticket_type else 'N/A'
            
            # Get seat name
            if ticket.seat:
                ticket_dict['seat_name'] = f"{ticket.seat.row_name}{ticket.seat.seat_number}"
            else:
                ticket_dict['seat_name'] = None
                
            tickets_data.append(ticket_dict)
        
        return {
            'order': order.to_dict(),
            'tickets': tickets_data,
            'payment': payment.to_dict() if payment else None
        }

    @staticmethod
    def get_order_by_code(order_code):
        order = Order.query.filter_by(order_code=order_code).first()
        if not order:
            return None
            
        tickets = Ticket.query.filter_by(order_id=order.order_id).all()
        payment = Payment.query.filter_by(order_id=order.order_id).first()
        
        # Get event info from first ticket
        event_info = None
        if tickets:
            ticket_type = TicketType.query.get(tickets[0].ticket_type_id)
            if ticket_type:
                event = Event.query.get(ticket_type.event_id)
                if event:
                    event_info = event.to_dict(include_details=True)
        
        return {
            'order': order.to_dict(),
            'tickets': [ticket.to_dict() for ticket in tickets],
            'payment': payment.to_dict() if payment else None,
            'event': event_info
        }

    @staticmethod
    def get_user_orders(user_id):
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        
        orders_data = []
        for order in orders:
            tickets = Ticket.query.filter_by(order_id=order.order_id).all()
            
            # Get event info with venue details
            event_info = None
            venue_info = None
            if tickets:
                ticket_type = TicketType.query.get(tickets[0].ticket_type_id)
                if ticket_type:
                    event = Event.query.get(ticket_type.event_id)
                    if event:
                        # Check if any ticket type has sales ended
                        min_sale_end = None
                        for tt in event.ticket_types:
                            if tt.sale_end:
                                if min_sale_end is None or tt.sale_end < min_sale_end:
                                    min_sale_end = tt.sale_end
                        
                        event_info = {
                            'event_id': event.event_id,
                            'event_name': event.event_name,
                            'start_datetime': event.start_datetime.isoformat() if event.start_datetime else None,
                            'end_datetime': event.end_datetime.isoformat() if event.end_datetime else None,
                            'banner_image_url': event.banner_image_url,
                            'status': event.status,
                            'sale_end': min_sale_end.isoformat() if min_sale_end else None,
                            'is_sale_active': min_sale_end > datetime.utcnow() if min_sale_end else True
                        }
                        
                        # Get venue info
                        venue = Venue.query.get(event.venue_id)
                        if venue:
                            venue_info = {
                                'venue_id': venue.venue_id,
                                'venue_name': venue.venue_name,
                                'address': venue.address,
                                'city': venue.city
                            }
            
            # Build detailed tickets list with ticket_type info
            tickets_data = []
            for ticket in tickets:
                ticket_dict = ticket.to_dict()
                
                # Add ticket type info
                ticket_type = TicketType.query.get(ticket.ticket_type_id)
                if ticket_type:
                    ticket_dict['ticket_type_name'] = ticket_type.type_name
                    ticket_dict['ticket_type_description'] = ticket_type.description
                
                # Add event and venue info to each ticket
                ticket_dict['event_name'] = event_info['event_name'] if event_info else None
                ticket_dict['event_date'] = event_info['start_datetime'] if event_info else None
                ticket_dict['venue_name'] = venue_info['venue_name'] if venue_info else None
                ticket_dict['venue_address'] = venue_info['address'] if venue_info else None
                
                tickets_data.append(ticket_dict)
            
            # Build order data
            order_dict = order.to_dict()
            order_dict['event_name'] = event_info['event_name'] if event_info else None
            order_dict['event_date'] = event_info['start_datetime'] if event_info else None
            order_dict['venue_name'] = venue_info['venue_name'] if venue_info else None
            order_dict['venue_address'] = venue_info['address'] if venue_info else None
            order_dict['is_sale_active'] = event_info['is_sale_active'] if event_info else True
            order_dict['tickets'] = tickets_data
            order_dict['tickets_count'] = len(tickets)
            
            orders_data.append(order_dict)
            
        return orders_data

    @staticmethod
    def cancel_order(order_id):
        order = Order.query.get(order_id)
        
        if not order:
            raise ValueError('Order not found')
        
        if order.order_status == 'CANCELLED':
            raise ValueError('Đơn hàng đã được hủy trước đó.')
            
        if order.order_status == 'CANCELLATION_PENDING':
            raise ValueError('Yêu cầu hủy đang được xử lý.')

        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        # If order is PAID, check if it can be cancelled (sales not ended)
        if order.order_status == 'PAID':
            for ticket in tickets:
                ticket_type = TicketType.query.get(ticket.ticket_type_id)
                if ticket_type and ticket_type.sale_end:
                    if datetime.utcnow() > ticket_type.sale_end:
                         raise ValueError(f'Rất tiếc, vé {ticket_type.type_name} đã qua thời hạn hỗ trợ hủy (kết thúc bán vé).')
            
            # Set to PENDING instead of immediate cancellation
            order.order_status = 'CANCELLATION_PENDING'
            return False, 'Yêu cầu hủy của bạn đã được gửi. Chúng tôi sẽ sớm liên hệ để hoàn tiền.'
            
        # If order is PENDING (not paid yet), cancel immediately
        for ticket in tickets:
            ticket.ticket_status = 'CANCELLED'
            
            # Release seat if exists (from RESERVED to AVAILABLE)
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat and seat.status == 'RESERVED':
                    seat.status = 'AVAILABLE'
            
            # NOTE: sold_quantity and sold_tickets are NOT decremented here
            # because they were never incremented (order was never paid)
        
        # Update order status
        order.order_status = 'CANCELLED'

    @staticmethod
    def mark_seats_as_booked(order_id):
        """Mark seats as BOOKED and update sold quantities when payment succeeds"""
        order = Order.query.get(order_id)
        if not order:
            return
        
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        # Track ticket types to update sold quantities
        ticket_type_counts = {}
        
        for ticket in tickets:
            # Mark seat as BOOKED if exists
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat and seat.status in ['RESERVED', 'AVAILABLE']:
                    seat.status = 'BOOKED'
            
            # Count tickets by ticket type for sold quantity update
            ticket_type_id = ticket.ticket_type_id
            if ticket_type_id not in ticket_type_counts:
                ticket_type_counts[ticket_type_id] = 0
            ticket_type_counts[ticket_type_id] += 1
        
        # Update sold quantities for each ticket type
        for ticket_type_id, quantity in ticket_type_counts.items():
            ticket_type = TicketType.query.get(ticket_type_id)
            if ticket_type:
                ticket_type.sold_quantity += quantity
                
                # Update event sold tickets
                event = Event.query.get(ticket_type.event_id)
                if event:
                    event.sold_tickets += quantity

    @staticmethod
    def release_seats_for_failed_order(order_id):
        """Release seats when payment fails (sold quantities not updated since order was never paid)"""
        order = Order.query.get(order_id)
        if not order:
            return
        
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        for ticket in tickets:
            # Release seat if exists (RESERVED only, since BOOKED means payment succeeded)
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat and seat.status == 'RESERVED':
                    seat.status = 'AVAILABLE'
        
        # Cancel tickets
        for ticket in tickets:
            ticket.ticket_status = 'CANCELLED'
        
        # Update order status
        order.order_status = 'CANCELLED'
        
        # NOTE: sold_quantity and sold_tickets are NOT decremented here
        # because they were never incremented (order was never paid)

    @staticmethod
    def cleanup_expired_pending_orders(older_than_minutes=15):
        """
        Cleanup expired pending orders and release reserved seats
        This should be called periodically (e.g., via cron job or scheduled task)
        
        Args:
            older_than_minutes: Orders older than this will be cancelled (default: 15 minutes)
            
        Returns:
            Tuple of (cancelled_count, released_seats_count)
        """
        from datetime import timedelta
        from app.repositories.order_repository import OrderRepository
        
        threshold = datetime.utcnow() - timedelta(minutes=older_than_minutes)
        
        # Get expired pending orders
        expired_orders = Order.query.filter(
            Order.order_status == 'PENDING',
            Order.created_at < threshold
        ).all()
        
        cancelled_count = 0
        released_seats_count = 0
        
        for order in expired_orders:
            try:
                tickets = Ticket.query.filter_by(order_id=order.order_id).all()
                
                # Release seats
                for ticket in tickets:
                    if ticket.seat_id:
                        seat = Seat.query.get(ticket.seat_id)
                        if seat and seat.status == 'RESERVED':
                            seat.status = 'AVAILABLE'
                            released_seats_count += 1
                    
                    # Cancel ticket
                    ticket.ticket_status = 'CANCELLED'
                
                # Cancel order
                order.order_status = 'CANCELLED'
                cancelled_count += 1
                
            except Exception as e:
                print(f"Error cleaning up order {order.order_id}: {e}")
                continue
        
        db.session.commit()
        return cancelled_count, released_seats_count

    @staticmethod
    def get_user_tickets_details(user_id):
        # Get all orders for user
        orders = Order.query.filter_by(user_id=user_id).all()
        
        all_tickets = []
        
        for order in orders:
            tickets = Ticket.query.filter_by(order_id=order.order_id).all()
            
            for ticket in tickets:
                ticket_dict = ticket.to_dict()
                
                # Add ticket type info
                ticket_type = TicketType.query.get(ticket.ticket_type_id)
                if ticket_type:
                    ticket_dict['ticket_type_name'] = ticket_type.type_name
                    ticket_dict['ticket_type_description'] = ticket_type.description
                    
                    # Get event info
                    event = Event.query.get(ticket_type.event_id)
                    if event:
                        ticket_dict['event_id'] = event.event_id
                        ticket_dict['event_name'] = event.event_name
                        ticket_dict['event_date'] = event.start_datetime.isoformat() if event.start_datetime else None
                        ticket_dict['event_status'] = event.status
                        ticket_dict['banner_image_url'] = event.banner_image_url
                        
                        # Get venue info
                        venue = Venue.query.get(event.venue_id)
                        if venue:
                            ticket_dict['venue_name'] = venue.venue_name
                            ticket_dict['venue_address'] = f"{venue.address}, {venue.city}"
                
                # Add order info
                ticket_dict['order_code'] = order.order_code
                ticket_dict['order_status'] = order.order_status
                ticket_dict['order_date'] = order.created_at.isoformat() if order.created_at else None
                
                all_tickets.append(ticket_dict)
        
        # Sort by created_at descending
        all_tickets.sort(key=lambda x: x.get('order_date', ''), reverse=True)
        return all_tickets


