"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const task_validation_1 = require("../validations/task.validation");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ✅ Listar tareas → cualquier usuario logueado
router.get("/", (0, auth_middleware_1.authRequired)(), task_controller_1.getTasks);
// ✅ Crear tarea → cualquier usuario logueado (validación incluida)
router.post("/", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(task_validation_1.taskSchema), task_controller_1.createTask);
// ✅ Actualizar tarea → cualquier usuario logueado (validación incluida)
// 🔐 Chequeo extra de permisos está en el controller
router.put("/:id", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(task_validation_1.taskSchema), task_controller_1.updateTask);
// ✅ Eliminar tarea → solo propietario
router.delete("/:id", (0, auth_middleware_1.authRequired)(), (0, role_middleware_1.hasRole)(["propietario"]), task_controller_1.deleteTask);
exports.default = router;
