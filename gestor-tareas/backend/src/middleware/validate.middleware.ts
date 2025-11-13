import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 🔹 Normalizar valores antes de validar
    if (req.body.status && typeof req.body.status === "string") {
      req.body.status = req.body.status.toLowerCase();
    }
    if (req.body.priority && typeof req.body.priority === "string") {
      req.body.priority = req.body.priority.toLowerCase();
    }

    // 🔹 Permitir claves adicionales como assignedTo
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true, 
    });

    if (error) {
      console.error("❌ Error de validación:", error.details.map((d) => d.message));
      return res.status(400).json({
        message: "Errores de validación",
        errors: error.details.map((err) => err.message),
      });
    }

    next();
  };
};
