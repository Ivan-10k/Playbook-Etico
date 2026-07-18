import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// 3. Encender el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo con Arquitectura Limpia en http://localhost:${PORT}`);
});