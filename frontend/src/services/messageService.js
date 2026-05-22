import axios from 'axios';
import API_BASE from '../config/api';

/**
 * Fetches all conversations for a given user.
 * Returns an array of objects: { id, partnerName, lastMessage, ... }
 */
export const getMessagesForUser = async (userId, token) => {
  try {
    const response = await axios.get(`${API_BASE}/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages', error);
    throw error;
  }
};

// Export default for backward compatibility with existing imports
export default { getMessagesForUser };
