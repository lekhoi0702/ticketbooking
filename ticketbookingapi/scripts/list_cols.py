from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    result = db.session.execute(text("DESCRIBE Event"))
    for row in result:
        print(f"Column: {row[0]}")
