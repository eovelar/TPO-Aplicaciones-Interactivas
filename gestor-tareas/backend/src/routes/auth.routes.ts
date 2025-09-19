import { Router, Request, Response } from "express";
import { register, login } from "../controllers/auth.controller";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validations/user.validation";

const router = Router();

// 🔑 Rutas públicas con validación
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// 👤 Ruta protegida → solo con token
router.get("/profile", authRequired(), (req: Request, res: Response) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user, // 👈 viene del middleware (id + role)
  });
});

export default router;
