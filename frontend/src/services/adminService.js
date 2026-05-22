import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Users
const getUsers = async (token) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const createUser = async (userData, token) => {
  const response = await axios.post(`${API_URL}/admin/users`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const updateUser = async (id, userData, token) => {
  const response = await axios.put(`${API_URL}/admin/users/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const deleteUser = async (id, token) => {
  await axios.delete(`${API_URL}/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Products (admin view)
const getProducts = async (token) => {
  const response = await axios.get(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const deleteProduct = async (id, token) => {
  await axios.delete(`${API_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const validateProduct = async (id, approvalStatus, token) => {
  const response = await axios.put(`${API_URL}/products/${id}/validate`, { approvalStatus }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const adminService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProducts,
  deleteProduct,
  validateProduct
};

export default adminService;
