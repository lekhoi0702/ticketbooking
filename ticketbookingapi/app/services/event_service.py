from app.extensions import db
from app.models.favorite_event import FavoriteEvent
from app.models.event import Event
from app.models.venue import Venue
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class EventService:
    @staticmethod
    def toggle_favorite(user_id, event_id):
        """Toggle favorite status for an event"""
        favorite = FavoriteEvent.query.filter_by(user_id=user_id, event_id=event_id).first()
        
        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            return False, "Đã xóa khỏi danh sách yêu thích"
        else:
            new_favorite = FavoriteEvent(user_id=user_id, event_id=event_id)
            db.session.add(new_favorite)
            db.session.commit()
            return True, "Đã thêm vào danh sách yêu thích"

    @staticmethod
    def get_user_favorites(user_id):
        """Get all favorite events for a user (excluding expired events)"""
        favorites = FavoriteEvent.query.filter_by(user_id=user_id).all()
        event_ids = [f.event_id for f in favorites]
        
        if not event_ids:
            return []
        
        # Get current time
        now = datetime.utcnow()
        
        # Get only events that haven't ended yet
        events = Event.query.filter(
            Event.event_id.in_(event_ids),
            Event.end_datetime > now
        ).all()
        
        # Find expired event IDs to remove from favorites
        active_event_ids = {event.event_id for event in events}
        expired_event_ids = set(event_ids) - active_event_ids
        
        # Remove expired events from favorites table
        if expired_event_ids:
            FavoriteEvent.query.filter(
                FavoriteEvent.user_id == user_id,
                FavoriteEvent.event_id.in_(expired_event_ids)
            ).delete(synchronize_session=False)
            db.session.commit()
        
        return [event.to_dict(include_details=True) for event in events]

    @staticmethod
    def get_user_favorite_ids(user_id):
        """Get list of event IDs favorited by user (excluding expired events)"""
        favorites = FavoriteEvent.query.filter_by(user_id=user_id).all()
        event_ids = [f.event_id for f in favorites]
        
        if not event_ids:
            return []
        
        now = now_gmt7()
        
        active_events = Event.query.filter(
            Event.event_id.in_(event_ids),
            Event.end_datetime > now
        ).all()
        
        active_event_ids = [event.event_id for event in active_events]
        
        # Find expired event IDs to remove from favorites
        expired_event_ids = set(event_ids) - set(active_event_ids)
        
        # Remove expired events from favorites table
        if expired_event_ids:
            FavoriteEvent.query.filter(
                FavoriteEvent.user_id == user_id,
                FavoriteEvent.event_id.in_(expired_event_ids)
            ).delete(synchronize_session=False)
            db.session.commit()
        
        return active_event_ids
