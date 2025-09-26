import { Router } from "express";
import { AppDataSource } from "../config/data-source";
import { hasRole } from "../middleware/role.middleware";

const router = Router();

/**
 * Resetea todas las tablas
 * Solo accesible para usuarios con rol "propietario"
 */
router.delete("/reset", hasRole(["propietario"]), async (req, res) => {
  try {
    await AppDataSource.manager.query(
      `TRUNCATE "task", "team", "user" RESTART IDENTITY CASCADE`
    );
    return res.json({ message: "Base de datos reseteada" });
  } catch (error) {
    console.error("Error al resetear la BD:", error);
    return res.status(500).json({ message: "Error al resetear la base de datos" });
  }
});

export default router;
