"""
Script to migrate and organize images from ticketbooking/uploads to ticketbookingapi/uploads
Organizes files into detailed folder structure:
    uploads/
    ├── banners/          # Banner images
    ├── events/          # Event images (organized by category if possible)
    │   ├── music/       # Music events
    │   ├── theater/     # Theater events
    │   ├── sports/       # Sports events
    │   └── other/        # Other events
    ├── organizers/      # Organizer logos and files
    │   └── {organizer_id}/
    │       ├── logo/
    │       └── events/
    ├── logos/           # Payment logos and general logos
    ├── qrcodes/         # QR codes
    └── misc/            # Miscellaneous files (ads, samples, etc.)
"""

import os
import shutil
import re
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
OLD_UPLOADS = PROJECT_ROOT / 'uploads'
NEW_UPLOADS = PROJECT_ROOT / 'ticketbookingapi' / 'uploads'

# Category mapping based on filename patterns
CATEGORY_PATTERNS = {
    'music': ['music', 'nhac', 'concert', 'live'],
    'theater': ['theater', 'san-khau', 'drama', 'play'],
    'sports': ['sport', 'the-thao', 'football', 'soccer', 'basketball']
}


def get_event_category(filename: str) -> str:
    """Determine event category from filename"""
    filename_lower = filename.lower()
    
    for category, patterns in CATEGORY_PATTERNS.items():
        if any(pattern in filename_lower for pattern in patterns):
            return category
    
    return 'other'


def migrate_file(src_path: Path, dest_dir: Path, category: str = None):
    """Migrate a single file to new location"""
    try:
        # Ensure destination directory exists
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        dest_path = dest_dir / src_path.name
        shutil.copy2(src_path, dest_path)
        
        print(f"[OK] Migrated: {src_path.name} -> {dest_dir.relative_to(NEW_UPLOADS)}/")
        return True
    except Exception as e:
        print(f"[ERROR] Error migrating {src_path.name}: {e}")
        return False


def migrate_banners():
    """Migrate banner images"""
    banner_dir = OLD_UPLOADS / 'banner'
    if not banner_dir.exists():
        return
    
    dest_dir = NEW_UPLOADS / 'banners'
    migrated = 0
    
    for file in banner_dir.iterdir():
        if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.svg', '.webp']:
            if migrate_file(file, dest_dir):
                migrated += 1
    
    print(f"\n[STATS] Banners: {migrated} files migrated")


def migrate_event_images():
    """Migrate event images and organize by category"""
    dest_base = NEW_UPLOADS / 'events'
    migrated = {'music': 0, 'theater': 0, 'sports': 0, 'other': 0}
    
    # Process event_image_* files
    for file in OLD_UPLOADS.iterdir():
        if file.is_file() and file.name.startswith('event_'):
            category = get_event_category(file.name)
            dest_dir = dest_base / category
            
            if migrate_file(file, dest_dir, category):
                migrated[category] += 1
    
    # Process events/ subdirectory if exists
    events_dir = OLD_UPLOADS / 'events'
    if events_dir.exists():
        for file in events_dir.iterdir():
            if file.is_file():
                category = get_event_category(file.name)
                dest_dir = dest_base / category
                
                if migrate_file(file, dest_dir, category):
                    migrated[category] += 1
    
    print(f"\n[STATS] Event Images:")
    print(f"   Music: {migrated['music']} files")
    print(f"   Theater: {migrated['theater']} files")
    print(f"   Sports: {migrated['sports']} files")
    print(f"   Other: {migrated['other']} files")


def migrate_logos():
    """Migrate logo files"""
    logo_dir = OLD_UPLOADS / 'logo'
    if not logo_dir.exists():
        return
    
    dest_dir = NEW_UPLOADS / 'logos'
    migrated = 0
    
    for file in logo_dir.iterdir():
        if file.is_file():
            if migrate_file(file, dest_dir):
                migrated += 1
    
    # Also check for organizer logos in root
    for file in OLD_UPLOADS.iterdir():
        if file.is_file() and 'logo' in file.name.lower():
            if migrate_file(file, dest_dir):
                migrated += 1
    
    print(f"\n[STATS] Logos: {migrated} files migrated")


def migrate_organizer_files():
    """Migrate organizer-specific files"""
    # Check if there's an organizer directory structure
    organizer_dirs = [
        OLD_UPLOADS / 'organizer',
        OLD_UPLOADS / 'organizers'
    ]
    
    migrated = 0
    
    for org_dir in organizer_dirs:
        if not org_dir.exists():
            continue
        
        for item in org_dir.rglob('*'):
            if item.is_file():
                # Preserve directory structure
                relative_path = item.relative_to(org_dir)
                dest_dir = NEW_UPLOADS / 'organizers' / relative_path.parent
                
                if migrate_file(item, dest_dir):
                    migrated += 1
    
    print(f"\n[STATS] Organizer Files: {migrated} files migrated")


def migrate_misc_files():
    """Migrate miscellaneous files (ads, samples, etc.)"""
    dest_dir = NEW_UPLOADS / 'misc'
    migrated = 0
    
    misc_patterns = ['quangcao', 'sample', 'ad', 'advertisement']
    
    for file in OLD_UPLOADS.iterdir():
        if file.is_file():
            filename_lower = file.name.lower()
            
            # Skip already processed files
            if (file.name.startswith('event_') or 
                'logo' in filename_lower or
                file.parent.name == 'banner' or
                file.parent.name == 'logo'):
                continue
            
            # Check if it's a misc file
            if any(pattern in filename_lower for pattern in misc_patterns):
                if migrate_file(file, dest_dir):
                    migrated += 1
    
    print(f"\n[STATS] Miscellaneous Files: {migrated} files migrated")


def main():
    """Main migration function"""
    import sys
    import io
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("Migrating uploads from ticketbooking/uploads")
    print("   to ticketbookingapi/uploads")
    print("=" * 60)
    
    # Check if old uploads directory exists
    if not OLD_UPLOADS.exists():
        print(f"[ERROR] Source directory not found: {OLD_UPLOADS}")
        return
    
    # Create new uploads directory structure
    NEW_UPLOADS.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    (NEW_UPLOADS / 'banners').mkdir(exist_ok=True)
    (NEW_UPLOADS / 'events' / 'music').mkdir(parents=True, exist_ok=True)
    (NEW_UPLOADS / 'events' / 'theater').mkdir(parents=True, exist_ok=True)
    (NEW_UPLOADS / 'events' / 'sports').mkdir(parents=True, exist_ok=True)
    (NEW_UPLOADS / 'events' / 'other').mkdir(parents=True, exist_ok=True)
    (NEW_UPLOADS / 'logos').mkdir(exist_ok=True)
    (NEW_UPLOADS / 'organizers').mkdir(exist_ok=True)
    (NEW_UPLOADS / 'qrcodes').mkdir(exist_ok=True)
    (NEW_UPLOADS / 'misc').mkdir(exist_ok=True)
    
    print(f"\n[INFO] Source: {OLD_UPLOADS}")
    print(f"[INFO] Destination: {NEW_UPLOADS}\n")
    
    # Migrate files
    migrate_banners()
    migrate_event_images()
    migrate_logos()
    migrate_organizer_files()
    migrate_misc_files()
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Migration completed!")
    print("=" * 60)
    print(f"\n[NOTE] Original files in {OLD_UPLOADS} are still present.")
    print("   Please review and delete them after verifying the migration.")


if __name__ == '__main__':
    main()
