import {
    obtenerUsuariosService,
    obtenerUsuarioService,
    modificarUsuarioService,
    cambiarPlanService,
    obtenerPuntosUsuarioService,
    recomendarVideojuegoService
} from '../services/usuarios.services.js';

export const obtenerUsuarios = async (req, res) => {
    const usuarios = await obtenerUsuariosService();

    res.status(200).json(usuarios);
};

export const obtenerUsuario = async (req, res) => {
    const { id } = req.validatedParams;
    const usuario = await obtenerUsuarioService(id);

    res.status(200).json(usuario);
};

export const modificarUsuario = async (req, res) => {
    const { id } = req.validatedParams;
    const datos = req.validatedBody;
    const usuario = await modificarUsuarioService(id, datos);

    res.status(200).json(usuario);
};

export const cambiarPlan = async (req, res) => {
    const { id } = req.validatedParams;
    const usuario = await cambiarPlanService(id);

    res.status(200).json(usuario);
};

export const obtenerPuntosUsuarioController = async (req, res, next) => {
    try {
        const puntos = await obtenerPuntosUsuarioService(req.params.id);

        res.status(200).json({
            puntos
        });
    } catch (error) {
        next(error);
    }
};

export const recomendarVideojuegoController = async (req, res, next) => {
    try {
        const resultado = await recomendarVideojuegoService(req.params.id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};