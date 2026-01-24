"""
Send email via Gmail SMTP (e.g. for forgot-password).
Uses MAIL_FROM_EMAIL and MAIL_APP_PASSWORD from config.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import Config


def send_email(to: str, subject: str, body_plain: str, body_html: Optional[str] = None) -> bool:
    """
    Send email via Gmail SMTP.

    Args:
        to: Recipient email
        subject: Subject line
        body_plain: Plain-text body
        body_html: Optional HTML body

    Returns:
        True if sent successfully, False otherwise.
    """
    if not Config.MAIL_FROM_EMAIL or not Config.MAIL_APP_PASSWORD:
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = Config.MAIL_FROM_EMAIL
    msg['To'] = to
    msg.attach(MIMEText(body_plain, 'plain', 'utf-8'))
    if body_html:
        msg.attach(MIMEText(body_html, 'html', 'utf-8'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(Config.MAIL_FROM_EMAIL, Config.MAIL_APP_PASSWORD)
            server.sendmail(Config.MAIL_FROM_EMAIL, to, msg.as_string())
        return True
    except Exception:
        return False
