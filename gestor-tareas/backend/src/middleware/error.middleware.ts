import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
