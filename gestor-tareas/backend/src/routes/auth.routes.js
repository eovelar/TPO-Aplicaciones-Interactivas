import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";  // 👈 Importamos el middleware

const router = Router();

// 🔑 Rutas públicas
router.post("/register", register);
router.post("/login", login);

// 👤 Ruta protegida → solo con token
router.get("/profile", authRequired(), (req, res) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user, // esto viene del middleware (id + role)
  });
});

export default router;
