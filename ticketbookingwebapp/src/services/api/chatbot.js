import { apiRequest } from './_compat';

export const chatbotApi = {
    async sendMessage(message) {
        const res = await apiRequest('/chatbot/message', {
            method: 'POST',
            body: { Message: message },
        });

        if (!res.success) return res;

        return {
            success: true,
            data: {
                response: res.data?.response || res.data?.Response || '',
            },
            message: '',
        };
    },
};
