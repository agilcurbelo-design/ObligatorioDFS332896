import mongoose from "mongoose";

const compraSchema = new mongoose.Schema({
    videojuego: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videojuego",
        required: true
    },
    precio: { type: Number, required: true, min: 0 },
    metodoPago: { type: String, enum: ["dinero", "puntos"], required: true },
    puntosGanados: { type: Number, required: true, min: 0, default: 0 },
    puntosGastados: { type: Number, required: true, min: 0, default: 0 },
    fecha: { type: Date, default: Date.now }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    rol: {
        type: String,
        enum: ["admin", "comun"],
        default: "comun"
    },
    plan: {
        type: String,
        enum: ["plus", "premium"],
        default: "plus"
    },
    puntos: { type: Number, min: 0, default: 0 },
    compras: { type: [compraSchema], default: [] }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;