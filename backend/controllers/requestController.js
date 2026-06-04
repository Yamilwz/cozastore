const Request = require('../models/Request');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Crear una solicitud para un producto/servicio
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  const { productId, message, requiredData } = req.body;
  const requesterId = req.user.id;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto o servicio no encontrado' });
    }

    if (parseInt(product.sellerId) === parseInt(requesterId)) {
      return res.status(400).json({ error: 'No puedes solicitar tu propio producto' });
    }

    const request = await Request.create({
      productId,
      requesterId,
      sellerId: product.sellerId,
      message,
      requiredData,
      status: 'pendiente'
    });

    // Incrementar requestCount en el producto
    product.requestCount = (product.requestCount || 0) + 1;
    await product.save();

    res.status(201).json({ message: 'Solicitud enviada correctamente', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Obtener solicitudes recibidas (como ofertante)
// @route   GET /api/requests/received
// @access  Private (Vendedor)
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { sellerId: req.user.id },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] },
        { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'avatarUrl', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Responder a una solicitud (Aceptar/Rechazar)
// @route   PUT /api/requests/:id/respond
// @access  Private (Vendedor)
exports.respondToRequest = async (req, res) => {
  const { status } = req.body;

  try {
    if (!['aceptado', 'rechazado'].includes(status)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (request.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para responder esta solicitud' });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Solicitud ${status} correctamente`, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Obtener solicitudes enviadas (como comprador)
// @route   GET /api/requests/sent
// @access  Private
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { requesterId: req.user.id },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'avatarUrl'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
