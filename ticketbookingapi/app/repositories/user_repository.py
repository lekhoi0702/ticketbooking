"""
User repository for user-specific database operations
"""

from typing import Optional, List
from app.models.user import User
from app.repositories.base_repository import BaseRepository
from app.exceptions import DuplicateResourceException


class UserRepository(BaseRepository[User]):
    """Repository for User model"""
    
    def __init__(self):
        super().__init__(User)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: User email address
            
        Returns:
            User instance or None
        """
        return self.get_one({'email': email, 'is_active': True})
    
    def get_active_users(self, role_id: Optional[int] = None) -> List[User]:
        """
        Get all active users
        
        Args:
            role_id: Optional role filter
            
        Returns:
            List of active users
        """
        filters = {'is_active': True}
        if role_id:
            filters['role_id'] = role_id
        return self.get_all(filters=filters)
    
    def email_exists(self, email: str, exclude_user_id: Optional[int] = None) -> bool:
        """
        Check if email already exists
        
        Args:
            email: Email to check
            exclude_user_id: Optional user ID to exclude from check
            
        Returns:
            True if email exists
        """
        query = self.session.query(User).filter(User.email == email)
        
        if exclude_user_id:
            query = query.filter(User.user_id != exclude_user_id)
        
        return query.first() is not None
    
    def create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        role_id: int = 1,
        phone: Optional[str] = None
    ) -> User:
        """
        Create new user with validation
        
        Args:
            email: User email
            password_hash: Hashed password
            full_name: User full name
            role_id: Role ID (default: 1 - User)
            phone: Optional phone number
            
        Returns:
            Created user instance
            
        Raises:
            DuplicateResourceException: If email already exists
        """
        # Check for duplicate email
        if self.email_exists(email):
            raise DuplicateResourceException('User', 'email', email)
        
        # Create user
        user = self.create(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role_id=role_id,
            phone=phone
        )
        
        return user
    
    def update_user(
        self,
        user: User,
        full_name: Optional[str] = None,
        phone: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> User:
        """
        Update user information
        
        Args:
            user: User instance to update
            full_name: Optional new full name
            phone: Optional new phone
            is_active: Optional active status
            
        Returns:
            Updated user instance
        """
        updates = {}
        if full_name is not None:
            updates['full_name'] = full_name
        if phone is not None:
            updates['phone'] = phone
        if is_active is not None:
            updates['is_active'] = is_active
        
        return self.update(user, **updates)
    
    def change_password(self, user: User, new_password_hash: str) -> User:
        """
        Change user password
        
        Args:
            user: User instance
            new_password_hash: New hashed password
            
        Returns:
            Updated user instance
        """
        return self.update(user, password_hash=new_password_hash)
    
    def deactivate_user(self, user: User) -> User:
        """
        Deactivate user account
        
        Args:
            user: User instance to deactivate
            
        Returns:
            Updated user instance
        """
        return self.update(user, is_active=False)
    
    def activate_user(self, user: User) -> User:
        """
        Activate user account
        
        Args:
            user: User instance to activate
            
        Returns:
            Updated user instance
        """
        return self.update(user, is_active=True)
