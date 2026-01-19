"""
Cleanup utility for removing expired event favorites
This script removes favorites for events that have already ended
"""
from app.extensions import db
from app.models.favorite_event import FavoriteEvent
from app.models.event import Event
from datetime import datetime
from sqlalchemy import and_

def cleanup_expired_favorites():
    """
    Remove all favorites for events that have ended
    Returns the number of favorites removed
    """
    try:
        # Get current time
        now = datetime.utcnow()
        
        # Find all events that have ended
        expired_events = Event.query.filter(Event.end_datetime <= now).all()
        expired_event_ids = [event.event_id for event in expired_events]
        
        if not expired_event_ids:
            print("No expired events found.")
            return 0
        
        # Delete favorites for expired events
        deleted_count = FavoriteEvent.query.filter(
            FavoriteEvent.event_id.in_(expired_event_ids)
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        print(f"Successfully removed {deleted_count} favorites for {len(expired_event_ids)} expired events.")
        return deleted_count
        
    except Exception as e:
        db.session.rollback()
        print(f"Error during cleanup: {str(e)}")
        raise

if __name__ == "__main__":
    from app import create_app
    
    app = create_app()
    with app.app_context():
        cleanup_expired_favorites()
