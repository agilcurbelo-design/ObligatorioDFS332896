import express from 'express';

import {
    obtenerUsuarios,
    obtenerUsuario,
    modificarUsuario,
    cambiarPlan,
    obtenerPuntosUsuarioController,
    recomendarVideojuegoController
}
from '../controllers/usuarios.controller.js';

import { authenticateMiddleware, requireAdminMiddleware, requireSelfOrAdminMiddleware } from '../middlewares/auth.middlewares.js';
import { validateBodyMiddleware } from '../middlewares/validateBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validateParams.middleware.js';
import { modificarUsuarioSchema,cambiarPlanSchema,usuarioIdParamSchema} 
from '../validators/usuarios.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/obtenerUsuarios',authenticateMiddleware,requireAdminMiddleware,obtenerUsuarios);

router.get('/obtenerUsuario/:id',authenticateMiddleware,
    validateParamsMiddleware(usuarioIdParamSchema),requireSelfOrAdminMiddleware,obtenerUsuario
);

router.get('/obtenerPuntos/:id', authenticateMiddleware,
    validateParamsMiddleware(usuarioIdParamSchema),
    requireSelfOrAdminMiddleware,
    obtenerPuntosUsuarioController
);

router.get('/recomendarVideojuego/:id', authenticateMiddleware,
    validateParamsMiddleware(usuarioIdParamSchema),
    requireSelfOrAdminMiddleware,
    recomendarVideojuegoController
);

router.put('/modificarUsuario/:id',authenticateMiddleware,validateParamsMiddleware(usuarioIdParamSchema),requireSelfOrAdminMiddleware,
    validateBodyMiddleware(modificarUsuarioSchema),modificarUsuario
);

router.put('/cambiarPlan/:id/plan',authenticateMiddleware,
    validateParamsMiddleware(usuarioIdParamSchema),
    requireSelfOrAdminMiddleware,
    validateBodyMiddleware(cambiarPlanSchema),cambiarPlan
);

export default router;