const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Especificaciones de Gestión de Productos y Servicios (Sprint 2)', () => {
  let adminToken, sellerToken, buyerToken, otherSellerToken;
  let adminUser, sellerUser, buyerUser, otherSellerUser;
  let sampleProduct;

  const generateTestToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
      expiresIn: '1d',
    });
  };

  beforeAll(async () => {
    // Sincronizar base de datos SQLite en memoria
    await sequelize.sync({ force: true });

    // Crear usuarios de prueba
    adminUser = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateTestToken(adminUser.id);

    sellerUser = await User.create({
      name: 'Seller Test',
      email: 'seller@test.com',
      password: 'password123',
      role: 'vendedor',
    });
    sellerToken = generateTestToken(sellerUser.id);

    otherSellerUser = await User.create({
      name: 'Other Seller Test',
      email: 'other_seller@test.com',
      password: 'password123',
      role: 'vendedor',
    });
    otherSellerToken = generateTestToken(otherSellerUser.id);

    buyerUser = await User.create({
      name: 'Buyer Test',
      email: 'buyer@test.com',
      password: 'password123',
      role: 'comprador',
    });
    buyerToken = generateTestToken(buyerUser.id);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar tabla de productos antes de cada prueba
    await Product.destroy({ where: {}, truncate: true });

    // Crear un producto de muestra pre-aprobado para pruebas de edición y listado
    sampleProduct = await Product.create({
      name: 'Mochila Impermeable',
      description: 'Mochila de alta resistencia para trekking.',
      price: 59.99,
      category: 'Accesorios',
      stock: 10,
      sellerId: sellerUser.id,
      approvalStatus: 'aprobado',
    });
  });

  // HU-01: Registro de Producto/Servicio (Ofertante)
  describe('HU-01: Registro de Producto/Servicio', () => {
    it('debe permitir a un Ofertante (Vendedor) registrar un producto con estado inicial "pendiente"', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Camisa Lino Premium',
          description: 'Camisa de lino 100% ideal para el verano.',
          price: 34.99,
          category: 'Ropa',
          stock: 15,
          location: 'Santiago, Chile',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Camisa Lino Premium');
      expect(response.body.price).toBe(34.99);
      expect(response.body.approvalStatus).toBe('pendiente'); // Estado inicial requerido
    });

    it('debe denegar el registro si el usuario no tiene rol Ofertante o Admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          name: 'Intento de Fraude',
          price: 10.00,
        });

      expect(response.status).toBe(403);
    });

    it('debe retornar un error si faltan campos obligatorios como el nombre o el precio', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          description: 'Falta nombre y precio',
          category: 'Ropa',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  // HU-02: Edición o Eliminación de Producto/Servicio (Ofertante)
  describe('HU-02: Edición o Eliminación de Producto/Servicio', () => {
    it('debe devolver el producto al estado "pendiente" tras una edición crítica (ej: cambiar el nombre)', async () => {
      const response = await request(app)
        .put(`/api/products/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Mochila Impermeable Ultra Pro', // Cambio crítico de nombre
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Mochila Impermeable Ultra Pro');
      expect(response.body.approvalStatus).toBe('pendiente'); // Se resetea a pendiente
    });

    it('debe mantener el estado "aprobado" tras una edición NO crítica (ej: cambiar el stock o ubicación)', async () => {
      const response = await request(app)
        .put(`/api/products/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          stock: 25, // No crítico
          location: 'Valparaíso, Chile', // No crítico
        });

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(25);
      expect(response.body.approvalStatus).toBe('aprobado'); // Mantiene estado aprobado
    });

    it('debe denegar la edición si el usuario no es el dueño ni un administrador', async () => {
      const response = await request(app)
        .put(`/api/products/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${otherSellerToken}`)
        .send({
          name: 'Mochila Robada',
        });

      expect(response.status).toBe(403);
    });

    it('debe permitir al dueño eliminar el producto', async () => {
      const response = await request(app)
        .delete(`/api/products/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Producto eliminado');

      const checkDb = await Product.findByPk(sampleProduct.id);
      expect(checkDb).toBeNull();
    });
  });

  // HU-03: Validación de Contenido (Administrador)
  describe('HU-03: Validación de Contenido', () => {
    let pendingProduct;

    beforeEach(async () => {
      pendingProduct = await Product.create({
        name: 'Reloj Inteligente',
        description: 'Smartwatch sumergible.',
        price: 99.99,
        category: 'Tecnología',
        stock: 5,
        sellerId: sellerUser.id,
        approvalStatus: 'pendiente',
      });
    });

    it('debe permitir al administrador cambiar el estado de validación a "aprobado"', async () => {
      const response = await request(app)
        .put(`/api/products/${pendingProduct.id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          approvalStatus: 'aprobado',
        });

      expect(response.status).toBe(200);
      expect(response.body.approvalStatus).toBe('aprobado');

      const checkDb = await Product.findByPk(pendingProduct.id);
      expect(checkDb.approvalStatus).toBe('aprobado');
    });

    it('debe permitir al administrador cambiar el estado de validación a "rechazado"', async () => {
      const response = await request(app)
        .put(`/api/products/${pendingProduct.id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          approvalStatus: 'rechazado',
        });

      expect(response.status).toBe(200);
      expect(response.body.approvalStatus).toBe('rechazado');

      const checkDb = await Product.findByPk(pendingProduct.id);
      expect(checkDb.approvalStatus).toBe('rechazado');
    });

    it('debe denegar la validación si el usuario no es administrador', async () => {
      const response = await request(app)
        .put(`/api/products/${pendingProduct.id}/validate`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          approvalStatus: 'aprobado',
        });

      expect(response.status).toBe(403);
    });

    it('no debe incluir productos "pendientes" o "rechazados" en la lista de catálogo público para Demandantes', async () => {
      // Deberíamos ver sólo 1 producto aprobado ('Mochila Impermeable') y no el pendiente ('Reloj Inteligente')
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(sampleProduct.id);
    });
  });
});
