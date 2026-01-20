"""
Payment repository for payment-specific database operations
"""

from typing import Optional, List
from datetime import datetime
from app.models.payment import Payment
from app.repositories.base_repository import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    """Repository for Payment model"""
    
    def __init__(self):
        super().__init__(Payment)
    
    def get_by_payment_code(self, payment_code: str) -> Optional[Payment]:
        """
        Get payment by payment code
        
        Args:
            payment_code: Payment code
            
        Returns:
            Payment instance or None
        """
        return self.get_one({'payment_code': payment_code})
    
    def get_by_transaction_id(self, transaction_id: str) -> Optional[Payment]:
        """
        Get payment by transaction ID
        
        Args:
            transaction_id: Transaction ID from payment gateway
            
        Returns:
            Payment instance or None
        """
        return self.get_one({'transaction_id': transaction_id})
    
    def get_order_payment(self, order_id: int) -> Optional[Payment]:
        """
        Get payment for an order
        
        Args:
            order_id: Order ID
            
        Returns:
            Payment instance or None
        """
        return self.get_one({'order_id': order_id})
    
    def get_successful_payments(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        payment_method: Optional[str] = None
    ) -> List[Payment]:
        """
        Get successful payments with optional filters
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            payment_method: Optional payment method filter
            
        Returns:
            List of successful payments
        """
        query = self.session.query(Payment).filter(
            Payment.payment_status == 'SUCCESS'
        )
        
        if start_date:
            query = query.filter(Payment.paid_at >= start_date)
        if end_date:
            query = query.filter(Payment.paid_at <= end_date)
        if payment_method:
            query = query.filter(Payment.payment_method == payment_method)
        
        return query.order_by(Payment.paid_at.desc()).all()
    
    def get_pending_payments(
        self,
        older_than_minutes: int = 15
    ) -> List[Payment]:
        """
        Get pending payments older than specified time
        
        Args:
            older_than_minutes: Minutes threshold
            
        Returns:
            List of pending payments
        """
        from datetime import timedelta
        threshold = datetime.utcnow() - timedelta(minutes=older_than_minutes)
        
        return self.session.query(Payment).filter(
            Payment.payment_status == 'PENDING',
            Payment.created_at < threshold
        ).all()
    
    def update_payment_status(
        self,
        payment: Payment,
        new_status: str,
        transaction_id: Optional[str] = None,
        paid_at: Optional[datetime] = None
    ) -> Payment:
        """
        Update payment status
        
        Args:
            payment: Payment instance
            new_status: New status
            transaction_id: Optional transaction ID
            paid_at: Optional payment timestamp
            
        Returns:
            Updated payment instance
        """
        updates = {'payment_status': new_status}
        
        if transaction_id:
            updates['transaction_id'] = transaction_id
        if paid_at:
            updates['paid_at'] = paid_at
        elif new_status == 'SUCCESS' and not payment.paid_at:
            updates['paid_at'] = datetime.utcnow()
        
        return self.update(payment, **updates)
    
    def mark_as_success(
        self,
        payment: Payment,
        transaction_id: Optional[str] = None
    ) -> Payment:
        """
        Mark payment as successful
        
        Args:
            payment: Payment instance
            transaction_id: Optional transaction ID
            
        Returns:
            Updated payment instance
        """
        return self.update_payment_status(
            payment,
            'SUCCESS',
            transaction_id=transaction_id,
            paid_at=datetime.utcnow()
        )
    
    def mark_as_failed(self, payment: Payment) -> Payment:
        """
        Mark payment as failed
        
        Args:
            payment: Payment instance
            
        Returns:
            Updated payment instance
        """
        return self.update_payment_status(payment, 'FAILED')
    
    def refund_payment(self, payment: Payment) -> Payment:
        """
        Mark payment as refunded
        
        Args:
            payment: Payment instance
            
        Returns:
            Updated payment instance
        """
        return self.update_payment_status(payment, 'REFUNDED')
    
    def get_total_revenue(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        payment_method: Optional[str] = None
    ) -> float:
        """
        Calculate total revenue from successful payments
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            payment_method: Optional payment method filter
            
        Returns:
            Total revenue amount
        """
        from sqlalchemy import func
        
        query = self.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'SUCCESS'
        )
        
        if start_date:
            query = query.filter(Payment.paid_at >= start_date)
        if end_date:
            query = query.filter(Payment.paid_at <= end_date)
        if payment_method:
            query = query.filter(Payment.payment_method == payment_method)
        
        result = query.scalar()
        return float(result) if result else 0.0
    
    def get_payment_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Get payment statistics
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            
        Returns:
            Dictionary with statistics
        """
        from sqlalchemy import func
        
        query = self.session.query(
            Payment.payment_status,
            Payment.payment_method,
            func.count(Payment.payment_id).label('count'),
            func.sum(Payment.amount).label('total')
        )
        
        if start_date:
            query = query.filter(Payment.created_at >= start_date)
        if end_date:
            query = query.filter(Payment.created_at <= end_date)
        
        query = query.group_by(Payment.payment_status, Payment.payment_method)
        
        results = query.all()
        
        stats = {}
        for status, method, count, total in results:
            key = f"{status}_{method}"
            stats[key] = {
                'status': status,
                'method': method,
                'count': count,
                'total': float(total) if total else 0.0
            }
        
        return stats
