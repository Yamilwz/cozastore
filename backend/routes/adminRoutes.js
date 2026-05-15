const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, createProduct, createUser, updateUser } = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { admin } = require('../middlewares/adminMiddleware');

router.get('/users', protect, admin, getAllUsers);
router.post('/users', protect, admin, createUser);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.post('/products', protect, admin, createProduct);

module.exports = router;
