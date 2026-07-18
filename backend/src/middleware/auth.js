// Cambiamos 'require' por 'import' (Sintaxis ESM)
import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
  // 1. Buscamos el token en la cabecera de la petición
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

  try {
    // 2. Extraemos el token (viene con el prefijo "Bearer ")
    const token = authHeader.replace('Bearer ', '');
    
    // 3. Verificamos que sea un token firmado por nuestro sistema
    // Usamos el secreto de respaldo en caso de que falte el .env
    const secreto = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    const verificado = jwt.verify(token, secreto);
    
    // 4. Guardamos los datos del usuario en la request para la siguiente función (obtenerPerfil)
    req.user = verificado;
    next();
  } catch (error) {
    // Si el token no es válido o expiró (Cierre de sesión silencioso que React detecta)
    res.status(401).json({ error: 'Token no válido o expirado.' });
  }
};

// Cambiamos 'module.exports' por 'export default' (Sintaxis ESM)
export default verificarToken;