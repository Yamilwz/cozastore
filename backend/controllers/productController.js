const Product = require('../models/Product');
const User = require('../models/User');
const SellerReview = require('../models/SellerReview');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// @desc    Obtener todos los productos con filtros avanzados
exports.getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, location, sellerId, status } = req.query;

  try {
    const where = {};

    // Obtener usuario autenticado opcionalmente desde el token
    let currentUser = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
          currentUser = await User.findByPk(decoded.id);
        }
      } catch (err) {
        // Ignorar token inválido
      }
    }

    // Aplicar filtros de estado de validación según el rol
    if (!currentUser || currentUser.role !== 'admin') {
      if (currentUser && currentUser.role === 'vendedor') {
        // Vendedor ve aprobados de todos + todos los propios
        where[Op.or] = [
          { approvalStatus: 'aprobado' },
          { sellerId: currentUser.id }
        ];
      } else {
        // Cliente o invitado solo ve aprobados
        where.approvalStatus = 'aprobado';
      }
    } else {
      // Admin ve todo, pero si filtra por approvalStatus lo respetamos
      if (req.query.approvalStatus) {
        where.approvalStatus = req.query.approvalStatus;
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category && category !== 'Todos') {
      where.category = category;
    }

    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'location', 'createdAt']
        }
      ]
    });

    // Batch-load seller reputation to avoid N+1 queries
    const sellerIds = [...new Set(products.map(p => p.sellerId).filter(Boolean))];
    const reviewMap = {};
    if (sellerIds.length > 0) {
      const allReviews = await SellerReview.findAll({
        where: { sellerId: sellerIds }
      });
      for (const sellerId of sellerIds) {
        const reviews = allReviews.filter(r => r.sellerId === sellerId);
        const avg = reviews.length > 0
          ? parseFloat((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1))
          : 0;
        reviewMap[sellerId] = { avgRating: avg, reviewsCount: reviews.length };
      }
    }

    // Attach reputation to each product's seller
    const enriched = products.map(p => {
      const plain = p.toJSON();
      if (plain.seller && reviewMap[plain.sellerId]) {
        plain.seller.avgRating = reviewMap[plain.sellerId].avgRating;
        plain.seller.reviewsCount = reviewMap[plain.sellerId].reviewsCount;
      }
      return plain;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Obtener un producto por ID con detalles del vendedor y su reputación
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'bio', 'location', 'createdAt']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Calcular reputación del vendedor (calificación promedio y comentarios)
    const reviews = await SellerReview.findAll({
      where: { sellerId: product.sellerId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'avatarUrl']
        }
      ]
    });

    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = parseFloat((sum / reviews.length).toFixed(1));
    }

    const response = {
      ...product.toJSON(),
      seller: {
        ...product.seller.toJSON(),
        avgRating,
        reviewsCount: reviews.length,
        reviews
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Crear un producto (Vendedor o Admin)
// @route   POST /api/products
// @access  Private (Vendedor / Admin)
exports.createProduct = async (req, res) => {
  const { name, description, price, category, images, stock, status, location } = req.body;
  const sellerId = req.user.id;
  // If an image file was uploaded, use its path as imageUrl
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    if (req.user.role !== 'vendedor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado. Solo vendedores pueden publicar productos.' });
    }

    if (!name || !price) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: category || 'General',
      imageUrl: imageUrl || req.body.imageUrl,
      images,
      stock: stock !== undefined ? parseInt(stock) : 1,
      sellerId,
      status: status || 'nuevo',
      approvalStatus: 'pendiente',
      location: location || req.user.location || 'No especificada'
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Actualizar un producto (Dueño o Admin)
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  const { name, description, price, category, imageUrl, images, stock, status, location } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si es dueño o admin
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para editar este producto.' });
    }

    // Verificar si hay cambios críticos para regresar a pendiente
    const isCriticalChange =
      (name !== undefined && name !== product.name) ||
      (description !== undefined && description !== product.description) ||
      (price !== undefined && parseFloat(price) !== product.price) ||
      (category !== undefined && category !== product.category);

    if (isCriticalChange) {
      product.approvalStatus = 'pendiente';
    }

    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.imageUrl = imageUrl || product.imageUrl;
    product.images = images !== undefined ? images : product.images;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.status = status || product.status;
    product.location = location || product.location;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Eliminar un producto (Dueño o Admin)
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si es dueño o admin
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar este producto.' });
    }

    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Agregar reseña a un vendedor
// @route   POST /api/products/seller/:sellerId/review
// @access  Private
exports.createSellerReview = async (req, res) => {
  const { rating, comment } = req.body;
  const sellerId = req.params.sellerId;
  const buyerId = req.user.id;

  try {
    if (buyerId == sellerId) {
      return res.status(400).json({ error: 'No puedes valorarte a ti mismo.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe ser un entero entre 1 y 5.' });
    }

    // Verificar si el vendedor existe
    const seller = await User.findByPk(sellerId);
    if (!seller || seller.role !== 'vendedor') {
      return res.status(404).json({ error: 'Vendedor no encontrado.' });
    }

    // Verificar si ya tiene reseña de este comprador
    const existingReview = await SellerReview.findOne({
      where: { sellerId, buyerId }
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      await existingReview.save();
      return res.json({ message: 'Reseña actualizada', review: existingReview });
    }

    const review = await SellerReview.create({
      sellerId,
      buyerId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Validar producto (Aprobar o Rechazar)
// @route   PUT /api/products/:id/validate
// @access  Private (Admin)
exports.validateProduct = async (req, res) => {
  const { approvalStatus } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado. Solo administradores pueden validar productos.' });
    }

    if (!approvalStatus || !['aprobado', 'rechazado', 'pendiente'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'Estado de aprobación no válido.' });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    product.approvalStatus = approvalStatus;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
