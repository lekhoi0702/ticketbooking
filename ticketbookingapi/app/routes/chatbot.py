from flask import Blueprint, request

from app.routes.helpers import ApiMethodView
from app.services.chatbot_service import ChatbotService
from app.utils.logger import get_logger

chatbot_bp = Blueprint("chatbot", __name__)
logger = get_logger("ticketbooking.chatbot")


class ChatbotMessageView(ApiMethodView):
    def post(self):
        try:
            data = request.get_json() or {}
            message = (data.get("Message") or data.get("message") or "").strip()
            if not message:
                return self.fail("Message is required", 400)

            user_id = data.get("UserID", data.get("user_id"))
            chatbot_service = ChatbotService()
            response = chatbot_service.process_message(message, user_id)
            return self.ok({"Response": response})
        except ValueError as exc:
            logger.error("Configuration error: %s", str(exc))
            return self.fail("Chatbot is not configured properly", 500)
        except Exception as exc:
            logger.error("Error processing chatbot message: %s", str(exc))
            return self.fail("An error occurred while processing your message", 500)


chatbot_bp.add_url_rule(
    "/chatbot/message",
    view_func=ChatbotMessageView.as_view("chatbot_message"),
    methods=["POST"],
)
