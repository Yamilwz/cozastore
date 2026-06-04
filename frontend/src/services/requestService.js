import axios from 'axios';
import API_BASE from '../config/api';

const API_URL = `${API_BASE}/requests`;

const getAuthHeaders = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (storedUser && storedUser.token) {
    return { Authorization: `Bearer ${storedUser.token}` };
  }
  return {};
};

const createRequest = async (data) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeaders() });
  return response.data;
};

const getReceivedRequests = async () => {
  const response = await axios.get(`${API_URL}/received`, { headers: getAuthHeaders() });
  return response.data;
};

const respondToRequest = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/respond`, { status }, { headers: getAuthHeaders() });
  return response.data;
};

const getSentRequests = async () => {
  const response = await axios.get(`${API_URL}/sent`, { headers: getAuthHeaders() });
  return response.data;
};

export default {
  createRequest,
  getReceivedRequests,
  respondToRequest,
  getSentRequests
};
