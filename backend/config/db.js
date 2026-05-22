const { Sequelize } = require('sequelize');
const path = require('path');
const dns = require('dns');

// Fuerza la resolución de nombres DNS a IPv4 primero (evita errores ENETUNREACH de IPv6 en Render)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      family: 4  // Fuerza la resolución a IPv4 (evita fallos de IPv6 en entornos como Render)
    }
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'test') {
      console.log('SQLite Test Database Connected');
    } else {
      console.log('PostgreSQL Database Connected (Supabase)');
    }
  } catch (error) {
    console.error(`Error connecting to Database: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
