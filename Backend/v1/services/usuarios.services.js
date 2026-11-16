import Usuario from "../models/usuarios.models.js";
import { obtenerVideojuegosDisponiblesPorPuntos } from "./videojuegos.services.js";
import { generarRecomendacionGroq } from "./groq.services.js";

export const obtenerUsuariosService = async () => {
    const usuarios = await Usuario.find().select('-password');
    return usuarios;
};

export const obtenerUsuarioService = async (id) => {
    const usuario = await Usuario.findById(id)
        .select('-password')
        .populate({
            path: 'compras.videojuego',
            select: 'nombre imagen precio categoria',
            populate: { path: 'categoria', select: 'nombre' }
        });
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
const construirError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

// Elimina (devuelve) una compra del usuario y revierte los puntos que generó
export const eliminarCompraService = async (id, videojuegoId) => {
    const usuario = await Usuario.findById(id).select('puntos compras');
    if (!usuario) {
        throw construirError("Usuario no encontrado", 404);
    }

    const compra = usuario.compras.find((item) => item.videojuego.equals(videojuegoId));
    if (!compra) {
        throw construirError("La compra no existe", 404);
    }

    // Si pagó con puntos se le devuelven; si ganó puntos con la compra se le descuentan
    const puntos = Math.max(0, usuario.puntos + compra.puntosGastados - compra.puntosGanados);

    await Usuario.updateOne(
        { _id: id },
        { $pull: { compras: { videojuego: videojuegoId } }, $set: { puntos } }
    );

    return { videojuegoId, puntos };
};

// Modifica los datos editables de una compra (estado y nota)
export const modificarCompraService = async (id, videojuegoId, datos) => {
    const cambios = {};
    if (datos.estado !== undefined) cambios['compras.$.estado'] = datos.estado;
    if (datos.nota !== undefined) cambios['compras.$.nota'] = datos.nota;

    const usuario = await Usuario.findOneAndUpdate(
        { _id: id, 'compras.videojuego': videojuegoId },
        { $set: cambios },
        { returnDocument: "after", runValidators: true }
    )
        .select('compras')
        .populate({
            path: 'compras.videojuego',
            select: 'nombre imagen precio categoria',
            populate: { path: 'categoria', select: 'nombre' }
        });

    if (!usuario) {
        throw construirError("La compra no existe", 404);
    }

    return usuario.compras.find((item) => String(item.videojuego?._id || item.videojuego) === videojuegoId);
};
