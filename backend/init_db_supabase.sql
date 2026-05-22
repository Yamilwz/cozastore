/*
  PostgreSQL initialization script for CozaStore application.
  Compatible with Supabase SQL Editor.
  
  NOTE: Sequelize will create these tables automatically via sync({ alter: true }).
  This script is only needed if you want to pre-create tables manually.
*/

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS "Messages" CASCADE;
DROP TABLE IF EXISTS "SellerReviews" CASCADE;
DROP TABLE IF EXISTS "Products" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Drop enum types if they exist
DROP TYPE IF EXISTS "enum_Users_role" CASCADE;
DROP TYPE IF EXISTS "enum_Products_status" CASCADE;
DROP TYPE IF EXISTS "enum_Products_approvalStatus" CASCADE;

-- Create enum types
CREATE TYPE "enum_Users_role" AS ENUM ('admin', 'vendedor', 'comprador');
CREATE TYPE "enum_Products_status" AS ENUM ('nuevo', 'usado');
CREATE TYPE "enum_Products_approvalStatus" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- Users table
CREATE TABLE "Users" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role "enum_Users_role" NOT NULL DEFAULT 'comprador',
  "avatarUrl" VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
  bio TEXT,
  location VARCHAR(255) DEFAULT 'No especificada',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE "Products" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  category VARCHAR(255),
  "imageUrl" VARCHAR(255),
  images TEXT,
  stock INTEGER DEFAULT 1,
  "sellerId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  status "enum_Products_status" DEFAULT 'nuevo',
  "approvalStatus" "enum_Products_approvalStatus" NOT NULL DEFAULT 'pendiente',
  location VARCHAR(255) DEFAULT 'No especificada',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- SellerReviews table
CREATE TABLE "SellerReviews" (
  id SERIAL PRIMARY KEY,
  "sellerId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "buyerId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE "Messages" (
  id SERIAL PRIMARY KEY,
  "senderId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "receiverId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "productId" INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_seller ON "Products"("sellerId");
CREATE INDEX idx_products_approval ON "Products"("approvalStatus");
CREATE INDEX idx_reviews_seller ON "SellerReviews"("sellerId");
CREATE INDEX idx_messages_sender ON "Messages"("senderId");
CREATE INDEX idx_messages_receiver ON "Messages"("receiverId");
