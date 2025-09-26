"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./config/data-source");
// Rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
// Middlewares
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares globales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configuración global para formatear JSON con 2 espacios
app.set("json spaces", 2);
// Rutas principales
app.use("/api/auth", auth_routes_1.default);
app.use("/api/tasks", task_routes_1.default);
app.use("/api/teams", team_routes_1.default);
app.use("/api/users", user_routes_1.default);
// 🚦 Ruta simple de prueba
app.get("/", (_req, res) => {
    res.send("Servidor funcionando");
});
// Middleware de errores (siempre al final)
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 4000;
// Inicializar conexión con TypeORM
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Conectado a PostgreSQL con TypeORM");
    app.listen(PORT, () => {
        console.log(`Server escuchando en puerto ${PORT}`);
    });
})
    .catch((error) => console.log("Error al conectar la BD:", error));
