import { Request, Response, NextFunction } from "express";
import { RequestContext } from "../utils/request-context";

export function requestContextMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  RequestContext.run(() => next());
}

export function setUserInContextMiddleware(
  req: Request & { user?: { id: number } },
  _res: Response,
  next: NextFunction
) {
  RequestContext.setUserId(req.user?.id);
  next();
}
