// seed.js – script to populate the MySQL database with initial data (admin, sellers, products)
// Run with: npm run seed   (package.json must have a "seed" script)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

(async () => {
  try {
    // Ensure DB tables are created (without dropping existing data)
    await sequelize.sync();
    console.log('✅ Database synced');

    // Helper to hash a plain password
    const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

    // Create second admin for legacy email
    await User.findOrCreate({
      where: { email: 'admin@casastore.com' },
      defaults: {
        name: 'Admin',
        password: 'admin123',
        role: 'admin',
      },
    });

    // Create sellers (Lucía & Pedro) – role "vendedor"
    const [lucia] = await User.findOrCreate({
      where: { email: 'lucia@casastore.com' },
      defaults: {
        name: 'Lucía',
        password: 'password123',
        role: 'vendedor',
      },
    });

    const [pedro] = await User.findOrCreate({
      where: { email: 'pedro@casastore.com' },
      defaults: {
        name: 'Pedro',
        password: 'password123',
        role: 'vendedor',
      },
    });

    console.log('👤 Users created/verified');

    // Create example products (only if they don't already exist)
    const createProductIfMissing = async (name, seller) => {
      const existing = await Product.findOne({ where: { name } });
      if (!existing) {
        await Product.create({
          name,
          description: `${name} - descripción de ejemplo`,
          price: Math.round(Math.random() * 100 + 10),
          category: 'General',
          imageUrl: null,
          sellerId: seller.id,
          status: 'nuevo',
          approvalStatus: 'aprobado'
        });
        console.log(`🛍️  Product "${name}" added`);
      }
    };

    await createProductIfMissing('Camiseta Vintage', lucia);
    await createProductIfMissing('Mochila de Cuero', pedro);

    console.log('✅ Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
})();
