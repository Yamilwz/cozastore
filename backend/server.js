// Forzar IPv4 en DNS antes de cualquier otro módulo (evita ENETUNREACH IPv6 en Render)
require('dns').setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const { connectDB, sequelize } = require('./config/db');
const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const messageRoutes = require('./routes/messageRoutes');
const requestRoutes = require('./routes/requestRoutes');

// Importar modelos para establecer relaciones
const User = require('./models/User');
const Product = require('./models/Product');
const SellerReview = require('./models/SellerReview');
const Message = require('./models/Message');
const Request = require('./models/Request');

// Definir Relaciones/Asociaciones
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(SellerReview, { foreignKey: 'sellerId', as: 'sellerReviews', onDelete: 'CASCADE' });
SellerReview.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
SellerReview.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Request.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Request.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Request.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Conectar a la base de datos y sincronizar modelos
connectDB().then(() => {
  return sequelize.sync({ alter: true });
}).then(() => {
  console.log('Database synced with relationships');
}).catch(err => {
  console.error('Failed to sync db: ' + err.message);
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middlewares
// 1. Helmet: Configura cabeceras HTTP de seguridad
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// 2. Rate Limiting: Prevenir ataques de fuerza bruta y DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter);

// 3. XSS Clean: Prevenir inyecciones XSS en el body o query
app.use(xss());

// 4. HPP: Prevenir ataques de contaminación de parámetros HTTP (HTTP Parameter Pollution)
app.use(hpp());

app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body para evitar ataques de sobrecarga

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/requests', requestRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de COZASTORE corriendo...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
