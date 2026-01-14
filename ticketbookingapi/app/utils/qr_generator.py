"""
QR Code Generator Utility
Generates QR codes for tickets and saves them to uploads directory
"""
import qrcode
import os
from io import BytesIO
import base64

def generate_qr_code(data, save_path=None):
    """
    Generate QR code for given data
    
    Args:
        data: String data to encode in QR code
        save_path: Optional path to save QR code image
        
    Returns:
        str: Base64 encoded QR code image or file path
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,  # Controls size (1-40)
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=10,  # Size of each box in pixels
        border=4,  # Border size in boxes
    )
    
    # Add data
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to file if path provided
    if save_path:
        # Ensure directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        img.save(save_path)
        return save_path
    
    # Otherwise return base64 encoded image
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


def generate_ticket_qr(ticket_code, ticket_id, save_to_file=True):
    """
    Generate QR code specifically for tickets
    
    Args:
        ticket_code: Unique ticket code
        ticket_id: Ticket ID
        save_to_file: Whether to save to file or return base64
        
    Returns:
        str: File path or base64 data URL
    """
    # Create QR data with ticket info
    qr_data = f"TICKET:{ticket_code}:ID:{ticket_id}"
    
    if save_to_file:
        # Save to uploads/qrcodes directory
        filename = f"{ticket_code}.png"
        save_path = os.path.join("uploads", "qrcodes", filename)
        file_path = generate_qr_code(qr_data, save_path)
        # Return relative URL path
        return f"/uploads/qrcodes/{filename}"
    else:
        return generate_qr_code(qr_data)
