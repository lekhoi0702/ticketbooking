from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    result = db.session.execute(db.text('DESCRIBE Event'))
    print("Event Table Schema:")
    print("-" * 80)
    for row in result:
        print(row)
