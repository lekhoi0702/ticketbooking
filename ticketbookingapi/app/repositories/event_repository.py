"""
Event repository for event-specific database operations
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy import and_, or_
from app.models.event import Event
from app.repositories.base_repository import BaseRepository
from app.utils.datetime_utils import now_gmt7


class EventRepository(BaseRepository[Event]):
    """Repository for Event model"""
    
    def __init__(self):
        super().__init__(Event)
    
    def get_active_events(
        self,
        category_id: Optional[int] = None,
        city: Optional[str] = None,
        is_featured: Optional[bool] = None,
        limit: Optional[int] = None
    ) -> List[Event]:
        """
        Get active (published/ongoing) events
        
        Args:
            category_id: Optional category filter
            city: Optional city filter
            is_featured: Optional featured filter
            limit: Maximum number of results
            
        Returns:
            List of active events
        """
        query = self.session.query(Event).filter(
            Event.deleted_at.is_(None),
            Event.status.in_(['PUBLISHED', 'ONGOING'])
        )
        
        if category_id:
            query = query.filter(Event.category_id == category_id)
        
        if city:
            # Join with venue to filter by city
            from app.models.venue import Venue
            query = query.join(Venue).filter(Venue.city == city)
        
        if is_featured is not None:
            query = query.filter(Event.is_featured == is_featured)
        
        query = query.order_by(Event.start_datetime.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def get_featured_events(self, limit: int = 10) -> List[Event]:
        """
        Get featured events
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of featured events
        """
        return self.get_active_events(is_featured=True, limit=limit)
    
    def get_upcoming_events(
        self,
        start_date: Optional[datetime] = None,
        limit: Optional[int] = None
    ) -> List[Event]:
        """
        Get upcoming events
        
        Args:
            start_date: Filter events starting after this date (default: now)
            limit: Maximum number of results
            
        Returns:
            List of upcoming events
        """
        if start_date is None:
            start_date = now_gmt7()
        
        query = self.session.query(Event).filter(
            Event.deleted_at.is_(None),
            Event.status.in_(['PUBLISHED', 'ONGOING']),
            Event.start_datetime >= start_date
        ).order_by(Event.start_datetime.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def search_events(
        self,
        search_term: str,
        limit: Optional[int] = None
    ) -> List[Event]:
        """
        Search events by name or description
        
        Args:
            search_term: Search query
            limit: Maximum number of results
            
        Returns:
            List of matching events
        """
        query = self.session.query(Event).filter(
            Event.deleted_at.is_(None),
            Event.status.in_(['PUBLISHED', 'ONGOING']),
            or_(
                Event.event_name.ilike(f'%{search_term}%'),
                Event.description.ilike(f'%{search_term}%')
            )
        ).order_by(Event.start_datetime.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def get_manager_events(
        self,
        manager_id: int,
        status: Optional[str] = None,
        include_deleted: bool = False
    ) -> List[Event]:
        """
        Get events created by manager
        
        Args:
            manager_id: Manager user ID
            status: Optional status filter
            include_deleted: Include soft-deleted events
            
        Returns:
            List of manager's events
        """
        query = self.session.query(Event).filter(Event.manager_id == manager_id)
        
        if not include_deleted:
            query = query.filter(Event.deleted_at.is_(None))
        
        if status:
            query = query.filter(Event.status == status)
        
        query = query.order_by(Event.created_at.desc())
        
        return query.all()
    
    def get_events_by_group(self, group_id: str) -> List[Event]:
        """
        Get events in the same group (showtimes)
        
        Args:
            group_id: Event group ID
            
        Returns:
            List of events in group
        """
        return self.session.query(Event).filter(
            Event.group_id == group_id,
            Event.deleted_at.is_(None)
        ).order_by(Event.start_datetime.asc()).all()
    
    def soft_delete_event(self, event: Event) -> Event:
        """
        Soft delete event
        
        Args:
            event: Event instance to delete
            
        Returns:
            Updated event instance
        """
        return self.update(event, deleted_at=now_gmt7())
    
    def get_events_with_pagination(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[dict] = None
    ) -> tuple[List[Event], int]:
        """
        Get paginated events
        
        Args:
            page: Page number (1-based)
            per_page: Items per page
            filters: Optional filters
            
        Returns:
            Tuple of (events, total_count)
        """
        query = self.session.query(Event).filter(Event.deleted_at.is_(None))
        
        if filters:
            if 'category_id' in filters:
                query = query.filter(Event.category_id == filters['category_id'])
            if 'status' in filters:
                query = query.filter(Event.status == filters['status'])
            if 'is_featured' in filters:
                query = query.filter(Event.is_featured == filters['is_featured'])
        
        total = query.count()
        
        query = query.order_by(Event.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        
        return query.all(), total
