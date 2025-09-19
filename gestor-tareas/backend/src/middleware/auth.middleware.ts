import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 👤 Extendemos el tipo de Request para incluir "user"
export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

// Middleware para proteger rutas
export const authRequired = (roles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: number; role: string };

      req.user = decoded;

      // 🔐 Validación de roles (si corresponde)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "No tienes permisos" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};
