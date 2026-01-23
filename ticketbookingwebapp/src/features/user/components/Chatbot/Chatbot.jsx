import React, { useState, useRef, useEffect } from 'react';
import { MessageOutlined, CloseOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { useChatbot } from '../../../../shared/hooks/useChatbot';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { messages, isLoading, sendMessage, clearMessages } = useChatbot();

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Clear messages when opening fresh
            clearMessages();
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) {
            return;
        }

        const message = inputMessage;
        setInputMessage('');
        await sendMessage(message);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Format message text with proper line breaks for better readability
    const formatMessage = (text) => {
        if (!text) return '';
        
        // Escape HTML first for security
        let formatted = escapeHtml(text);
        
        // Preserve existing line breaks
        formatted = formatted.replace(/\n/g, '<br />');
        
        // Add line breaks after major punctuation (., !, ?) followed by space
        // This creates natural paragraph breaks
        formatted = formatted.replace(/([.!?])\s+/g, '$1<br />');
        
        // For segments longer than 80 characters, add breaks after commas
        // Process text in chunks separated by existing breaks
        const chunks = formatted.split(/(<br \/>)/);
        const processedChunks = chunks.map(chunk => {
            // Skip break tags
            if (chunk === '<br />') return chunk;
            
            // If chunk is longer than 80 chars, add breaks after commas
            if (chunk.length > 80) {
                return chunk.replace(/(,)\s+/g, ',<br />');
            }
            return chunk;
        });
        
        formatted = processedChunks.join('');
        
        // Clean up excessive breaks (max 2 consecutive)
        formatted = formatted.replace(/(<br \/>\s*){3,}/g, '<br /><br />');
        
        return formatted.trim();
    };

    return (
        <>
            {/* Chat Button */}
            <button
                className="chatbot-toggle-btn"
                onClick={handleToggle}
                aria-label="Open chatbot"
            >
                <MessageOutlined style={{ fontSize: '24px' }} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-content">
                            <h3>TICKETBOOKING AI SUPPORT</h3>
                            <p>Tôi có thể giúp gì cho bạn?</p>
                        </div>
                        <button
                            className="chatbot-close-btn"
                            onClick={handleToggle}
                            aria-label="Close chatbot"
                        >
                            <CloseOutlined style={{ fontSize: '20px' }} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.length === 0 && (
                            <div className="chatbot-welcome">
                                <p>👋 Xin chào! Tôi là chatbot hỗ trợ.</p>
                                <p>Tôi có thể giúp bạn:</p>
                                <ul>
                                    <li>🔍 Tìm kiếm sự kiện</li>
                                    <li>📋 Kiểm tra đơn hàng</li>
                                    <li>💳 Hướng dẫn thanh toán</li>
                                    <li>❓ Trả lời câu hỏi thường gặp</li>
                                </ul>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chatbot-message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
                            >
                                <div 
                                    className="message-content"
                                    dangerouslySetInnerHTML={{ 
                                        __html: message.sender === 'bot' 
                                            ? formatMessage(message.text) 
                                            : escapeHtml(message.text).replace(/\n/g, '<br />')
                                    }}
                                />
                                <div className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-message bot-message">
                                <div className="message-content typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputMessage.trim() || isLoading}
                        >
                            {isLoading ? (
                                <LoadingOutlined style={{ fontSize: '20px' }} className="spinning" />
                            ) : (
                                <SendOutlined style={{ fontSize: '20px' }} />
                            )}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
