/*
  Database initialization script for CozaStore application.
  Run with: mysql -u root -p < init_db.sql
*/

DROP DATABASE IF EXISTS cozastore;
CREATE DATABASE cozastore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cozastore;

-- Users table (stores buyers, sellers, admins)
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','seller','buyer') NOT NULL DEFAULT 'buyer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products table
CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  seller_id INT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seller reviews (buyer reviews a seller)
CREATE TABLE seller_reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id INT UNSIGNED NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Messages (chat between users about a product)
CREATE TABLE messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed admin user (you can change the password after login)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@cozastore.com', 'admin123', 'admin');

-- Seed sellers (Lucía and Pedro) – passwords are plain for demo; replace with hashed values in production
INSERT INTO users (name, email, password, role) VALUES
  ('Lucía', 'lucia@casastore.com', 'password123', 'seller'),
  ('Pedro', 'pedro@casastore.com', 'password123', 'seller');

-- Example products for each seller (you can add more later via the app)
INSERT INTO products (name, description, price, image_url, seller_id) VALUES
  ('Camiseta Vintage', 'Camiseta de algodón 100% con diseño retro', 19.99, NULL, (SELECT id FROM users WHERE email='lucia@casastore.com')),
  ('Mochila de Cuero', 'Mochila de cuero auténtico, estilo urbano', 79.50, NULL, (SELECT id FROM users WHERE email='pedro@casastore.com'));
