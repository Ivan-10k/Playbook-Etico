import express from 'express';
import verificarToken from '../middleware/auth.js';

// Importamos TODAS las funciones del controlador en una sola línea
import { 
  registrarUsuario, 
  loginUsuario, 
  obtenerPerfil, 
  inicializarDatosEticos, 
  completarModulo 
} from '../controllers/authController.js';

const router = express.Router();

// ==========================================
// RUTAS PÚBLICAS
// ==========================================
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// ==========================================
// RUTAS PROTEGIDAS (Requieren Token JWT)
// ==========================================
router.get('/me', verificarToken, obtenerPerfil);
router.post('/init', verificarToken, inicializarDatosEticos);

// NUEVA RUTA: Simulador de Decisiones
router.post('/completar-modulo', verificarToken, completarModulo);

export default router;