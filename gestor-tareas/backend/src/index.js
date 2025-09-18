import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

app.use("/api/auth", authRoutes);


console.log("🔑 Password cargada:", process.env.DB_PASSWORD);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta simple de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// Levantar server + conectar DB
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => console.log(`✅ Server en puerto ${PORT}`));
};

startServer();
