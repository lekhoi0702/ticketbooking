"""
Base repository with common CRUD operations
"""

from typing import TypeVar, Generic, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.extensions import db
from app.exceptions import ResourceNotFoundException, DatabaseException
from app.utils.datetime_utils import now_gmt7

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """
    Base repository class providing common database operations
    
    All repositories should inherit from this class and specify their model type
    """
    
    def __init__(self, model: type[T]):
        """
        Initialize repository with model class
        
        Args:
            model: SQLAlchemy model class
        """
        self.model = model
        self.session: Session = db.session
    
    def get_by_id(self, id: int, raise_if_not_found: bool = True) -> Optional[T]:
        """
        Get record by ID
        
        Args:
            id: Primary key ID
            raise_if_not_found: Raise exception if not found
            
        Returns:
            Model instance or None
            
        Raises:
            ResourceNotFoundException: If record not found and raise_if_not_found is True
        """
        try:
            instance = self.session.get(self.model, id)
            
            if instance is None and raise_if_not_found:
                raise ResourceNotFoundException(
                    resource_type=self.model.__name__,
                    resource_id=id
                )
            
            return instance
        except Exception as e:
            if isinstance(e, ResourceNotFoundException):
                raise
            raise DatabaseException(f"Error fetching {self.model.__name__}: {str(e)}")
    
    def get_all(
        self,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[T]:
        """
        Get all records with optional filtering
        
        Args:
            filters: Dictionary of field:value filters
            order_by: Field name to order by (prefix with - for DESC)
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of model instances
        """
        try:
            query = self.session.query(self.model)
            
            # Apply filters
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        query = query.filter(getattr(self.model, field) == value)
            
            # Apply ordering
            if order_by:
                if order_by.startswith('-'):
                    field = order_by[1:]
                    if hasattr(self.model, field):
                        query = query.order_by(getattr(self.model, field).desc())
                else:
                    if hasattr(self.model, order_by):
                        query = query.order_by(getattr(self.model, order_by))
            
            # Apply pagination
            if offset:
                query = query.offset(offset)
            if limit:
                query = query.limit(limit)
            
            return query.all()
        except Exception as e:
            raise DatabaseException(f"Error fetching {self.model.__name__} list: {str(e)}")
    
    def get_one(self, filters: Dict[str, Any]) -> Optional[T]:
        """
        Get single record by filters
        
        Args:
            filters: Dictionary of field:value filters
            
        Returns:
            Model instance or None
        """
        try:
            query = self.session.query(self.model)
            
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
            
            return query.first()
        except Exception as e:
            raise DatabaseException(f"Error fetching {self.model.__name__}: {str(e)}")
    
    def create(self, **kwargs) -> T:
        """
        Create new record
        
        Args:
            **kwargs: Field values for new record
            
        Returns:
            Created model instance
        """
        try:
            instance = self.model(**kwargs)
            self.session.add(instance)
            return instance
        except Exception as e:
            self.session.rollback()
            raise DatabaseException(f"Error creating {self.model.__name__}: {str(e)}")
    
    def update(self, instance: T, **kwargs) -> T:
        """
        Update existing record
        
        Args:
            instance: Model instance to update
            **kwargs: Fields to update
            
        Returns:
            Updated model instance
        """
        try:
            for key, value in kwargs.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
            return instance
        except Exception as e:
            self.session.rollback()
            raise DatabaseException(f"Error updating {self.model.__name__}: {str(e)}")
    
    def delete(self, instance: T, soft: bool = False) -> bool:
        """
        Delete record (hard or soft delete)
        
        Args:
            instance: Model instance to delete
            soft: Use soft delete if True
            
        Returns:
            True if deleted successfully
        """
        try:
            if soft and hasattr(instance, 'deleted_at'):
                instance.deleted_at = now_gmt7()
            else:
                self.session.delete(instance)
            return True
        except Exception as e:
            self.session.rollback()
            raise DatabaseException(f"Error deleting {self.model.__name__}: {str(e)}")
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filters
        
        Args:
            filters: Dictionary of field:value filters
            
        Returns:
            Number of matching records
        """
        try:
            query = self.session.query(self.model)
            
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        query = query.filter(getattr(self.model, field) == value)
            
            return query.count()
        except Exception as e:
            raise DatabaseException(f"Error counting {self.model.__name__}: {str(e)}")
    
    def exists(self, filters: Dict[str, Any]) -> bool:
        """
        Check if record exists
        
        Args:
            filters: Dictionary of field:value filters
            
        Returns:
            True if record exists
        """
        return self.count(filters) > 0
    
    def commit(self):
        """Commit current transaction"""
        try:
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise DatabaseException(f"Error committing transaction: {str(e)}")
    
    def rollback(self):
        """Rollback current transaction"""
        self.session.rollback()
    
    def refresh(self, instance: T) -> T:
        """
        Refresh instance from database
        
        Args:
            instance: Model instance to refresh
            
        Returns:
            Refreshed instance
        """
        try:
            self.session.refresh(instance)
            return instance
        except Exception as e:
            raise DatabaseException(f"Error refreshing {self.model.__name__}: {str(e)}")
