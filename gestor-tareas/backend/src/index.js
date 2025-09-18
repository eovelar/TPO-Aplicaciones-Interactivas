import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, sequelize } from "./config/db.js";
import taskRoutes from "./routes/tasks.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/tasks", taskRoutes);

// Inicializar DB y servidor
const PORT = process.env.PORT || 4000;
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true }); // crea/actualiza tablas automáticamente
    app.listen(PORT, () => console.log(`✅ Server en puerto ${PORT}`));
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
};
startServer();
