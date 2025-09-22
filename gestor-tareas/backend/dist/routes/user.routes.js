"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// 📌 Listar todos los usuarios → solo propietario
router.get("/", (0, auth_middleware_1.authRequired)(), user_controller_1.getUsers);
// 📌 Obtener un usuario por id → solo propietario
router.get("/:id", (0, auth_middleware_1.authRequired)(), user_controller_1.getUserById);
// 📌 Actualizar usuario → solo propietario
router.put("/:id", (0, auth_middleware_1.authRequired)(), user_controller_1.updateUser);
// 📌 Eliminar usuario → solo propietario
router.delete("/:id", (0, auth_middleware_1.authRequired)(), user_controller_1.deleteUser);
exports.default = router;
