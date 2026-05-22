const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// @desc    Enviar un mensaje
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { receiverId, message, productId } = req.body;
  const senderId = req.user.id;

  try {
    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Receptor y contenido de mensaje son obligatorios' });
    }

    // Verificar si el receptor existe
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Usuario receptor no encontrado' });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      productId: productId || null,
      message
    });

    // Cargar detalles para responder con el objeto completo
    const messageDetails = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }
      ]
    });

    res.status(201).json(messageDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Obtener lista de conversaciones activas
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    // Buscar todos los mensajes del usuario
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatarUrl', 'role'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }
      ]
    });

    // Agrupar por el otro usuario
    const conversationsMap = new Map();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser) continue;

      const conversationKey = `${otherUser.id}-${msg.productId || 'no-product'}`;

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          otherUser,
          lastMessage: msg.message,
          createdAt: msg.createdAt,
          isRead: msg.receiverId === userId ? msg.isRead : true,
          product: msg.product || null
        });
      }
    }

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Obtener mensajes de un chat específico
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessagesBetweenUsers = async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;
  const { productId } = req.query;

  try {
    const whereCondition = {
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    };

    if (productId) {
      whereCondition.productId = productId;
    }

    const messages = await Message.findAll({
      where: whereCondition,
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }
      ]
    });

    // Marcar como leídos
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        }
      }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
