from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        print("Columns in Event table:")
        result = db.session.execute(text("DESCRIBE Event"))
        for row in result:
            print(row)
    except Exception as e:
        print(f"Error: {e}")
