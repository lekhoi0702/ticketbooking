"""
Venue repository for venue-specific database operations
"""

from typing import Optional, List
from app.models.venue import Venue
from app.repositories.base_repository import BaseRepository


class VenueRepository(BaseRepository[Venue]):
    """Repository for Venue model"""
    
    def __init__(self):
        super().__init__(Venue)
    
    def get_active_venues(
        self,
        city: Optional[str] = None,
        manager_id: Optional[int] = None
    ) -> List[Venue]:
        """
        Get active venues
        
        Args:
            city: Optional city filter
            manager_id: Optional manager filter
            
        Returns:
            List of active venues
        """
        filters = {'is_active': True, 'status': 'ACTIVE'}
        
        if city:
            filters['city'] = city
        if manager_id:
            filters['manager_id'] = manager_id
        
        return self.get_all(filters=filters, order_by='venue_name')
    
    def get_manager_venues(
        self,
        manager_id: int,
        include_inactive: bool = False
    ) -> List[Venue]:
        """
        Get venues by manager
        
        Args:
            manager_id: Manager user ID
            include_inactive: Include inactive venues
            
        Returns:
            List of venues
        """
        filters = {'manager_id': manager_id}
        
        if not include_inactive:
            filters['is_active'] = True
        
        return self.get_all(filters=filters, order_by='created_at')
    
    def get_venues_by_city(self, city: str) -> List[Venue]:
        """
        Get venues by city
        
        Args:
            city: City name
            
        Returns:
            List of venues in city
        """
        return self.get_all(
            filters={'city': city, 'is_active': True, 'status': 'ACTIVE'},
            order_by='venue_name'
        )
    
    def get_available_venues(
        self,
        min_capacity: Optional[int] = None
    ) -> List[Venue]:
        """
        Get available venues (ACTIVE status)
        
        Args:
            min_capacity: Minimum capacity requirement
            
        Returns:
            List of available venues
        """
        query = self.session.query(Venue).filter(
            Venue.is_active == True,
            Venue.status == 'ACTIVE'
        )
        
        if min_capacity:
            query = query.filter(Venue.capacity >= min_capacity)
        
        return query.order_by(Venue.venue_name).all()
    
    def search_venues(self, search_term: str) -> List[Venue]:
        """
        Search venues by name or address
        
        Args:
            search_term: Search query
            
        Returns:
            List of matching venues
        """
        from sqlalchemy import or_
        
        return self.session.query(Venue).filter(
            Venue.is_active == True,
            or_(
                Venue.venue_name.ilike(f'%{search_term}%'),
                Venue.address.ilike(f'%{search_term}%'),
                Venue.city.ilike(f'%{search_term}%')
            )
        ).order_by(Venue.venue_name).all()
    
    def update_venue_status(self, venue: Venue, new_status: str) -> Venue:
        """
        Update venue status
        
        Args:
            venue: Venue instance
            new_status: New status (ACTIVE, INACTIVE, MAINTENANCE)
            
        Returns:
            Updated venue instance
        """
        return self.update(venue, status=new_status)
    
    def deactivate_venue(self, venue: Venue) -> Venue:
        """
        Deactivate venue
        
        Args:
            venue: Venue instance
            
        Returns:
            Updated venue instance
        """
        return self.update(venue, is_active=False, status='INACTIVE')
    
    def activate_venue(self, venue: Venue) -> Venue:
        """
        Activate venue
        
        Args:
            venue: Venue instance
            
        Returns:
            Updated venue instance
        """
        return self.update(venue, is_active=True, status='ACTIVE')
    
    def get_cities_with_venues(self) -> List[str]:
        """
        Get list of cities that have active venues
        
        Returns:
            List of city names
        """
        from sqlalchemy import distinct
        
        result = self.session.query(distinct(Venue.city)).filter(
            Venue.is_active == True,
            Venue.status == 'ACTIVE'
        ).order_by(Venue.city).all()
        
        return [city[0] for city in result if city[0]]
