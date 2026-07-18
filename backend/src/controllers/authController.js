import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// ==========================================
// REGISTRO DE NUEVOS INGENIEROS
// ==========================================
export const registrarUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este correo institucional ya está registrado.' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Guardar el nuevo usuario en PostgreSQL
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: email,
        passwordHash: passwordHash
      }
    });

    res.status(201).json({ mensaje: 'Ingeniero registrado exitosamente en el Playbook.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ==========================================
// INICIO DE SESIÓN (LOGIN)
// ==========================================
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario por su correo
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Credenciales inválidas.' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Crear el Token de Seguridad (JWT) válido por 2 horas
    // ¡AQUÍ AGREGAMOS EL MISMO SECRETO DE RESPALDO QUE EN AUTH.JS!
    const secreto = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol }, 
      secreto, 
      { expiresIn: '2h' }
    );

    res.json({ 
      mensaje: 'Autenticación exitosa', 
      token: token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ==========================================
// OBTENER PERFIL (RUTA PROTEGIDA)
// ==========================================
export const obtenerPerfil = async (req, res) => {
  try {
    // req.user viene del middleware auth.js
    const userId = req.user.id || req.user.userId;

    // Buscamos en PostgreSQL con Prisma
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor al obtener el perfil' });
  }
};

// ==========================================
// INICIALIZAR DATOS ÉTICOS (POBLAR BD)
// ==========================================
export const inicializarDatosEticos = async (req, res) => {
  try {
    // 1. Obtenemos el ID del usuario del token
    const userId = req.user.id || req.user.userId;

    // 2. Definimos los Módulos Éticos Profesionales (ACM/IEEE)
    const modulosDatos = [
      {
        identificador: "fundamentos",
        titulo: "Fundamentos Éticos",
        descripcion: "Análisis del Código de Ética ACM/IEEE y principios de Green IT.",
        icono: "school",
        totalClases: 16
      },
      {
        identificador: "casos",
        titulo: "Casos Prácticos",
        descripcion: "Resolución de dilemas morales reales en el desarrollo de software.",
        icono: "cases",
        totalClases: 12
      }
    ];

    // 3. Poblamos las tablas usando Prisma en una Transacción
    await prisma.$transaction(async (tx) => {
      for (const mod of modulosDatos) {
        // a. Creamos el Módulo si no existe (upsert)
        const moduloCreado = await tx.modulo.upsert({
          where: { identificador: mod.identificador },
          update: mod, // Actualiza si ya existe
          create: mod  // Crea si no existe
        });

        // b. Inicializamos el progreso del usuario para este módulo
        // Usamos upsert para no duplicar si el usuario ya tiene progreso
        await tx.progresoModulo.upsert({
          where: {
            usuarioId_moduloId: {
              usuarioId: userId,
              moduloId: moduloCreado.id
            }
          },
          update: {}, // No actualiza nada si ya existe
          create: {
            usuarioId: userId,
            moduloId: moduloCreado.id,
            estado: moduloCreado.identificador === "fundamentos" ? "EN_CURSO" : "BLOQUEADO",
            // Simulamos el 25% de progreso (4 clases de 16) para 'fundamentos'
            clasesCompletadas: moduloCreado.identificador === "fundamentos" ? 4 : 0
          }
        });
      }

      // c. Poblamos la tabla de Auditorías (Security Audit Hub)
      const auditoriasDatos = [
        { tituloControl: "Privacidad por diseño", hashValidacion: "48e9...2a11", riskScore: "Low" },
        { tituloControl: "Threat modeling", hashValidacion: "9fbc...e41d", riskScore: "Neutral" },
        { tituloControl: "Data Lineage Audit", hashValidacion: "b201...7f82", riskScore: "Pending" }
      ];

      for (const aud of auditoriasDatos) {
        // Creamos la auditoría relacional para el usuario
        await tx.auditoria.create({
          data: {
            ...aud,
            usuarioId: userId
          }
        });
      }
    });

    res.json({ mensaje: "Base de datos poblada exitosamente con el Playbook Ético Profesional." });

  } catch (error) {
    console.error("Error al poblar base de datos:", error);
    res.status(500).json({ error: "Error interno al inicializar datos éticos." });
  }
};

// ==========================================
// ACTUALIZAR PROGRESO DEL MÓDULO
// ==========================================
export const completarModulo = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { identificadorModulo } = req.body; // Recibimos qué módulo se terminó

    // 1. Buscamos el ID interno del módulo en la BD
    const modulo = await prisma.modulo.findUnique({ 
      where: { identificador: identificadorModulo } 
    });

    if (!modulo) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }

    // 2. Actualizamos el registro en la tabla intermedia ProgresoModulo
    const progresoActualizado = await prisma.progresoModulo.update({
      where: {
        usuarioId_moduloId: {
          usuarioId: userId,
          moduloId: modulo.id
        }
      },
      data: {
        clasesCompletadas: modulo.totalClases, // Sube al 100%
        estado: "COMPLETADO"
      }
    });

    res.json({ 
      mensaje: "Módulo completado al 100% exitosamente", 
      progreso: progresoActualizado 
    });

  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    res.status(500).json({ error: "Error interno al guardar el progreso." });
  }
};