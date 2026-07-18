import express from 'express';
import cors from 'cors';

// Importamos el archivo de rutas que ya configuraste en la carpeta 'routes'
import authRoutes from './routes/authRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares globales
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 2. Conexión del Enrutador (Arquitectura Limpia)
// Le decimos que cualquier petición que empiece con '/api/auth' 
// debe ser manejada por tu archivo authRoutes.js
app.use('/api/auth', authRoutes);

// 3. Encender el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo con Arquitectura Limpia en http://localhost:${PORT}`);
});