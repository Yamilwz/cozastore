const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      if (user.role === 'admin' && req.user.id === user.id) {
        return res.status(400).json({ error: 'No puedes eliminarte a ti mismo como administrador' });
      }
      await user.destroy();
      res.json({ message: 'Usuario eliminado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Crear un producto como administrador
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, images, stock, status, location } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      images,
      stock: stock !== undefined ? parseInt(stock) : 1,
      sellerId: req.user.id, // El administrador actúa como el vendedor
      status: status || 'nuevo',
      location: location || req.user.location || 'No especificada'
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Crear un usuario manualmente
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, location, avatarUrl } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'comprador',
      bio: bio || '',
      location: location || 'No especificada',
      avatarUrl: avatarUrl || undefined
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Actualizar un usuario
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, bio, location, avatarUrl } = req.body;
    const user = await User.findByPk(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.bio = bio !== undefined ? bio : user.bio;
      user.location = location !== undefined ? location : user.location;
      user.avatarUrl = avatarUrl || user.avatarUrl;

      const updatedUser = await user.save();
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt
      });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
