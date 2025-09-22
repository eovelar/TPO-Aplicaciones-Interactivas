"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = void 0;
const hasRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autorizado" });
        }
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: "No tenés permisos para esta acción" });
        }
        next();
    };
};
exports.hasRole = hasRole;
