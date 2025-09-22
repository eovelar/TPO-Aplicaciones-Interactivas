"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const user_validation_1 = require("../validations/user.validation");
const auth_controller_2 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// 🔑 Rutas públicas con validación
router.post("/register", (0, validate_middleware_1.validate)(user_validation_1.registerSchema), auth_controller_1.register);
router.post("/login", (0, validate_middleware_1.validate)(user_validation_1.loginSchema), auth_controller_1.login);
// Eliminar usuario
router.delete("/:id", (0, auth_middleware_1.authRequired)(), auth_controller_2.deleteUser);
// 👤 Ruta protegida → solo con token
router.get("/profile", (0, auth_middleware_1.authRequired)(), (req, res) => {
    res.json({
        message: "Perfil del usuario autenticado",
        user: req.user, // 👈 ahora sí funciona con la extensión de Express
    });
});
exports.default = router;
