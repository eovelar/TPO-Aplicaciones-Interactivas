import { Router, Response } from "express";
import { register, login } from "../controllers/auth.controller";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validations/user.validation";
import { deleteUser } from "../controllers/auth.controller";


const router = Router();

// 🔑 Rutas públicas con validación
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Eliminar usuario
router.delete("/:id", authRequired(), deleteUser);

// 👤 Ruta protegida → solo con token
router.get("/profile", authRequired(), (req, res: Response) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user, // 👈 ahora sí funciona con la extensión de Express
  });
});

export default router;
