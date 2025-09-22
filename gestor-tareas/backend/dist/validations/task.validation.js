"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.taskSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).required().messages({
        "string.empty": "El título es obligatorio",
        "string.min": "El título debe tener al menos 3 caracteres",
    }),
    description: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "La descripción debe ser un texto",
    }),
    status: joi_1.default.string()
        .valid("pendiente", "en progreso", "completada", "cancelada")
        .default("pendiente")
        .messages({
        "any.only": "El estado debe ser 'pendiente', 'en progreso', 'completada' o 'cancelada'",
    }),
    priority: joi_1.default.string()
        .valid("alta", "media", "baja")
        .default("media")
        .messages({
        "any.only": "La prioridad debe ser 'alta', 'media' o 'baja'",
    }),
    deadline: joi_1.default.date().greater("now").optional().messages({
        "date.base": "La fecha límite debe ser una fecha válida",
        "date.greater": "La fecha límite debe ser en el futuro",
    }),
    // 👉 opcional, solo se usará si lo envía un propietario
    userId: joi_1.default.number().optional().messages({
        "number.base": "El ID del usuario asignado debe ser un número",
    }),
});
