from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    result = db.session.execute(text('DESCRIBE Discount'))
    print("Discount Table Schema Columns:")
    for row in result:
        print(f"COL_DATA: {row[0]}")
