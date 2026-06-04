# CASA STORE (COZASTORE) - Plataforma de Marketplace

Este proyecto es una plataforma de Marketplace (Casa Store / Cozastore) que permite conectar a compradores y vendedores. Cuenta con un sistema completo de roles, gestión de productos, mensajería y perfiles de usuario.

## 🌐 Demo en Vivo (Despliegue)

La aplicación está actualmente desplegada y corriendo en producción a través de **Render**. 
Puedes probar el funcionamiento de la plataforma ingresando al siguiente enlace:

👉 **[https://cozastore-frontend.onrender.com](https://cozastore-frontend.onrender.com)**


## 🚀 Tecnologías Utilizadas

**Backend:**
- **Node.js & Express**: Servidor REST API.
- **Sequelize ORM**: Gestión de la base de datos (Soporta PostgreSQL para producción y SQLite para desarrollo/testing).
- **JWT (JSON Web Tokens)**: Autenticación y autorización segura.
- **Multer**: Subida y manejo de imágenes.
- **Bcryptjs**: Encriptación de contraseñas.

**Frontend:**
- **React & Vite**: Construcción de la interfaz de usuario moderna y rápida.
- **React Router DOM**: Manejo de rutas y navegación protegida (SPA).
- **Axios**: Cliente HTTP para peticiones al backend.
- **CSS Responsivo**: Diseño adaptativo a múltiples dispositivos (Mobile-First).

## ⚙️ Funcionalidades Principales

El sistema posee una arquitectura basada en **roles de usuario**, cada uno con diferentes permisos y vistas:

### 1. Sistema de Autenticación y Perfiles
- Registro e inicio de sesión seguro (contraseñas encriptadas).
- Sesiones manejadas a través de JWT (persistencia en `localStorage`).
- Redirección automática según el rol del usuario al iniciar sesión.
- Gestión de Perfil: Edición de datos personales (nombre, email).

### 2. Compradores (Buyers)
- Exploración de productos disponibles en la plataforma (`/products`).
- Capacidad de contactar a los vendedores a través del sistema de chat.
- Calificación y reseñas de vendedores.

### 3. Vendedores (Sellers)
- **Dashboard de Vendedor**: Panel de control para gestionar su actividad (`/seller`).
- **Publicación de Productos**: Creación de nuevos productos con imágenes, descripción, categoría y precio (`/publish`).
- Recepción de mensajes de compradores interesados.

### 4. Administradores (Admins)
- **Dashboard de Administrador**: Acceso a la gestión global de la plataforma (`/admin`).
- Moderación de usuarios y revisión de métricas o productos.

### 5. Chat Integrado
- Sistema de mensajería para la comunicación directa entre compradores y vendedores (`/chat`).
- Lista de conversaciones activas e historial de mensajes.

## 🛠 Instalación y Configuración Local

### Requisitos Previos
- Node.js instalado.
- PostgreSQL (opcional para producción, por defecto usa SQLite para desarrollo si así se configura).

### 1. Configurar el Backend

```bash
cd backend
npm install
```

Configurar las variables de entorno: Crear un archivo `.env` en la carpeta `backend` con los puertos, la clave secreta para JWT (`JWT_SECRET`) y las credenciales de la base de datos.

Iniciar el servidor:
```bash
npm run dev
```
El servidor backend correrá en `http://localhost:5000`.

### 2. Configurar el Frontend

```bash
cd frontend
npm install
```

Iniciar la aplicación React:
```bash
npm run dev
```
La aplicación correrá en `http://localhost:3000` o `http://localhost:5173` dependiendo de la configuración de Vite.

## 📱 Diseño y UI/UX
- Interfaz moderna, limpia y altamente intuitiva.
- **Completamente Responsivo**: Vistas adaptadas para funcionar sin problemas en teléfonos móviles, tablets y pantallas de escritorio.
- Sistema de ruteo eficiente preparado para despliegues como Single Page Application (SPA) previniendo errores de navegación.
