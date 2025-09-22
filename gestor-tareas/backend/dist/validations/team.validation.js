"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMemberSchema = exports.addMemberSchema = exports.teamSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validación para crear/actualizar equipo
exports.teamSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required().messages({
        "string.empty": "El nombre del equipo es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre no puede superar los 50 caracteres",
    }),
    description: joi_1.default.string().optional().allow("").messages({
        "string.base": "La descripción debe ser un texto",
    }),
    members: joi_1.default.array()
        .items(joi_1.default.number().messages({ "number.base": "Cada miembro debe ser un ID numérico" }))
        .optional()
        .messages({
        "array.base": "Los miembros deben enviarse en una lista",
    }),
});
// Validación para añadir miembro (body: userId)
exports.addMemberSchema = joi_1.default.object({
    userId: joi_1.default.number().required().messages({
        "number.base": "El ID del usuario debe ser numérico",
        "any.required": "El userId es obligatorio",
    }),
});
// Validación para quitar miembro (solo body vacío, IDs vienen en params)
exports.removeMemberSchema = joi_1.default.object({});
