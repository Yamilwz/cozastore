import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/users`, config);
  return response.data;
};

const deleteUser = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/users/${id}`, config);
  return response.data;
};

const createProduct = async (productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/products`, productData, config);
  return response.data;
};

const createUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/users`, userData, config);
  return response.data;
};

const updateUser = async (id, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/users/${id}`, userData, config);
  return response.data;
};

const adminService = {
  getUsers,
  deleteUser,
  createProduct,
  createUser,
  updateUser,
};

export default adminService;
