"""
Ticket repository for ticket-specific database operations
"""

from typing import Optional, List
from datetime import datetime
from app.models.ticket import Ticket
from app.models.ticket_type import TicketType
from app.repositories.base_repository import BaseRepository


class TicketRepository(BaseRepository[Ticket]):
    """Repository for Ticket model"""
    
    def __init__(self):
        super().__init__(Ticket)
    
    def get_by_ticket_code(self, ticket_code: str) -> Optional[Ticket]:
        """
        Get ticket by ticket code
        
        Args:
            ticket_code: Unique ticket code
            
        Returns:
            Ticket instance or None
        """
        return self.get_one({
            'ticket_code': ticket_code,
            'deleted_at': None
        })
    
    def get_order_tickets(
        self,
        order_id: int,
        include_deleted: bool = False
    ) -> List[Ticket]:
        """
        Get all tickets for an order
        
        Args:
            order_id: Order ID
            include_deleted: Include soft-deleted tickets
            
        Returns:
            List of tickets
        """
        query = self.session.query(Ticket).filter(Ticket.order_id == order_id)
        
        if not include_deleted:
            query = query.filter(Ticket.deleted_at.is_(None))
        
        return query.all()
    
    def get_user_tickets(
        self,
        user_id: int,
        status: Optional[str] = None,
        include_deleted: bool = False
    ) -> List[Ticket]:
        """
        Get all tickets for a user
        
        Args:
            user_id: User ID
            status: Optional ticket status filter
            include_deleted: Include soft-deleted tickets
            
        Returns:
            List of tickets
        """
        from app.models.order import Order
        
        query = self.session.query(Ticket).join(Order).filter(
            Order.user_id == user_id
        )
        
        if not include_deleted:
            query = query.filter(Ticket.deleted_at.is_(None))
        
        if status:
            query = query.filter(Ticket.ticket_status == status)
        
        query = query.order_by(Ticket.created_at.desc())
        
        return query.all()
    
    def get_event_tickets(
        self,
        event_id: int,
        status: Optional[str] = None
    ) -> List[Ticket]:
        """
        Get all tickets for an event
        
        Args:
            event_id: Event ID
            status: Optional ticket status filter
            
        Returns:
            List of tickets
        """
        query = self.session.query(Ticket).join(TicketType).filter(
            TicketType.event_id == event_id,
            Ticket.deleted_at.is_(None)
        )
        
        if status:
            query = query.filter(Ticket.ticket_status == status)
        
        return query.all()
    
    def update_ticket_status(
        self,
        ticket: Ticket,
        new_status: str,
        checked_in_at: Optional[datetime] = None
    ) -> Ticket:
        """
        Update ticket status
        
        Args:
            ticket: Ticket instance
            new_status: New status
            checked_in_at: Optional check-in timestamp
            
        Returns:
            Updated ticket instance
        """
        updates = {'ticket_status': new_status}
        if checked_in_at:
            updates['checked_in_at'] = checked_in_at
        
        return self.update(ticket, **updates)
    
    def check_in_ticket(self, ticket: Ticket) -> Ticket:
        """
        Check in a ticket
        
        Args:
            ticket: Ticket instance
            
        Returns:
            Updated ticket instance
        """
        return self.update_ticket_status(
            ticket,
            'USED',
            checked_in_at=datetime.utcnow()
        )
    
    def cancel_tickets(self, order_id: int) -> int:
        """
        Cancel all tickets for an order
        
        Args:
            order_id: Order ID
            
        Returns:
            Number of tickets cancelled
        """
        tickets = self.get_order_tickets(order_id)
        count = 0
        
        for ticket in tickets:
            if ticket.ticket_status in ['ACTIVE', 'USED']:
                self.update(ticket, ticket_status='CANCELLED')
                count += 1
        
        return count
    
    def soft_delete_tickets(self, order_id: int) -> int:
        """
        Soft delete all tickets for an order
        
        Args:
            order_id: Order ID
            
        Returns:
            Number of tickets deleted
        """
        tickets = self.get_order_tickets(order_id)
        count = 0
        
        for ticket in tickets:
            self.update(ticket, deleted_at=datetime.utcnow())
            count += 1
        
        return count
    
    def get_ticket_statistics(self, event_id: int) -> dict:
        """
        Get ticket statistics for an event
        
        Args:
            event_id: Event ID
            
        Returns:
            Dictionary with ticket counts by status
        """
        from sqlalchemy import func
        
        query = self.session.query(
            Ticket.ticket_status,
            func.count(Ticket.ticket_id).label('count')
        ).join(TicketType).filter(
            TicketType.event_id == event_id,
            Ticket.deleted_at.is_(None)
        ).group_by(Ticket.ticket_status)
        
        results = query.all()
        
        return {status: count for status, count in results}


class TicketTypeRepository(BaseRepository[TicketType]):
    """Repository for TicketType model"""
    
    def __init__(self):
        super().__init__(TicketType)
    
    def get_event_ticket_types(
        self,
        event_id: int,
        active_only: bool = True
    ) -> List[TicketType]:
        """
        Get ticket types for an event
        
        Args:
            event_id: Event ID
            active_only: Return only active ticket types
            
        Returns:
            List of ticket types
        """
        filters = {'event_id': event_id}
        if active_only:
            filters['is_active'] = True
        
        return self.get_all(filters=filters, order_by='created_at')
    
    def get_available_ticket_types(self, event_id: int) -> List[TicketType]:
        """
        Get available ticket types (has stock)
        
        Args:
            event_id: Event ID
            
        Returns:
            List of available ticket types
        """
        return self.session.query(TicketType).filter(
            TicketType.event_id == event_id,
            TicketType.is_active == True,
            TicketType.sold_quantity < TicketType.quantity
        ).all()
    
    def check_availability(
        self,
        ticket_type_id: int,
        quantity: int
    ) -> tuple[bool, int]:
        """
        Check if ticket type has enough availability
        
        Args:
            ticket_type_id: Ticket type ID
            quantity: Required quantity
            
        Returns:
            Tuple of (is_available, available_quantity)
        """
        ticket_type = self.get_by_id(ticket_type_id)
        
        if not ticket_type or not ticket_type.is_active:
            return False, 0
        
        available = ticket_type.quantity - ticket_type.sold_quantity
        is_available = available >= quantity
        
        return is_available, available
    
    def increment_sold_quantity(
        self,
        ticket_type_id: int,
        quantity: int
    ) -> TicketType:
        """
        Increment sold quantity
        
        Args:
            ticket_type_id: Ticket type ID
            quantity: Quantity to add
            
        Returns:
            Updated ticket type instance
        """
        ticket_type = self.get_by_id(ticket_type_id)
        new_sold = ticket_type.sold_quantity + quantity
        
        return self.update(ticket_type, sold_quantity=new_sold)
    
    def decrement_sold_quantity(
        self,
        ticket_type_id: int,
        quantity: int
    ) -> TicketType:
        """
        Decrement sold quantity (e.g., for cancellations)
        
        Args:
            ticket_type_id: Ticket type ID
            quantity: Quantity to subtract
            
        Returns:
            Updated ticket type instance
        """
        ticket_type = self.get_by_id(ticket_type_id)
        new_sold = max(0, ticket_type.sold_quantity - quantity)
        
        return self.update(ticket_type, sold_quantity=new_sold)
