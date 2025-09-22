import Joi, { ObjectSchema } from "joi";

export const taskSchema: ObjectSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.empty": "El título es obligatorio",
    "string.min": "El título debe tener al menos 3 caracteres",
  }),

  description: Joi.string().allow("", null).optional().messages({
    "string.base": "La descripción debe ser un texto",
  }),

  status: Joi.string()
    .valid("pendiente", "en progreso", "completada", "cancelada")
    .default("pendiente")
    .messages({
      "any.only":
        "El estado debe ser 'pendiente', 'en progreso', 'completada' o 'cancelada'",
    }),

  priority: Joi.string()
    .valid("alta", "media", "baja")
    .default("media")
    .messages({
      "any.only": "La prioridad debe ser 'alta', 'media' o 'baja'",
    }),

  deadline: Joi.date().greater("now").optional().messages({
    "date.base": "La fecha límite debe ser una fecha válida",
    "date.greater": "La fecha límite debe ser en el futuro",
  }),

  // 👉 opcional, solo se usará si lo envía un propietario
  userId: Joi.number().optional().messages({
    "number.base": "El ID del usuario asignado debe ser un número",
  }),
});
