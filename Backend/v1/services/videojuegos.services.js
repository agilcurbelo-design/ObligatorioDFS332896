import cloudinary from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.util.js';

import axios from 'axios';
import Videojuego from '../models/videojuegos.models.js';
import Categoria from '../models/categorias.models.js';
import Usuario from '../models/usuarios.models.js';

const BASE_URL = process.env.RAWG_BASE_URL || 'https://api.rawg.io/api';
const VIDEOJUEGOS_POR_PAGINA = 10;

const construirError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const obtenerVideojuegosPaginados = async (filtro, page) => {
  const [videojuegos, total] = await Promise.all([
    Videojuego.find(filtro)
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 })
      .skip((page - 1) * VIDEOJUEGOS_POR_PAGINA)
      .limit(VIDEOJUEGOS_POR_PAGINA),
    Videojuego.countDocuments(filtro),
  ]);

  return {
    videojuegos,
    pagination: {
      page,
      limit: VIDEOJUEGOS_POR_PAGINA,
      total,
      totalPages: Math.ceil(total / VIDEOJUEGOS_POR_PAGINA),
    },
  };
};

export const obtenerVideojuegos = async (page = 1) => {
  try {
    return await obtenerVideojuegosPaginados({}, page);
  } catch (error) {
    throw construirError('No se pudieron obtener los videojuegos', 500);
  }
};

export const obtenerVideojuegoPorId = async (id) => {
  try {
    const videojuego = await Videojuego.findById(id).populate('categoria', 'nombre');
    if (!videojuego) {
      throw construirError('Videojuego no encontrado', 404);
    }
    return videojuego;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw construirError('No se pudo obtener el videojuego', 500);
  }
};

export const crearVideojuego = async (data) => {
  try {
    const categoria = await Categoria.findById(data.categoria);
    if (!categoria) {
      throw construirError('La categoría seleccionada no existe', 404);
    }
    const datosExternos = await obtenerDatosVideojuegoExterno(data.nombre);
    const imagenCloudinary = await subirImagenDesdeRAWG(datosExternos.imagen);

    const videojuego = new Videojuego({
      nombre: datosExternos.nombre,
      descripcion: datosExternos.descripcion,
      precio: data.precio,
      categoria: categoria._id,
      puntajeMetacritic: datosExternos.puntajeMetacritic,
      imagen: imagenCloudinary,
    });
    await videojuego.save();
    return videojuego;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw construirError('No se pudo crear el videojuego', 500);
  }
};

export const actualizarVideojuego = async (id, data) => {
  try {
    const videojuegoExistente = await Videojuego.findById(id);
    if (!videojuegoExistente) {
      throw construirError('Videojuego no encontrado', 404);
    }

    if (data.categoria && !(await Categoria.exists({ _id: data.categoria }))) {
      throw construirError('La categoría seleccionada no existe', 404);
    }

    const videojuegoActualizado = await Videojuego.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return videojuegoActualizado;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw construirError('No se pudo actualizar el videojuego', 500);
  }
};

export const eliminarVideojuego = async (id) => {
  try {
    const videojuego = await Videojuego.findById(id);
    if (!videojuego) {
      throw construirError('Videojuego no encontrado', 404);
    }

    await Videojuego.findByIdAndDelete(id);
    return { message: 'Videojuego eliminado correctamente' };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw construirError('No se pudo eliminar el videojuego', 500);
  }
};

export const buscarVideojuegosExternos = async (nombre) => {
  if (!nombre || !nombre.trim()) {
    throw construirError('Debe indicar un nombre para buscar', 400);
  }

  try {
    const apiKey = process.env.RAWG_API_KEY;
    const response = await axios.get(`${BASE_URL}/games`, {
      params: {
        search: nombre.trim(),
        key: apiKey,
        page_size: 10,
      },
    });

    const resultados = (response.data?.results || []).map(mapearVideojuegoExterno);

    return { resultados };
  } catch (error) {
    throw construirError('No se pudo consultar la API externa de videojuegos', 500);
  }
};

export const buscarVideojuegosEnBaseDatos = async (nombre, page = 1) => {
  if (!nombre || !nombre.trim()) {
    throw construirError('Debe indicar un nombre para buscar', 400);
  }

  try {
    return await obtenerVideojuegosPaginados(
      { nombre: { $regex: nombre.trim(), $options: 'i' } },
      page
    );
  } catch (error) {
    throw construirError('No se pudieron buscar los videojuegos en la base de datos', 500);
  }
};

