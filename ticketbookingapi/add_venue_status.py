from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Check if column exists
        with db.engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM Venue LIKE 'status'"))
            if not result.fetchone():
                print("Adding 'status' column to Venue table...")
                conn.execute(text("ALTER TABLE Venue ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE' AFTER is_active"))
                conn.execute(text("CREATE INDEX ix_venue_status ON Venue(status)"))
                conn.commit()
                print("Column added successfully.")
            else:
                print("Column 'status' already exists.")
    except Exception as e:
        print(f"Error: {e}")
