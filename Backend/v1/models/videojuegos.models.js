import mongoose from 'mongoose';

const videojuegoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true,
    },
    puntajeMetacritic: {
      type: Number,
      min: 0,
      max: 100,
    },
    imagen: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Videojuego = mongoose.model('Videojuego', videojuegoSchema);

export default Videojuego;