export const comprarVideojuego = async (usuarioId, videojuegoId, metodoPago) => {
  try {
    const [usuario, videojuego] = await Promise.all([
      Usuario.findById(usuarioId),
      Videojuego.findById(videojuegoId),
    ]);

    if (!usuario) {
      throw construirError('Usuario no encontrado', 404);
    }
    if (!videojuego) {
      throw construirError('Videojuego no encontrado', 404);
    }
    if (usuario.plan === 'plus' && usuario.compras.length > 4) {
      throw construirError('Usted ya tiene mas de 10 compras  realizadas, para hacer compras ilimitadas cambiece al plan Premium', 403);
    }
    if (usuario.compras.some((compra) => compra.videojuego.equals(videojuego._id))) {
      throw construirError('El videojuego ya fue comprado por este usuario', 409);
    }

    const precio = videojuego.precio;
    const puntosGanados = metodoPago === 'dinero' && usuario.plan === 'premium'
      ? Math.round(precio * 10)
      : 0;
    const puntosGastados = metodoPago === 'puntos' ? Math.round(precio * 100) : 0;

    if (metodoPago === 'puntos' && usuario.plan !== 'premium') {
      throw construirError('El pago con puntos está disponible solo para usuarios premium', 403);
    }
    if (metodoPago === 'puntos' && usuario.puntos < puntosGastados) {
      throw construirError('No tienes puntos suficientes para esta compra', 400);
    }

    const compra = { videojuego: videojuego._id, precio, metodoPago, puntosGanados, puntosGastados };
    const condiciones = {
      _id: usuario._id,
      plan: usuario.plan,
      'compras.videojuego': { $ne: videojuego._id },
    };
    if (metodoPago === 'puntos') {
      condiciones.puntos = { $gte: puntosGastados };
    }

    const usuarioActualizado = await Usuario.findOneAndUpdate(
      condiciones,
      {
        $inc: { puntos: metodoPago === 'puntos' ? -puntosGastados : puntosGanados },
        $push: { compras: compra },
      },
      { new: true, runValidators: true }
    );

    if (!usuarioActualizado) {
      throw construirError('La compra no se pudo completar; revisa tu saldo e inténtalo de nuevo', 409);
    }

    return {
      videojuego,
      compra: usuarioActualizado.compras.at(-1),
      puntos: usuarioActualizado.puntos,
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw construirError('No se pudo completar la compra', 500);
  }
};

export const obtenerVideojuegosDisponiblesPorPuntos = async (puntos) => {
  try {
    const precioMaximo = puntos / 100;

    const videojuegos = await Videojuego.find({
      precio: { $lte: precioMaximo }
    }).populate('categoria', 'nombre');

    return videojuegos;
  } catch (error) {
    throw construirError('No se pudieron obtener los videojuegos disponibles por puntos', 500);
  }
};

const mapearVideojuegoExterno = (juego) => ({
  id: juego.id,
  nombre: juego.name || 'Sin nombre',
  descripcion: juego.description_raw || juego.description || 'Sin descripción disponible',
  imagen: juego.background_image || '',
  puntajeMetacritic: juego.metacritic ?? null,
});

//CLOUDINARY

const subirImagenDesdeRAWG = async (urlImagen) => {
  if (!urlImagen) {
    return '';
  }

  const response = await axios.get(urlImagen, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(response.data);

  const resultado = await uploadBufferToCloudinary(
    cloudinary,
    buffer,
    {
      resource_type: 'image',
      folder: 'videojuegos',
    }
  );

  return resultado.secure_url;
};

const obtenerDatosVideojuegoExterno = async (nombre) => {
  const resultados = await buscarVideojuegosExternos(nombre);
  const juego = resultados.resultados[0];

  if (!juego) {
    throw construirError('No se encontró el videojuego en la API externa', 404);
  }

  try {
    const response = await axios.get(`${BASE_URL}/games/${juego.id}`, {
      params: { key: process.env.RAWG_API_KEY },
    });

    return {
      ...juego,
      ...mapearVideojuegoExterno(response.data),
    };
  } catch (error) {
    return juego;
  }
};
