import axios from 'axios';
import API_BASE from '../config/api';

const API_URL = `${API_BASE}/auth`;

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const verify = async (token) => {
  const response = await axios.get(`${API_BASE}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  verify,
};

export default authService;
