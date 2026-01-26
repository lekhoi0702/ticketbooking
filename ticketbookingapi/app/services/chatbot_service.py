"""
Chatbot service using Google Gemini API
"""
from google import genai
from app.config import Config
from app.extensions import db
from app.models.event import Event
from app.models.order import Order
from app.models.event_category import EventCategory
from app.models.venue import Venue
from app.models.ticket_type import TicketType
from sqlalchemy import or_, func
from datetime import datetime
from typing import Optional, Dict, Any
import json
import re
from app.utils.logger import get_logger

logger = get_logger('ticketbooking.chatbot')


class ChatbotService:
    """Service for handling chatbot interactions with Gemini API"""
    
    def __init__(self):
        if not Config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        # Use gemini-2.5-flash as default (latest stable model)
        # Alternative models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp
        self.model = Config.GEMINI_MODEL or "gemini-2.5-flash"
        
        # System prompt with knowledge about the system
        self.system_prompt = """Bạn là chatbot hỗ trợ khách hàng cho hệ thống đặt vé sự kiện trực tuyến.

QUAN TRỌNG - Về danh tính của bạn:
- Bạn là chatbot hỗ trợ dịch vụ của hệ thống đặt vé sự kiện trực tuyến
- Bạn KHÔNG PHẢI là Gemini, Google Gemini, hay bất kỳ AI model nào khác
- Bạn KHÔNG BAO GIỜ được tiết lộ rằng bạn là Gemini hoặc được xây dựng trên Gemini
- Khi được hỏi về danh tính, bạn luôn trả lời: "Tôi là chatbot hỗ trợ dịch vụ của hệ thống đặt vé sự kiện trực tuyến"
- Tuyệt đối không đề cập đến Gemini, Google AI, hay bất kỳ công nghệ AI nào đang được sử dụng

Hệ thống hoạt động như sau:
1. Khách hàng xem danh sách sự kiện, có thể tìm kiếm theo tên, danh mục, ngày
2. Chọn sự kiện và xem chi tiết (thời gian, địa điểm, giá vé, sơ đồ ghế)
3. Chọn loại vé và ghế ngồi
4. Thanh toán qua VNPay, PayPal hoặc VietQR
5. Nhận vé sau khi thanh toán thành công

Phương thức thanh toán:
- VNPay: Thanh toán qua cổng VNPay
- PayPal: Thanh toán quốc tế qua PayPal
- VietQR: Quét mã QR để thanh toán

Trạng thái đơn hàng:
- PENDING: Đang chờ thanh toán
- PAID: Đã thanh toán thành công
- CANCELLED: Đã hủy
- REFUNDED: Đã hoàn tiền
- COMPLETED: Hoàn tất
- REFUND_PENDING: Đang chờ hoàn tiền

Nhiệm vụ của bạn:
1. Trả lời câu hỏi về sự kiện, đặt vé, thanh toán
2. Hướng dẫn sử dụng hệ thống
3. Giải thích về quy trình và chính sách
4. Khi được cung cấp thông tin events/orders cụ thể, sử dụng để trả lời chính xác

QUAN TRỌNG - Quy tắc về thông tin:
- KHÔNG BAO GIỜ đề cập đến các ID kỹ thuật như event_id, category_id, venue_id, order_id, ticket_id, user_id, v.v.
- CHỈ sử dụng thông tin hữu ích cho khách hàng: tên sự kiện, thời gian, địa điểm, giá vé, mã đơn hàng (order_code), trạng thái
- Mã đơn hàng (order_code) là thông tin công khai và có thể đề cập, nhưng các ID nội bộ khác thì KHÔNG
- Khi mô tả sự kiện, chỉ nêu: tên, thời gian, địa điểm, giá, mô tả - KHÔNG nêu ID

Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp. Nếu không biết câu trả lời, hãy thành thật và hướng dẫn người dùng liên hệ hỗ trợ."""

    def _get_system_context(self, user_id: Optional[int] = None) -> str:
        """Get system context including events and user orders if available"""
        context_parts = []
        
        # Get recent published events
        try:
            recent_events = Event.query.filter(
                Event.status == 'PUBLISHED'
            ).order_by(Event.start_datetime.asc()).limit(10).all()
            
            if recent_events:
                context_parts.append("\n\nCác sự kiện sắp tới:")
                for event in recent_events:
                    # Format event info without exposing technical IDs
                    venue_name = event.venue.venue_name if event.venue else "Chưa cập nhật"
                    context_parts.append(
                        f"- {event.event_name}: "
                        f"{event.start_datetime.strftime('%d/%m/%Y %H:%M') if event.start_datetime else 'N/A'}, "
                        f"Tại {venue_name}, "
                        f"Đã bán {event.sold_tickets}/{event.total_capacity} vé"
                    )
        except Exception as e:
            pass
        
        # Get user orders if user is authenticated
        if user_id:
            try:
                user_orders = Order.query.filter(
                    Order.user_id == user_id
                ).order_by(Order.created_at.desc()).limit(5).all()
                
                if user_orders:
                    context_parts.append("\n\nĐơn hàng của người dùng:")
                    for order in user_orders:
                        status_map = {
                            'PENDING': 'Đang chờ thanh toán',
                            'PAID': 'Đã thanh toán',
                            'CANCELLED': 'Đã hủy',
                            'REFUNDED': 'Đã hoàn tiền',
                            'COMPLETED': 'Hoàn tất',
                            'REFUND_PENDING': 'Đang chờ hoàn tiền'
                        }
                        context_parts.append(
                            f"- Mã đơn: {order.order_code}, "
                            f"Trạng thái: {status_map.get(order.order_status, order.order_status)}, "
                            f"Tổng tiền: {order.final_amount:,.0f} VNĐ"
                        )
            except Exception as e:
                pass
        
        return "\n".join(context_parts) if context_parts else ""

    def _search_events(self, query: str, limit: int = 5) -> list:
        """Search events by name or description"""
        try:
            search_term = f"%{query}%"
            events = Event.query.filter(
                Event.status == 'PUBLISHED',
                or_(
                    Event.event_name.like(search_term),
                    Event.description.like(search_term)
                )
            ).limit(limit).all()
            
            return [event.to_dict() for event in events]
        except Exception as e:
            return []

    def _sanitize_response(self, text: str) -> str:
        """
        Remove technical IDs, internal information, and Gemini references from response text
        """
        import re
        
        # Remove any references to Gemini, Google Gemini, or AI models
        text = re.sub(r'(?i)\b(gemini|google\s+gemini|gemini\s+ai|gemini\s+model|gemini\s+api)\b', 'chatbot hỗ trợ dịch vụ', text)
        text = re.sub(r'(?i)\b(tôi\s+là\s+gemini|tôi\s+là\s+google\s+gemini|được\s+xây\s+dựng\s+trên\s+gemini|sử\s+dụng\s+gemini)\b', 'tôi là chatbot hỗ trợ dịch vụ', text)
        text = re.sub(r'(?i)\b(được\s+phát\s+triển\s+bởi\s+google|powered\s+by\s+gemini|built\s+on\s+gemini)\b', '', text)
        
        # Remove patterns like "ID: 123", "event_id: 456", "ID sự kiện: 789"
        text = re.sub(r'(?i)(ID|event_id|category_id|venue_id|order_id|ticket_id|user_id|manager_id)[\s:]*\d+', '', text)
        text = re.sub(r'(?i)ID\s+sự\s+kiện[\s:]*\d+', '', text)
        text = re.sub(r'(?i)ID\s+đơn\s+hàng[\s:]*\d+', '', text)
        
        # Remove standalone numeric IDs that might be technical (but keep order_code format)
        # Pattern: numbers at start of line or after colon, but not order codes (usually alphanumeric)
        text = re.sub(r'(?i)(?:^|\s)(?:ID|Mã\s+ID)[\s:]*(\d+)(?=\s|$|\.|,|;|:)', '', text)
        
        # Clean up extra spaces
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\s*,\s*,', ',', text)  # Remove double commas
        text = re.sub(r'\s*\.\s*\.', '.', text)  # Remove double periods
        
        return text.strip()

    def _get_order_by_code(self, order_code: str, user_id: Optional[int] = None) -> Optional[Dict]:
        """Get order information by order code"""
        try:
            query = Order.query.filter(Order.order_code == order_code)
            
            # If user_id provided, ensure order belongs to user
            if user_id:
                query = query.filter(Order.user_id == user_id)
            
            order = query.first()
            
            if order:
                order_dict = order.to_dict()
                # Add event info from tickets
                if order.tickets:
                    ticket = order.tickets[0]
                    if ticket.ticket_type and ticket.ticket_type.event:
                        order_dict['event_name'] = ticket.ticket_type.event.event_name
                return order_dict
        except Exception as e:
            pass
        
        return None

    def process_message(
        self, 
        message: str, 
        user_id: Optional[int] = None
    ) -> str:
        """
        Process user message and generate response using Gemini API
        
        Args:
            message: User's message
            user_id: Optional user ID for personalized responses
            
        Returns:
            Bot's response text
        """
        if not Config.CHATBOT_ENABLED:
            return "Xin lỗi, chatbot hiện đang tạm dừng. Vui lòng liên hệ hỗ trợ."
        
        try:
            # Get system context
            context = self._get_system_context(user_id)
            
            # Build full prompt
            full_prompt = self.system_prompt
            if context:
                full_prompt += context
            
            full_prompt += f"\n\nNgười dùng hỏi: {message}\n\nHãy trả lời một cách thân thiện và hữu ích:"
            
            # Call Gemini API
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=full_prompt
                )
                
                # Extract text from response
                response_text = None
                if hasattr(response, 'text'):
                    response_text = response.text
                elif hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and candidate.content:
                        if hasattr(candidate.content, 'parts') and candidate.content.parts:
                            response_text = candidate.content.parts[0].text
                    if not response_text:
                        response_text = str(candidate)
                
                if response_text:
                    # Sanitize response to remove technical IDs
                    return self._sanitize_response(response_text)
                else:
                    return "Xin lỗi, tôi không thể tạo phản hồi lúc này. Vui lòng thử lại sau."
            except Exception as api_error:
                # If model not found, try fallback model
                error_str = str(api_error)
                if "NOT_FOUND" in error_str or "not found" in error_str.lower():
                    logger.warning(f"Model {self.model} not found, trying fallback model")
                    # Try with gemini-2.0-flash-exp as fallback
                    try:
                        fallback_model = "gemini-2.0-flash-exp"
                        response = self.client.models.generate_content(
                            model=fallback_model,
                            contents=full_prompt
                        )
                        if hasattr(response, 'text'):
                            return self._sanitize_response(response.text)
                    except Exception:
                        pass
                # Re-raise to be caught by outer exception handler
                raise api_error
                
        except Exception as e:
            # Log error with details
            error_str = str(e)
            logger.error(f"Error processing chatbot message: {error_str}")
            
            # Check for specific error types
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                return "Xin lỗi, chatbot hiện đang tạm thời không khả dụng do đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau vài phút hoặc liên hệ hỗ trợ để được hỗ trợ trực tiếp."
            elif "401" in error_str or "UNAUTHENTICATED" in error_str or "API key" in error_str.lower():
                return "Xin lỗi, chatbot chưa được cấu hình đúng. Vui lòng liên hệ quản trị viên."
            elif "NOT_FOUND" in error_str or "not found" in error_str.lower() or "not supported" in error_str.lower():
                return f"Xin lỗi, model {self.model} không khả dụng. Vui lòng liên hệ quản trị viên để cấu hình lại model."
            else:
                return "Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
