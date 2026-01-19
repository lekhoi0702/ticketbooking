from app import create_app
from app.extensions import db
from sqlalchemy import text
import sys

# Set encoding to UTF-8 for Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def init_db():
    app = create_app()
    with app.app_context():
        print("Checking and creating FavoriteEvent table...")
        try:
            # Using db.create_all()
            db.create_all()
            
            # Pure SQL fallback
            sql = """
            CREATE TABLE IF NOT EXISTS FavoriteEvent (
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, event_id),
                FOREIGN KEY(user_id) REFERENCES User (user_id) ON DELETE CASCADE,
                FOREIGN KEY(event_id) REFERENCES Event (event_id) ON DELETE CASCADE
            );
            """
            db.session.execute(text(sql))
            db.session.commit()
            print("Successfully created/verified FavoriteEvent table.")
            
        except Exception as e:
            print(f"Error creating table: {str(e)}")

if __name__ == "__main__":
    init_db()
