const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createRequest,
  getReceivedRequests,
  respondToRequest,
  getSentRequests
} = require('../controllers/requestController');

// Rutas base: /api/requests
router.post('/', protect, createRequest);
router.get('/received', protect, getReceivedRequests);
router.get('/sent', protect, getSentRequests);
router.put('/:id/respond', protect, respondToRequest);

module.exports = router;
