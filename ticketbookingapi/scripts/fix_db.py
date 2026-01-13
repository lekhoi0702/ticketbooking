from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        print("Columns in Event table:")
        result = db.session.execute(text("DESCRIBE Event"))
        columns = [row[0] for row in result]
        print(", ".join(columns))
        
        if 'is_featured' not in columns:
            print("Missing is_featured! Adding it...")
            db.session.execute(text("ALTER TABLE Event ADD COLUMN is_featured BOOLEAN DEFAULT FALSE"))
            db.session.commit()
            print("Added is_featured.")
            
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()
