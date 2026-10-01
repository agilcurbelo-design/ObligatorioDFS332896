import {
  obtenerVideojuegos,
  obtenerVideojuegoPorId,
  crearVideojuego,
  actualizarVideojuego,
  eliminarVideojuego,
  buscarVideojuegosExternos,
  buscarVideojuegosEnBaseDatos,
  comprarVideojuego,
} from '../services/videojuegos.services.js';

export const listarVideojuegos = async (req, res) => {
  try {
    const videojuegos = await obtenerVideojuegos(req.validatedQuery.page);
    return res.status(200).json(videojuegos);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const obtenerVideojuego = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const videojuego = await obtenerVideojuegoPorId(id);
    return res.status(200).json(videojuego);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const buscarVideojuegoExterno = async (req, res) => {
  try {
    const { nombre } = req.validatedQuery;
    const resultados = await buscarVideojuegosExternos(nombre);
    return res.status(200).json(resultados);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const buscarVideojuegoEnBaseDatos = async (req, res) => {
  try {
    const { nombre, page } = req.validatedQuery;
    const videojuegos = await buscarVideojuegosEnBaseDatos(nombre, page);
    return res.status(200).json(videojuegos);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const crearVideojuegoController = async (req, res) => {
  try {
    const videojuego = await crearVideojuego(req.validatedBody);
    return res.status(201).json({
      message: 'Videojuego creado correctamente',
      videojuego,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const actualizarVideojuegoController = async (req, res) => {
  try {
    const datosValidados = req.validatedBody;
    const { id: idDelBody, ...datos } = datosValidados;
    const id = idDelBody || req.validatedParams.id;
    const videojuegoActualizado = await actualizarVideojuego(id, datos);
    return res.status(200).json({
      message: 'Videojuego actualizado correctamente',
      videojuego: videojuegoActualizado,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const comprarVideojuegoController = async (req, res) => {
  try {
    const resultado = await comprarVideojuego(
      req.decoded.sub,
      req.validatedParams.id,
      req.validatedBody.metodoPago
    );
    return res.status(201).json({ message: 'Compra registrada correctamente', ...resultado });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const eliminarVideojuegoController = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const respuesta = await eliminarVideojuego(id);
    return res.status(200).json(respuesta);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
};
