const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getMessagesBetweenUsers } = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

// Todas las rutas de chat requieren estar logueado
router.use(protect);

router.route('/')
  .post(sendMessage);

router.route('/conversations')
  .get(getConversations);

router.route('/:otherUserId')
  .get(getMessagesBetweenUsers);

module.exports = router;
