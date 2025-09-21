import Joi, { ObjectSchema } from "joi";

// Validación para crear/actualizar un equipo
export const teamSchema: ObjectSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "El nombre del equipo es obligatorio",
    "string.min": "El nombre del equipo debe tener al menos 3 caracteres",
    "string.max": "El nombre del equipo no puede superar los 50 caracteres",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.base": "La descripción debe ser un texto",
  }),
  members: Joi.array()
    .items(
      Joi.number().messages({
        "number.base": "Cada miembro debe ser un ID numérico",
      })
    )
    .optional()
    .messages({
      "array.base": "Los miembros deben enviarse en una lista",
    }),
});

// Validación para añadir miembro
export const addMemberSchema: ObjectSchema = Joi.object({
  teamId: Joi.number().required().messages({
    "number.base": "El ID del equipo debe ser numérico",
    "any.required": "El ID del equipo es obligatorio",
  }),
  userId: Joi.number().required().messages({
    "number.base": "El ID del usuario debe ser numérico",
    "any.required": "El ID del usuario es obligatorio",
  }),
});

// Validación para quitar miembro
export const removeMemberSchema: ObjectSchema = Joi.object({
  teamId: Joi.number().required().messages({
    "number.base": "El ID del equipo debe ser numérico",
    "any.required": "El ID del equipo es obligatorio",
  }),
  userId: Joi.number().required().messages({
    "number.base": "El ID del usuario debe ser numérico",
    "any.required": "El ID del usuario es obligatorio",
  }),
});
