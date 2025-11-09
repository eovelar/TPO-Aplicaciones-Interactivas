import { Request, Response, NextFunction } from "express";

type Role = "propietario" | "miembro";

export function simpleAuth(req: Request, res: Response, next: NextFunction) {
  const idHeader = req.header("x-user-id");
  const roleHeader = req.header("x-user-role");
  const emailHeader = req.header("x-user-email");

  if (!idHeader || !roleHeader) {
    return res.status(401).json({
      message: "Faltan encabezados de autenticación: x-user-id y x-user-role",
    });
  }

  const id = Number(idHeader);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "x-user-id debe ser numérico" });
  }

  const role = roleHeader === "propietario" ? "propietario" : "miembro";

  req.user = {
    id,
    role,
    email: emailHeader ?? undefined,
  };

  next();
}

export function requireRole(roles: Role[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    next();
  };
}
