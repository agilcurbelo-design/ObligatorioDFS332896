import Joi from 'joi';

const objectId = Joi.string().hex().length(24).messages({
    'string.hex': 'El id debe ser un ObjectId válido',
    'string.length': 'El id debe tener 24 caracteres',
    'any.required': 'El id es obligatorio',
});

export const modificarUsuarioSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).messages({
        'string.empty': 'El nombre de usuario no puede estar vacío',
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'string.max': 'El nombre de usuario no puede tener más de 30 caracteres',
    })}).min(1).messages({
    'object.min': 'Debe enviar al menos un campo para modificar',
});

export const cambiarPlanSchema = Joi.object({
    plan: Joi.string().valid('premium').required().messages({
        'any.only': 'El plan debe ser premium',
        'any.required': 'El plan es obligatorio',
    })
});

export const usuarioIdParamSchema = Joi.object({
    id: objectId.required(),
});