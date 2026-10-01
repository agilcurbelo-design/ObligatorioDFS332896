import jwt from 'jsonwebtoken';

export const authenticateMiddleware = (req, res, next) => {

    //En el header de las requests se espera que el token esté en el formato "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó el token' });
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token || !process.env.SECRET_KEY) {
        return res.status(401).json({ message: 'Token inválido' });
    }
    
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.decoded = decoded;
        next();
    });
    
};

export const requireAdminMiddleware = (req, res, next) => {
    if (req.decoded?.rol === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'No autorizado: se requiere usuario administrador' });
};

export const requireSelfOrAdminMiddleware = (req, res, next) => {
    if (req.decoded?.rol === 'admin' || req.decoded?.sub === req.validatedParams?.id) {
        return next();
    }
    return res.status(403).json({ message: 'No autorizado para acceder a este usuario' });
};