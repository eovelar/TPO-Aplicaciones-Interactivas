import Joi, { ObjectSchema } from "joi";

// Validación para crear/actualizar equipo
export const teamSchema: ObjectSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "El nombre del equipo es obligatorio",
    "string.min": "El nombre debe tener al menos 3 caracteres",
    "string.max": "El nombre no puede superar los 50 caracteres",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.base": "La descripción debe ser un texto",
  }),
  members: Joi.array()
    .items(Joi.number().messages({ "number.base": "Cada miembro debe ser un ID numérico" }))
    .optional()
    .messages({
      "array.base": "Los miembros deben enviarse en una lista",
    }),
});

// Validación para añadir miembro (body: userId)
export const addMemberSchema: ObjectSchema = Joi.object({
  userId: Joi.number().required().messages({
    "number.base": "El ID del usuario debe ser numérico",
    "any.required": "El userId es obligatorio",
  }),
});

// Validación para quitar miembro (solo body vacío, IDs vienen en params)
export const removeMemberSchema: ObjectSchema = Joi.object({});
