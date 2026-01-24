"""
Advertisement Service
Business logic for advertisement management
"""
from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy import and_, or_
from app.models.advertisement import Advertisement
from app.extensions import db
from app.utils.datetime_utils import now_gmt7


class AdvertisementService:
    """Service for managing advertisements"""
    
    @staticmethod
    def get_active_ads_by_position(position: str, limit: Optional[int] = None) -> List[Advertisement]:
        """
        Get active advertisements for a specific position
        
        Args:
            position: Display position (e.g., 'HOME_BETWEEN_SECTIONS')
            limit: Maximum number of ads to return
            
        Returns:
            List of active Advertisement objects
        """
        now = now_gmt7()
        
        query = Advertisement.query.filter(
            and_(
                Advertisement.position == position,
                Advertisement.is_active == True,
                or_(
                    Advertisement.start_date == None,
                    Advertisement.start_date <= now
                ),
                or_(
                    Advertisement.end_date == None,
                    Advertisement.end_date >= now
                )
            )
        ).order_by(Advertisement.display_order.asc(), Advertisement.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    @staticmethod
    def get_all_ads(include_inactive: bool = False) -> List[Advertisement]:
        """
        Get all advertisements
        
        Args:
            include_inactive: Include inactive ads
            
        Returns:
            List of Advertisement objects
        """
        query = Advertisement.query
        
        if not include_inactive:
            query = query.filter(Advertisement.is_active == True)
        
        return query.order_by(
            Advertisement.position.asc(),
            Advertisement.display_order.asc(),
            Advertisement.created_at.desc()
        ).all()
    
    @staticmethod
    def get_ad_by_id(ad_id: int) -> Optional[Advertisement]:
        """Get advertisement by ID"""
        return Advertisement.query.get(ad_id)
    
    @staticmethod
    def create_ad(data: Dict) -> Advertisement:
        """
        Create new advertisement
        
        Args:
            data: Advertisement data dictionary
            
        Returns:
            Created Advertisement object
        """
        ad = Advertisement(
            title=data['title'],
            image_url=data['image_url'],
            link_url=data.get('link_url'),
            position=data['position'],
            display_order=data.get('display_order', 0),
            is_active=data.get('is_active', True),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            created_by=data.get('created_by')
        )
        
        db.session.add(ad)
        db.session.commit()
        
        return ad
    
    @staticmethod
    def update_ad(ad_id: int, data: Dict) -> Optional[Advertisement]:
        """
        Update advertisement
        
        Args:
            ad_id: Advertisement ID
            data: Update data dictionary
            
        Returns:
            Updated Advertisement object or None if not found
        """
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return None
        
        # Update fields
        if 'title' in data:
            ad.title = data['title']
        if 'image_url' in data:
            ad.image_url = data['image_url']
        if 'link_url' in data:
            ad.link_url = data['link_url']
        if 'position' in data:
            ad.position = data['position']
        if 'display_order' in data:
            ad.display_order = data['display_order']
        if 'is_active' in data:
            ad.is_active = data['is_active']
        if 'start_date' in data:
            ad.start_date = data['start_date']
        if 'end_date' in data:
            ad.end_date = data['end_date']
        
        db.session.commit()
        return ad
    
    @staticmethod
    def delete_ad(ad_id: int) -> bool:
        """
        Delete advertisement
        
        Args:
            ad_id: Advertisement ID
            
        Returns:
            True if deleted, False if not found
        """
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return False
        
        db.session.delete(ad)
        db.session.commit()
        return True
    
    @staticmethod
    def increment_view(ad_id: int) -> bool:
        """
        Increment view count for an advertisement
        
        Args:
            ad_id: Advertisement ID
            
        Returns:
            True if successful, False if not found
        """
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return False
        
        ad.increment_view_count()
        return True
    
    @staticmethod
    def increment_click(ad_id: int) -> bool:
        """
        Increment click count for an advertisement
        
        Args:
            ad_id: Advertisement ID
            
        Returns:
            True if successful, False if not found
        """
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return False
        
        ad.increment_click_count()
        return True
    
    @staticmethod
    def get_ads_by_creator(user_id: int) -> List[Advertisement]:
        """Get all advertisements created by a specific user"""
        return Advertisement.query.filter_by(created_by=user_id).order_by(
            Advertisement.created_at.desc()
        ).all()
