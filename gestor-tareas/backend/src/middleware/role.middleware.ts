import { Request, Response, NextFunction } from "express";

export const hasRole = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tenés permisos para esta acción" });
    }

    next();
  };
};
