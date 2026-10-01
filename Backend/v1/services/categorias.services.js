import Categoria from "../models/categorias.models.js";
import Videojuego from "../models/videojuegos.models.js";

export const obtenerCategoriasService = async () => {
    const categorias = await Categoria.find();
    return categorias;
};

export const obtenerCategoriaService = async (id) => {
    const categoria = await Categoria.findById(id);

    if (!categoria) {
        const error = new Error("Categoría no encontrada");
        error.status = 404;
        throw error;
    }

    return categoria;
};

export const crearCategoriaService = async (datos) => {
    const categoria = new Categoria(datos);
    await categoria.save();
    return categoria;
};

export const modificarCategoriaService = async (id, datos) => {
    const categoria = await Categoria.findByIdAndUpdate(
        id,
        datos,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!categoria) {
        const error = new Error("Categoría no encontrada");
        error.status = 404;
        throw error;
    }

    return categoria;
};

export const eliminarCategoriaService = async (id) => {
    const categoria = await Categoria.findById(id);

    if (!categoria) {
        const error = new Error("Categoría no encontrada");
        error.status = 404;
        throw error;
    }

    const videojuegos = await Videojuego.exists({ categoria: id });

    if (videojuegos) {
        const error = new Error("No se puede eliminar la categoría porque tiene videojuegos asociados");
        error.status = 409;
        throw error;
    }

    await Categoria.findByIdAndDelete(id);

    return categoria;
};