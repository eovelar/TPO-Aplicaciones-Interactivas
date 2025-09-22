"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.details.map((err) => err.message),
            });
        }
        next();
    };
};
exports.validate = validate;
