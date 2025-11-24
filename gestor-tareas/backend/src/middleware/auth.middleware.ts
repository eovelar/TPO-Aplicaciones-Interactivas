import { Request, Response, NextFunction } from "express";
import { RequestContext } from "../utils/request-context";

type Role = "propietario" | "miembro";

/**
 * Middleware de autenticación basado en headers.
 * Requiere x-user-id y x-user-role.
 */
export function simpleAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const idHeader = req.header("x-user-id");
  const roleHeader = req.header("x-user-role");
  const emailHeader = req.header("x-user-email");
  const nameHeader = req.header("x-user-name"); // <-- agregado para soporte de nombre

  if (!idHeader || !roleHeader) {
    return res.status(401).json({
      message: "Faltan encabezados de autenticación: x-user-id y x-user-role",
    });
  }

  const id = Number(idHeader);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "x-user-id debe ser numérico" });
  }

  const role: Role =
    roleHeader === "propietario" ? "propietario" : "miembro";

  // Guardamos info en req.user
  req.user = {
    id,
    role,
    email: emailHeader ?? undefined,
    name: nameHeader ?? undefined, // <-- necesario para historial
  };

  // También lo guardamos en RequestContext (usado por AuditSubscriber)
  RequestContext.setUser(id, emailHeader ?? undefined, nameHeader ?? undefined);

  next();
}

/**
 * Middleware para verificar roles autorizados.
 */
export function requireRole(roles: Role[] = []) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    next();
  };
}
