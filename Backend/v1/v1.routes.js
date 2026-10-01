import express from 'express';
import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import videojuegosRoutes from './routes/videojuegos.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/videojuegos', videojuegosRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
