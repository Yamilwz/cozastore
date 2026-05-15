const { sequelize } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const seedUsers = async () => {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: 'admin@casastore.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@casastore.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    const clientExists = await User.findOne({ where: { email: 'cliente@casastore.com' } });
    if (!clientExists) {
      await User.create({
        name: 'Cliente Prueba',
        email: 'cliente@casastore.com',
        password: 'password123',
        role: 'cliente'
      });
      console.log('Client user created');
    }

    // Seed products
    const productsCount = await Product.count();
    if (productsCount === 0) {
      await Product.bulkCreate([
        {
          name: 'Camiseta Minimalista',
          description: 'Camiseta de algodón premium con diseño minimalista.',
          price: 25.99,
          category: 'Ropa',
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
          stock: 50
        },
        {
          name: 'Gorra Urban',
          description: 'Gorra estilo urbano con bordado sutil.',
          price: 15.50,
          category: 'Accesorios',
          imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
          stock: 30
        },
        {
          name: 'Sudadera con Capucha',
          description: 'Sudadera cálida y cómoda para el día a día.',
          price: 45.00,
          category: 'Ropa',
          imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
          stock: 20
        },
        {
          name: 'Reloj de Pulsera',
          description: 'Reloj elegante con correa de cuero.',
          price: 89.90,
          category: 'Accesorios',
          imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
          stock: 10
        }
      ]);
      console.log('Sample products created');
    }

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
