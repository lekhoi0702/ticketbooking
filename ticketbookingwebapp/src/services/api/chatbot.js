import { API_BASE_URL } from '@shared/constants';

/**
 * Chatbot API service
 */
export const chatbotApi = {
    /**
     * Send a message to the chatbot
     * @param {string} message - User's message
     * @returns {Promise<{success: boolean, data: {response: string}}>}
     */
    sendMessage: async (message) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to send message');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending chatbot message:', error);
            throw error;
        }
    }
};
