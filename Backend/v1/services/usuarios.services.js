import Usuario from "../models/usuarios.models.js";
import { obtenerVideojuegosDisponiblesPorPuntos } from "./videojuegos.services.js";
import { generarRecomendacionGroq } from "./groq.services.js";

export const obtenerUsuariosService = async () => {
    const usuarios = await Usuario.find().select('-password');
    return usuarios;
};

export const obtenerUsuarioService = async (id) => {
    const usuario = await Usuario.findById(id).select('-password');
    return usuario;
};

export const modificarUsuarioService = async (id, datos) => {
    const usuario = await Usuario.findByIdAndUpdate(
        id,
        datos,
        { 
            returnDocument: "after",
            runValidators: true
        }
    ).select('-password');

    return usuario;
};

export const cambiarPlanService = async (id) => {
    const usuarioActualizado = await Usuario.findOneAndUpdate(
        { _id: id, plan: "plus" },
        { $set: { plan: "premium" } },
        { new: true, runValidators: true }
    ).select('-password');

    if (usuarioActualizado) {
        return usuarioActualizado;
    }

    const usuario = await Usuario.findById(id).select('plan');
    if (!usuario) {
        const error = new Error("Usuario no encontrado");
        error.status = 404;
        throw error;
    }

    if (usuario.plan === "premium") {
        const error = new Error("El usuario ya tiene el plan premium");
        error.status = 409;
        throw error;
    }

    const error = new Error("Solo los usuarios con plan plus pueden cambiar a premium");
    error.status = 403;
    throw error;
};

export const obtenerPuntosUsuarioService = async (id) => {
    const usuario = await Usuario.findById(id).select('puntos');

    if (!usuario) {
        const error = new Error("Usuario no encontrado");
        error.status = 404;
        throw error;
    }

    return usuario.puntos;
};

export const recomendarVideojuegoService = async (id) => {
    const usuario = await Usuario.findById(id).select('puntos');

    if (!usuario) {
        const error = new Error("Usuario no encontrado");
        error.status = 404;
        throw error;
    }

    const videojuegos = await obtenerVideojuegosDisponiblesPorPuntos(usuario.puntos);

    if (videojuegos.length === 0) {
        return {
            puntos: usuario.puntos,
            recomendacion: "No hay videojuegos disponibles para comprar con tus puntos."
        };
    }

    let recomendacion;

    try {
        recomendacion = await generarRecomendacionGroq(
            usuario.puntos,
            videojuegos
        );
    } catch (error) {
        recomendacion = `Te recomendamos ${videojuegos[0].nombre}, ya que puedes comprarlo con tus puntos.`;
    }

    return {
        puntos: usuario.puntos,
        recomendacion
    };
};