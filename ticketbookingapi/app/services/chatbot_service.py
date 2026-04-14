"""
Chatbot service using Google Gemini API
"""

from datetime import datetime
from typing import Optional
import re

from google import genai

from app.config import Config
from app.models.event import Event
from app.models.order import Order
from app.utils.logger import get_logger

logger = get_logger("ticketbooking.chatbot")


class ChatbotService:
    """Service for handling chatbot interactions with Gemini API."""

    def __init__(self):
        if not Config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model = Config.GEMINI_MODEL or "gemini-2.5-flash"

        self.system_prompt = (
            "Ban la chatbot ho tro khach hang cho he thong dat ve su kien truc tuyen.\n\n"
            "Quy tac danh tinh:\n"
            "- Ban la chatbot ho tro dich vu cua he thong dat ve su kien\n"
            "- Khong de cap den ten model AI hay cong nghe nen\n"
            "- Khi duoc hoi danh tinh, tra loi: Toi la chatbot ho tro dich vu dat ve su kien truc tuyen\n\n"
            "Nhiem vu:\n"
            "1. Tra loi ve tim su kien, dat ve, thanh toan\n"
            "2. Huong dan su dung he thong\n"
            "3. Giai thich trang thai don hang\n"
            "4. Chi su dung thong tin huu ich cho khach hang\n\n"
            "Khong bao gio de lo cac ID ky thuat noi bo nhu EventID, UserID, TicketID...\n"
            "Luon tra loi bang tieng Viet, than thien va chuyen nghiep."
        )

    def _build_event_context(self) -> str:
        """Build compact event context based on new schema."""
        try:
            now = datetime.utcnow()
            events = (
                Event.query.filter(Event.status == "Active", Event.start_date >= now)
                .order_by(Event.start_date.asc())
                .limit(10)
                .all()
            )
        except Exception as exc:
            logger.warning("Cannot load event context: %s", exc)
            return ""

        if not events:
            return ""

        lines = ["\n\nSu kien sap toi:"]
        for event in events:
            start_text = event.start_date.strftime("%d/%m/%Y %H:%M") if event.start_date else "N/A"
            lines.append(f"- {event.event_name}: {start_text}")
        return "\n".join(lines)

    def _build_user_order_context(self, user_id: Optional[int]) -> str:
        """Build order context for a user if user_id is provided."""
        if not user_id:
            return ""

        try:
            orders = (
                Order.query.filter(Order.user_id == user_id)
                .order_by(Order.order_date.desc())
                .limit(5)
                .all()
            )
        except Exception as exc:
            logger.warning("Cannot load user order context: %s", exc)
            return ""

        if not orders:
            return ""

        status_map = {
            "Pending": "Dang cho thanh toan",
            "Completed": "Da thanh toan",
            "Cancelled": "Da huy",
            "Refunded": "Da hoan tien",
        }

        lines = ["\n\nDon hang gan day cua nguoi dung:"]
        for order in orders:
            status_text = status_map.get(order.status, order.status)
            amount = float(order.total_amount) if order.total_amount is not None else 0
            lines.append(
                f"- Ma don: {order.order_code}, Trang thai: {status_text}, Tong tien: {amount:,.0f} VND"
            )
        return "\n".join(lines)

    def _get_system_context(self, user_id: Optional[int] = None) -> str:
        return f"{self._build_event_context()}{self._build_user_order_context(user_id)}"

    def _sanitize_response(self, text: str) -> str:
        """Remove technical identifiers and model mentions from response."""
        cleaned = re.sub(
            r"(?i)\b(gemini|google\s+gemini|google\s+ai|ai\s+model|llm)\b",
            "chatbot ho tro dich vu",
            text,
        )
        cleaned = re.sub(
            r"(?i)\b(eventid|userid|ticketid|orderid|categoryid|venueid|organizerid|paymentid)\b\s*[:#-]?\s*\d+",
            "",
            cleaned,
        )
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def process_message(self, message: str, user_id: Optional[int] = None) -> str:
        if not Config.CHATBOT_ENABLED:
            return "Xin loi, chatbot hien dang tam dung. Vui long lien he ho tro."

        try:
            context = self._get_system_context(user_id)
            prompt = self.system_prompt
            if context:
                prompt += context

            prompt += f"\n\nNguoi dung hoi: {message}\n\nHay tra loi ngan gon, de hieu va huu ich:"

            try:
                response = self.client.models.generate_content(model=self.model, contents=prompt)
                response_text = getattr(response, "text", None)

                if not response_text and getattr(response, "candidates", None):
                    candidate = response.candidates[0]
                    if getattr(candidate, "content", None) and getattr(candidate.content, "parts", None):
                        response_text = candidate.content.parts[0].text

                if response_text:
                    return self._sanitize_response(response_text)
                return "Xin loi, toi chua the tao phan hoi luc nay."

            except Exception as api_error:
                error_str = str(api_error)
                if "NOT_FOUND" in error_str.upper() or "not found" in error_str.lower():
                    logger.warning("Model %s not found, trying fallback", self.model)
                    fallback = self.client.models.generate_content(
                        model="gemini-2.0-flash-exp",
                        contents=prompt,
                    )
                    fallback_text = getattr(fallback, "text", None)
                    if fallback_text:
                        return self._sanitize_response(fallback_text)
                raise

        except Exception as exc:
            error_text = str(exc)
            logger.error("Error processing chatbot message: %s", error_text)

            if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text or "quota" in error_text.lower():
                return "Xin loi, chatbot tam thoi qua tai. Vui long thu lai sau it phut."
            if "401" in error_text or "UNAUTHENTICATED" in error_text or "API key" in error_text.lower():
                return "Xin loi, chatbot chua duoc cau hinh dung. Vui long lien he quan tri vien."
            if "NOT_FOUND" in error_text.upper() or "not supported" in error_text.lower():
                return f"Xin loi, model {self.model} hien khong kha dung. Vui long lien he quan tri vien."

            return "Xin loi, da xay ra loi khi xu ly cau hoi cua ban. Vui long thu lai sau."
