import axios from 'axios';
import API_BASE from '../config/api';

const getAuthHeaders = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (storedUser && storedUser.token) {
    return { Authorization: `Bearer ${storedUser.token}` };
  }
  return {};
};

// Obtener lista de conversaciones
const getConversations = async () => {
  const response = await axios.get(`${API_BASE}/messages/conversations`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Obtener mensajes entre dos usuarios (con filtro de productId opcional)
const getMessages = async (otherUserId, productId = null) => {
  const params = productId ? { productId } : {};
  const response = await axios.get(`${API_BASE}/messages/${otherUserId}`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

// Enviar mensaje
const sendMessage = async ({ receiverId, message, productId }) => {
  const response = await axios.post(`${API_BASE}/messages`, { receiverId, message, productId }, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Exportar el formato original por compatibilidad
const getMessagesForUser = async () => {
  return getConversations();
};

export { getConversations, getMessages, sendMessage };
export default { getConversations, getMessages, sendMessage, getMessagesForUser };
