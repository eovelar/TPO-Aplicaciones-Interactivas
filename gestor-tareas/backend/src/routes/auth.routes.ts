import { Router, Response } from "express";
import { register, login, deleteUser } from "../controllers/auth.controller";
import { simpleAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validations/user.validation";

const router = Router();

// Rutas públicas con validación
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Eliminar usuario → requiere autenticación y rol propietario
router.delete("/:id", simpleAuth, requireRole(["propietario"]), deleteUser);

// Perfil del usuario autenticado
router.get("/profile", simpleAuth, (req, res: Response) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user,
  });
});

export default router;
