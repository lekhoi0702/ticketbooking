"""
Order repository for order-specific database operations
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy import and_, or_
from app.models.order import Order
from app.models.ticket import Ticket
from app.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Repository for Order model"""
    
    def __init__(self):
        super().__init__(Order)
    
    def get_by_order_code(self, order_code: str) -> Optional[Order]:
        """
        Get order by order code
        
        Args:
            order_code: Unique order code
            
        Returns:
            Order instance or None
        """
        return self.get_one({
            'order_code': order_code,
            'deleted_at': None
        })
    
    def get_user_orders(
        self,
        user_id: int,
        status: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Order]:
        """
        Get orders by user
        
        Args:
            user_id: User ID
            status: Optional status filter
            limit: Maximum number of results
            
        Returns:
            List of user's orders
        """
        query = self.session.query(Order).filter(
            Order.user_id == user_id,
            Order.deleted_at.is_(None)
        )
        
        if status:
            query = query.filter(Order.order_status == status)
        
        query = query.order_by(Order.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def get_pending_orders(self, older_than_minutes: int = 30) -> List[Order]:
        """
        Get pending orders older than specified time
        
        Args:
            older_than_minutes: Minutes threshold
            
        Returns:
            List of pending orders
        """
        from datetime import timedelta
        threshold = datetime.utcnow() - timedelta(minutes=older_than_minutes)
        
        return self.session.query(Order).filter(
            Order.order_status == 'PENDING',
            Order.created_at < threshold,
            Order.deleted_at.is_(None)
        ).all()
    
    def get_orders_by_status(
        self,
        status: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Order]:
        """
        Get orders by status with optional date range
        
        Args:
            status: Order status
            start_date: Optional start date
            end_date: Optional end date
            
        Returns:
            List of orders
        """
        query = self.session.query(Order).filter(
            Order.order_status == status,
            Order.deleted_at.is_(None)
        )
        
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)
        
        query = query.order_by(Order.created_at.desc())
        
        return query.all()
    
    def get_order_with_tickets(self, order_id: int) -> Optional[Order]:
        """
        Get order with tickets eagerly loaded
        
        Args:
            order_id: Order ID
            
        Returns:
            Order instance with tickets or None
        """
        from sqlalchemy.orm import joinedload
        
        return self.session.query(Order).options(
            joinedload(Order.tickets)
        ).filter(
            Order.order_id == order_id,
            Order.deleted_at.is_(None)
        ).first()
    
    def update_order_status(
        self,
        order: Order,
        new_status: str,
        paid_at: Optional[datetime] = None
    ) -> Order:
        """
        Update order status
        
        Args:
            order: Order instance
            new_status: New status
            paid_at: Optional payment timestamp
            
        Returns:
            Updated order instance
        """
        updates = {'order_status': new_status}
        if paid_at:
            updates['paid_at'] = paid_at
        
        return self.update(order, **updates)
    
    def cancel_order(self, order: Order) -> Order:
        """
        Cancel order
        
        Args:
            order: Order instance to cancel
            
        Returns:
            Updated order instance
        """
        return self.update(order, order_status='CANCELLED')
    
    def soft_delete_order(self, order: Order) -> Order:
        """
        Soft delete order
        
        Args:
            order: Order instance to delete
            
        Returns:
            Updated order instance
        """
        return self.update(order, deleted_at=datetime.utcnow())
    
    def get_user_order_count(self, user_id: int, status: Optional[str] = None) -> int:
        """
        Count user orders
        
        Args:
            user_id: User ID
            status: Optional status filter
            
        Returns:
            Number of orders
        """
        filters = {'user_id': user_id, 'deleted_at': None}
        if status:
            filters['order_status'] = status
        
        return self.count(filters)
    
    def get_total_revenue(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        manager_id: Optional[int] = None
    ) -> float:
        """
        Calculate total revenue
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            manager_id: Optional filter by event manager
            
        Returns:
            Total revenue amount
        """
        from sqlalchemy import func
        from app.models.ticket import Ticket
        from app.models.ticket_type import TicketType
        from app.models.event import Event
        
        query = self.session.query(func.sum(Order.final_amount)).filter(
            Order.order_status == 'PAID',
            Order.deleted_at.is_(None)
        )
        
        if start_date:
            query = query.filter(Order.paid_at >= start_date)
        if end_date:
            query = query.filter(Order.paid_at <= end_date)
        
        if manager_id:
            # Join through tickets to filter by event manager
            query = query.join(Ticket).join(TicketType).join(Event).filter(
                Event.manager_id == manager_id
            )
        
        result = query.scalar()
        return float(result) if result else 0.0
