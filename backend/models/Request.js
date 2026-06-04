const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Request = sequelize.define('Request', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requiredData: {
    type: DataTypes.JSON,
    allowNull: true // Puede guardar datos de contacto extra u otros requerimientos
  }
});

module.exports = Request;
