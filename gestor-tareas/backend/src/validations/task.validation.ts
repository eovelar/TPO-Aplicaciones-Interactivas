import Joi, { ObjectSchema } from "joi";

export const taskSchema: ObjectSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.empty": "El título es obligatorio",
    "string.min": "El título debe tener al menos 3 caracteres",
  }),
  description: Joi.string().optional(),
  status: Joi.string()
    .valid("pendiente", "en curso", "finalizada", "cancelada")
    .default("pendiente"),
  priority: Joi.string()
    .valid("alta", "media", "baja")
    .default("media"),
  deadline: Joi.date().greater("now").optional().messages({
    "date.greater": "La fecha límite debe ser en el futuro",
  }),
});
