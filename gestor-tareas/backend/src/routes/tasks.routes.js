import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/tasks.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";  // 👈 Importar el middleware

const router = Router();

// ✅ Listar tareas → solo usuarios logueados
router.get("/", authRequired(), getTasks);

// ✅ Crear tarea → cualquier usuario logueado
router.post("/", authRequired(), createTask);

// ✅ Actualizar tarea → cualquier usuario logueado (después en el controller podés chequear dueño)
router.put("/:id", authRequired(), updateTask);

// ✅ Eliminar tarea → cualquier usuario logueado (igual que arriba, podés filtrar en el controller)
router.delete("/:id", authRequired(), deleteTask);

export default router;
