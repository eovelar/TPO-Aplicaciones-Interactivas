import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Role = "propietario" | "miembro";

interface JwtUserPayload {
  id: number;
  role: Role;
  email?: string;
  iat?: number;
  exp?: number;
}

// Extrae "Bearer <token>"
function extractToken(req: Request): string | null {
  const h = (req.headers.authorization || (req.headers as any).Authorization) as string | undefined;
  if (!h) return null;
  const [scheme, token] = h.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") return null;
  return token;
}

/**
 * Middleware base: valida JWT y setea req.user
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    // req.user viene de tu src/types/express.d.ts
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

/**
 * Factory con roles: primero corre `auth`, luego valida el rol (si se indicó)
 * Uso: router.get("/admin", authRequired(["propietario"]), handler);
 */
export function authRequired(roles: Role[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    auth(req, res, () => {
      if (roles.length && (!req.user || !roles.includes(req.user.role))) {
        return res.status(403).json({ message: "No tienes permisos" });
      }
      return next();
    });
  };
}
