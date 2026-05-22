require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Importar modelos para establecer relaciones
const User = require('./models/User');
const Product = require('./models/Product');
const SellerReview = require('./models/SellerReview');
const Message = require('./models/Message');

// Definir Relaciones/Asociaciones
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(SellerReview, { foreignKey: 'sellerId', as: 'sellerReviews', onDelete: 'CASCADE' });
SellerReview.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
SellerReview.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

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
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);

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
