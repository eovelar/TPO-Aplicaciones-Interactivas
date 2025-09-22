"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "El nombre debe tener al menos 2 caracteres",
        "string.max": "El nombre no puede superar los 50 caracteres",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "El email no tiene un formato válido",
        "any.required": "El email es obligatorio",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "La contraseña debe tener al menos 6 caracteres",
    }),
    role: joi_1.default.string()
        .valid("propietario", "miembro")
        .default("miembro")
        .messages({
        "any.only": "El rol debe ser 'propietario' o 'miembro'",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "El email no tiene un formato válido",
        "any.required": "El email es obligatorio",
    }),
    password: joi_1.default.string().required().messages({
        "string.empty": "La contraseña es obligatoria",
    }),
});
