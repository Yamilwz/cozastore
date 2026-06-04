// Obtiene la URL de la API desde las variables de entorno de Render
// Si no está definida y estamos en desarrollo, usa el proxy local '/api'
// Si no está definida y estamos en producción, usa un valor de respaldo por defecto
const isDev = import.meta.env.MODE === 'development';
const API_BASE = import.meta.env.VITE_API_URL || (isDev ? '/api' : 'https://cozastore-backend.onrender.com/api');

export default API_BASE;
