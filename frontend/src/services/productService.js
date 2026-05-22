import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

const getProducts = async (token) => {
  let headers = {};
  if (token) {
    headers = { Authorization: `Bearer ${token}` };
  } else {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.token) {
      headers = { Authorization: `Bearer ${storedUser.token}` };
    }
  }
  const response = await axios.get(API_URL, { headers });
  return response.data;
};

const createProduct = async (productData, token) => {
  const response = await axios.post(API_URL, productData, {
    headers: {
      Authorization: `Bearer ${token}`
      // Let Axios set Content-Type for FormData automatically
    }
  });
  return response.data;
};

const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const updateProduct = async (id, productData, token) => {
  const response = await axios.put(`${API_URL}/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const deleteProduct = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const productService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

export default productService;
