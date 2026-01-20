"""
Discount repository for discount-specific database operations
"""

from typing import Optional, List
from datetime import datetime
from app.models.discount import Discount
from app.repositories.base_repository import BaseRepository
from app.exceptions import InvalidDiscountException


class DiscountRepository(BaseRepository[Discount]):
    """Repository for Discount model"""
    
    def __init__(self):
        super().__init__(Discount)
    
    def get_by_code(self, discount_code: str) -> Optional[Discount]:
        """
        Get discount by code
        
        Args:
            discount_code: Discount code
            
        Returns:
            Discount instance or None
        """
        return self.get_one({'discount_code': discount_code})
    
    def get_active_discounts(
        self,
        manager_id: Optional[int] = None,
        event_id: Optional[int] = None
    ) -> List[Discount]:
        """
        Get active discounts
        
        Args:
            manager_id: Optional manager filter
            event_id: Optional event filter
            
        Returns:
            List of active discounts
        """
        now = datetime.now()
        
        query = self.session.query(Discount).filter(
            Discount.is_active == True,
            Discount.start_date <= now,
            Discount.end_date >= now
        )
        
        if manager_id:
            query = query.filter(Discount.manager_id == manager_id)
        if event_id:
            query = query.filter(
                (Discount.event_id == event_id) | (Discount.event_id.is_(None))
            )
        
        return query.order_by(Discount.created_at.desc()).all()
    
    def get_manager_discounts(
        self,
        manager_id: int,
        include_expired: bool = False
    ) -> List[Discount]:
        """
        Get discounts created by manager
        
        Args:
            manager_id: Manager user ID
            include_expired: Include expired discounts
            
        Returns:
            List of discounts
        """
        query = self.session.query(Discount).filter(
            Discount.manager_id == manager_id
        )
        
        if not include_expired:
            now = datetime.now()
            query = query.filter(Discount.end_date >= now)
        
        return query.order_by(Discount.created_at.desc()).all()
    
    def validate_discount(
        self,
        discount_code: str,
        total_amount: float,
        event_id: Optional[int] = None
    ) -> Discount:
        """
        Validate discount code and return discount if valid
        
        Args:
            discount_code: Discount code to validate
            total_amount: Order total amount
            event_id: Optional event ID to check applicability
            
        Returns:
            Valid discount instance
            
        Raises:
            InvalidDiscountException: If discount is invalid
        """
        discount = self.get_by_code(discount_code)
        
        if not discount:
            raise InvalidDiscountException('Discount code not found')
        
        if not discount.is_active:
            raise InvalidDiscountException('Discount code is not active')
        
        # Check dates
        now = datetime.now()
        if now < discount.start_date:
            raise InvalidDiscountException('Discount code is not yet valid')
        if now > discount.end_date:
            raise InvalidDiscountException('Discount code has expired')
        
        # Check usage limit
        if discount.usage_limit and discount.used_count >= discount.usage_limit:
            raise InvalidDiscountException('Discount code usage limit reached')
        
        # Check minimum order amount
        if total_amount < float(discount.min_order_amount):
            raise InvalidDiscountException(
                f'Minimum order amount of {discount.min_order_amount} required'
            )
        
        # Check event applicability
        if discount.event_id and event_id and discount.event_id != event_id:
            raise InvalidDiscountException('Discount code not applicable to this event')
        
        return discount
    
    def calculate_discount_amount(
        self,
        discount: Discount,
        total_amount: float
    ) -> float:
        """
        Calculate discount amount
        
        Args:
            discount: Discount instance
            total_amount: Order total amount
            
        Returns:
            Discount amount to subtract
        """
        if discount.discount_type == 'PERCENTAGE':
            discount_amount = total_amount * (float(discount.discount_value) / 100)
            
            # Apply max discount amount if set
            if discount.max_discount_amount:
                discount_amount = min(discount_amount, float(discount.max_discount_amount))
        else:  # FIXED_AMOUNT
            discount_amount = float(discount.discount_value)
        
        # Ensure discount doesn't exceed total
        discount_amount = min(discount_amount, total_amount)
        
        return round(discount_amount, 2)
    
    def increment_usage(self, discount: Discount) -> Discount:
        """
        Increment discount usage count
        
        Args:
            discount: Discount instance
            
        Returns:
            Updated discount instance
        """
        new_count = discount.used_count + 1
        return self.update(discount, used_count=new_count)
    
    def deactivate_discount(self, discount: Discount) -> Discount:
        """
        Deactivate discount
        
        Args:
            discount: Discount instance
            
        Returns:
            Updated discount instance
        """
        return self.update(discount, is_active=False)
    
    def code_exists(
        self,
        discount_code: str,
        exclude_discount_id: Optional[int] = None
    ) -> bool:
        """
        Check if discount code already exists
        
        Args:
            discount_code: Code to check
            exclude_discount_id: Optional discount ID to exclude
            
        Returns:
            True if code exists
        """
        query = self.session.query(Discount).filter(
            Discount.discount_code == discount_code
        )
        
        if exclude_discount_id:
            query = query.filter(Discount.discount_id != exclude_discount_id)
        
        return query.first() is not None
