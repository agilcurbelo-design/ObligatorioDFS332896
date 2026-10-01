import {
    obtenerCategoriasService,
    obtenerCategoriaService,
    crearCategoriaService,
    modificarCategoriaService,
    eliminarCategoriaService
} from '../services/categorias.services.js';

export const obtenerCategorias = async (req, res) => {
    const categorias = await obtenerCategoriasService();

    res.status(200).json(categorias);
};

export const obtenerCategoria = async (req, res) => {
    const { id } = req.validatedParams;
    const categoria = await obtenerCategoriaService(id);

    res.status(200).json(categoria);
};

export const crearCategoria = async (req, res) => {
    const datos = req.validatedBody;
    const categoria = await crearCategoriaService(datos);

    res.status(201).json(categoria);
};

export const modificarCategoria = async (req, res) => {
    const { id } = req.validatedParams;
    const datos = req.validatedBody;
    const categoria = await modificarCategoriaService(id, datos);

    res.status(200).json(categoria);
};

export const eliminarCategoria = async (req, res) => {
    const { id } = req.validatedParams;
    const categoria = await eliminarCategoriaService(id);

    res.status(200).json(categoria);
};