import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./swagger";

// Rutas
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import teamRoutes from "./routes/team.routes";
import userRoutes from "./routes/user.routes";
import historialRoutes from "./routes/historial.routes";
import commentRoutes from "./routes/comment.routes";

// Middlewares
import { errorHandler } from "./middleware/error.middleware";

// Auth + Contexto por request
import { simpleAuth } from "./middleware/auth.middleware";
import {
  requestContextMiddleware,
  setUserInContextMiddleware,
} from "./middleware/request-context.middleware";

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Contexto por request (DEBE ir antes de auth y rutas)
app.use(requestContextMiddleware);

// Configuración global para formatear JSON con 2 espacios
app.set("json spaces", 2);

// Rutas públicas (sin auth)
app.use("/api/auth", authRoutes);

// Documentación Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.get("/api/openapi.json", (_req, res) => res.json(openapi));

// Rutas protegidas (simpleAuth → setUserInContext → rutas)
app.use("/api/tasks", simpleAuth, setUserInContextMiddleware, taskRoutes);
app.use("/api/teams", simpleAuth, setUserInContextMiddleware, teamRoutes);
app.use("/api/users", simpleAuth, setUserInContextMiddleware, userRoutes);
app.use("/api/historial", simpleAuth, setUserInContextMiddleware, historialRoutes);
app.use("/api", simpleAuth, setUserInContextMiddleware, commentRoutes);

// Ruta simple de prueba
app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor funcionando 🚀");
});

// Middleware de errores (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Inicializar conexión con TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log("Conectado a PostgreSQL con TypeORM");
    app.listen(PORT, () => {
      console.log(`Server escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => console.log("Error al conectar la BD:", error));
