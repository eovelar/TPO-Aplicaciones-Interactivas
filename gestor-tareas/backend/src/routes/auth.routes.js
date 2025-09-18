import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";  
import { validate } from "../middleware/validate.middleware.js"; // 👈 nuevo
import { registerSchema, loginSchema } from "../validations/user.validation.js"; // 👈 nuevo

const router = Router();

// 🔑 Rutas públicas con validación
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// 👤 Ruta protegida → solo con token
router.get("/profile", authRequired(), (req, res) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user, // viene del middleware (id + role)
  });
});

export default router;

