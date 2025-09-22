import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/task.controller";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { taskSchema } from "../validations/task.validation";
import { hasRole } from "../middleware/role.middleware";

const router = Router();

// ✅ Listar tareas → cualquier usuario logueado
router.get("/", authRequired(), getTasks);

// ✅ Crear tarea → cualquier usuario logueado (validación incluida)
router.post("/", authRequired(), validate(taskSchema), createTask);

// ✅ Actualizar tarea → cualquier usuario logueado (validación incluida)
// 🔐 Chequeo extra de permisos está en el controller
router.put("/:id", authRequired(), validate(taskSchema), updateTask);

// ✅ Eliminar tarea → solo propietario
router.delete("/:id", authRequired(), hasRole(["propietario"]), deleteTask);

export default router;

