require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const SellerReview = require('./models/SellerReview');
const Message = require('./models/Message');

const seedUsers = async () => {
  try {
    // Definir Relaciones/Asociaciones directamente
    User.hasMany(Product, { foreignKey: 'sellerId', as: 'products', onDelete: 'CASCADE' });
    Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

    User.hasMany(SellerReview, { foreignKey: 'sellerId', as: 'sellerReviews', onDelete: 'CASCADE' });
    SellerReview.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
    SellerReview.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

    Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
    Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
    Message.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    await sequelize.sync({ force: true }); // Reset de base de datos para recrear con relaciones
    
    // Crear Admin
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@casastore.com',
      password: 'password123',
      role: 'admin',
      location: 'Madrid, España',
      bio: 'Administrador central de COZASTORE Marketplace.'
    });
    console.log('Admin user created');

    // Crear Vendedor
    const seller = await User.create({
      name: 'Juan Pérez (Vendedor)',
      email: 'vendedor@casastore.com',
      password: 'password123',
      role: 'vendedor',
      location: 'Santiago, Chile',
      bio: 'Vendedor de ropa premium y accesorios vintage. Hago envíos a todo el mundo.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    });
    console.log('Seller user created');

    // Crear Comprador
    const buyer = await User.create({
      name: 'María Gómez',
      email: 'comprador@casastore.com',
      password: 'password123',
      role: 'comprador',
      location: 'Buenos Aires, Argentina',
      bio: 'Amante de la moda sostenible y el calzado retro.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    });
    console.log('Buyer user created');

    // Seed products asociados al vendedor
    await Product.bulkCreate([
      {
        name: 'Camiseta Minimalista',
        description: 'Camiseta de algodón premium con diseño minimalista.',
        price: 25.99,
        category: 'Ropa',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
        images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
        stock: 50,
        sellerId: seller.id,
        status: 'nuevo',
        approvalStatus: 'aprobado',
        location: 'Santiago, Chile'
      },
      {
        name: 'Gorra Urban',
        description: 'Gorra estilo urbano con bordado sutil en frente.',
        price: 15.50,
        category: 'Accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
        images: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
        stock: 30,
        sellerId: seller.id,
        status: 'nuevo',
        approvalStatus: 'aprobado',
        location: 'Valparaíso, Chile'
      },
      {
        name: 'Sudadera con Capucha',
        description: 'Sudadera cálida y cómoda para el día a día en color gris.',
        price: 45.00,
        category: 'Ropa',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
        images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
        stock: 20,
        sellerId: seller.id,
        status: 'usado',
        approvalStatus: 'aprobado',
        location: 'Santiago, Chile'
      },
      {
        name: 'Reloj de Pulsera Classic',
        description: 'Reloj elegante con correa de cuero y marco cromado.',
        price: 89.90,
        category: 'Accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
        images: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
        stock: 10,
        sellerId: seller.id,
        status: 'usado',
        approvalStatus: 'aprobado',
        location: 'Santiago, Chile'
      }
    ]);

    // Additional sellers and products
    const seller2 = await User.create({
      name: 'Lucía Martínez (Vendedora)',
      email: 'lucia@casastore.com',
      password: 'password123',
      role: 'vendedor',
      location: 'Barcelona, España',
      bio: 'Vendedora de ropa vintage y accesorios únicos.',
      avatarUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=150&q=80'
    });
    const seller3 = await User.create({
      name: 'Pedro Silva (Vendedor)',
      email: 'pedro@casastore.com',
      password: 'password123',
      role: 'vendedor',
      location: 'Lima, Perú',
      bio: 'Especialista en calzado artesanal y sostenible.',
      avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'
    });
    await Product.bulkCreate([
      {
        name: 'Chaqueta de Cuero Vintage',
        description: 'Chaqueta de cuero auténtico con estilo retro.',
        price: 120.00,
        category: 'Ropa',
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        images: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        stock: 5,
        sellerId: seller2.id,
        status: 'nuevo',
        approvalStatus: 'aprobado',
        location: 'Barcelona, España'
      },
      {
        name: 'Sandalias Ecológicas',
        description: 'Sandalias hechas de materiales reciclados, ideales para el verano.',
        price: 35.99,
        category: 'Calzado',
        imageUrl: 'https://images.unsplash.com/photo-1580894894515-70a4c1fe2e5e?auto=format&fit=crop&w=800&q=80',
        images: 'https://images.unsplash.com/photo-1580894894515-70a4c1fe2e5e?auto=format&fit=crop&w=800&q=80',
        stock: 25,
        sellerId: seller3.id,
        status: 'nuevo',
        approvalStatus: 'aprobado',
        location: 'Lima, Perú'
      }
    ]);
    console.log('Sample products created');

    // Agregar algunas reseñas de prueba para el vendedor
    await SellerReview.bulkCreate([
      {
        sellerId: seller.id,
        buyerId: buyer.id,
        rating: 5,
        comment: 'Excelente vendedor, el producto llegó súper rápido y en perfectas condiciones!'
      },
      {
        sellerId: seller.id,
        buyerId: admin.id,
        rating: 4,
        comment: 'Buena comunicación, la gorra es genial y de buena calidad.'
      }
    ]);
    console.log('Sample reviews created');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
