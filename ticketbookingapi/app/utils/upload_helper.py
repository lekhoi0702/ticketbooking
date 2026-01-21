"""
Upload Helper Module
Centralized file upload management with organized folder structure

Structure:
    uploads/
    ├── organizers/
    │   └── {organizer_id}/
    │       ├── events/
    │       │   └── {event_id}_{timestamp}_{filename}
    │       └── logo/
    │           └── logo_{timestamp}_{filename}
    ├── banners/
    │   └── {timestamp}_{filename}
    └── qrcodes/
        └── {ticket_code}.png
"""

import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

# Base directory for uploads
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename: str, allowed_extensions: set = None) -> bool:
    """Check if file has allowed extension"""
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def generate_unique_filename(original_filename: str, prefix: str = "") -> str:
    """Generate unique filename with timestamp and uuid"""
    filename = secure_filename(original_filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = uuid.uuid4().hex[:6]
    
    name, ext = os.path.splitext(filename)
    if prefix:
        return f"{prefix}_{timestamp}_{unique_id}{ext}"
    return f"{timestamp}_{unique_id}_{name}{ext}"


def ensure_directory(path: str) -> str:
    """Create directory if it doesn't exist and return path"""
    os.makedirs(path, exist_ok=True)
    return path


def get_organizer_upload_path(organizer_id: int, upload_type: str = "events") -> str:
    """
    Get upload path for organizer files
    
    Args:
        organizer_id: The organizer's user ID
        upload_type: Type of upload ('events', 'logo')
    
    Returns:
        Full path to the upload directory
    """
    path = os.path.join(UPLOAD_FOLDER, 'organizers', str(organizer_id), upload_type)
    return ensure_directory(path)


def get_banner_upload_path() -> str:
    """Get upload path for banner files"""
    path = os.path.join(UPLOAD_FOLDER, 'banners')
    return ensure_directory(path)


def get_qrcode_upload_path() -> str:
    """Get upload path for QR code files"""
    path = os.path.join(UPLOAD_FOLDER, 'qrcodes')
    return ensure_directory(path)


def save_event_image(file, organizer_id: int, event_id: int = None) -> str:
    """
    Save event banner image
    
    Args:
        file: File object from request.files
        organizer_id: The organizer's user ID
        event_id: Optional event ID for naming
    
    Returns:
        URL path to access the file (e.g., /uploads/organizers/1/events/...)
    """
    if not file or not allowed_file(file.filename):
        return None
    
    upload_path = get_organizer_upload_path(organizer_id, 'events')
    
    prefix = f"event_{event_id}" if event_id else "event"
    filename = generate_unique_filename(file.filename, prefix)
    
    filepath = os.path.join(upload_path, filename)
    file.save(filepath)
    
    return f"/uploads/organizers/{organizer_id}/events/{filename}"


def save_organizer_logo(file, organizer_id: int) -> str:
    """
    Save organizer logo image
    
    Args:
        file: File object from request.files
        organizer_id: The organizer's user ID
    
    Returns:
        URL path to access the file
    """
    if not file or not allowed_file(file.filename):
        return None
    
    upload_path = get_organizer_upload_path(organizer_id, 'logo')
    filename = generate_unique_filename(file.filename, "logo")
    
    filepath = os.path.join(upload_path, filename)
    file.save(filepath)
    
    return f"/uploads/organizers/{organizer_id}/logo/{filename}"


def save_vietqr_image(file, organizer_id: int, event_id: int = None) -> str:
    """
    Save VietQR QR code image
    
    Args:
        file: File object from request.files
        organizer_id: The organizer's user ID
        event_id: Optional event ID for naming
    
    Returns:
        URL path to access the file
    """
    if not file or not allowed_file(file.filename):
        return None
    
    upload_path = get_organizer_upload_path(organizer_id, 'events')
    
    prefix = f"vietqr_{event_id}" if event_id else "vietqr"
    filename = generate_unique_filename(file.filename, prefix)
    
    filepath = os.path.join(upload_path, filename)
    file.save(filepath)
    
    return f"/uploads/organizers/{organizer_id}/events/{filename}"


def save_banner_image(file) -> str:
    """
    Save banner image
    
    Args:
        file: File object from request.files
    
    Returns:
        URL path to access the file
    """
    if not file or not allowed_file(file.filename):
        return None
    
    upload_path = get_banner_upload_path()
    filename = generate_unique_filename(file.filename, "banner")
    
    filepath = os.path.join(upload_path, filename)
    file.save(filepath)
    
    return f"/uploads/banners/{filename}"


def delete_file(url_path: str) -> bool:
    """
    Delete a file by its URL path
    
    Args:
        url_path: URL path like /uploads/organizers/1/events/file.jpg
    
    Returns:
        True if deleted successfully, False otherwise
    """
    if not url_path or not url_path.startswith('/uploads/'):
        return False
    
    # Convert URL path to file system path
    relative_path = url_path.replace('/uploads/', '')
    full_path = os.path.join(UPLOAD_FOLDER, relative_path)
    
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except Exception as e:
        print(f"Error deleting file {full_path}: {e}")
    
    return False


def get_upload_url(organizer_id: int, upload_type: str, filename: str) -> str:
    """
    Build URL path for uploaded file
    
    Args:
        organizer_id: The organizer's user ID
        upload_type: Type of upload ('events', 'logo')
        filename: The filename
    
    Returns:
        URL path to access the file
    """
    return f"/uploads/organizers/{organizer_id}/{upload_type}/{filename}"
