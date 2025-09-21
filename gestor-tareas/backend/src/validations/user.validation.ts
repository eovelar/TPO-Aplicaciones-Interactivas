import Joi, { ObjectSchema } from "joi";

export const registerSchema: ObjectSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede superar los 50 caracteres",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "El email no tiene un formato válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 6 caracteres",
  }),
  role: Joi.string()
    .valid("propietario", "miembro")
    .default("miembro")
    .messages({
      "any.only": "El rol debe ser 'propietario' o 'miembro'",
    }),
});

export const loginSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "El email no tiene un formato válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().required().messages({
    "string.empty": "La contraseña es obligatoria",
  }),
});
