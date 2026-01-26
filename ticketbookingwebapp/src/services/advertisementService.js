import { API_BASE_URL } from '@shared/constants';

/**
 * Advertisement API Service
 */
export const advertisementAPI = {
    /**
     * Get active advertisements by position
     * @param {string} position - Position identifier (e.g., 'HOME_BETWEEN_SECTIONS', 'EVENT_DETAIL_SIDEBAR')
     * @param {number} limit - Maximum number of ads to fetch
     * @returns {Promise} Advertisement data
     */
    async getAdsByPosition(position, limit = null) {
        try {
            const params = limit ? `?limit=${limit}` : '';
            const response = await fetch(`${API_BASE_URL}/advertisements/position/${position}${params}`);
            if (!response.ok) throw new Error('Failed to fetch advertisements');
            return await response.json();
        } catch (error) {
            console.error('Error fetching advertisements:', error);
            throw error;
        }
    },

    /**
     * Get all advertisements (admin only)
     * @param {boolean} includeInactive - Include inactive ads
     * @param {string} token - Auth token
     * @returns {Promise} Advertisement data
     */
    async getAllAds(includeInactive = false, token) {
        try {
            const params = includeInactive ? '?include_inactive=true' : '';
            const response = await fetch(`${API_BASE_URL}/advertisements/${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch advertisements');
            return await response.json();
        } catch (error) {
            console.error('Error fetching all advertisements:', error);
            throw error;
        }
    },

    /**
     * Get advertisement by ID (admin only)
     * @param {number} adId - Advertisement ID
     * @param {string} token - Auth token
     * @returns {Promise} Advertisement data
     */
    async getAdById(adId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch advertisement');
            return await response.json();
        } catch (error) {
            console.error('Error fetching advertisement:', error);
            throw error;
        }
    },

    /**
     * Create new advertisement (admin only)
     * @param {FormData} formData - Advertisement data as FormData
     * @param {string} token - Auth token
     * @returns {Promise} Created advertisement
     */
    async createAd(formData, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type - browser will set it with boundary for FormData
                },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to create advertisement');
            return await response.json();
        } catch (error) {
            console.error('Error creating advertisement:', error);
            throw error;
        }
    },

    /**
     * Update advertisement (admin only)
     * @param {number} adId - Advertisement ID
     * @param {FormData} formData - Updated advertisement data as FormData
     * @param {string} token - Auth token
     * @returns {Promise} Updated advertisement
     */
    async updateAd(adId, formData, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type - browser will set it with boundary for FormData
                },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to update advertisement');
            return await response.json();
        } catch (error) {
            console.error('Error updating advertisement:', error);
            throw error;
        }
    },

    /**
     * Delete advertisement (admin only)
     * @param {number} adId - Advertisement ID
     * @param {string} token - Auth token
     * @returns {Promise}
     */
    async deleteAd(adId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete advertisement');
            return await response.json();
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            throw error;
        }
    }
};
