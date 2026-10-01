import express from 'express';
import { authenticateMiddleware, requireAdminMiddleware } from '../middlewares/auth.middlewares.js';
import { validateBodyMiddleware } from '../middlewares/validateBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validateParams.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validateQuery.middleware.js';
import {
  listarVideojuegos,
  obtenerVideojuego,
  buscarVideojuegoExterno,
  buscarVideojuegoEnBaseDatos,
  crearVideojuegoController,
  actualizarVideojuegoController,
  eliminarVideojuegoController,
  comprarVideojuegoController,
} from '../controllers/videojuegos.controller.js';
import {
  videojuegoCreateSchema,
  videojuegoUpdateSchema,
  videojuegoUpdateBodySchema,
  videojuegoIdParamSchema,
  videojuegoPurchaseSchema,
  videojuegosPaginationQuerySchema,
  videojuegoDatabaseSearchQuerySchema,
  videojuegoExternalSearchQuerySchema,
} from '../validators/videojuegos.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/listarVideojuegos', validateQueryMiddleware(videojuegosPaginationQuerySchema), listarVideojuegos);
router.get('/buscar/externo', authenticateMiddleware, validateQueryMiddleware(videojuegoExternalSearchQuerySchema), buscarVideojuegoExterno);
router.get('/buscar/base-datos', validateQueryMiddleware(videojuegoDatabaseSearchQuerySchema), buscarVideojuegoEnBaseDatos);
router.post('/comprar/:id', authenticateMiddleware, validateParamsMiddleware(videojuegoIdParamSchema), validateBodyMiddleware(videojuegoPurchaseSchema), comprarVideojuegoController);
router.get('/obtenerVideojuego/:id', validateParamsMiddleware(videojuegoIdParamSchema), obtenerVideojuego);
router.post('/crearVideojuego', authenticateMiddleware, requireAdminMiddleware, validateBodyMiddleware(videojuegoCreateSchema), crearVideojuegoController);
router.put('/actualizarVideojuego/:id', authenticateMiddleware, requireAdminMiddleware, validateParamsMiddleware(videojuegoIdParamSchema), validateBodyMiddleware(videojuegoUpdateSchema), actualizarVideojuegoController);
router.delete('/eliminarVideojuego/:id', authenticateMiddleware, requireAdminMiddleware, validateParamsMiddleware(videojuegoIdParamSchema), eliminarVideojuegoController);

export default router;
