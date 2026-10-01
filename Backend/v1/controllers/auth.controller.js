import { loginService, registerService } from '../services/auth.services.js';

export const ingresarUsuario = async (req, res) => {

  const {username, password} = req.body;
  const { usuario, token } = await loginService(username, password);
  res.json({
    message: 'Iniciando sesión',
    usuario: { username: usuario.username, rol: usuario.rol, plan: usuario.plan, puntos: usuario.puntos },
    token,
  });
};

export const registrarUsuario =  async (req, res) => {
  const { username, password } = req.body;
  const { usuario, token } = await registerService(username, password);
  res.status(201).json({
    message: 'Usuario registrado',
    usuario: { username: usuario.username, rol: usuario.rol, plan: usuario.plan, puntos: usuario.puntos },
    token,
  });
};