import { useState, useCallback } from 'react';
import { chatbotApi } from '../../services/api/chatbot';

/**
 * Hook for managing chatbot state and interactions
 */
export const useChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Send a message to the chatbot
     */
    const sendMessage = useCallback(async (message) => {
        if (!message || !message.trim()) {
            return;
        }

        const userMessage = message.trim();
        
        // Add user message to state
        const newUserMessage = {
            id: Date.now(),
            text: userMessage,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatbotApi.sendMessage(userMessage);
            
            if (response.success && response.data) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    sender: 'bot',
                    timestamp: new Date()
                };
                
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (err) {
            const errorMessage = {
                id: Date.now() + 1,
                text: err.message || 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clear all messages
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages
    };
};
