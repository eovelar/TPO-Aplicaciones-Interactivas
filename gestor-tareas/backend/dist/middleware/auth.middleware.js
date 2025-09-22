"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.authRequired = authRequired;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Extrae "Bearer <token>"
function extractToken(req) {
    const h = (req.headers.authorization || req.headers.Authorization);
    if (!h)
        return null;
    const [scheme, token] = h.split(" ");
    if (!token || scheme.toLowerCase() !== "bearer")
        return null;
    return token;
}
/**
 * Middleware base: valida JWT y setea req.user
 */
function auth(req, res, next) {
    const token = extractToken(req);
    if (!token)
        return res.status(401).json({ message: "Token requerido" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // req.user viene de tu src/types/express.d.ts
        req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
        return next();
    }
    catch {
        return res.status(401).json({ message: "Token inválido" });
    }
}
/**
 * Factory con roles: primero corre `auth`, luego valida el rol (si se indicó)
 * Uso: router.get("/admin", authRequired(["propietario"]), handler);
 */
function authRequired(roles = []) {
    return (req, res, next) => {
        auth(req, res, () => {
            if (roles.length && (!req.user || !roles.includes(req.user.role))) {
                return res.status(403).json({ message: "No tienes permisos" });
            }
            return next();
        });
    };
}
