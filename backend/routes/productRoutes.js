const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createSellerReview,
  validateProduct
} = require('../controllers/productController');
const { protect } = require('../middlewares/auth');

// Rutas Públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas Privadas (Requieren Login)
router.post('/', protect, upload.single('image'), createProduct);
router.put('/:id', protect, updateProduct);
router.put('/:id/validate', protect, validateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/seller/:sellerId/review', protect, createSellerReview);

module.exports = router;

module.exports = router;
