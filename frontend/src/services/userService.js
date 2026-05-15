import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

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
