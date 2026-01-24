"""
Timezone utilities: GMT+7 (Asia/Ho_Chi_Minh) for the entire system.
Store and compare all datetimes in Vietnam time.
"""

from datetime import datetime

from zoneinfo import ZoneInfo

APP_TZ_NAME = 'Asia/Ho_Chi_Minh'
APP_TZ = ZoneInfo(APP_TZ_NAME)


def now_gmt7():
    """Current time in GMT+7 (Vietnam). Returns naive datetime for DB compatibility."""
    return datetime.now(APP_TZ).replace(tzinfo=None)


def parse_to_gmt7(dt_str):
    """
    Parse ISO/local datetime string and return naive datetime in GMT+7.
    Handles: "2025-01-24T15:00:00", "2025-01-24 15:00:00", "2025-01-24T08:00:00Z".
    """
    if not dt_str:
        return None
    s = str(dt_str).strip()
    s_tz = s.replace('Z', '+00:00')
    try:
        dt = datetime.fromisoformat(s_tz)
    except ValueError:
        try:
            dt = datetime.fromisoformat(s)
        except ValueError:
            return None
    if dt.tzinfo:
        dt = dt.astimezone(APP_TZ).replace(tzinfo=None)
    return dt


def as_gmt7_naive(dt):
    """Convert datetime to naive GMT+7. If naive, assume already GMT+7."""
    if dt is None:
        return None
    if dt.tzinfo:
        return dt.astimezone(APP_TZ).replace(tzinfo=None)
    return dt
