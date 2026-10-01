import Joi from 'joi';

const objectId = Joi.string().hex().length(24).messages({
    'string.hex': 'El id debe ser un ObjectId válido',
    'string.length': 'El id debe tener 24 caracteres',
    'any.required': 'El id es obligatorio',

});

export const crearCategoriaSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'El nombre de la categoría no puede estar vacío',
        'string.min': 'El nombre de la categoría debe tener al menos 2 caracteres',
        'string.max': 'El nombre de la categoría no puede tener más de 50 caracteres',
        'any.required': 'El nombre de la categoría es obligatorio',
    })
});

export const modificarCategoriaSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(50).messages({
        'string.empty': 'El nombre de la categoría no puede estar vacío',
        'string.min': 'El nombre de la categoría debe tener al menos 2 caracteres',
        'string.max': 'El nombre de la categoría no puede tener más de 50 caracteres',
    })
}).min(1).messages({
    'object.min': 'Debe enviar al menos un campo para modificar',

});

export const categoriaIdParamSchema = Joi.object({
    id: objectId.required(),
});