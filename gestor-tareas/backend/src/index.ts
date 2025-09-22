import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./config/data-source";

// Rutas
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import teamRoutes from "./routes/team.routes";
import userRoutes from "./routes/user.routes";

// Middlewares
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// 🌍 Middlewares globales
app.use(cors());
app.use(express.json());

// ✅ Configuración global para formatear JSON con 2 espacios
app.set("json spaces", 2);

// 📌 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);

// 🚦 Ruta simple de prueba
app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor funcionando 🚀");
});

// 🛑 Middleware de errores (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// 🔗 Inicializar conexión con TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conectado a PostgreSQL con TypeORM");
    app.listen(PORT, () => {
      console.log(`🚀 Server escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Error al conectar la BD:", error));
