"""
Script to cleanup and merge duplicate directories in uploads folder
Merges banner/ -> banners/ and logo/ -> logos/
"""

import os
import shutil
from pathlib import Path

UPLOADS_DIR = Path(__file__).parent.parent / 'uploads'


def merge_directories(source: Path, destination: Path):
    """Merge source directory into destination"""
    if not source.exists():
        return 0
    
    if not destination.exists():
        destination.mkdir(parents=True, exist_ok=True)
    
    moved = 0
    for item in source.iterdir():
        if item.is_file():
            dest_file = destination / item.name
            if not dest_file.exists():
                shutil.move(str(item), str(dest_file))
                moved += 1
                print(f"[OK] Moved: {item.name} -> {destination.name}/")
            else:
                # File exists, skip or handle conflict
                print(f"[SKIP] File exists: {item.name} in {destination.name}/")
                item.unlink()  # Delete duplicate
    
    # Remove empty source directory
    try:
        if source.exists() and not any(source.iterdir()):
            source.rmdir()
            print(f"[OK] Removed empty directory: {source.name}/")
    except:
        pass
    
    return moved


def main():
    """Main cleanup function"""
    print("=" * 60)
    print("Cleaning up duplicate directories in uploads")
    print("=" * 60)
    
    if not UPLOADS_DIR.exists():
        print(f"[ERROR] Uploads directory not found: {UPLOADS_DIR}")
        return
    
    # Merge banner/ -> banners/
    print("\n[MERGE] banner/ -> banners/")
    banner_source = UPLOADS_DIR / 'banner'
    banner_dest = UPLOADS_DIR / 'banners'
    moved = merge_directories(banner_source, banner_dest)
    print(f"   Moved {moved} files")
    
    # Merge logo/ -> logos/
    print("\n[MERGE] logo/ -> logos/")
    logo_source = UPLOADS_DIR / 'logo'
    logo_dest = UPLOADS_DIR / 'logos'
    moved = merge_directories(logo_source, logo_dest)
    print(f"   Moved {moved} files")
    
    # Check for organizer/ directory and merge to organizers/
    print("\n[MERGE] organizer/ -> organizers/")
    organizer_source = UPLOADS_DIR / 'organizer'
    organizer_dest = UPLOADS_DIR / 'organizers'
    if organizer_source.exists():
        # Move all subdirectories
        for item in organizer_source.iterdir():
            if item.is_dir():
                dest_item = organizer_dest / item.name
                if dest_item.exists():
                    # Merge contents
                    for subitem in item.rglob('*'):
                        if subitem.is_file():
                            rel_path = subitem.relative_to(item)
                            dest_file = dest_item / rel_path
                            dest_file.parent.mkdir(parents=True, exist_ok=True)
                            if not dest_file.exists():
                                shutil.move(str(subitem), str(dest_file))
                                print(f"[OK] Moved: {rel_path} -> organizers/{item.name}/")
                else:
                    shutil.move(str(item), str(dest_item))
                    print(f"[OK] Moved directory: {item.name} -> organizers/")
        
        # Remove empty organizer directory
        try:
            if organizer_source.exists() and not any(organizer_source.iterdir()):
                organizer_source.rmdir()
                print(f"[OK] Removed empty directory: organizer/")
        except:
            pass
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Cleanup completed!")
    print("=" * 60)


if __name__ == '__main__':
    main()
