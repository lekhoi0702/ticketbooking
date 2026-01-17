from app import create_app
from app.models.banner import Banner
import os

app = create_app()
with app.app_context():
    banners = Banner.query.all()
    print(f"Total banners: {len(banners)}")
    for b in banners:
        print(f"ID: {b.banner_id}, Title: {b.title}, URL: {b.image_url}, Active: {b.is_active}")
