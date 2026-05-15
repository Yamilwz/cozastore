# COZASTORE - Gestión de Usuarios

Este proyecto es el primer entregable del Sprint 1 para la plataforma COZASTORE. Implementa un sistema completo de registro, inicio de sesión y gestión de perfil de usuario.

## Requisitos Previos

- Node.js instalado
- MongoDB instalado y corriendo (por defecto usa `mongodb://localhost:27017/cozastore`)

## Estructura del Monorepo

- `/backend`: Servidor Express con Mongoose y JWT.
- `/frontend`: Aplicación React construida con Vite.

## Instalación y Ejecución

### 1. Configurar el Backend

```bash
cd backend
pnpm install
# Asegúrate de configurar las variables en el archivo .env
pnpm run dev
```

El servidor correrá en `http://localhost:5000`.

### 2. Configurar el Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

La aplicación correrá en `http://localhost:3000`.

## Funcionalidades Implementadas

- **Registro de Usuarios:** Validación de campos, email único y encriptación de contraseña.
- **Autenticación:** Inicio de sesión con JWT persistido en `localStorage`.
- **Rutas Protegidas:** Acceso exclusivo al perfil para usuarios autenticados.
- **Gestión de Perfil:** Visualización de datos y edición de nombre/email con validación en tiempo real.
- **Diseño Premium:** Interfaz moderna, minimalista y responsiva.
