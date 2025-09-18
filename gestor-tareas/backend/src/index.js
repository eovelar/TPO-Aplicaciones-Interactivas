import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// ✅ Middlewares globales
app.use(cors());
app.use(express.json());

// ✅ Rutas
app.use("/api/auth", authRoutes);

// Ruta simple de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

console.log("🔑 Password cargada:", process.env.DB_PASSWORD);

// Levantar server + conectar DB
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => console.log(`✅ Server en puerto ${PORT}`));
};

startServer();
