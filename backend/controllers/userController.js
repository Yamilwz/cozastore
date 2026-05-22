const User = require('../models/User');

// @desc    Obtener perfil del usuario
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.location = req.body.location !== undefined ? req.body.location : user.location;
    user.avatarUrl = req.body.avatarUrl || user.avatarUrl;
    
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ where: { email: req.body.email } });
      if (emailExists) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        location: updatedUser.location,
        createdAt: updatedUser.createdAt,
      },
    });
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
};
