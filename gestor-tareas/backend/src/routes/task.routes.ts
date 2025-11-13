import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { simpleAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { taskSchema } from "../validations/task.validation";

const router = Router();

// Listar tareas → cualquier usuario autenticado
router.get("/", simpleAuth, getTasks);

// Crear tarea → propietario o miembro autenticado
router.post("/", simpleAuth, validate(taskSchema), createTask);

// Actualizar tarea → propietario o miembro autenticado
router.put("/:id", simpleAuth, validate(taskSchema), updateTask);

// Eliminar tarea → solo propietario
router.delete("/:id", simpleAuth, requireRole(["propietario"]), deleteTask);

export default router;
