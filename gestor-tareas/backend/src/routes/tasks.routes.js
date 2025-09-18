import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/tasks.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { taskSchema } from "../validations/task.validation.js";
import { hasRole } from "../middleware/role.middleware.js";  // 👈 nuevo

const router = Router();

// ✅ Listar tareas → cualquier usuario logueado
router.get("/", authRequired(), getTasks);

// ✅ Crear tarea → cualquier usuario logueado (validación incluida)
router.post("/", authRequired(), validate(taskSchema), createTask);

// ✅ Actualizar tarea → cualquier usuario logueado (validación incluida)
// 🔐 Pero en el controller chequeamos que sea dueño o propietario
router.put("/:id", authRequired(), validate(taskSchema), updateTask);

// ✅ Eliminar tarea → solo propietario
router.delete("/:id", authRequired(), hasRole(["propietario"]), deleteTask);

export default router;
