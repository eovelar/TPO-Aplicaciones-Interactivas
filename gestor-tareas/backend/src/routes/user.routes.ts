// src/routes/user.routes.ts
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware";
import {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

// Listar todos los usuarios → solo propietario
router.get("/", authRequired(), getUsers);

// Obtener un usuario por id → solo propietario
router.get("/:id", authRequired(), getUserById);

// Actualizar usuario → solo propietario
router.put("/:id", authRequired(), updateUser);

// Eliminar usuario → solo propietario
router.delete("/:id", authRequired(), deleteUser);

export default router;
