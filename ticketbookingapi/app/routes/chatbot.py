"""
Chatbot API routes
"""
from flask import Blueprint, jsonify, request, g
from app.services.chatbot_service import ChatbotService
from app.decorators.auth import optional_auth
from app.utils.logger import get_logger

chatbot_bp = Blueprint("chatbot", __name__)
logger = get_logger('ticketbooking.chatbot')


@chatbot_bp.route("/chatbot/message", methods=["POST"])
@optional_auth
def send_message():
    """
    Send a message to the chatbot and get response
    
    Request body:
    {
        "message": "string",
        "user_id": int (optional, will be extracted from token if authenticated)
    }
    
    Returns:
    {
        "success": bool,
        "data": {
            "response": "string"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400
        
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                'success': False,
                'message': 'Message cannot be empty'
            }), 400
        
        # Get user_id from authenticated user if available
        user_id = None
        if hasattr(g, 'user_id'):
            user_id = g.user_id
        elif hasattr(g, 'current_user'):
            user_id = g.current_user.user_id
        
        # Also check if user_id is provided in request body (for testing)
        if not user_id and 'user_id' in data:
            user_id = data.get('user_id')
        
        # Initialize chatbot service
        chatbot_service = ChatbotService()
        
        # Process message
        response = chatbot_service.process_message(message, user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'response': response
            }
        }), 200
        
    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Chatbot is not configured properly'
        }), 500
        
    except Exception as e:
        logger.error(f"Error processing chatbot message: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your message'
        }), 500
