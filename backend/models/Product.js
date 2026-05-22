const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  images: {
    type: DataTypes.TEXT, // Commas-separated or JSON string of multiple image URLs
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('nuevo', 'usado'),
    defaultValue: 'nuevo'
  },
  approvalStatus: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: 'No especificada'
  }
});

module.exports = Product;
