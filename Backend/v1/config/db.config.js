import mongoose from "mongoose";
import Usuario from "../models/usuarios.models.js";
import bcrypt from "bcryptjs";

const seedAdminUsers = async () => {
  const adminUsers = [
    { username: process.env.ADMIN_1_USERNAME, password: process.env.ADMIN_1_PASSWORD },
    { username: process.env.ADMIN_2_USERNAME, password: process.env.ADMIN_2_PASSWORD },
  ];
  const configuredValues = adminUsers.flatMap(({ username, password }) => [username, password]);
  const configuredCount = configuredValues.filter(Boolean).length;

  if (configuredCount === 0) {
    console.warn("Seed admin omitido: configura ADMIN_1_USERNAME/PASSWORD y ADMIN_2_USERNAME/PASSWORD");
    return;
  }
  if (configuredCount !== configuredValues.length) {
    throw new Error("Configura ADMIN_1_USERNAME, ADMIN_1_PASSWORD, ADMIN_2_USERNAME y ADMIN_2_PASSWORD");
  }
  if (adminUsers[0].username.toLowerCase() === adminUsers[1].username.toLowerCase()) {
    throw new Error("Los dos usuarios admin deben tener usernames distintos");
  }

  for (const { username, password } of adminUsers) {
    if (username.length < 3 || username.length > 30 || password.length < 6 || password.length > 30) {
      throw new Error("Los usuarios admin deben tener username de 3-30 caracteres y password de 6-30 caracteres");
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.ROUND) || 10);
    await Usuario.updateOne(
      { username },
      {
        $set: { rol: "admin", password: hashedPassword },
      },
      { upsert: true }
    );
  }
};

const connectDB = async () => {
  console.log("MONGO_URI existe:", !!process.env.MONGO_URI);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
    await Usuario.updateMany({ plan: "normal" }, { $set: { plan: "plus" } });
    await Usuario.updateMany({ plan: { $exists: false } }, { $set: { plan: "plus" } });
    await Usuario.updateMany({ puntos: { $exists: false } }, { $set: { puntos: 0 } });
    await Usuario.updateMany({ compras: { $exists: false } }, { $set: { compras: [] } });
    await seedAdminUsers();

    if (process.env.ADMIN_USERNAME) {
      const resultado = await Usuario.updateOne(
        { username: process.env.ADMIN_USERNAME },
        { $set: { rol: "admin" } }
      );
      if (resultado.matchedCount === 0) {
        console.warn("ADMIN_USERNAME no coincide con ningún usuario registrado");
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;