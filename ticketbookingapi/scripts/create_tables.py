from app import create_app
from app.extensions import db
# Import all models to ensure they are known to SQLAlchemy
from app.models import *

app = create_app()

with app.app_context():
    print("Creating all tables...")
    db.create_all()
    print("Tables created.")
