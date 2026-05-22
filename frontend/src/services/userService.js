import axios from 'axios';
import API_BASE from '../config/api';

const API_URL = `${API_BASE}/users`;

const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/profile`, config);
  return response.data;
};

const updateProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}/profile`, userData, config);
  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
};

export default userService;
