import { Router } from "express";
import { simpleAuth, requireRole } from "../middleware/auth.middleware";
import {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

// Listar todos los usuarios → solo propietario
router.get("/", simpleAuth, requireRole(["propietario"]), getUsers);

// Obtener un usuario por id → solo propietario
router.get("/:id", simpleAuth, requireRole(["propietario"]), getUserById);

// Actualizar usuario → solo propietario
router.put("/:id", simpleAuth, requireRole(["propietario"]), updateUser);

// Eliminar usuario → solo propietario
router.delete("/:id", simpleAuth, requireRole(["propietario"]), deleteUser);

export default router;
