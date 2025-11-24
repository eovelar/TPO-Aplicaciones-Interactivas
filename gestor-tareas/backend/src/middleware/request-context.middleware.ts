import { Request, Response, NextFunction } from "express";
import { RequestContext } from "../utils/request-context";

// Crea un contexto por request (obligatorio antes de cargar datos del usuario)
export function requestContextMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  RequestContext.run(() => next());
}

// Carga los datos del usuario (id, email, name) dentro del contexto
export function setUserInContextMiddleware(
  req: Request & { user?: { id: number; email?: string; name?: string } },
  _res: Response,
  next: NextFunction
) {
  RequestContext.setUser(
    req.user?.id ?? undefined,
    req.user?.email ?? undefined,
    req.user?.name ?? undefined
  );

  next();
}
