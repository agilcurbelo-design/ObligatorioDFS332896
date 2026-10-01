import express from 'express';

import {obtenerCategorias,obtenerCategoria,
    crearCategoria,modificarCategoria,eliminarCategoria} 
from '../controllers/categorias.controller.js';

import { authenticateMiddleware, requireAdminMiddleware } from '../middlewares/auth.middlewares.js';
import { validateBodyMiddleware } from '../middlewares/validateBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validateParams.middleware.js';

import {crearCategoriaSchema,modificarCategoriaSchema,categoriaIdParamSchema} 
from '../validators/categorias.validators.js';

const router = express.Router();

router.get('/obtenerCategorias',authenticateMiddleware,obtenerCategorias);

router.post('/crearCategoria',authenticateMiddleware,requireAdminMiddleware,
    validateBodyMiddleware(crearCategoriaSchema),crearCategoria
);

router.get('/obtenerCategoria/:id',authenticateMiddleware, 
    validateParamsMiddleware(categoriaIdParamSchema),obtenerCategoria
);

router.put('/modificarCategoria/:id',authenticateMiddleware,requireAdminMiddleware,validateParamsMiddleware(categoriaIdParamSchema),
    validateBodyMiddleware(modificarCategoriaSchema),modificarCategoria
);

router.delete('/eliminarCategoria/:id',authenticateMiddleware,requireAdminMiddleware,
    validateParamsMiddleware(categoriaIdParamSchema),eliminarCategoria
);

export default router;