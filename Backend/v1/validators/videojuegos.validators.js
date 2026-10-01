import Joi from 'joi';

const objectId = Joi.string().hex().length(24);
const page = Joi.number().integer().min(1).default(1).messages({
  'number.base': 'La página debe ser numérica',
  'number.integer': 'La página debe ser un número entero',
  'number.min': 'La página debe ser mayor o igual a 1',
});
const nombreBusqueda = Joi.string().trim().min(1).required().messages({
  'string.empty': 'El nombre de búsqueda no puede estar vacío',
  'any.required': 'El nombre de búsqueda es obligatorio',
});

export const videojuegosPaginationQuerySchema = Joi.object({ page });

export const videojuegoDatabaseSearchQuerySchema = Joi.object({
  nombre: nombreBusqueda,
  page,
});

export const videojuegoExternalSearchQuerySchema = Joi.object({
  nombre: nombreBusqueda,
});

export const videojuegoCreateSchema = Joi.object({
  nombre: Joi.string().trim().min(1).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'any.required': 'El nombre es obligatorio',
  }),
  precio: Joi.number().required().min(0).messages({
    'number.base': 'El precio debe ser numérico',
    'number.min': 'El precio debe ser mayor o igual a 0',
    'any.required': 'El precio es obligatorio',
  }),
  categoria: objectId.required().messages({
    'string.hex': 'La categoría debe ser un ObjectId válido',
    'string.length': 'El id de categoría debe tener 24 caracteres',
    'any.required': 'Debe seleccionar una categoría existente',
  }),
});

export const videojuegoSchema = videojuegoCreateSchema;

export const videojuegoUpdateSchema = Joi.object({
  nombre: Joi.string().trim().min(1).messages({
    'string.empty': 'El nombre no puede estar vacío',
  }),
  descripcion: Joi.string().trim().min(1).messages({
    'string.empty': 'La descripción no puede estar vacía',
  }),
  precio: Joi.number().min(0).messages({
    'number.base': 'El precio debe ser numérico',
    'number.min': 'El precio debe ser mayor o igual a 0',
  }),
  puntajeMetacritic: Joi.number().min(0).max(100).messages({
    'number.base': 'El puntaje Metacritic debe ser numérico',
    'number.min': 'El puntaje Metacritic debe estar entre 0 y 100',
    'number.max': 'El puntaje Metacritic debe estar entre 0 y 100',
  }),
  imagen: Joi.string().uri().allow('').optional(),
  categoria: objectId.messages({
    'string.hex': 'La categoría debe ser un ObjectId válido',
    'string.length': 'El id de categoría debe tener 24 caracteres',
  }),
}).min(1);

export const videojuegoUpdateBodySchema = videojuegoUpdateSchema.keys({
  id: objectId.required().messages({
    'string.empty': 'El id es obligatorio',
    'string.hex': 'El id debe ser un ObjectId válido',
    'string.length': 'El id debe tener 24 caracteres',
    'any.required': 'El id es obligatorio',
  }),
});

export const videojuegoIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const videojuegoPurchaseSchema = Joi.object({
  metodoPago: Joi.string().valid('dinero', 'puntos').required().messages({
    'any.only': 'El método de pago debe ser dinero o puntos',
    'any.required': 'Debe indicar el método de pago',
  }),
});
